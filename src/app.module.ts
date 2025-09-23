import { Module } from '@nestjs/common';
import { PingpongModule } from './pingpong/pingpong.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PONG: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    PingpongModule,
    DatabaseModule,
  ],
})
export class AppModule {}
