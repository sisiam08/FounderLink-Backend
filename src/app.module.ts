import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from './application/application.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<string>('NODE_ENV') !== 'production',
        ssl: true,
        retryAttempts: 3,
        retryDelay: 3000,
        connectTimeoutMS: 15000,
      })
    }),
    ApplicationModule,
    UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
