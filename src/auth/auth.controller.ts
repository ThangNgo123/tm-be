import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/jwt.guard';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Google OAuth Login' })
  @ApiBody({
    type: GoogleLoginDto,
    examples: {
      example1: {
        summary: 'Valid Google Token',
        value: {
          token:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ...',
        },
      },
    },
  })
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.googleLogin(googleLoginDto.token);
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiBody({
    schema: {
      properties: { refreshToken: { type: 'string' } },
      example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }
}
