import { PubSubListener } from "@hamok-dev/hamok-js-core";
import * as Repos from "../Repositories";

const sleep = (timeoutInMs: number) => new Promise(resolve => setTimeout(resolve, timeoutInMs));

export const description = `
    Basic PubSub Storage Test
`;

const EVENT_1 = "event1";
const EVENT_2 = "event2";
const EVENT_3 = "event3";

export async function server_1(): Promise<void> {
    const listener: PubSubListener = (data, sourceEndpointId, event, topic) => {
        const str = Buffer.from(data).toString("utf-8");
        console.log(`Received ${event} from ${sourceEndpointId} on topic ${topic}`, str);
    }
    await Repos.pubsub.subscribe(EVENT_1, listener);
    await Repos.pubsub.subscribe(EVENT_2, listener);
    await sleep(5000);
    Repos.pubsub.notify(EVENT_1, Buffer.from(`event1, server_1, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_2, Buffer.from(`event2, server_1, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_3, Buffer.from(`event3, server_1, notify`, "utf-8"));
    await Repos.pubsub.publish(EVENT_1, Buffer.from(`event1, server_1, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_2, Buffer.from(`event2, server_1, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_3, Buffer.from(`event3, server_1, publish`, "utf-8"));
}


export async function server_2(): Promise<void> {
    const listener: PubSubListener = (data, sourceEndpointId, event, topic) => {
        const str = Buffer.from(data).toString("utf-8");
        console.log(`Received ${event} from ${sourceEndpointId} on topic ${topic}`, str);
    }
    await Repos.pubsub.subscribe(EVENT_2, listener);
    await Repos.pubsub.subscribe(EVENT_3, listener);
    await sleep(5000);
    Repos.pubsub.notify(EVENT_1, Buffer.from(`event1, server_2, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_2, Buffer.from(`event2, server_2, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_3, Buffer.from(`event3, server_2, notify`, "utf-8"));
    await Repos.pubsub.publish(EVENT_1, Buffer.from(`event1, server_2, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_2, Buffer.from(`event2, server_2, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_3, Buffer.from(`event3, server_2, publish`, "utf-8"));
}


export async function server_3(): Promise<void> {
    const listener: PubSubListener = (data, sourceEndpointId, event, topic) => {
        const str = Buffer.from(data).toString("utf-8");
        console.log(`Received ${event} from ${sourceEndpointId} on topic ${topic}`, str);
    }
    await Repos.pubsub.subscribe(EVENT_3, listener);
    await Repos.pubsub.subscribe(EVENT_1, listener);
    await sleep(5000);

    Repos.pubsub.notify(EVENT_1, Buffer.from(`event1, server_3, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_2, Buffer.from(`event2, server_3, notify`, "utf-8"));
    Repos.pubsub.notify(EVENT_3, Buffer.from(`event3, server_3, notify`, "utf-8"));
    await Repos.pubsub.publish(EVENT_1, Buffer.from(`event1, server_3, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_2, Buffer.from(`event2, server_3, publish`, "utf-8"));
    await Repos.pubsub.publish(EVENT_3, Buffer.from(`event3, server_3, publish`, "utf-8"));

}


