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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt.guard';
import { User } from '../auth/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Create new user',
        value: {
          email: 'user@example.com',
          full_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get all user' })
  findAll() {
    return this.userService.findAll();
  }

  @Post('profile')
  @ApiOperation({ summary: 'Get user profile by email' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string' } },
      example: { email: 'user@example.com' },
    },
  })
  @ApiSecurity('token')
  async getProfile(@Body() body: { email: string }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException(`User with email ${body.email} not found`);
    }
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Update user profile',
        value: {
          full_name: 'John Updated',
          avatar_url: 'https://example.com/new-avatar.jpg',
        },
      },
    },
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.remove(id);
  }
}
