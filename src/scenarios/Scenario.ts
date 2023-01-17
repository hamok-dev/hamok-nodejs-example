// import { description, server_1, server_2, server_3} from "./sepStorage_base";
// import { description, server_1, server_2, server_3} from "./repStorage_base";
// import { description, server_1, server_2, server_3} from "./pubsub_base";
import { description, server_1, server_2, server_3} from "./cacheStorage_base";

export interface Scenario {
    readonly description: string;
    server_1(): Promise<void>;
    server_2(): Promise<void>;
    server_3(): Promise<void>;
}

export const scenario: Scenario = {
    description,
    server_1,
    server_2,
    server_3,
};