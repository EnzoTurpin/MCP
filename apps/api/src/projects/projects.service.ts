import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const DEFAULT_STATUSES = [
  { name: 'Backlog',    color: '#6b7280', order_index: 0, is_default: true,  is_done_state: false },
  { name: 'À faire',   color: '#3b82f6', order_index: 1, is_default: false, is_done_state: false },
  { name: 'En cours',  color: '#f59e0b', order_index: 2, is_default: false, is_done_state: false },
  { name: 'En review', color: '#8b5cf6', order_index: 3, is_default: false, is_done_state: false },
  { name: 'Terminé',   color: '#10b981', order_index: 4, is_default: false, is_done_state: true  },
];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        owner_id: userId,
        statuses: { create: DEFAULT_STATUSES },
      },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        statuses: {
          orderBy: { order_index: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, display_name: true } },
              },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    await this.assertMemberOrOwner(projectId, userId, project.owner_id);

    return project;
  }

  async update(projectId: string, userId: string, name: string) {
    await this.assertOwner(projectId, userId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { name },
    });
  }

  async remove(projectId: string, userId: string) {
    await this.assertOwner(projectId, userId);
    return this.prisma.project.delete({ where: { id: projectId } });
  }

  async createTask(projectId: string, userId: string, dto: CreateTaskDto) {
    await this.assertMemberOrOwner(projectId, userId);

    const lastTask = await this.prisma.task.findFirst({
      where: { status_id: dto.status_id },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.task.create({
      data: {
        project_id: projectId,
        creator_id: userId,
        title: dto.title,
        description: dto.description,
        status_id: dto.status_id,
        assignee_id: dto.assignee_id,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        priority: dto.priority,
        position: (lastTask?.position ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, display_name: true } },
      },
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertMemberOrOwner(projectId, userId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status_id !== undefined && { status_id: dto.status_id }),
        ...(dto.assignee_id !== undefined && { assignee_id: dto.assignee_id }),
        ...(dto.deadline !== undefined && { deadline: new Date(dto.deadline) }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
      include: {
        assignee: { select: { id: true, display_name: true } },
      },
    });
  }

  async removeTask(projectId: string, taskId: string, userId: string) {
    await this.assertMemberOrOwner(projectId, userId);
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  private async assertOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== userId) throw new ForbiddenException();
  }

  private async assertMemberOrOwner(
    projectId: string,
    userId: string,
    knownOwnerId?: string,
  ) {
    const ownerId =
      knownOwnerId ??
      (
        await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { owner_id: true },
        })
      )?.owner_id;

    if (!ownerId) throw new NotFoundException('Project not found');
    if (ownerId === userId) return;

    const member = await this.prisma.projectMember.findUnique({
      where: {
        project_id_user_id: { project_id: projectId, user_id: userId },
      },
    });
    if (!member) throw new ForbiddenException();
  }
}
