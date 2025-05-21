import { Injectable } from '@nestjs/common';

@Injectable()
export class PingpongService {
  pingpong(): string {
    return 'Pong';
  }
}
