import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
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

  async findAllForUser(userId: string) {
    const [projects, favorites] = await Promise.all([
      this.prisma.project.findMany({
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
      }),
      this.prisma.projectFavorite.findMany({
        where: { user_id: userId },
        select: { project_id: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const favoriteMap = new Map(
      favorites.map((f) => [f.project_id, f.created_at]),
    );

    return projects
      .map((p) => ({
        ...p,
        isFavorited: favoriteMap.has(p.id),
        favoritedAt: favoriteMap.get(p.id) ?? null,
      }))
      .sort((a, b) => {
        if (a.isFavorited && b.isFavorited) {
          return b.favoritedAt!.getTime() - a.favoritedAt!.getTime();
        }
        if (a.isFavorited) return -1;
        if (b.isFavorited) return 1;
        return 0;
      });
  }

  async toggleFavorite(projectId: string, userId: string) {
    await this.assertMemberOrOwner(projectId, userId);

    const existing = await this.prisma.projectFavorite.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: userId } },
    });

    if (existing) {
      await this.prisma.projectFavorite.delete({
        where: { project_id_user_id: { project_id: projectId, user_id: userId } },
      });
      return { isFavorited: false };
    }

    await this.prisma.projectFavorite.create({
      data: { project_id: projectId, user_id: userId },
    });
    return { isFavorited: true };
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
        members: { select: { user_id: true, role: true } },
        _count: { select: { members: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

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

  async updateStatus(projectId: string, statusId: string, userId: string, dto: UpdateStatusDto) {
    await this.assertOwner(projectId, userId);
    const status = await this.prisma.projectStatus.findUnique({
      where: { id: statusId },
      select: { project_id: true },
    });
    if (!status || status.project_id !== projectId) throw new NotFoundException('Status not found');
    return this.prisma.projectStatus.update({
      where: { id: statusId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async removeStatus(projectId: string, statusId: string, userId: string) {
    await this.assertOwner(projectId, userId);

    const statuses = await this.prisma.projectStatus.findMany({
      where: { project_id: projectId },
      select: { id: true },
    });
    if (statuses.length <= 1) {
      throw new ForbiddenException('Impossible de supprimer le dernier statut');
    }

    const status = statuses.find((s) => s.id === statusId);
    if (!status) throw new NotFoundException('Status not found');

    await this.prisma.$transaction([
      this.prisma.task.deleteMany({ where: { status_id: statusId } }),
      this.prisma.projectStatus.delete({ where: { id: statusId } }),
    ]);
  }

  // ─── Partage via lien ────────────────────────────────────────────────────────

  async generateShareLink(projectId: string, userId: string) {
    await this.assertOwner(projectId, userId);
    const shareToken = randomBytes(32).toString('hex');
    await this.prisma.project.update({
      where: { id: projectId },
      data: { share_token: shareToken },
    });
    return { shareToken };
  }

  async revokeShareLink(projectId: string, userId: string) {
    await this.assertOwner(projectId, userId);
    await this.prisma.project.update({
      where: { id: projectId },
      data: { share_token: null },
    });
  }

  async findByShareToken(shareToken: string) {
    const project = await this.prisma.project.findUnique({
      where: { share_token: shareToken },
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

    if (!project) throw new NotFoundException('Lien de partage invalide ou révoqué');

    // Ne pas exposer le share_token dans la réponse publique
    const { share_token, ...rest } = project;
    void share_token;
    return rest;
  }

  // ─── Invitations par email ────────────────────────────────────────────────

  async inviteMember(projectId: string, invitedByUserId: string, email: string) {
    // Admins et propriétaires peuvent inviter
    await this.assertAdminOrOwner(projectId, invitedByUserId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Vérifier que l'invité n'est pas déjà propriétaire ou membre
    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (invitedUser) {
      if (invitedUser.id === project.owner_id) {
        throw new ConflictException('Cet utilisateur est déjà propriétaire du projet');
      }
      const existingMember = await this.prisma.projectMember.findUnique({
        where: { project_id_user_id: { project_id: projectId, user_id: invitedUser.id } },
      });
      if (existingMember) {
        throw new ConflictException('Cet utilisateur est déjà membre du projet');
      }
    }

    // Supprimer l'éventuelle invitation en attente pour cet email
    await this.prisma.projectInvitation.deleteMany({
      where: { project_id: projectId, email, status: 'pending' },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    return this.prisma.projectInvitation.create({
      data: {
        project_id: projectId,
        email,
        invited_by_user_id: invitedByUserId,
        token,
        status: 'pending',
        expires_at: expiresAt,
      },
      select: { token: true, email: true, expires_at: true },
    });
  }

  async getInvitationInfo(token: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: { select: { name: true } },
        invited_by: { select: { display_name: true } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Cette invitation a déjà été utilisée ou a expiré');
    }
    if (invitation.expires_at < new Date()) {
      await this.prisma.projectInvitation.update({
        where: { token },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Cette invitation a expiré');
    }

    return {
      email: invitation.email,
      projectName: invitation.project.name,
      invitedBy: invitation.invited_by.display_name,
      expiresAt: invitation.expires_at,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { token },
      select: {
        project_id: true,
        email: true,
        status: true,
        expires_at: true,
      },
    });

    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation déjà utilisée ou expirée');
    }
    if (invitation.expires_at < new Date()) {
      await this.prisma.projectInvitation.update({
        where: { token },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation expirée');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException("Cette invitation ne correspond pas à votre compte");
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: invitation.project_id, user_id: userId } },
    });

    await this.prisma.$transaction([
      ...(existingMember ? [] : [
        this.prisma.projectMember.create({
          data: { project_id: invitation.project_id, user_id: userId, role: 'member' },
        }),
      ]),
      this.prisma.projectInvitation.update({
        where: { token },
        data: { status: 'accepted' },
      }),
    ]);

    return { projectId: invitation.project_id };
  }

  async getMembers(projectId: string, userId: string) {
    await this.assertMemberOrOwner(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, display_name: true, email: true } },
        members: {
          include: { user: { select: { id: true, display_name: true, email: true } } },
          orderBy: { joined_at: 'asc' },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    return {
      owner: project.owner,
      members: project.members.map((m) => ({
        ...m.user,
        role: m.role,
        joined_at: m.joined_at,
      })),
    };
  }

  async removeMember(projectId: string, targetUserId: string, requesterId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.owner_id === requesterId;

    const targetMember = await this.prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
    });
    if (!targetMember) throw new NotFoundException('Ce membre ne fait pas partie du projet');

    if (!isOwner) {
      // Vérifier que le requérant est admin
      const requesterMember = await this.prisma.projectMember.findUnique({
        where: { project_id_user_id: { project_id: projectId, user_id: requesterId } },
      });
      if (!requesterMember || requesterMember.role !== 'admin') {
        throw new ForbiddenException();
      }
      // Un admin ne peut expulser que des membres (pas d'autres admins)
      if (targetMember.role === 'admin') {
        throw new ForbiddenException('Un admin ne peut pas expulser un autre admin');
      }
    }

    await this.prisma.projectMember.delete({
      where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
    });
  }

  async updateMemberRole(
    projectId: string,
    targetUserId: string,
    requesterId: string,
    role: 'admin' | 'member',
  ) {
    await this.assertOwner(projectId, requesterId);

    const member = await this.prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
    });
    if (!member) throw new NotFoundException('Ce membre ne fait pas partie du projet');

    return this.prisma.projectMember.update({
      where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } },
      data: { role },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id !== userId) throw new ForbiddenException();
  }

  private async assertAdminOrOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner_id === userId) return;

    const member = await this.prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: userId } },
    });
    if (!member || member.role !== 'admin') throw new ForbiddenException();
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
