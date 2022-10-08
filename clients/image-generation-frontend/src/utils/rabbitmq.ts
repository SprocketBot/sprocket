import {connect} from "amqplib";
import {v4} from "uuid";

import config from "../config";

export async function rmqRequest(
    pattern: string,
    data: Record<string, unknown> = {},
): Promise<unknown> {
    let rej, res;
    const response = new Promise((a, b) => {
        res = a;
        rej = b;
        setTimeout(() => rej("Request Timed Out."), 30000);
    });

    try {
        const connection = await connect(config.transport.url);
        const channel = await connection.createChannel();

        const sendQ = await channel.assertQueue(
            config.transport.image_generation_queue,
        );
        const replyQ = await channel.assertQueue(``, {exclusive: true});
        const correlationId = v4();

        channel.consume(
            replyQ.queue,
            msg => {
                if (msg.properties.correlationId === correlationId) {
                    console.log(" [.] Got %s", msg.content.toString());
                    connection.close();
                    res(JSON.parse(msg.content.toString()));
                }
            },
            {
                noAck: true,
            },
        );

        channel.sendToQueue(
            sendQ.queue,
            Buffer.from(
                JSON.stringify({
                    pattern: pattern,
                    message: data,
                    id: correlationId,
                }),
            ),
            {
                replyTo: `${replyQ.queue}`,
                correlationId: correlationId,
            },
        );
    } catch (err) {
        // console.log(err);
    }

    return response;
}
