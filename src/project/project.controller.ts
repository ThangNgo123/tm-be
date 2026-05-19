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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/guards/jwt.guard';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      example1: {
        summary: 'Create new project',
        value: {
          name: 'My Project',
          description: 'Project description',
        },
      },
    },
  })
  create(
    @UserDecorator() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(user, createProjectDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get all projects for user' })
  findAll(@UserDecorator() user: User) {
    return this.projectService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
  ) {
    return this.projectService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Update project' })
  @ApiBody({ type: UpdateProjectDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, user.id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete project' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserDecorator() user: User,
  ) {
    return this.projectService.remove(id, user.id);
  }
}
