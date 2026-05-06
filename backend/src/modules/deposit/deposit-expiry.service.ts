import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DepositStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepositExpiryService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async handleExpiry() {
    await this.prisma.deposit.updateMany({
      where: {
        status: {
          in: [DepositStatus.PENDING, DepositStatus.WAITING_VERIFICATION],
        },
        expiredAt: { lt: new Date() },
      },
      data: { status: DepositStatus.EXPIRED },
    });
  }
}
