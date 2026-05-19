import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async googleLogin(googleToken: string): Promise<AuthResponseDto> {
    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Check if user exists
      let user = await this.userService.findByEmail(payload.email);

      // Create user if doesn't exist
      if (!user) {
        user = await this.userService.create({
          email: payload.email,
          full_name: payload.name,
          avatar_url: payload.picture,
        });
      }

      // Generate access token
      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: (this.configService.get<string>('JWT_EXPIRATION') || '15m') as any,
        },
      );

      // Generate refresh token
      const refreshTokenExpires = new Date();
      refreshTokenExpires.setDate(
        refreshTokenExpires.getDate() +
          parseInt(
            this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7',
          ),
      );

      const refreshTokenEntity = this.refreshTokenRepository.create({
        user,
        token: this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' }),
        expires_at: refreshTokenExpires,
      });

      await this.refreshTokenRepository.save(refreshTokenEntity);

      return {
        user,
        accessToken,
        refreshToken: refreshTokenEntity.token,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const token = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['user'],
      });

      if (!token || token.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: token.user.id,
          email: token.user.email,
        },
        {
          expiresIn: (this.configService.get<string>('JWT_EXPIRATION') || '15m') as any,
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  async verifyToken(token: string): Promise<{ user: any }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
