import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth-request.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // ============== AUTHENTICATION METHODS ==============

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = new this.userModel({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    // With pure JWT and no tracking, logout is purely a client-side operation
    return { success: true, message: 'Successfully logged out' };
  }

  // ============== TOKEN METHODS ==============

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userModel.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or deactivated');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user: this.mapUserToResponse(user),
        tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ============== HELPER METHODS ==============

  private async generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private mapUserToResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
