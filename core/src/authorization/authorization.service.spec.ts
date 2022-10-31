import type {ExecutionContext} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {GqlExecutionContext} from "@nestjs/graphql";
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";

import {MemberRepository} from "$repositories";

import type {JwtAuthPayload} from "../authentication/types";
import {JwtType} from "../authentication/types";
import {AuthorizationService} from "./authorization.service";
import {getMockMember} from "./authorization.service.spec.helpers";
import {ActionsAnd, ActionsOr} from "./decorators/actions.decorator";
import {ActionGuard} from "./guards/action.guard";

describe("AuthorizationService", () => {
    let service: AuthorizationService;
    let memberRepository: {getById: jest.Mock; getOrNull: jest.Mock};
    let reflector;
    let actionGuard: ActionGuard;

    let getAllAndOverride: jest.SpyInstance;

    let mockExecutionContext: Partial<Record<jest.FunctionPropertyNames<ExecutionContext>, jest.MockedFunction<any>>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthorizationService],
        })
            .useMocker(token => {
                if (token === MemberRepository) {
                    return {getById: jest.fn(), getOrNull: jest.fn()};
                }
            })
            .compile();

        service = module.get<AuthorizationService>(AuthorizationService);
        memberRepository = module.get(MemberRepository);
        reflector = module.get(Reflector);
        actionGuard = new ActionGuard(
            module.get(Reflector),
            module.get(AuthorizationService),
            module.get(MemberRepository),
        );

        getAllAndOverride = jest.spyOn(reflector, "getAllAndOverride");

        mockExecutionContext = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn(),
                getResponse: jest.fn(),
            }),
        };

        GqlExecutionContext.create = jest.fn().mockImplementation((_ctx: ExecutionContext) => {
            return {
                getContext: jest.fn().mockReturnValue({
                    req: {
                        user: {
                            sub: 1,
                            type: JwtType.Authentication,
                            username: "BadCoderGuy",
                            userId: 1,
                            currentOrganizationId: 1,
                            orgTeams: [],
                        } as JwtAuthPayload,
                    } as any,
                }),
            } as unknown;
        });
    });

    describe("authorization.service.ts", () => {
        it("Do that one thing", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);

            const actual = await service.getMemberActions(member.id);
            const expected = ["LaughAtShuckle", "KickShuckle", "BanShuckle"];

            expect(actual).toEqual(expected);
        });
    });

    describe("action.guard.ts", () => {
        it("Should allow access when no actions are required", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = true;

            expect(actual).toEqual(expected);
        });

        it("Should allow when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (BanShucke)", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue(["BanShuckle"]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = true;

            expect(actual).toEqual(expected);
        });

        it("Should prevent when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (BeNiceToShuckle)", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue(["BeNiceToShuckle"]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = false;

            expect(actual).toEqual(expected);
        });

        it("Should allow when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (KickShuckle | HelpShuckle)", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsOr("KickShuckle", "HelpShuckle")]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = true;

            expect(actual).toEqual(expected);
        });

        it("Should prevent when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (KickShuckle & HelpShuckle)", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsAnd("KickShuckle", "HelpShuckle")]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = false;

            expect(actual).toEqual(expected);
        });

        it("Should allow when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (KickShuckle & (HelpShuckle | LaughAtShuckle))", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsAnd("KickShuckle", ActionsOr("HelpShuckle", "LaughAtShuckle"))]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = true;

            expect(actual).toEqual(expected);
        });

        it("Should prevent when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (KickShuckle & (HelpShuckle | PunchShuckle))", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsAnd("KickShuckle", ActionsOr("HelpShuckle", "PunchShuckle"))]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = false;

            expect(actual).toEqual(expected);
        });

        it("Should allow when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (HelpShuckle | (KickShuckle & LaughAtShuckle))", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsOr("HelpShuckle", ActionsAnd("KickShuckle", "LaughAtShuckle"))]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = true;

            expect(actual).toEqual(expected);
        });

        it("Should prevent when member has [KickShuckle, BanShuckle, LaughAtShuckle] and requires (HelpShuckle | (KickShuckle & PunchShuckle))", async () => {
            const member = getMockMember(["KickShuckle"], ["KickShuckle", "BanShuckle"], ["LaughAtShuckle"]);

            memberRepository.getById.mockResolvedValue(member);
            memberRepository.getOrNull.mockResolvedValue(member);
            getAllAndOverride.mockReturnValue([ActionsOr("HelpShuckle", ActionsAnd("KickShuckle", "PunchShuckle"))]);

            const actual = await actionGuard.canActivate(mockExecutionContext as ExecutionContext);
            const expected = false;

            expect(actual).toEqual(expected);
        });
    });
});
