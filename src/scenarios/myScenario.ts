import * as Repos from "../Repositories";

const sleep = (timeoutInMs: number) => new Promise(resolve => setTimeout(resolve, timeoutInMs));

export const description = `
    Custom Scenario
`;
const storage = Repos.separatedStorage;
export async function server_1(): Promise<void> {
    await storage.set(1, "one");
    await sleep(10000);
    console.info(`Read entries `, 
        "1:", await storage.get(1), 
        "2:", await storage.get(2), 
        "3:", await storage.get(3)
    );
}


export async function server_2(): Promise<void> {
    await storage.set(2, "two");
    await sleep(10000);
    console.info(`Read entries `, 
        "1:", await storage.get(1), 
        "2:", await storage.get(2), 
        "3:", await storage.get(3)
    );
}


export async function server_3(): Promise<void> {
    await storage.set(3, "three");
    await sleep(10000);
    console.info(`Read entries `, 
        "1:", await storage.get(1), 
        "2:", await storage.get(2), 
        "3:", await storage.get(3)
    );
}