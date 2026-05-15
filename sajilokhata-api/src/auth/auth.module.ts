import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities';
import { ShopsModule } from '../shops/shops.module';
import { User } from '../users/entities';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [UsersModule, ShopsModule, PassportModule, JwtModule.registerAsync({          // ✅ async — waits for env to load
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1d' },
    }),
  }), TypeOrmModule.forFeature([User, Shop])],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
