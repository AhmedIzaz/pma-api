import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<TEnvironmentVariables>) => {
        const JWTSecret = config.get('JWT_SECRET');
        console.log('JWT Secret is :', JWTSecret);
        return {
          global: true,
          secret: JWTSecret,
          signOptions: { expiresIn: '24H' },
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [TypeOrmModule, UserService, UserRepository],
})
export class UserModule {}
