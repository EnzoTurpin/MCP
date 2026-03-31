import { Injectable } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaService } from '../../../apps/api/src/prisma/prisma.service';

@Injectable()
export class McpService {
    private server: Server;

    constructor(private readonly prisma: PrismaService) {
        this.server = new Server(
            { name: 'boards-mcp-server', version: '1.0.0' },
            { capabilities: { tools: {}, resources: {} } },
        );

        this.registerHandlers();
    }

    private registerHandlers() {
        // ── Tools list ────────────────────────────────────────────────────────

        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_projects',
                    description: "Liste tous les projets de l'utilisateur (propriétaire ou membre).",
                    inputSchema: {
                        type: 'object',
                        properties: {
                            user_email: { type: 'string', description: "Email de l'utilisateur" },
                        },
                        required: ['user_email'],
                    },
                },
                {
                    name: 'list_tasks',
                    description: 'Liste les tâches d\'un projet avec filtres optionnels.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: { type: 'string', description: 'ID du projet' },
                            status_name: { type: 'string', description: 'Filtrer par nom de statut (ex: "En cours")' },
                            assignee_email: { type: 'string', description: "Filtrer par email de l'assigné" },
                            overdue_only: { type: 'boolean', description: 'Retourner uniquement les tâches en retard' },
                        },
                        required: ['project_id'],
                    },
                },
                {
                    name: 'create_task',
                    description: 'Crée une nouvelle tâche dans un projet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: { type: 'string', description: 'ID du projet' },
                            creator_email: { type: 'string', description: 'Email du créateur' },
                            title: { type: 'string', description: 'Titre de la tâche' },
                            description: { type: 'string', description: 'Description de la tâche' },
                            status_name: { type: 'string', description: 'Nom du statut (ex: "Backlog"). Défaut : premier statut du projet.' },
                            assignee_email: { type: 'string', description: "Email de l'assigné (optionnel)" },
                            deadline: { type: 'string', description: 'Deadline au format ISO 8601 (optionnel)' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priorité (optionnel)' },
                        },
                        required: ['project_id', 'creator_email', 'title'],
                    },
                },
                {
                    name: 'update_task',
                    description: "Modifie le statut, l'assigné ou la deadline d'une tâche.",
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: { type: 'string', description: 'ID du projet' },
                            task_id: { type: 'string', description: 'ID de la tâche' },
                            status_name: { type: 'string', description: 'Nouveau statut (ex: "Terminé")' },
                            assignee_email: { type: 'string', description: "Nouvel assigné (email), ou null pour désassigner" },
                            deadline: { type: 'string', description: 'Nouvelle deadline ISO 8601, ou null pour effacer' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Nouvelle priorité' },
                            title: { type: 'string', description: 'Nouveau titre' },
                        },
                        required: ['project_id', 'task_id'],
                    },
                },
                {
                    name: 'get_project_summary',
                    description: 'Retourne un résumé structuré du projet : progression, tâches critiques, membres.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project_id: { type: 'string', description: 'ID du projet' },
                        },
                        required: ['project_id'],
                    },
                },
            ],
        }));

        // ── Tools execution ───────────────────────────────────────────────────

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name } = request.params;
            const args = (request.params.arguments ?? {}) as Record<string, unknown>;

            try {
                switch (name) {

                    case 'list_projects': {
                        const user = await this.prisma.user.findUnique({
                            where: { email: args.user_email as string },
                            select: { id: true },
                        });
                        if (!user) return this.error(`Utilisateur introuvable : ${args.user_email}`);

                        const projects = await this.prisma.project.findMany({
                            where: {
                                OR: [
                                    { owner_id: user.id },
                                    { members: { some: { user_id: user.id } } },
                                ],
                            },
                            include: {
                                _count: { select: { tasks: true, members: true } },
                                owner: { select: { display_name: true, email: true } },
                            },
                            orderBy: { created_at: 'desc' },
                        });

                        return this.ok(projects.map((p) => ({
                            id: p.id,
                            name: p.name,
                            owner: p.owner.display_name,
                            tasks: p._count.tasks,
                            members: p._count.members,
                            created_at: p.created_at,
                        })));
                    }

                    case 'list_tasks': {
                        const projectId = args.project_id as string;

                        // Resolve optional status filter
                        let statusId: string | undefined;
                        if (args.status_name) {
                            const status = await this.prisma.projectStatus.findFirst({
                                where: { project_id: projectId, name: { equals: args.status_name as string, mode: 'insensitive' } },
                                select: { id: true },
                            });
                            if (!status) return this.error(`Statut introuvable : ${args.status_name}`);
                            statusId = status.id;
                        }

                        // Resolve optional assignee filter
                        let assigneeId: string | undefined;
                        if (args.assignee_email) {
                            const assignee = await this.prisma.user.findUnique({
                                where: { email: args.assignee_email as string },
                                select: { id: true },
                            });
                            if (!assignee) return this.error(`Utilisateur introuvable : ${args.assignee_email}`);
                            assigneeId = assignee.id;
                        }

                        const now = new Date();
                        const tasks = await this.prisma.task.findMany({
                            where: {
                                project_id: projectId,
                                ...(statusId ? { status_id: statusId } : {}),
                                ...(assigneeId ? { assignee_id: assigneeId } : {}),
                                ...(args.overdue_only ? { deadline: { lt: now }, completed_at: null } : {}),
                            },
                            include: {
                                status: { select: { name: true } },
                                assignee: { select: { display_name: true, email: true } },
                                creator: { select: { display_name: true } },
                            },
                            orderBy: { position: 'asc' },
                        });

                        return this.ok(tasks.map((t) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            status: t.status.name,
                            priority: t.priority,
                            deadline: t.deadline,
                            assignee: t.assignee ? { name: t.assignee.display_name, email: t.assignee.email } : null,
                            creator: t.creator.display_name,
                            overdue: t.deadline ? t.deadline < now && !t.completed_at : false,
                            created_at: t.created_at,
                        })));
                    }

                    case 'create_task': {
                        const projectId = args.project_id as string;

                        const creator = await this.prisma.user.findUnique({
                            where: { email: args.creator_email as string },
                            select: { id: true },
                        });
                        if (!creator) return this.error(`Créateur introuvable : ${args.creator_email}`);

                        // Resolve status
                        let status = args.status_name
                            ? await this.prisma.projectStatus.findFirst({
                                where: { project_id: projectId, name: { equals: args.status_name as string, mode: 'insensitive' } },
                                select: { id: true },
                            })
                            : await this.prisma.projectStatus.findFirst({
                                where: { project_id: projectId },
                                orderBy: { order_index: 'asc' },
                                select: { id: true },
                            });
                        if (!status) return this.error('Aucun statut trouvé pour ce projet.');

                        // Resolve optional assignee
                        let assigneeId: string | undefined;
                        if (args.assignee_email) {
                            const assignee = await this.prisma.user.findUnique({
                                where: { email: args.assignee_email as string },
                                select: { id: true },
                            });
                            if (!assignee) return this.error(`Assigné introuvable : ${args.assignee_email}`);
                            assigneeId = assignee.id;
                        }

                        const lastTask = await this.prisma.task.findFirst({
                            where: { status_id: status.id },
                            orderBy: { position: 'desc' },
                            select: { position: true },
                        });

                        const task = await this.prisma.task.create({
                            data: {
                                project_id: projectId,
                                creator_id: creator.id,
                                title: args.title as string,
                                description: args.description as string | undefined,
                                status_id: status.id,
                                assignee_id: assigneeId,
                                deadline: args.deadline ? new Date(args.deadline as string) : undefined,
                                priority: args.priority as 'low' | 'medium' | 'high' | undefined,
                                position: (lastTask?.position ?? -1) + 1,
                            },
                            include: {
                                status: { select: { name: true } },
                                assignee: { select: { display_name: true } },
                            },
                        });

                        return this.ok({
                            id: task.id,
                            title: task.title,
                            status: task.status.name,
                            assignee: task.assignee?.display_name ?? null,
                            created: true,
                        });
                    }

                    case 'update_task': {
                        const { project_id, task_id } = args as { project_id: string; task_id: string };

                        const updateData: Record<string, unknown> = {};

                        if (args.title !== undefined) updateData.title = args.title;
                        if (args.priority !== undefined) updateData.priority = args.priority;

                        if (args.status_name !== undefined) {
                            const status = await this.prisma.projectStatus.findFirst({
                                where: { project_id, name: { equals: args.status_name as string, mode: 'insensitive' } },
                                select: { id: true },
                            });
                            if (!status) return this.error(`Statut introuvable : ${args.status_name}`);
                            updateData.status_id = status.id;
                        }

                        if (args.assignee_email !== undefined) {
                            if (args.assignee_email === null || args.assignee_email === '') {
                                updateData.assignee_id = null;
                            } else {
                                const assignee = await this.prisma.user.findUnique({
                                    where: { email: args.assignee_email as string },
                                    select: { id: true },
                                });
                                if (!assignee) return this.error(`Assigné introuvable : ${args.assignee_email}`);
                                updateData.assignee_id = assignee.id;
                            }
                        }

                        if (args.deadline !== undefined) {
                            updateData.deadline = args.deadline ? new Date(args.deadline as string) : null;
                        }

                        const task = await this.prisma.task.update({
                            where: { id: task_id },
                            data: updateData,
                            include: {
                                status: { select: { name: true } },
                                assignee: { select: { display_name: true } },
                            },
                        });

                        return this.ok({
                            id: task.id,
                            title: task.title,
                            status: task.status.name,
                            assignee: task.assignee?.display_name ?? null,
                            deadline: task.deadline,
                            updated: true,
                        });
                    }

                    case 'get_project_summary': {
                        const projectId = args.project_id as string;
                        const now = new Date();

                        const project = await this.prisma.project.findUnique({
                            where: { id: projectId },
                            include: {
                                owner: { select: { display_name: true, email: true } },
                                statuses: {
                                    orderBy: { order_index: 'asc' },
                                    include: { tasks: { select: { id: true, completed_at: true, deadline: true } } },
                                },
                                members: { include: { user: { select: { display_name: true, email: true } } } },
                            },
                        });
                        if (!project) return this.error(`Projet introuvable : ${projectId}`);

                        const totalTasks = project.statuses.reduce((sum, s) => sum + s.tasks.length, 0);
                        const doneTasks = project.statuses
                            .filter((s) => s.is_done_state)
                            .reduce((sum, s) => sum + s.tasks.length, 0);
                        const overdueTaskIds = project.statuses
                            .filter((s) => !s.is_done_state)
                            .flatMap((s) => s.tasks.filter((t) => t.deadline && t.deadline < now));
                        const overdueTasks = overdueTaskIds;

                        const statusBreakdown = project.statuses.map((s) => ({
                            name: s.name,
                            color: s.color,
                            count: s.tasks.length,
                            is_done_state: s.is_done_state,
                        }));

                        // Top 5 overdue tasks details
                        const overdueDetails = overdueTasks.length > 0
                            ? await this.prisma.task.findMany({
                                where: { id: { in: overdueTasks.map((t) => t.id) } },
                                include: { assignee: { select: { display_name: true } } },
                                orderBy: { deadline: 'asc' },
                                take: 5,
                            })
                            : [];

                        return this.ok({
                            project: {
                                id: project.id,
                                name: project.name,
                                owner: project.owner.display_name,
                                created_at: project.created_at,
                            },
                            progress: {
                                total_tasks: totalTasks,
                                done_tasks: doneTasks,
                                completion_rate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
                                overdue_count: overdueTasks.length,
                            },
                            status_breakdown: statusBreakdown,
                            overdue_tasks: overdueDetails.map((t) => ({
                                id: t.id,
                                title: t.title,
                                deadline: t.deadline,
                                assignee: t.assignee?.display_name ?? 'Non assigné',
                            })),
                            members: project.members.map((m) => ({
                                name: m.user.display_name,
                                email: m.user.email,
                                role: m.role,
                            })),
                        });
                    }

                    default:
                        return this.error(`Tool inconnu : ${name}`);
                }
            } catch (error) {
                return this.error(`Erreur interne : ${(error as Error).message}`);
            }
        });

        // ── Resources ─────────────────────────────────────────────────────────

        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const projects = await this.prisma.project.findMany({
                select: { id: true, name: true },
                orderBy: { created_at: 'desc' },
                take: 50,
            });

            return {
                resources: projects.map((p) => ({
                    uri: `project://${p.id}`,
                    name: p.name,
                    description: `Données complètes du projet "${p.name}"`,
                    mimeType: 'application/json',
                })),
            };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            const match = uri.match(/^project:\/\/(.+)$/);
            if (!match) throw new Error(`URI invalide : ${uri}`);

            const projectId = match[1];
            const now = new Date();

            const project = await this.prisma.project.findUnique({
                where: { id: projectId },
                include: {
                    owner: { select: { display_name: true, email: true } },
                    statuses: {
                        orderBy: { order_index: 'asc' },
                        include: {
                            tasks: {
                                orderBy: { position: 'asc' },
                                include: {
                                    assignee: { select: { display_name: true, email: true } },
                                    creator: { select: { display_name: true } },
                                },
                            },
                        },
                    },
                    members: { include: { user: { select: { display_name: true, email: true } } } },
                },
            });

            if (!project) throw new Error(`Projet introuvable : ${projectId}`);

            const totalTasksCount = project.statuses.reduce((sum, s) => sum + s.tasks.length, 0);
            const doneTasks = project.statuses
                .filter((s) => s.is_done_state)
                .reduce((sum, s) => sum + s.tasks.length, 0);
            const overdueTasks = project.statuses
                .filter((s) => !s.is_done_state)
                .flatMap((s) => s.tasks.filter((t) => t.deadline && t.deadline < now)).length;

            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: project.id,
                            name: project.name,
                            owner: project.owner,
                            created_at: project.created_at,
                            stats: {
                                total_tasks: totalTasksCount,
                                done_tasks: doneTasks,
                                completion_rate: totalTasksCount > 0 ? Math.round((doneTasks / totalTasksCount) * 100) : 0,
                                overdue_tasks: overdueTasks,
                            },
                            members: project.members.map((m) => ({
                                name: m.user.display_name,
                                email: m.user.email,
                                role: m.role,
                            })),
                            statuses: project.statuses.map((s) => ({
                                id: s.id,
                                name: s.name,
                                color: s.color,
                                is_done_state: s.is_done_state,
                                tasks: s.tasks.map((t) => ({
                                    id: t.id,
                                    title: t.title,
                                    description: t.description,
                                    priority: t.priority,
                                    deadline: t.deadline,
                                    overdue: t.deadline ? t.deadline < now && !s.is_done_state : false,
                                    assignee: t.assignee ? { name: t.assignee.display_name, email: t.assignee.email } : null,
                                    creator: t.creator.display_name,
                                })),
                            })),
                        }, null, 2),
                    },
                ],
            };
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ok(data: unknown) {
        return {
            content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        };
    }

    private error(message: string) {
        return {
            isError: true,
            content: [{ type: 'text' as const, text: message }],
        };
    }

    async connect(transport: Transport) {
        await this.server.connect(transport);
    }
}
