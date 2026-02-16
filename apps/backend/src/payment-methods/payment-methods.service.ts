import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a new card
  async create(name: string, last4: string) {
    return this.prisma.paymentMethod.create({
      data: {
        name,
        last4,
        isDefault: true, // Auto-set as default for simplicity
      },
    });
  }

  // 2. View all cards
  async findAll() {
    return this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Delete a card
  async remove(id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
