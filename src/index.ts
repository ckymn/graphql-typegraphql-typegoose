import dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import express from 'express';
import { buildSchema } from 'graphql';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import { resolvers } from './resolvers';
import { connectToDatabase } from './utils/mongo';
import { verifyJwt } from './utils/jwt';
import { User } from './schema/user.schema';
import Context from './types/Context';

async function bootstrap() {
  // Build the schema
  const schema = buildSchema({
    resolvers,
  });

  // Init. express
  const app = express();
  app.use(cookieParser());

  // Create apollo server
  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => {
      const context = ctx;
      if (ctx.req.cookies.access_token) {
        const user = verifyJwt<User>(ctx.req.cookies.access_token);
        context.user = user;
      }
      return context;
    },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  // server start
  await server.start();

  // Apply middleware to server
  server.applyMiddleware({ app });

  // Listen express server
  app.listen({ port: 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });

  // Connect database
  await connectToDatabase();
}

bootstrap();
