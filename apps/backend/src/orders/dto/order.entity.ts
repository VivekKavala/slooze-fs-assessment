import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@prisma/client';
import { Restaurant } from '../../restaurants/dto/restaurant.entity';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class OrderItem {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field()
  quantity: number;
}

@ObjectType()
export class Order {
  @Field()
  id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field()
  createdAt: Date;
}
