import type {CanActivate, ExecutionContext, Type} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {ModuleRef} from "@nestjs/core";

/**
 * Function to create an "or" guard. Only one must pass true for the method to be accessible.
 * @param {Array<Type<CanActivate>>} guards The guards to use.
 * @returns {Type<CanActivate>} The combined guard.
 *
 * @example
 * ```js
 * \@UseGuards(OrGuard(QueueBanGuard, JoinScrimPlayerGuard))
 * async function joinScrim(): Promise<void> {}
 * ```
 */
export function OrGuard(
    ...guards: Array<Type<CanActivate>>
): Type<CanActivate> {
    @Injectable()
    class _OrGuard implements CanActivate {
        constructor(private readonly moduleRef: ModuleRef) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const errors: string[] = [];

            for (const _guard of guards) {
                const guard = await this.moduleRef.create<CanActivate>(_guard);

                try {
                    const canActivate = guard.canActivate(
                        context,
                    ) as Promise<boolean>;
                    if (await canActivate) return true;
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    errors.push((e as Error)?.message ?? "Unknown Error");
                }
            }

            throw new Error(errors.join("\n"));
        }
    }

    return _OrGuard;
}
