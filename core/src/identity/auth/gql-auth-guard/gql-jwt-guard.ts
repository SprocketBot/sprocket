import type {ExecutionContext} from "@nestjs/common";
import {Injectable, Logger} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class GqlJwtGuard extends AuthGuard("jwt") {
    private readonly logger = new Logger(GqlJwtGuard.name);

    getRequest(context: ExecutionContext): unknown {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }

    private isTestBypassEnabled(): boolean {
        return process.env.ENABLE_TEST_MODE === "true" && process.env.NODE_ENV === "test";
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Allow bypassing auth only in automated Jest-style test mode.
    // IMPORTANT: This must never synthesize a user in a deployed runtime.
        if (this.isTestBypassEnabled()) {
            const ctx = GqlExecutionContext.create(context);
            const req = ctx.getContext().req;

            // Check for the test bypass header
            if (req.headers["x-test-mode"] === "true") {
                // Inject a mock user for testing purposes
                req.user = {
                    userId: 1,
                    username: "test-user",
                    currentOrganizationId: 2,
                    orgTeams: [],
                };
                return true;
            }
        } else if (process.env.ENABLE_TEST_MODE === "true") {
            this.logger.error("ENABLE_TEST_MODE ignored because NODE_ENV is not test");
        }

        // Default to standard JWT authentication
        return super.canActivate(context) as boolean | Promise<boolean>;
    }
}
