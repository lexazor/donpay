import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetupPinDto, VerifyPinDto } from './dto/pin.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signTokens(payload: JwtPayload) {
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET', 'dev-secret'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>(
        'JWT_REFRESH_SECRET',
        'dev-refresh-secret',
      ),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private async generateUniqueUsername(fullName: string) {
    const base = fullName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    let username = base;
    let i = 2;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${i}`;
      i += 1;
    }
    return username;
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { whatsapp: dto.whatsapp }] },
    });
    if (exists)
      throw new BadRequestException('Email atau WhatsApp sudah terdaftar');
    const username = await this.generateUniqueUsername(dto.fullName);
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, username, password },
    });
    return { userId: user.id, username };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { whatsapp: dto.identifier }] },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Kredensial tidak valid');
    const tokens = this.signTokens({ sub: user.id, role: user.role });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return { ...tokens, isPinSet: user.isPinSet };
  }

  async setupPin(userId: string, dto: SetupPinDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pin: await bcrypt.hash(dto.pin, 10), isPinSet: true },
    });
    return { message: 'PIN berhasil disimpan' };
  }

  async verifyPin(userId: string, dto: VerifyPinDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Pengguna tidak ditemukan');
    if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
      throw new ForbiddenException('Akun terkunci sementara karena PIN salah');
    }
    if (!user?.pin || !(await bcrypt.compare(dto.pin, user.pin))) {
      const attempts = user.pinAttempts + 1;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          pinAttempts: attempts,
          pinLockedUntil:
            attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      throw new UnauthorizedException('PIN tidak valid');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { pinAttempts: 0, pinLockedUntil: null },
    });
    return { verified: true };
  }

  async refreshToken(userId: string, dto: RefreshTokenDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken)
      throw new UnauthorizedException('Session tidak valid');
    const match = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException('Refresh token tidak valid');
    const tokens = this.signTokens({ sub: user.id, role: user.role });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return tokens;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        whatsapp: true,
        email: true,
        balance: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('Pengguna tidak ditemukan');
    return user;
  }
}
