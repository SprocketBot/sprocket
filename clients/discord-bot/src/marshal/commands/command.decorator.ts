import {Logger} from "@nestjs/common";
import {
    AnalyticsEndpoint, CoreEndpoint, ResponseStatus,
} from "@sprocketbot/common";
import type {Message} from "discord.js";
import {TextChannel} from "discord.js";
import {performance} from "perf_hooks";

import {CommandError} from "../command-error";
import type {Marshal} from "../marshal";
import {MarshalMetadataKey} from "../types";
import type {
    CommandFunction, CommandMeta, CommandSpec,
} from "./commands.types";

const logger = new Logger("CommandDecorator");
export const Command
  = (commandSpec: CommandSpec): MethodDecorator => <T>(
      target: Object,
      key: string | symbol,
      descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> => {
      if (!descriptor.value) throw new Error("Descriptor is undefined??");

      // <  Decorator>
      const originalMethod: CommandFunction = descriptor.value as unknown as CommandFunction;

      // @ts-expect-error If it was not a CommandFunction before, then it is using this decorator incorrectly
      descriptor.value = async function(
          this: Marshal,
          ...params: Parameters<CommandFunction>
      ): Promise<unknown> {
          /*
       * TODO: Will nest guards work, or do we need our own system?
       * If we need our own system, it should go here.
       */
          const before = performance.now();

          try {
              const response = await this.coreService.send(CoreEndpoint.GetUserByAuthAccount, {
                  accountId: params[0].author.id,
                  accountType: "DISCORD",
              });
              if (response.status === ResponseStatus.ERROR) throw response.error;
              const user = response.data;
              const context = {...params[1]};
              context.author = {
                  ...user,
                  id: user.id,
              };
              params[1] = context;
          } catch (e) {
              logger.error(e);
          }

          let success = true;
          const message: Message = params[0];

          try {
              // eslint-disable-next-line @typescript-eslint/return-await
              return (await originalMethod.apply(this, params)) as ReturnType<CommandFunction>;
          } catch (_e) {
              logger.error(_e);

              let commandError: CommandError;
              if (_e instanceof CommandError) {
                  commandError = _e;
              } else {
                  commandError = new CommandError("UnknownError");
              }

              commandError.log();
              await commandError.replyTo(message);

              success = false;
              return undefined;
          } finally {
              this.analyticsService
                  .send(AnalyticsEndpoint.Analytics, {
                      name: "commandRun",
                      tags: [
                          ["author", message.author.tag],
                          [
                              "guild",
                              message.channel instanceof TextChannel ? message.channel.guild.name : "DMs",
                          ],
                          ["channel", message.channel instanceof TextChannel ? message.channel.name : "DMs"],
                          ["command_name", commandSpec.name],
                      ],
                      floats: [ ["duration", performance.now() - before] ],
                      booleans: [ ["command_succeeded", success] ],
                  })
                  .catch(err => {
                      logger.error(err);
                  });
          }
      };
      // </ Decorator>

      // <Metadata>
      const commandMeta: CommandMeta = {
          spec: commandSpec,
          functionName: key.toString(),
      };
          // Check for existing metadata attached to the class
      let unsafeMetadata: unknown = Reflect.getMetadata(MarshalMetadataKey.Command, target);
      if (!Array.isArray(unsafeMetadata)) unsafeMetadata = [];
      const classCommandMetadatas: unknown[] = unsafeMetadata as unknown[];

      // Add our metadata for this command to the class
      classCommandMetadatas.push(commandMeta);
      Reflect.defineMetadata(MarshalMetadataKey.Command, classCommandMetadatas, target);
      // </ Metadata>
      return descriptor;
  };
