import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Restaurant } from '../../restaurants/dto/restaurant.entity';

@ObjectType()
export class CartItem {
  @Field()
  id: string;

  @Field()
  menuItemId: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class Cart {
  @Field()
  id: string;

  @Field()
  region: string;

  @Field()
  restaurantId: string;

  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => [CartItem])
  items: CartItem[];

  @Field()
  createdAt: Date;
}
