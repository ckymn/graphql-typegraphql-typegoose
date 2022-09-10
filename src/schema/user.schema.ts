import {
  getModelForClass,
  prop,
  Pre,
  ReturnModelType,
  queryMethod,
  index,
} from '@typegoose/typegoose';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import bcrypt from 'bcrypt';
import { AsQueryMethod } from '@typegoose/typegoose/lib/types';

function findByEmail(
  this: ReturnModelType<typeof User, QueryHelpers>,
  email: User['email']
) {
  return this.findOne({ email });
}

interface QueryHelpers {
  findByEmail: AsQueryMethod<typeof findByEmail>;
}

@Pre<User>('save', async function () {
  // check that the password is being modified
  if (!this.isModified('password')) return;

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hashSync(this.password, salt);
  this.password = hash;
})
@queryMethod(findByEmail)
@index({ email: 1 })
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;
}

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'Password must not be longer than 20 characters',
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

export const UserModel = getModelForClass<typeof User, QueryHelpers>(
  User
);
