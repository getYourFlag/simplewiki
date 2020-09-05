import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { imports } from './imports';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports,
  controllers: [],
  providers: [AppService],
  exports: [ConfigModule]
})

export class AppModule {}
