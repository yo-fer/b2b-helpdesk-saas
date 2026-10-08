import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  // reflector read metadata
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Search what role need certain route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route does not have the decorator @Roles(), so it is public
    if (!requiredRoles) return true;

    // Obtaining user
    const { user } = context.switchToHttp().getRequest();

    if (!user) throw new ForbiddenException('User not found in request');

    // Check if user role is in permited list
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole)
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );

    return true;
  }
}
