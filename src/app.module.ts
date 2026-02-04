import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './userModule/user.module';
// import { dataSourceOption } from 'database/data-source';
import { PromptModule } from './prompt/prompt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TEnvironmentVariables>) => ({
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
        logging: ['error', 'query'],
        synchronize: false,
      }),
    }),

    // feature modules
    UserModule,

    PromptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
