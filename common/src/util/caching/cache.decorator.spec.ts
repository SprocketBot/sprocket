import {Test} from "@nestjs/testing";

import {RedisService} from "../../redis";
import {Cache, CacheOptions} from "./cache.decorator";

type AnyFunction = (...args: any) => any;
interface ITestClass<F extends AnyFunction> {
    impl: (...args: Parameters<F>) => ReturnType<F>;
}

function getTestClass<F extends AnyFunction>(implementation: F, opts?: CacheOptions): {new (): ITestClass<F>} {
    if (typeof opts !== "undefined") {
        class TestClass<_F extends AnyFunction> implements ITestClass<_F> {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Typescript doesn't like that opts may not be defined here
            @Cache(opts)
            impl(...args: Parameters<_F>): ReturnType<_F> {
                return implementation.call(this, ...args);
            }
        }
        return TestClass<F>;
    } else {
        class TestClass<_F extends AnyFunction> implements ITestClass<_F> {
            impl(...args: Parameters<_F>): ReturnType<_F> {
                return implementation.call(this, ...args);
            }
        }

        return TestClass<F>;
    }
}

describe("cache.decorator.ts", () => {
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: RedisService,
                    useValue: {
                        get: jest.fn()
                    },
                },
            ],
        }).compile();
        console.log(moduleRef.get(RedisService));
    });
    describe("TestClass sanity checks", () => {
        it("should pass through behaviors (return value)", () => {
            const proto = getTestClass(() => "Hi");
            const c = new proto();
            expect(c.impl()).toBe("Hi");
        });

        it("should pass through behaviors (parameters)", () => {
            const proto = getTestClass((x: string) => x);
            const c = new proto();
            const value = "Yo";
            expect(c.impl(value)).toBe(value);
        });

        it("should properly bind", () => {
            const proto = getTestClass(function (this: ITestClass<AnyFunction>) {
                return this;
            });
            const c = new proto();
            expect(c.impl()).toBe(c);
        });
    });

    describe("Cache Decorator", () => {
        it("should be defined", () => {
            expect(Cache).toBeDefined();
        });

        it("should inject a copy of the redis service", () => {
            const proto = getTestClass(() => undefined);
            const c = new proto();
            console.log(Object.keys(c));
        });
    });
});
