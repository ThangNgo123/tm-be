import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { AuthGuard } from '../auth/guards/jwt.guard';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      example1: {
        summary: 'Create new task',
        value: {
          title: 'Fix bug',
          description: 'Fix login bug',
          status: 'todo',
          priority: 1,
          due_date: '2026-05-25T00:00:00Z',
          project_id: 'uuid-here',
        },
      },
    },
  })
  create(@Body() createTaskDto: CreateTaskDto, @UserDecorator() user: User) {
    return this.taskService.create(createTaskDto, user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get all tasks in a project' })
  findAll(
    @Query('project_id', new ParseUUIDPipe()) projectId: string,
    @UserDecorator() user: User,
  ) {
    return this.taskService.findAll(projectId, user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
  ) {
    return this.taskService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Update task' })
  @ApiBody({ type: UpdateTaskDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, user.id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete task' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
  ) {
    return this.taskService.remove(id, user.id);
  }
}
