import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartInput } from './dto/add-to-cart.input';
import { AuthenticatedUser } from '../restaurants/restaurants.service';
import { Role } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getRegionalCart(user: AuthenticatedUser) {
    if (!user.region) {
      throw new ForbiddenException('User has no region assigned');
    }
    const cart = await this.prisma.cart.findUnique({
      where: { region: user.region },
      include: { items: true, restaurant: true },
    });
    return cart; // Returns null if no cart exists, which is handled by nullable Query
  }

  async clearCart(user: AuthenticatedUser) {
    if (!user.region) throw new ForbiddenException('No region');

    const cart = await this.prisma.cart.findUnique({
      where: { region: user.region }
    });
    
    if (cart) {
      await this.prisma.cart.delete({
        where: { id: cart.id }
      });
    }
    return true;
  }

  async addToCart(input: AddToCartInput, user: AuthenticatedUser) {
    if (!user.region) throw new ForbiddenException('No region to add to cart');

    // Fetch restaurant and validate menu item
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: input.restaurantId },
      include: { menuItems: true },
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');
    
    if (restaurant.region !== user.region && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Cannot add items from another region to your regional cart.');
    }

    const menuItem = restaurant.menuItems.find(m => m.id === input.menuItemId);
    if (!menuItem) throw new NotFoundException('Menu item not found');

    // Find existing cart for region
    let cart = await this.prisma.cart.findUnique({
      where: { region: user.region },
      include: { items: true }
    });

    // If a cart exists but for a different restaurant, clear it first based on the plan
    // (though frontend should also handle this explicitly)
    if (cart && cart.restaurantId !== input.restaurantId) {
      await this.prisma.cart.delete({ where: { id: cart.id } });
      cart = null; // Reset cart so it gets re-created below
    }

    if (!cart) {
      // Create new cart for this region
      cart = await this.prisma.cart.create({
        data: {
          region: user.region,
          restaurantId: input.restaurantId,
        },
        include: { items: true }
      });
    }

    // Process item (add or update quantity)
    const existingItem = cart.items.find(i => i.menuItemId === input.menuItemId);

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + input.quantity }
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: input.quantity,
        }
      });
    }

    return this.getRegionalCart(user);
  }

  async removeFromCart(cartItemId: string, user: AuthenticatedUser) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!item) throw new NotFoundException('Cart item not found');
    
    if (item.cart.region !== user.region && user.role !== Role.ADMIN) {
      throw new ForbiddenException("Cannot remove items from another region's cart");
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return this.getRegionalCart(user);
  }
}
