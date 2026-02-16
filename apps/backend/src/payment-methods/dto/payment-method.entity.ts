import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethod {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  last4: string;

  @Field(() => Boolean)
  isActive: boolean;
}
