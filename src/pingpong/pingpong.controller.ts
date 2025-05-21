import { Controller, Get } from '@nestjs/common';
import { PingpongService } from './pingpong.service';

@Controller('pingpong')
export class PingpongController {
  constructor(private PingpongService: PingpongService) {}
  @Get()
  pingpong(): string {
    return this.PingpongService.pingpong();
  }
}
