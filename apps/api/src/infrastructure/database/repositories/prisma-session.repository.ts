import { Injectable } from '@nestjs/common';
import type { UserRole } from '@clashscout/shared';

import {
  SessionRepository,
  type AuthenticatedUser,
} from '../../../core/domain/repositories/session.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSessionRepository extends SessionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findValidUserBySessionToken(sessionToken: string): Promise<AuthenticatedUser | null> {
    const session = await this.prisma.client.session.findUnique({
      where: { sessionToken },
      select: {
        expires: true,
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });

    if (session === null || session.expires.getTime() <= Date.now()) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as UserRole,
    };
  }
}
