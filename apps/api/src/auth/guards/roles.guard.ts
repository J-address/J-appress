import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../../generated/prisma';
import type { AuthUser } from '../types/auth.types';

/**
 * Guard that checks if the authenticated user has the required role(s)
 * to access a specific endpoint.
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.ADMIN)
 * @Get('users')
 * getAllUsers() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  // Reflector is a NestJS utility that reads metadata attached to handlers/classes
  // In this case, it reads the roles we specified in the @Roles() decorator

  canActivate(context: ExecutionContext): boolean {
    // Read the 'roles' metadata from the @Roles() decorator
    // Checks both method and class level - method level takes precedence
    // Example: @Roles(Role.ADMIN) → requiredRoles = [Role.ADMIN]
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      'roles', // The metadata key we set in the decorator
      [context.getHandler(), context.getClass()], // Check method, then controller
    );

    if (!requiredRoles) {
      return true; // No @Roles() decorator present, allow access
    }

    // Get the request object which contains the authenticated user
    // Type it as Express Request with optional user property
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user; // User info attached by JwtAuthGuard

    // Check if user exists and has one of the required roles
    // Using optional chaining for safe access
    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true; // User has required role, allow access
  }
}
