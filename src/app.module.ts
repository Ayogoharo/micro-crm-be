import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { validate } from 'src/config/env.validation';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ClientsModule } from 'src/clients/clients.module';

/**
 * Root application module orchestrating all feature modules and infrastructure.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: process.env.NODE_ENV !== 'test', // Disable cache in test environment
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'test', // In test, rely on process.env set by setup-env.ts
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
