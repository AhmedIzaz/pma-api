import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { TUserInterface } from 'src/userModule/interfaces/user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
    // private  reflector: Reflector
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request?.headers?.authorization?.split(' ')[1];

      const data = await this.jwtService.verifyAsync(token);
      const { userId, userName, userEmail, actorType } = data ?? {};

      const user: TUserInterface = {
        userId: Number(userId),
        userName,
        userEmail,
        actorType,
      };
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token Expired');
    }
  }
}
