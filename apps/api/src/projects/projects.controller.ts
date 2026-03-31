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
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
}
