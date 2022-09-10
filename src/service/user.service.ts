import { ApolloError } from 'apollo-server';
import {
  CreateUserInput,
  LoginInput,
  User,
  UserModel,
} from '../schema/user.schema';
import bcrypt from 'bcrypt';
import { singJwt } from '../utils/jwt';
import Context from '../types/Context';

class UserService {
  async createUser(input: CreateUserInput) {
    return UserModel.create(input);
  }

  async login(input: LoginInput, context: Context) {
    const e = 'Invalid email or password';
    const user = await UserModel.find()
      .findByEmail(input.email)
      .lean();
    if (!user) {
      throw new ApolloError(e);
    }

    const passwordIsValid = await bcrypt.compare(
      input.password,
      user.password
    );
    if (!passwordIsValid) {
      throw new ApolloError(e);
    }

    // genereate JWT
    const token = singJwt(user);

    // set cookie for JWT
    context.res.cookie('access_token', token, {
      maxAge: 3.154e10, // 1 year
      httpOnly: true,
      domain: 'localhost',
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return token;
  }
}

export default UserService;
