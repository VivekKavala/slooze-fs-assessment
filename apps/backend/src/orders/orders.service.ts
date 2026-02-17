import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { AuthenticatedUser } from '../restaurants/restaurants.service';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderInput: CreateOrderInput, user: AuthenticatedUser) {
    const { restaurantId, items } = createOrderInput;

    // 1. Fetch Restaurant & Validate Region (ReBAC)
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menuItems: true }, // Load menu to verify items exist
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (user.role !== Role.ADMIN && restaurant.region !== user.region) {
      throw new ForbiddenException('You can only order from your own region.');
    }

    // 2. Process Items (The Secure Price Lookup)
    let totalAmount = 0;
    const finalOrderItems = [];

    for (const itemInput of items) {
      // Find the specific menu item in the restaurant's menu
      const menuItem = restaurant.menuItems.find(
        (m) => m.id === itemInput.menuItemId,
      );

      if (!menuItem) {
        throw new BadRequestException(
          `Menu Item ${itemInput.menuItemId} does not belong to this restaurant`,
        );
      }

      // Calculate cost using DATABASE price (Secure!)
      const itemTotal = menuItem.price * itemInput.quantity;
      totalAmount += itemTotal;

      // Prepare the snapshot data
      finalOrderItems.push({
        name: menuItem.name, // Snapshot name
        price: menuItem.price, // Snapshot price
        quantity: itemInput.quantity,
      });
    }

    // 3. Create Order
    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: finalOrderItems, // Write the snapshots
        },
      },
      include: { items: true, restaurant: true },
    });
  }

  async pay(orderId: string, user: AuthenticatedUser) {
    // Step A: Find the order AND the restaurant info
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    // Step B: ReBAC Check (The Bonus Objective)
    // If user is NOT Admin, they must be in the same region as the restaurant
    if (user.role !== Role.ADMIN) {
      if (order.restaurant.region !== user.region) {
        throw new ForbiddenException(
          `Access Denied: You cannot pay for orders outside your region (${user.region})`,
        );
      }
    }

    // Step C: Process Payment
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
      include: { items: true, restaurant: true }, // Return full tree for GraphQL
    });
  }

  // 3. Find All (ReBAC: Only see your region's orders)
  async findAll(user: AuthenticatedUser) {
    const where =
      user.role === Role.ADMIN
        ? {}
        : {
            restaurant: { region: user.region },
          };

    return this.prisma.order.findMany({
      where,
      include: { items: true, restaurant: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(orderId: string, user: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new NotFoundException(`Order #${orderId} not found`);

    // ReBAC Check: Managers can only cancel orders in their region
    if (user.role !== Role.ADMIN && order.restaurant.region !== user.region) {
      throw new ForbiddenException(
        'You cannot cancel orders in another region.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true, restaurant: true },
    });
  }
}
