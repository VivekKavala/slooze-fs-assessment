import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role, Region } from '@prisma/client';

// 1. Register Enums so GraphQL can use them
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles (ADMIN, MANAGER, MEMBER)',
});

registerEnumType(Region, {
  name: 'Region',
  description: 'User region (INDIA, AMERICA)',
});

// 2. Define the User Object
@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Region, { nullable: true })
  region?: Region;
}
