import * as Hamok from "./HamokService";
import { createCodec } from "@hamok-dev/hamok-js-core";
import { SlowStorage } from "./SlowStorage";


const strCodec = createCodec<string, Uint8Array>(
    input => Buffer.from(input, "utf-8"),
    input => Buffer.from(input).toString("utf-8")
);

const numCodec = createCodec<number, Uint8Array>(
    input => Buffer.from(`${input}`, "utf-8"),
    input => Number.parseInt(Buffer.from(input).toString("utf-8"))
);

export const pubsub = Hamok.grid.createPubSub()
    .withConfig({
        topic: "general-channel"
    })
    .build();


export const separatedStorage = Hamok.grid.createSeparatedStorage<number, string>()
    .withConfig({
        storageId: "separated-storage",
        maxKeys: 10,
        maxValues: 100
    })
    .withKeyCodec(numCodec)
    .withValueCodec(strCodec)
    .build();

export const replicatedStorage = Hamok.grid.createReplicatedStorage<number, string>()
    .withConfig({
        storageId: "replicated-storage",
        maxKeys: 10,
        maxValues: 100
    })
    .withKeyCodec(numCodec)
    .withValueCodec(strCodec)
    .build();

export const cachedStorage = Hamok.grid.createCachedStorage<number, string>()
    .withConfig({
        maxKeys: 10,
        maxValues: 100
    })
    .setBaseStorage(new SlowStorage("slow-storage"))
    .withKeyCodec(numCodec)
    .withValueCodec(strCodec)
    .build();