import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';
import { ScrimResolver } from './scrim/scrim.resolver';
import { UserResolver } from './user/user.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      csrfPrevention: false,
      introspection: true,
      context: ({ req, res }) => {
        return {
          request: req,
          response: res,
        };
      },
      playground: {
        title: 'Sprocket GraphQL Playground',
        settings: {
          'tracing.hideTracingResponse': true,
          'request.credentials': 'include',
        },
      },
      includeStacktraceInErrorResponses: true, // TODO: False in prod
    }),
    DbModule,
    AuthModule,
  ],
  providers: [ScrimResolver, UserResolver],
})
export class GqlModule {}