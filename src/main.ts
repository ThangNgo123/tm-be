import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = (
    configService.get<string>('NODE_ENV') ?? 'development'
  ).toLowerCase();
  const isProduction = nodeEnv === 'prod' || nodeEnv === 'production';
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api/v1');

  if (!isProduction) {
    const swaggerUsername = configService.get<string>(
      'SWAGGER_BASIC_AUTH_USERNAME',
    );
    const swaggerPassword = configService.get<string>(
      'SWAGGER_BASIC_AUTH_PASSWORD',
    );

    if (!swaggerUsername || !swaggerPassword) {
      throw new Error(
        'SWAGGER_BASIC_AUTH_USERNAME and SWAGGER_BASIC_AUTH_PASSWORD are required when NODE_ENV is not production',
      );
    }

    const swaggerPaths = ['/api'];

    app.use((req: Request, res: Response, next: NextFunction) => {
      const requestPath = req.originalUrl.split('?')[0];

      if (requestPath.startsWith('/api/v1')) {
        return next();
      }

      const isSwaggerRequest = swaggerPaths.some(
        (path) => requestPath === path || requestPath.startsWith(`${path}/`),
      );

      if (!isSwaggerRequest) {
        return next();
      }

      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
        return res.status(401).send('Unauthorized');
      }

      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString(
        'utf8',
      );
      const separatorIndex = credentials.indexOf(':');

      if (separatorIndex === -1) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
        return res.status(401).send('Unauthorized');
      }

      const username = credentials.slice(0, separatorIndex);
      const password = credentials.slice(separatorIndex + 1);

      if (username !== swaggerUsername || password !== swaggerPassword) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
        return res.status(401).send('Unauthorized');
      }

      return next();
    });

    const config = new DocumentBuilder()
      .setTitle('The tm project nestjs api')
      .setDescription('The tm project nestjs api description')
      .setVersion('1.0')
      .addSecurity('token', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      })
      .build();
    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
