import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from './dto/payment-method.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Resolver(() => PaymentMethod)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodsResolver {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Mutation(() => PaymentMethod)
  @Roles(Role.ADMIN)
  createPaymentMethod(
    @Args('name') name: string,
    @Args('last4') last4: string,
  ) {
    return this.paymentMethodsService.create(name, last4);
  }

  @Query(() => [PaymentMethod], { name: 'paymentMethods' })
  @Roles(Role.ADMIN)
  findAllPaymentMethods() {
    return this.paymentMethodsService.findAll();
  }

  @Mutation(() => PaymentMethod)
  @Roles(Role.ADMIN)
  removePaymentMethod(@Args('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
}
