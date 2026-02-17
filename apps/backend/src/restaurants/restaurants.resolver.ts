import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticatedUser, RestaurantsService } from './restaurants.service';
import { Restaurant } from './dto/restaurant.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant], { name: 'restaurants' })
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: User) {
    return this.restaurantsService.findAll(user);
  }

  @Query(() => Restaurant, { name: 'restaurant' })
  @UseGuards(JwtAuthGuard)
  findOne(@Args('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.restaurantsService.findOne(id, user);
  }
}
