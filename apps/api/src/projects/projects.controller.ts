import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { Public } from 'auth/decorators/public.decorator';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ─── Routes publiques (pas d'authentification requise) ────────────────────

  @Get('shared/:shareToken')
  @Public()
  getSharedProject(@Param('shareToken') shareToken: string) {
    return this.projectsService.findByShareToken(shareToken);
  }

  @Get('invitations/:token')
  @Public()
  getInvitationInfo(@Param('token') token: string) {
    return this.projectsService.getInvitationInfo(token);
  }

  // ─── Routes authentifiées ─────────────────────────────────────────────────

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.projectsService.findAllForUser(userId);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Post('invitations/accept')
  acceptInvitation(
    @CurrentUser('sub') userId: string,
    @Body('token') token: string,
  ) {
    return this.projectsService.acceptInvitation(token, userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('name') name: string,
  ) {
    return this.projectsService.update(id, userId, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/favorite')
  toggleFavorite(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.toggleFavorite(projectId, userId);
  }

  @Patch(':id/statuses/:statusId')
  updateStatus(
    @Param('id') projectId: string,
    @Param('statusId') statusId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.projectsService.updateStatus(projectId, statusId, userId, dto);
  }

  @Delete(':id/statuses/:statusId')
  removeStatus(
    @Param('id') projectId: string,
    @Param('statusId') statusId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.removeStatus(projectId, statusId, userId);
  }

  @Post(':id/tasks')
  createTask(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projectsService.createTask(projectId, userId, dto);
  }

  @Patch(':id/tasks/:taskId')
  updateTask(
    @Param('id') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTask(projectId, taskId, userId, dto);
  }

  @Delete(':id/tasks/:taskId')
  removeTask(
    @Param('id') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.removeTask(projectId, taskId, userId);
  }

  // ─── Partage via lien ─────────────────────────────────────────────────────

  @Post(':id/share-link')
  generateShareLink(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.generateShareLink(projectId, userId);
  }

  @Delete(':id/share-link')
  revokeShareLink(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.revokeShareLink(projectId, userId);
  }

  // ─── Gestion des membres ──────────────────────────────────────────────────

  @Post(':id/invitations')
  inviteMember(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.projectsService.inviteMember(projectId, userId, dto.email);
  }

  @Get(':id/members')
  getMembers(
    @Param('id') projectId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.getMembers(projectId, userId);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.projectsService.updateMemberRole(projectId, targetUserId, userId, dto.role);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') projectId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.removeMember(projectId, targetUserId, userId);
  }
}
