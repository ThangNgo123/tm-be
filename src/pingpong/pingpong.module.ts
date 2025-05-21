import { Module } from '@nestjs/common';
import { PingpongController } from './pingpong.controller';
import { PingpongService } from './pingpong.service';

@Module({
  controllers: [PingpongController],
  providers: [PingpongService],
})
export class PingpongModule {}
