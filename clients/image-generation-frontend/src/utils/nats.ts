import type {NatsConnection, PublishOptions} from "nats";
import {connect, createInbox, JSONCodec} from "nats";
import {v4} from "uuid";

import config from "$src/config";
let client: NatsConnection | undefined;

export async function getNatsClient(): Promise<NatsConnection> {
    if (client) return client;
    client = await connect({
        servers: config.transport.url,
        name: config.transport.queue,
    });
    return client;
}

export async function natsRequest(
    subject: string,
    data: Record<string, unknown> = {},
    options: PublishOptions = {},
): Promise<unknown> {
    if (!subject.startsWith(config.transport.scope))
        subject = `${config.transport.scope}.${subject}`;

    if (!client) await getNatsClient();

    let rej, res;

    const response = new Promise((a, b) => {
        res = a;
        rej = b;
        setTimeout(() => rej("Request Timed Out."), 15000);
    });

    const reply = createInbox();
    const subscription = client.subscribe(reply, {
        callback: (err, msg) => {
            subscription.unsubscribe();
            if (err) {
                rej(err);
                return;
            }
            const decodedData = new TextDecoder().decode(msg.data);
            try {
                const d = JSON.parse(decodedData);
                res(d.response);
            } catch (e) {
                rej(new Error(decodedData));
            }
        },
        max: 1,
    });

    const serializedData = JSONCodec().encode({
        data: data,
        id: v4(),
    });

    await client.publish(subject, serializedData, {
        ...options,
        reply,
    });
    return response;
}
