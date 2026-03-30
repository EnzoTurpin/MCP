import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const DEFAULT_STATUSES = [
  { name: 'To Do', color: '#6B7280', order_index: 0, is_default: true, is_done_state: false },
  { name: 'In Progress', color: '#3B82F6', order_index: 1, is_default: false, is_done_state: false },
  { name: 'Done', color: '#10B981', order_index: 2, is_default: false, is_done_state: true },
];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        owner_id: userId,
        members: {
          create: { user_id: userId, role: 'owner' },
        },
        statuses: {
          create: DEFAULT_STATUSES,
        },
      },
      include: { statuses: true, members: true },
    });
  }

  // List projects where the user is a member
  findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { members: { some: { user_id: userId } } },
      include: {
        owner: { select: { id: true, display_name: true, email: true } },
        members: {
          include: { user: { select: { id: true, display_name: true, email: true } } },
        },
        statuses: { orderBy: { order_index: 'asc' } },
        _count: { select: { tasks: true } },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, display_name: true, email: true } },
        members: {
          include: { user: { select: { id: true, display_name: true, email: true } } },
        },
        statuses: { orderBy: { order_index: 'asc' } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) throw new NotFoundException('Projet introuvable');
    this.assertMember(project, userId);
    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.findOne(userId, projectId);
    this.assertOwner(project, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async remove(userId: string, projectId: string) {
    const project = await this.findOne(userId, projectId);
    this.assertOwner(project, userId);

    return this.prisma.project.delete({ where: { id: projectId } });
  }

  // ── Members ────────────────────────────────────────────────────────────────

  async addMember(userId: string, projectId: string, targetUserId: string, role: string) {
    const project = await this.findOne(userId, projectId);
    this.assertOwnerOrAdmin(project, userId);

    return this.prisma.projectMember.create({
      data: { project_id: projectId, user_id: targetUserId, role },
    });
  }

  async removeMember(userId: string, projectId: string, targetUserId: string) {
    const project = await this.findOne(userId, projectId);
    this.assertOwner(project, userId);

    return this.prisma.projectMember.delete({
      where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private assertMember(project: { members: { user_id: string }[] }, userId: string) {
    const isMember = project.members.some((m) => m.user_id === userId);
    if (!isMember) throw new ForbiddenException('Accès refusé');
  }

  private assertOwner(project: { owner_id: string }, userId: string) {
    if (project.owner_id !== userId) throw new ForbiddenException('Réservé au propriétaire');
  }

  private assertOwnerOrAdmin(
    project: { owner_id: string; members: { user_id: string; role: string }[] },
    userId: string,
  ) {
    if (project.owner_id === userId) return;
    const member = project.members.find((m) => m.user_id === userId);
    if (member?.role !== 'admin') throw new ForbiddenException('Réservé au propriétaire ou admin');
  }
}
