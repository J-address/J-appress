import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth.types';

/**
 * Admin Controller - Protected endpoints for admin users only
 *
 * All routes in this controller require:
 * 1. Valid JWT token (JwtAuthGuard)
 * 2. ADMIN role (RolesGuard + @Roles decorator)
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards to all routes
export class AdminController {
  /**
   * GET /admin/dashboard
   * Returns admin dashboard data
   *
   * Access: ADMIN only
   */
  @Get('dashboard')
  @Roles(Role.ADMIN)
  getDashboard(@CurrentUser() user: AuthUser) {
    return {
      message: 'Welcome to the admin dashboard',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalUsers: 0, // TODO: Implement actual stats
        totalInboxItems: 0,
      },
    };
  }

  /**
   * GET /admin/users
   * Returns list of all users
   *
   * Access: ADMIN only
   */
  @Get('users')
  @Roles(Role.ADMIN)
  getAllUsers(@CurrentUser() user: AuthUser) {
    return {
      message: 'Admin-only endpoint: List of all users',
      requestedBy: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      users: [], // TODO: Implement actual user list from database
    };
  }
}
