import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './userModule/user.module';
// import { dataSourceOption } from 'database/data-source';
import { PromptModule } from './prompt/prompt.module';
import { SymptomModule } from './symptom/symptom.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { FirstAidModule } from './first-aid/first-aid.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './redis/redis.module';
import { DoctorModule } from './doctorModule/doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<TEnvironmentVariables>) => {
        const JWTSecret = config.get('JWT_SECRET');
        console.log('JWT Secret is :', JWTSecret);
        return {
          global: true,
          secret: JWTSecret,
          signOptions: { expiresIn: 24 * 60 * 1 * 60 },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TEnvironmentVariables>) => {
        console.log(JSON.stringify({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
          database: configService.get('DB_NAME'),
        }, null, 2))
        return ({
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
          database: configService.get('DB_NAME'),
          entities: ['dist/**/*.entity.js'],
          migrations: ['dist/database/migrations/*.js'],
          retryAttempts: 10,
          retryDelay: 10 * 1000, // 10 seconds,
          logging: ['error'],
          synchronize: true,
        })
      }
    }),

    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [{
          name: "BASIC",
          ttl: 60,
          limit: 30
        }]
      })
    }),


    // feature modules
    UserModule,

    DoctorModule,

    PromptModule,

    SymptomModule,

    FirstAidModule,

    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }

  ],
})
export class AppModule { }
