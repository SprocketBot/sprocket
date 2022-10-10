/* eslint-disable no-console, @typescript-eslint/no-magic-numbers, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-empty-function */
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {config as appConfig} from "@sprocketbot/common";
import type {Message} from "discord.js";

import {CommandManagerService} from "./command-manager.service";
import type {LinkedCommandMeta} from "./commands.types";

const botPrefix = appConfig.bot.prefix;

describe("CommandManagerService", () => {
    let service: CommandManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CommandManagerService],
        }).compile();

        service = module.get<CommandManagerService>(CommandManagerService);
    });
    it("Should allow commands to be registered", () => {
        service.registerCommand({
            spec: {
                name: "name",
                args: [],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        expect(service.commands.length).toBe(1);
    });
    it("Should allow commands to be registered with multiple aliases", () => {
        const name = "name";
        service.registerCommand({
            spec: {
                name: name,
                aliases: ["alias1", "alias2", "alias3"],
                args: [],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        expect(service.commands.length).toBe(1);
        expect(service.commands[0].name).toEqual(name);
    });

    it("Should allow overloads with different number of arguments", () => {
        const name = "name";
        service.registerCommand({
            spec: {
                name: name,
                aliases: [],
                args: [
                    {
                        name: "arg1",
                        type: "string",
                        docs: "docs",
                    },
                ],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        service.registerCommand({
            spec: {
                name: name,
                aliases: [],
                args: [],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        expect(service.commands.length).toBe(2);
        expect(service.commands[0].name).toEqual(name);
        expect(service.commands[1].name).toEqual(name);
    });

    it("Should allow overloads to have different aliases", () => {
        const name = "name";
        service.registerCommand({
            spec: {
                name: name,
                aliases: ["alias1", "alias2"],
                args: [
                    {
                        name: "arg1",
                        type: "string",
                        docs: "docs",
                    },
                ],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        service.registerCommand({
            spec: {
                name: name,
                aliases: ["alias3", "alias4"],
                args: [],
                docs: "docs",
            },
            function: async () => {},
            functionName: "functionName",
        });
        expect(service.commands.length).toBe(2);
    });

    it("Should not allow duplicate commands with the same number of arguments", () => {
        const name = "name";
        expect(() => {
            service.registerCommand({
                spec: {
                    name: name,
                    args: [],
                    docs: "docs",
                },
                function: async () => {},
                functionName: "functionName",
            });
            service.registerCommand({
                spec: {
                    name: name,
                    args: [],
                    docs: "docs",
                },
                function: async () => {},
                functionName: "functionName",
            });
        }).toThrow(new Error(`Error: Command "${name}" with ${0} arguments was declared more than once!`));
    });

    it("Should execute a command when given a matching message", async () => {
        const name = "name";
        const commandFunction = jest.fn();
        service.registerCommand({
            spec: {
                name: name,
                args: [],
                docs: "docs",
            },
            function: commandFunction,
            functionName: "functionName",
        });

        const mockedMessage = {content: `${botPrefix}${name}`} as Message;
        await service.handleMessage(mockedMessage);
        expect(commandFunction).toBeCalledTimes(1);
    });

    it("Should execute a command with arguments", async () => {
        const name = "name";
        const commandFunction = jest.fn();
        service.registerCommand({
            spec: {
                name: name,
                args: [
                    {
                        name: "arg1",
                        type: "string",
                        docs: "docs",
                    },
                    {
                        name: "arg2",
                        type: "string",
                        docs: "docs",
                    },
                ],
                docs: "docs",
            },
            function: commandFunction,
            functionName: "functionName",
        });

        const stringArg = "stringArg";
        const stringArgWithSpaces = "stringArg with spaces";
        const mockedMessage = {
            content: `${botPrefix}${name} ${stringArg} "${stringArgWithSpaces}"`,
        } as Message;
        const expectedContext = {
            args: {
                arg1: stringArg,
                arg2: stringArgWithSpaces,
            },
            author: false,
        };
        await service.handleMessage(mockedMessage);
        expect(commandFunction).toBeCalledTimes(1);
        expect(commandFunction).toHaveBeenCalledWith(mockedMessage, expectedContext);
    });

    it("Should execute a command not found hooks when given a non-matching message that starts with the bot prefix", async () => {
        const commandNotFoundHook = jest.fn();
        service.registerNotFoundCommand({
            function: commandNotFoundHook,
            functionName: "functionName",
        });
        const mockedMessage = {content: `${botPrefix}anything`} as Message;
        await service.handleMessage(mockedMessage);
        expect(commandNotFoundHook).toBeCalledTimes(1);
    });

    it("Should execute all command not found hooks when given a non-matching message that starts with the bot prefix", async () => {
        const commandNotFoundHook = jest.fn();
        const anotherCommandNotFoundHook = jest.fn();
        service.registerNotFoundCommand({
            function: commandNotFoundHook,
            functionName: "functionName",
        });
        service.registerNotFoundCommand({
            function: anotherCommandNotFoundHook,
            functionName: "functionName",
        });
        const mockedMessage = {content: `${botPrefix}anything`} as Message;
        await service.handleMessage(mockedMessage);
        expect(commandNotFoundHook).toBeCalledTimes(1);
        expect(anotherCommandNotFoundHook).toBeCalledTimes(1);
    });

    it("Should not execute a command if given the incorrect prefix", async () => {
        const name = "name";

        const commandFunction = jest.fn();
        service.registerCommand({
            spec: {
                name: name,
                args: [],
                docs: "docs",
            },
            function: commandFunction,
            functionName: "functionName",
        });
        const mockedMessage = {content: `__${botPrefix}${name}`} as Message;
        await service.handleMessage(mockedMessage);
        expect(commandFunction).toBeCalledTimes(0);
    });

    describe("getCommandSpecs", () => {
        it("should return all matching command overloads, excluding aliases", () => {
            const name = "name";

            const command1: LinkedCommandMeta = {
                spec: {
                    name: name,
                    args: [],
                    aliases: ["alias1", "alias2"],
                    docs: "docs",
                },
                function: async () => {},
                functionName: "functionName",
            };

            const command2: LinkedCommandMeta = {
                spec: {
                    name: name,
                    args: [
                        {
                            name: "numberArg",
                            type: "number",
                            docs: "docs",
                        },
                    ],
                    aliases: ["alias3"],
                    docs: "docs",
                },
                function: async () => {},
                functionName: "functionName",
            };

            service.registerCommand(command1);
            service.registerCommand(command2);

            const specs = service.getCommandSpecs(name);
            expect(specs).toEqual([command1.spec, command2.spec]);
        });
    });
});
