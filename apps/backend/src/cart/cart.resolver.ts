import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../restaurants/restaurants.service';
import { Role } from '@prisma/client';

@Resolver(() => Cart)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { name: 'myRegionalCart', nullable: true })
  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN)
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getRegionalCart(user);
  }

  @Mutation(() => Cart)
  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN)
  addToCart(
    @Args('input') input: AddToCartInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.addToCart(input, user);
  }

  @Mutation(() => Boolean)
  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN)
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user);
  }

  @Mutation(() => Cart, { nullable: true })
  @Roles(Role.MEMBER, Role.MANAGER, Role.ADMIN)
  removeFromCart(
    @Args('cartItemId') cartItemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartService.removeFromCart(cartItemId, user);
  }
}
