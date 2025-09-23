import { Logger, Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  onModuleInit() {
    this.logger.log('Database connected successfully');
  }

  onModuleDestroy() {
    this.logger.log('Database disconnected');
  }
}
