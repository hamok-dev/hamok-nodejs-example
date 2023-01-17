import * as Repos from "../Repositories";

const sleep = (timeoutInMs: number) => new Promise(resolve => setTimeout(resolve, timeoutInMs));

export const description = `
    Basic Separated Storage Test
`;


const entries = new Map<number, string>();
for (let i = 0; i < 10; ++i) {
    entries.set(i, `${Math.round(Math.random() * 10000)}`);
}

export async function server_1(): Promise<void> {
    await Repos.cachedStorage.setAll(entries);
    await sleep(10000);
    console.info(`Read entries `);
    let started = Date.now();
    const read_1 = await Repos.cachedStorage.getAll(
        new Set<number>([0, 1, 2])
    );
    let checkpoint_1 = Date.now();
    const read_2 = await Repos.cachedStorage.getAll(
        new Set<number>([3, 4, 5])
    );
    let checkpoint_2 = Date.now();
    const read_3 = await Repos.cachedStorage.getAll(
        new Set<number>([6, 7, 8])
    );
    let checkpoint_3 = Date.now();
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
    console.log(`Reading time: read_1: ${checkpoint_1 - started}`);
    console.log(`Reading time: read_2: ${checkpoint_2 - checkpoint_1}`);
    console.log(`Reading time: read_3: ${checkpoint_3 - checkpoint_2}`);
    console.log(`Misses: ${Repos.cachedStorage.metrics.misses}`);
    console.log(`remoteHits: ${Repos.cachedStorage.metrics.remoteHits}`);
    console.log(`localHits: ${Repos.cachedStorage.metrics.localHits}`);
}


export async function server_2(): Promise<void> {
    await Repos.cachedStorage.setAll(entries);
    await sleep(10000);
    let started = Date.now();
    const read_2 = await Repos.cachedStorage.getAll(
        new Set<number>([3, 4, 5])
    );
    let checkpoint_1 = Date.now();
    const read_1 = await Repos.cachedStorage.getAll(
        new Set<number>([0, 1, 2])
    );
    let checkpoint_2 = Date.now();
    const read_3 = await Repos.cachedStorage.getAll(
        new Set<number>([6, 7, 8])
    );
    let checkpoint_3 = Date.now();
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
    console.log(`Reading time: read_1: ${checkpoint_2 - checkpoint_1}`);
    console.log(`Reading time: read_2: ${checkpoint_1 - started}`);
    console.log(`Reading time: read_3: ${checkpoint_3 - checkpoint_2}`);
    console.log(`Misses: ${Repos.cachedStorage.metrics.misses}`);
    console.log(`remoteHits: ${Repos.cachedStorage.metrics.remoteHits}`);
    console.log(`localHits: ${Repos.cachedStorage.metrics.localHits}`);
}


export async function server_3(): Promise<void> {
    await Repos.cachedStorage.setAll(entries);
    await sleep(10000);
    let started = Date.now();
    const read_3 = await Repos.cachedStorage.getAll(
        new Set<number>([6, 7, 8])
    );
    let checkpoint_1 = Date.now();
    const read_1 = await Repos.cachedStorage.getAll(
        new Set<number>([0, 1, 2])
    );
    let checkpoint_2 = Date.now();
    const read_2 = await Repos.cachedStorage.getAll(
        new Set<number>([3, 4, 5])
    );
    let checkpoint_3 = Date.now();
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
    console.log(`Reading time: read_1: ${checkpoint_2 - checkpoint_1}`);
    console.log(`Reading time: read_2: ${checkpoint_3 - checkpoint_2}`);
    console.log(`Reading time: read_3: ${checkpoint_1 - started}`);
    console.log(`Misses: ${Repos.cachedStorage.metrics.misses}`);
    console.log(`remoteHits: ${Repos.cachedStorage.metrics.remoteHits}`);
    console.log(`localHits: ${Repos.cachedStorage.metrics.localHits}`);
}


