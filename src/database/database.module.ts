import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/userModule/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService<TEnvironmentVariables>) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', { infer: true }),
        port: configService.get('DB_PORT', { infer: true }),
        username: configService.get('DB_USER', { infer: true }),
        password: configService.get('DB_PASS', { infer: true }),
        database: configService.get('DB_NAME', { infer: true }),

        //
        entities: [UserEntity],
        migrations:['src/database/migrations/*.ts'],
        autoLoadEntities: true,
        logging: ['error', 'query'],
        poolSize: 10,
        synchronize: false,

        // retry of connection to database related properties
        retryAttempts: 10,
        retryDelay: 10 * 1000, // 10 second
      }),
    }),
  ],
})
export class DatabaseModule {}
