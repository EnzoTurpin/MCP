import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '../../prisma/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomBytes } from 'crypto';
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // ----- HELPERS -----

  // Token hash before storage in DB
  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  // Generate an access token which expires in 15min
  private generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15min',
    });
  }

  // Security purpose : will return a 64 octets in token format to the client
  private generateRawRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  // Let the refreshToken alive for 7 days before the expiring date
  private getRefreshExpiry(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }

  // Send both tokens to the controller
  private async issueTokens(
    userId: number,
    email: string,
    first_name: string | null,
  ) {
    const accessToken = await this.generateAccessToken({
      sub: userId,
      email,
      first_name,
    });

    const rawRefreshToken = this.generateRawRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        token: await this.hashToken(rawRefreshToken),
        expires_at: this.getRefreshExpiry(),
        userId,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  // ---- Public methods -----

  // Used in local.strategy.ts to validate if a user exists with the local provider
  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findOne({ email });
    if (!user) return null;

    const provider = await this.prisma.authProvider.findUnique({
      where: {
        userId_provider: { userId: user.id, provider: Provider.local },
      },
    });
    if (!provider?.password) return null;

    const isMatch = await bcrypt.compare(password, provider.password);
    return isMatch ? user : null;
  }

  // Implements the local sign up logic
  async localRegister(
    email: string,
    password: string,
    first_name?: string,
    last_name?: string,
  ) {
    const usedEmail = await this.usersService.findOne({ email });
    if (usedEmail) throw new ConflictException('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        authProviders: {
          create: { provider: Provider.local, password: hashed },
        },
      },
    });

    return this.issueTokens(user.id, user.email, user.first_name);
  }

  // As local strategy validate the user, localLogin is simple
  async localLogin(userId: number, email: string, first_name: string | null) {
    return this.issueTokens(userId, email, first_name);
  }

  async refresh(rawRefreshToken: string) {
    // Load every tokens that is not expired (greater then now)
    const tokens = await this.prisma.refreshToken.findMany({
      where: { expires_at: { gt: new Date() } },
      include: { user: true },
    });

    // Find which token corresponds to the user
    const match = await Promise.all(
      // Create an object for each token in the DB with t = token and
      // valid = bcrypt.compare result
      tokens.map(async (t) => ({
        record: t,
        valid: await bcrypt.compare(rawRefreshToken, t.token),
      })),
    ).then((results) => results.find((r) => r.valid)); // Return the first result where valid === true

    if (!match)
      throw new UnauthorizedException('Refresh token invalide ou expiré');

    await this.prisma.refreshToken.delete({ where: { id: match.record.id } });

    return this.issueTokens(
      match.record.user.id,
      match.record.user.email,
      match.record.user.first_name,
    );
  }

  async logout(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async validateOAuthLogin(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    if (!email) throw new Error('Email Google manquant');

    const existing = await this.prisma.authProvider.findUnique({
      where: {
        provider_provider_id: {
          provider: Provider.google,
          provider_id: providerId,
        },
      },
      include: { user: true },
    });

    if (existing) {
      return this.issueTokens(
        existing.user.id,
        existing.user.email,
        existing.user.first_name,
      );
    }

    let user = await this.usersService.findOne({ email });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          first_name: profile.name?.givenName,
          last_name: profile.name?.familyName,
          authProviders: {
            create: { provider: Provider.google, provider_id: providerId },
          },
        },
      });
    } else {
      await this.prisma.authProvider.create({
        data: {
          provider: Provider.google,
          provider_id: providerId,
          userId: user.id,
        },
      });
    }

    return this.issueTokens(user.id, user.email, user.first_name);
  }
}
