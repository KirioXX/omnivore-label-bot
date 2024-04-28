import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { OmnivorePostConsumer } from './omnivore/omnivore-post.processor';
import { LangchainService } from './omnivore/langchain.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OmnivoreService } from './omnivore/omnivore.service';
import { HealthModule } from './health/health.module';

// Configs
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import llmConfig from './config/llm.config';
import omnivoreConfig from './config/omnivore.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, llmConfig, omnivoreConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('database.host')!,
          port: configService.get<number>('database.port')!,
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'omnivore',
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OmnivorePostConsumer,
    LangchainService,
    OmnivoreService,
  ],
})
export class AppModule {}
