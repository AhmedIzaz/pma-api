import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TActorTypeEnum } from 'src/common/enums/database.enum';

export const ROLES_KEY = 'roles';

export const Roles = Reflector.createDecorator<TActorTypeEnum[]>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no role restriction
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;


    if (!user?.actorType || !requiredRoles.includes(user.actorType)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
