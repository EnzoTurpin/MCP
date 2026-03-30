import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    // Assert membership
    await this.projectsService.findOne(userId, projectId);

    const task = await this.prisma.task.create({
      data: {
        project_id: projectId,
        creator_id: userId,
        title: dto.title,
        description: dto.description,
        status_id: dto.status_id,
        assignee_id: dto.assignee_id,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        position: dto.position ?? 0,
        priority: dto.priority as any,
      },
      include: {
        status: true,
        assignee: { select: { id: true, display_name: true, email: true } },
        creator: { select: { id: true, display_name: true, email: true } },
      },
    });

    await this.prisma.taskActivity.create({
      data: {
        project_id: projectId,
        task_id: task.id,
        user_id: userId,
        type: 'task_created',
        metadata: { title: task.title },
      },
    });

    return task;
  }

  async findAll(
    userId: string,
    projectId: string,
    filters: { status_id?: string; assignee_id?: string; overdue?: boolean },
  ) {
    await this.projectsService.findOne(userId, projectId);

    const where: any = { project_id: projectId };
    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.assignee_id) where.assignee_id = filters.assignee_id;
    if (filters.overdue) {
      where.deadline = { lt: new Date() };
      where.completed_at = null;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        status: true,
        assignee: { select: { id: true, display_name: true, email: true } },
        creator: { select: { id: true, display_name: true, email: true } },
      },
      orderBy: [{ position: 'asc' }, { created_at: 'asc' }],
    });
  }

  async findOne(userId: string, projectId: string, taskId: string) {
    await this.projectsService.findOne(userId, projectId);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        status: true,
        assignee: { select: { id: true, display_name: true, email: true } },
        creator: { select: { id: true, display_name: true, email: true } },
        activity: {
          include: { user: { select: { id: true, display_name: true } } },
          orderBy: { created_at: 'desc' },
          take: 20,
        },
      },
    });

    if (!task || task.project_id !== projectId) throw new NotFoundException('Tâche introuvable');
    return task;
  }

  async update(userId: string, projectId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.findOne(userId, projectId, taskId);
    const prevStatusId = task.status_id;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        priority: dto.priority as any,
        // Auto-set completed_at when moved to a done status
        completed_at:
          dto.status_id && dto.status_id !== prevStatusId
            ? await this.isDoneStatus(dto.status_id)
              ? new Date()
              : null
            : undefined,
      },
      include: {
        status: true,
        assignee: { select: { id: true, display_name: true, email: true } },
        creator: { select: { id: true, display_name: true, email: true } },
      },
    });

    if (dto.status_id && dto.status_id !== prevStatusId) {
      await this.prisma.taskActivity.create({
        data: {
          project_id: projectId,
          task_id: taskId,
          user_id: userId,
          type: 'task_status_changed',
          metadata: { from: prevStatusId, to: dto.status_id },
        },
      });
    }

    return updated;
  }

  async remove(userId: string, projectId: string, taskId: string) {
    const task = await this.findOne(userId, projectId, taskId);

    if (task.creator_id !== userId) {
      // Only creator or project owner can delete
      const project = await this.projectsService.findOne(userId, projectId);
      if (project.owner_id !== userId)
        throw new ForbiddenException('Seul le créateur ou le propriétaire peut supprimer');
    }

    return this.prisma.task.delete({ where: { id: taskId } });
  }

  private async isDoneStatus(statusId: string): Promise<boolean> {
    const status = await this.prisma.projectStatus.findUnique({ where: { id: statusId } });
    return status?.is_done_state ?? false;
  }
}
