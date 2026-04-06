import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type?: string;
}

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: { headers?: { cookie?: string } }) => {
          const cookieHeader = req?.headers?.cookie;
          if (!cookieHeader) return null;

          const cookies = cookieHeader.split(';').map((part) => part.trim());
          const accessCookie = cookies.find((c) =>
            c.startsWith('nexusai_access_token='),
          );
          if (!accessCookie) return null;

          const value = accessCookie.split('=').slice(1).join('=');
          if (!value) return null;

          try {
            return decodeURIComponent(value);
          } catch {
            return value;
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.type === 'refresh') {
       throw new UnauthorizedException('Refresh token cannot be used as access token');
    }

    // Verify user exists
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
