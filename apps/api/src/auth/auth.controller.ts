import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalRegisterDto } from './dto/local-register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ----- LOCAL METHODS -----
  @Post('register')
  async register(@Body() dto: LocalRegisterDto, @Res() res: any) {
    const { accessToken, refreshToken } = await this.authService.localRegister(
      dto.email,
      dto.password,
      dto.display_name,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: JwtPayload, @Res() res: any) {
    // req.user est injecté par LocalStrategy.validate()
    const { accessToken, refreshToken } = await this.authService.localLogin(
      user.sub,
      user.email,
      user.display_name,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  }

  @Post('refresh')
  async refresh(@Req() req: any, @Res() res: any) {
    const token = req.cookies['refreshToken'];
    if (!token) throw new UnauthorizedException('Refresh token manquant');

    const { accessToken, refreshToken } = await this.authService.refresh(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: JwtPayload, @Res() res: any) {
    await this.authService.logout(user.sub);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Déconnecté' });
  }

}
