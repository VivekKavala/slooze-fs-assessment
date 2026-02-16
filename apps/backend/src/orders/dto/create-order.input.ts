import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field()
  menuItemId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field()
  restaurantId: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}
