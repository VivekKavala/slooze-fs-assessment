import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, Region } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  region?: Region | null;
}

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    const where = user.role === Role.ADMIN ? {} : { region: user.region };

    return this.prisma.restaurant.findMany({
      where,
      include: { menuItems: true },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    // 1. Fetch the restaurant with menu
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }

    // 2. ReBAC Security Check (Bonus Point Logic)
    // If user is NOT Admin, they can only view restaurants in their region
    if (user.role !== Role.ADMIN && restaurant.region !== user.region) {
      throw new ForbiddenException(
        `You cannot view restaurants in ${restaurant.region}`,
      );
    }

    return restaurant;
  }
}
