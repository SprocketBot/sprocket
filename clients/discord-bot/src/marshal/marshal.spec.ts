/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Test } from '@nestjs/testing';
import { AnalyticsService, config, CoreService } from '@sprocketbot/common';
import type { Message } from 'discord.js';

import { EmbedService } from '../embed';
import type { CommandSpec } from './commands';
import { Command, CommandManagerService, CommandNotFound } from './commands';
import { Marshal } from './marshal';

const command1Spec: CommandSpec = {
  name: 'command1',
  args: [
    {
      name: 'arg1',
      type: 'string',
      docs: 'arg 1 docs',
    },
    {
      name: 'arg2',
      type: 'number',
      docs: 'arg 2 docs',
    },
  ],
  docs: 'docs',
};

const command2Name = 'command2';
const command2Spec: CommandSpec = {
  name: command2Name,
  args: [],
  docs: 'docs',
};

const command2OverloadSpec: CommandSpec = {
  name: command2Name,
  args: [
    {
      name: 'Argument',
      type: 'string',
      docs: 'docs',
    },
  ],
  docs: 'docs',
};

class TestMarshal extends Marshal {
  @Command(command1Spec)
  async MyCommandHandler(): Promise<void> { }

  @CommandNotFound()
  async MyFirstCommandNotFoundHook(): Promise<void> { }

  @CommandNotFound()
  async MySecondCommandNotFoundHook(): Promise<void> { }
}

class NoCommandNotFoundMarshal extends Marshal {
  @Command(command2Spec)
  async MyCommandHandler(): Promise<void> { }
}
class CommandOverloadMarshal extends Marshal {
  @Command(command2Spec)
  async BaseCommand(): Promise<void> { }

  @Command(command2OverloadSpec)
  async BaseCommandWithArgument(): Promise<void> { }
}
const botPrefix = config.bot.prefix;

jest.mock('@sprocketbot/common', () => ({
  CoreModule: jest.fn(),
  CoreService: jest.fn(),
  AnalyticsModule: jest.fn(),
  AnalyticsService: jest.fn(),
  config: {
    bot: {
      prefix: '.',
    },
  },
}));

describe('Marshal', () => {
  describe('TestMarshal', () => {
    let marshal: TestMarshal;
    let cms: CommandManagerService;
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          TestMarshal,
          CommandManagerService,
          CoreService,
          AnalyticsService,
          EmbedService,
          {
            provide: 'DISCORD_CLIENT',
            useValue: {
              on: jest.fn(),
            },
          },
        ],
      }).compile();
      marshal = moduleRef.get(TestMarshal);
      cms = moduleRef.get(CommandManagerService);
      jest.resetAllMocks();
    });

    // We need to spy on the prototype to see the real method, rather than the decorated version
    const commandHandlerSpy = jest.spyOn(TestMarshal.prototype, 'MyCommandHandler');
    const commandNotFoundHookSpies = [
      jest.spyOn(TestMarshal.prototype, 'MyFirstCommandNotFoundHook'),
      jest.spyOn(TestMarshal.prototype, 'MySecondCommandNotFoundHook'),
    ];

    it('should be defined', () => {
      expect(marshal).toBeDefined();
    });

    it('should correctly register its command when instantiated', () => {
      expect(cms.commands.length).toBe(1);
    });

    it('should call command function when resolving a message in CommandManagerService', async () => {
      const mockedMessage = {
        content: `${botPrefix}${command1Spec.name} arg1 2`,
      } as Message;

      await cms.handleMessage(mockedMessage);

      expect(commandHandlerSpy).toBeCalledTimes(1);
    });

    it('should call all command not found hooks when resolving a message with an unknown command', async () => {
      const mockedMessage = {
        content: `${botPrefix}MyInvalidCommand`,
      } as Message;

      await cms.handleMessage(mockedMessage);

      commandNotFoundHookSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it('should recieve a context object with parsed arguments', async () => {
      const command = command1Spec;
      const mockedMessage = {
        content: `${botPrefix}${command.name} "arg1 value" 2`,
      } as Message;

      await cms.handleMessage(mockedMessage);

      expect(commandHandlerSpy).toHaveBeenCalledTimes(1);
      expect(commandHandlerSpy).toHaveBeenCalledWith(mockedMessage, {
        args: {
          arg1: 'arg1 value',
          arg2: 2,
        },
        author: false,
      });
    });
  });

  describe('NoCommandNotFoundMarshal', () => {
    let noCommandNotFoundMarshal: NoCommandNotFoundMarshal;
    // Let managerService: CommandManagerService;
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          NoCommandNotFoundMarshal,
          CommandManagerService,
          CoreService,
          AnalyticsService,
          EmbedService,
          {
            provide: 'DISCORD_CLIENT',
            useValue: {
              on: jest.fn(),
            },
          },
        ],
      }).compile();

      noCommandNotFoundMarshal = moduleRef.get(NoCommandNotFoundMarshal);

      jest.resetAllMocks();
    });
    it('should correctly instantiate a marshal without any @CommandNotFound', () => {
      expect(noCommandNotFoundMarshal).toBeDefined();
    });
  });

  describe('CommandOverloadMarshal', () => {
    let managerService: CommandManagerService;
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          CommandOverloadMarshal,
          CommandManagerService,
          CoreService,
          AnalyticsService,
          EmbedService,
          {
            provide: 'DISCORD_CLIENT',
            useValue: {
              on: jest.fn(),
            },
          },
        ],
      }).compile();

      managerService = moduleRef.get(CommandManagerService);

      jest.resetAllMocks();
    });
    const noArgumentsSpy = jest.spyOn(CommandOverloadMarshal.prototype, 'BaseCommand');
    const oneArgumentsSpy = jest.spyOn(CommandOverloadMarshal.prototype, 'BaseCommandWithArgument');

    it('should register each overload of the command as a seperate command', () => {
      expect(managerService.commands.length).toBe(2);
    });

    it('should resolve the command with no arguments to the handler with no arguments', async () => {
      const mockedMessage = {
        content: `${botPrefix}${command2Name}`,
      } as Message;

      await managerService.handleMessage(mockedMessage);

      expect(noArgumentsSpy).toBeCalledTimes(1);
      expect(oneArgumentsSpy).toBeCalledTimes(0);
    });

    it('should resolve the command with one argument to the handler with no arguments', async () => {
      const mockedMessage = {
        content: `${botPrefix}${command2Name} Argument`,
      } as Message;

      await managerService.handleMessage(mockedMessage);

      expect(oneArgumentsSpy).toBeCalledTimes(1);
      expect(noArgumentsSpy).toBeCalledTimes(0);
    });
  });
});
