import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import {
  CreateUserInput,
  LoginInput,
  User,
} from '../schema/user.schema';
import UserService from '../service/user.service';
import Context from '../types/Context';

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  async createUser(@Arg('input') input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @Mutation(() => String) // return JWT
  async login(@Arg('input') input: LoginInput, @Ctx() ctx: Context) {
    return this.userService.login(input, ctx);
  }

  @Query(() => User)
  me(@Ctx() ctx: Context) {
    return ctx.user;
  }
}
