import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AddToCartInput {
  @Field()
  menuItemId: string;

  @Field()
  restaurantId: string;

  @Field(() => Int)
  quantity: number;
}
