import type {
    CanActivate, ExecutionContext, Type,
} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {ModuleRef} from "@nestjs/core";

/**
 * Function to create an "or" guard. Only one must pass true for the method to be accessible.
 *
 * ```js
 * \@UseGuards(OrGuard(QueueBanGuard, JoinScrimPlayerGuard))
 * async function joinScrim(): Promise<void> {}
 * ```
 *
 * @param {Array<Type<CanActivate>>} guards The guards to use.
 * @returns {Type<CanActivate>} The combined guard.
 */
export function OrGuard(...guards: Array<Type<CanActivate>>): Type<CanActivate> {
    @Injectable()
    class _OrGuard implements CanActivate {
        constructor(private readonly moduleRef: ModuleRef) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const errors: string[] = [];
            const guardResponses = await Promise.all(guards.map(async (_guard): Promise<boolean> => {
                const guard = await this.moduleRef.create<CanActivate>(_guard);

                try {
                    const canActivate = guard.canActivate(context) as Promise<boolean>;
                    return await canActivate;
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    errors.push((e as Error)?.message ?? "Unknown Error");
                    return false;
                }
            }));

            if (guardResponses.some(g => g)) return true;
            throw new Error(errors.join("\n"));
        }
    }

    return _OrGuard;
}
