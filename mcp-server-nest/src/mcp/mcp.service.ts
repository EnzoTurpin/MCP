import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ModelHintSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PokemonService } from '../pokemon/pokemon.service';

@Injectable()
export class McpService implements OnModuleInit {
    private server: Server;

    constructor(private readonly pokemonService: PokemonService) {
        this.server = new Server(
            { name: 'poke-mcp-server', version: '1.0.0' },
            { capabilities: { tools: {} } }
        );
    }

    async onModuleInit() {
        this.setupHandlers();
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('MCP Server running on stdio');
    }

    private setupHandlers() {
        // 1. Liste des outils disponibles
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_pokemon_info',
                    description: 'Get detailed info about a Pokémon by name.',
                    inputSchema: {
                        type: 'object',
                        properties: { name: { type: 'string' } },
                        required: ['name'],
                    },
                },
                {
                    name: 'create_tournament_squad',
                    description: 'Create a powerful squad of Pokémon for a tournament.',
                    inputSchema: { type: 'object', properties: {} },
                },
                {
                    name: 'create_team_by_criterion',
                    description: 'Recherche et trie les Pokémon. Tu peux filtrer par type et choisir la stat à optimiser.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            criterion: { type: 'string', enum: ['attack', 'defense', 'speed', 'hp'], default: 'attack' },
                            mode: { type: 'string', enum: ['max', 'min'], default: 'max' },
                            type: { type: 'string', description: 'Le type (ex: electric, fire, water...)' },
                            limit: { type: 'number', description: 'Nombre de résultats' }
                        }
                    }
                },
            ],
        }));

        // 2. Exécution des outils
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'get_pokemon_info':
                    const info = await this.pokemonService.getPokemonInfo(args?.name as string);
                    return { content: [{ type: 'text', text: info }] };

                case 'create_tournament_squad':
                    const squad = await this.pokemonService.createTournamentSquad();
                    return { content: [{ type: 'text', text: squad }] };

                case 'create_team_by_criterion':
                    const criterion = (args?.criterion as string) || 'attack';
                    const mode = (args?.mode as string) || 'max';
                    const type = args?.type as string | undefined;
                    const limit = (args?.limit as number) || 6;
                    const customSquad = await this.pokemonService.createTeamByCriterion(criterion, mode, type, limit);
                    return { content: [{ type: 'text', text: customSquad }] };

                default:
                    throw new Error(`Tool not found: ${name}`);
            }
        });
    }
}