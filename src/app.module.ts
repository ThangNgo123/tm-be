import { Module } from '@nestjs/common';
import { PingpongModule } from './pingpong/pingpong.module';

@Module({
  imports: [PingpongModule],
})
export class AppModule {}
