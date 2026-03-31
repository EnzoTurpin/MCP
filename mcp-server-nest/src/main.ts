import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpService } from './mcp/mcp.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const mcpService = app.get(McpService);
    const transport = new StdioServerTransport(); // Une seule fois !

    // Cette ligne appelle la méthode qu'on a gardée dans le service
    await mcpService.connect(transport);

    console.error('MCP Server [mcp-server-trello] started on stdio');
  } catch (error) {
    console.error('Failed to start MCP Server:', error);
    process.exit(1);
  }
}
bootstrap();