import { ObjectType, Field } from '@nestjs/graphql';
import { Region } from '@prisma/client';

@ObjectType()
export class MenuItem {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class Restaurant {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Region)
  region: Region;

  @Field(() => [MenuItem], { nullable: 'itemsAndList' })
  menuItems: MenuItem[];
}
