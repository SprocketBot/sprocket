import type {
    CanActivate, ExecutionContext, Type,
} from "@nestjs/common";
import {Injectable} from "@nestjs/common";

export function OrGuard(...guards: CanActivate[]): Type<CanActivate> {
    @Injectable()
    class _OrGuard implements CanActivate {
        async canActivate(context: ExecutionContext): Promise<boolean> {
            const errors: string[] = [];
            const guardResponses = await Promise.all(guards.map(async (g): Promise<boolean> => {
                try {
                    const canActivate = g.canActivate(context) as Promise<boolean>;
                    return await canActivate;
                } catch (e) {
                    errors.push((e as Error).message);
                    return false;
                }
            }));

            if (guardResponses.some(g => g)) return true;
            throw new Error(errors.join("\n"));
        }
    }

    return _OrGuard;
}
