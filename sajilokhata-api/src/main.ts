import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);

  console.log(`Server running on port ${process.env.PORT || 3000}`);
}
bootstrap();
