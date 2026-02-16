import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderInput } from './dto/create-order.input';
import { Order } from './dto/order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../restaurants/restaurants.service';
import { Role } from '@prisma/client';

@Resolver(() => Order)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  // 1.Everyone can view the restaurents and menu items
  @Query(() => [Order], { name: 'orders' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findAll(user);
  }

  // 2. Everyone can create an order
  @Mutation(() => Order)
  createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.create(createOrderInput, user);
  }

  // 3. ONLY Admins & Managers can Pay
  @Mutation(() => Order)
  @Roles(Role.ADMIN, Role.MANAGER)
  payOrder(@Args('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.pay(id, user);
  }

  // 4. ONLY Admins & Managers can canvel the order
  @Mutation(() => Order)
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancelOrder(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.cancel(id, user);
  }
}
