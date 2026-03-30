import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon/pokemon.service';
import { McpService } from './mcp/mcp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PokemonService, McpService],
})
export class AppModule {}