import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Add custom behavior before JWT validation
    return super.canActivate(context);
  }

  handleRequest<TUser = Record<string, unknown>>(
    err: unknown,
    user: TUser | false | null,
    info?: { message?: string },
  ): TUser {
    if (err || !user) {
      if (err instanceof Error) throw err;
      if (typeof info?.message === 'string' && info.message.length > 0) {
        throw new UnauthorizedException(info.message);
      }
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
