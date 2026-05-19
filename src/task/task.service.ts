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

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      priority: createTaskDto.priority,
      due_date: createTaskDto.due_date,
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

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }
}
