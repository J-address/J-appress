import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma';

/**
 * Decorator to specify which roles are allowed to access an endpoint.
 *
 * This decorator attaches metadata to the route handler, which is then
 * read by the RolesGuard to enforce role-based access control.
 *
 * Usage:
 * @Roles(Role.ADMIN)              // Only admins
 * @Roles(Role.USER, Role.ADMIN)   // Users or admins
 * @Get('users')
 * getAllUsers() { ... }
 *
 * @param roles - One or more Role enum values
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
// SetMetadata('roles', roles) stores the roles array as metadata
// with the key 'roles' - this is what the RolesGuard reads
