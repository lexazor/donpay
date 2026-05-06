import { Module } from '@nestjs/common';
import { DepositExpiryService } from './deposit-expiry.service';

@Module({
  providers: [DepositExpiryService],
})
export class DepositModule {}
