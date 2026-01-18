import { Test, TestingModule } from '@nestjs/testing';
import { ApiTokenThrottlerGuard } from './api_token.throttler';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext } from '@nestjs/common';

describe('ApiTokenThrottlerGuard', () => {
  let guard: ApiTokenThrottlerGuard;

  beforeEach(async () => {
    // Mock dependencies to avoid complex ThrottlerModule setup
    const mockOptions = [{ ttl: 60, limit: 10 }];
    const mockStorage = { increment: jest.fn(), storage: {} };
    const mockReflector = { getAllAndOverride: jest.fn() };

    // Manually instantiate to avoid DI issues and just test the method we control
    guard = new ApiTokenThrottlerGuard(
      mockOptions as any,
      mockStorage as any,
      mockReflector as any,
    );
  });

  it('should return undefined res when GqlExecutionContext is missing response (Reproduction)', () => {
    const mockGqlContext = {
      getContext: jest.fn().mockReturnValue({
        req: { headers: {} },
        // res is undefined
      }),
    };

    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('graphql'),
    } as unknown as ExecutionContext;

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockGqlContext as any);

    const result = guard.getRequestResponse(mockExecutionContext);

    // We expect this to be defined after fix, containing mock header methods
    expect(result.res).toBeDefined();
    expect(result.res.header).toBeDefined();
    expect(result.res.setHeader).toBeDefined();
  });
});
