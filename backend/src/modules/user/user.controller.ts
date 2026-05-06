import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  profile(@CurrentUser() user: { id: string }) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
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
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
      select: {
        id: true,
        fullName: true,
        whatsapp: true,
        email: true,
        username: true,
      },
    });
  }

  @Get('balance')
  balance(@CurrentUser() user: { id: string }) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });
  }
}
