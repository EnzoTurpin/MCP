import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // ----- HELPERS -----

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15min',
    });
  }

  private generateRawRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  private getRefreshExpiry(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }

  private async issueTokens(
    userId: string,
    email: string,
    display_name: string,
  ) {
    const accessToken = await this.generateAccessToken({
      sub: userId,
      email,
      display_name,
    });

    const rawRefreshToken = this.generateRawRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        token: await this.hashToken(rawRefreshToken),
        expires_at: this.getRefreshExpiry(),
        user_id: userId,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  // ---- Public methods -----

  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findOne({ email });
    if (!user || !user.password_hash) return null;

    const isMatch = await bcrypt.compare(password, user.password_hash);
    return isMatch ? user : null;
  }

  async localRegister(email: string, password: string, display_name: string) {
    const usedEmail = await this.usersService.findOne({ email });
    if (usedEmail) throw new ConflictException('Cet email est déjà utilisé');

    const hashed = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: { email, password_hash: hashed, display_name },
    });

    return this.issueTokens(user.id, user.email, user.display_name);
  }

  async localLogin(userId: string, email: string, display_name: string) {
    return this.issueTokens(userId, email, display_name);
  }

  async refresh(rawRefreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { expires_at: { gt: new Date() } },
      include: { user: true },
    });

    const match = await Promise.all(
      tokens.map(async (t) => ({
        record: t,
        valid: await bcrypt.compare(rawRefreshToken, t.token),
      })),
    ).then((results) => results.find((r) => r.valid));

    if (!match)
      throw new UnauthorizedException('Refresh token invalide ou expiré');

    await this.prisma.refreshToken.deleteMany({ where: { id: match.record.id } });

    return this.issueTokens(
      match.record.user.id,
      match.record.user.email,
      match.record.user.display_name,
    );
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { user_id: userId } });
  }
}
