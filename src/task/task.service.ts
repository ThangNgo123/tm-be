import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Project } from '../entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const project = await this.projectRepository.findOne({
      where: { id: createTaskDto.project_id, user: { id: userId } },
    });

    if (!project) {
      throw new BadRequestException('Project not found or unauthorized');
    }

    const dueDateStart = createTaskDto.due_date_start
      ? new Date(createTaskDto.due_date_start)
      : undefined;
    const dueDateEnd = createTaskDto.due_date_end
      ? new Date(createTaskDto.due_date_end)
      : undefined;

    if (dueDateStart && dueDateEnd && dueDateEnd < dueDateStart) {
      throw new BadRequestException(
        'due_date_end must be greater than or equal to due_date_start',
      );
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      priority: createTaskDto.priority,
      due_date_start: dueDateStart,
      due_date_end: dueDateEnd,
      project,
    });

    return this.taskRepository.save(task);
  }

  async findAll(projectId: string, userId: string): Promise<Task[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) {
      throw new BadRequestException('Project not found or unauthorized');
    }

    return this.taskRepository.find({
      where: { project: { id: projectId } },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'project.user'],
    });

    if (!task || task.project.user.id !== userId) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    const hasDueDateStart = updateTaskDto.due_date_start !== undefined;
    const hasDueDateEnd = updateTaskDto.due_date_end !== undefined;

    const dueDateStart = hasDueDateStart
      ? new Date(updateTaskDto.due_date_start as string)
      : task.due_date_start;
    const dueDateEnd = hasDueDateEnd
      ? new Date(updateTaskDto.due_date_end as string)
      : task.due_date_end;

    if (dueDateStart && dueDateEnd && dueDateEnd < dueDateStart) {
      throw new BadRequestException(
        'due_date_end must be greater than or equal to due_date_start',
      );
    }

    Object.assign(task, updateTaskDto);

    if (hasDueDateStart) {
      task.due_date_start = dueDateStart;
    }

    if (hasDueDateEnd) {
      task.due_date_end = dueDateEnd;
    }

    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }
}
