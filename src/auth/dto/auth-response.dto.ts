import { User } from '../../entities/user.entity';

export class AuthResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}
