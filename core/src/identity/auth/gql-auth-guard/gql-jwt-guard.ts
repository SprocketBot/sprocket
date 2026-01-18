import type {ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class GqlJwtGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext): unknown {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        // Allow bypassing auth in test mode for local development
        // IMPORTANT: This should ONLY be enabled in local development, never in production
        if (process.env.ENABLE_TEST_MODE === "true") {
            const ctx = GqlExecutionContext.create(context);
            const req = ctx.getContext().req;

            // Check for the test bypass header
            if (req.headers["x-test-mode"] === "true") {
                // Inject a mock user for testing purposes
                req.user = {
                    id: 1,
                    username: "test-user",
                    orgTeams: ["MLEDB_ADMIN", "LEAGUE_OPERATIONS"],
                };
                return true;
            }
        }

        // Default to standard JWT authentication
        return super.canActivate(context) as boolean | Promise<boolean>;
    }
}
