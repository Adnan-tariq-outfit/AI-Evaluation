import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestUser } from './strategies/jwt.strategy';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from './dto/auth-request.dto';
import {
  AuthResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';

interface RequestWithUser extends Request {
  user: RequestUser;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============== REGISTRATION ==============

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  // ============== LOGIN ==============

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  // ============== TOKEN REFRESH ==============

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  // ============== LOGOUT ==============

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: LogoutResponseDto,
  })
  async logout(): Promise<LogoutResponseDto> {
    return this.authService.logout();
  }

  // ============== CURRENT USER ==============

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({
    status: 200,
    description: 'Current user info',
    schema: {
      properties: {
        isAuthenticated: { type: 'boolean' },
        user: { type: 'object' },
      },
    },
  })
  async getCurrentUser(@Req() req: RequestWithUser) {
    const { user } = req;

    return {
      isAuthenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }
}
