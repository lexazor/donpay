import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetupPinDto, VerifyPinDto } from './dto/pin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('setup-pin')
  @UseGuards(JwtAuthGuard)
  setupPin(@CurrentUser() user: { id: string }, @Body() dto: SetupPinDto) {
    return this.authService.setupPin(user.id, dto);
  }

  @Post('verify-pin')
  @UseGuards(JwtAuthGuard)
  verifyPin(@CurrentUser() user: { id: string }, @Body() dto: VerifyPinDto) {
    return this.authService.verifyPin(user.id, dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@CurrentUser() user: { id: string }, @Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(user.id, dto);
  }

  @Post('forgot-pin')
  forgotPin() {
    return { message: 'Endpoint forgot PIN siap diintegrasikan WA/email' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
