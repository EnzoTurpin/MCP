import { Injectable } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PrismaService } from '../../../apps/api/src/prisma/prisma.service';

@Injectable()
export class McpService {
    private server: Server;

    constructor(
        private readonly prisma: PrismaService,
    ) {

        this.server = new Server(
            { name: 'poke-mcp-server', version: '1.0.0' },
            { capabilities: { tools: {} } }
        );

        this.registerHandlers();
    }

    private registerHandlers() {
        // 1. Liste des outils
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_all_users',
                    description: 'Récupère la liste des utilisateurs inscrits en base de données.',
                    inputSchema: { type: 'object', properties: {} },
                }
            ],
        }));

        // 2. Logique d'exécution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {

                case 'get_all_users':
                case 'get_all_users':
                    try {
                        // On s'assure que Prisma est bien connecté
                        const users = await this.prisma.user.findMany({
                            select: {
                                id: true,
                                email: true,
                                first_name: true,
                                last_name: true,
                                created_at: true,
                                modified_at: true,
                            }
                        });

                        return {
                            content: [{
                                type: 'text',
                                text: users.length > 0
                                    ? JSON.stringify(users, null, 2)
                                    : "La base de données est vide."
                            }],
                        };
                    } catch (error) {
                        // C'est ce bloc qui évite le message d'erreur générique dans Claude
                        return {
                            isError: true,
                            content: [{
                                type: 'text',
                                text: `Erreur lors de la récupération des utilisateurs : ${error.message}`
                            }],
                        };
                    }

                default:
                    throw new Error(`Tool not found: ${name}`);
            }
        });
    }

    // Utilisé uniquement par le main.ts
    async connect(transport: Transport) {
        await this.server.connect(transport);
    }
}