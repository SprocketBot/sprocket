import {config} from "@sprocketbot/common";
import type {EmbedFieldData} from "discord.js";

import {Unicode} from "../../../enums/unicode";
import type {CommandSpec} from "../../../marshal";

export const specToField = (spec: CommandSpec): EmbedFieldData => {
    const aliases: string | undefined = spec.aliases ? spec.aliases.map(a => `\`${config.bot.prefix}${a}\``).join(", ") : undefined;
    const docs: string = spec.longDocs ?? spec.docs;
    return {
        name: `\`${config.bot.prefix}${spec.name}${spec.args.map(a => ` [${a.name}]`).join("")}\``,
        value: `${aliases ? `**Aliases:** ${aliases}` : ""}\n${docs}`,
        inline: false,
    };
};

export const specsToFields = (specs: CommandSpec[]): EmbedFieldData[] => {
    const name = specs[0].name;
    const fields: EmbedFieldData[] = [];

    for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];

        if (spec.name !== name) {
            throw new Error(`specsToFields should only be used with commands of the same name (overloads)`);
        }

        fields.push({
            name: "Usage",
            value: `\`\`\`${config.bot.prefix}${spec.name}${spec.args.map(arg => ` [${arg.name}]`).join("")}\`\`\``,
        });

        if (spec.aliases) {
            fields.push({
                name: "Aliases",
                value: spec.aliases.map(alias => `\`${config.bot.prefix}${alias}\``).join(", "),
            });
        }

        fields.push({
            name: "Description",
            value: spec.longDocs ?? spec.docs,
        });

        if (spec.args.length) {
            fields.push({
                name: "Arguments",
                value: `${spec.args.map(arg => `\`${arg.name}\`: ${arg.docs}`).join("\n")}`,
            });
        }

        if (i !== specs.length - 1) {
            fields.push({
                name: Unicode.ZERO_WIDTH_SPACE,
                value: "━━━",
            });
        }
    }

    return fields;
};

export const specByNameAndArgs = (spec1: CommandSpec, spec2: CommandSpec): number => {
    if (spec1.name < spec2.name) return -1;
    if (spec1.name > spec2.name) return 1;
    if (spec1.args.length < spec2.args.length) return -1;
    if (spec1.args.length > spec2.args.length) return 1;
    return -1;
};
