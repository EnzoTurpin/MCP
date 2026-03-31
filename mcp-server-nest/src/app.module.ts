import { Module } from '@nestjs/common';
import { McpService } from './mcp/mcp.service';
import { PrismaService } from '../../apps/api/src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    McpService,
    PrismaService
  ],
})
export class AppModule {}