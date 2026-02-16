import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity'; // This import should now work

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
