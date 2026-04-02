// redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                console.log(configService.get<string>('REDIS_HOST'));
                console.log(configService.get<number>('REDIS_PORT'));
                return new Redis({
                    host: configService.get<string>('REDIS_HOST') || 'localhost',
                    port: configService.get<number>('REDIS_PORT') || 6379,
                });
            },
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
