import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type' })
  tokenType: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn: number;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last login date', required: false })
  lastLoginAt?: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: UserResponseDto;

  @ApiProperty({ description: 'Token information' })
  tokens: TokenResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({ description: 'Logout success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
