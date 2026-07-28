import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { MessageModule } from './message/message.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        url: configService.getOrThrow<string>('DATABASE_URL'),

        autoLoadEntities: true,

        synchronize:
          configService.getOrThrow<string>('NODE_ENV') !== 'production',

        ssl: true,

        retryAttempts: 3,

        retryDelay: 3000,

        connectTimeoutMS: 15000,
      }),
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    MailModule,
    MessageModule,
    NotificationModule,
    ProfileModule,
    UserModule
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}