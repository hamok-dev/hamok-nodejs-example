import * as Repos from "../Repositories";

const sleep = (timeoutInMs: number) => new Promise(resolve => setTimeout(resolve, timeoutInMs));

export const description = `
    Basic Separated Storage Test
`;

const entries_1 = new Map<number, string>();
for (let i = 100000; i < 110001; ++i) {
    entries_1.set(i, `${Math.round(Math.random() * 10000)}`);
}

const entries_2 = new Map<number, string>();
for (let i = 200000; i < 210001; ++i) {
    entries_2.set(i, `${Math.round(Math.random() * 10000)}`);
}

const entries_3 = new Map<number, string>();
for (let i = 300000; i < 310001; ++i) {
    entries_3.set(i, `${Math.round(Math.random() * 10000)}`);
}

export async function server_1(): Promise<void> {
    await Repos.separatedStorage.setAll(entries_1);
    await sleep(10000);
    let started = Date.now();
    console.info(`Read entries `);
    const read_1 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_1.keys()))
    );
    const read_2 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_2.keys()))
    );
    const read_3 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_3.keys()))
    );
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
}


export async function server_2(): Promise<void> {
    await Repos.separatedStorage.setAll(entries_2);
    await sleep(10000);
    let started = Date.now();
    console.info(`Read entries `);
    const read_1 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_1.keys()))
    );
    const read_2 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_2.keys()))
    );
    const read_3 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_3.keys()))
    );
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
}


export async function server_3(): Promise<void> {
    await Repos.separatedStorage.setAll(entries_3);
    await sleep(10000);
    let started = Date.now();
    console.info(`Read entries `);
    const read_1 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_1.keys()))
    );
    const read_2 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_2.keys()))
    );
    const read_3 = await Repos.separatedStorage.getAll(
        new Set<number>(Array.from(entries_3.keys()))
    );
    console.log(`Read finished in ${Date.now() - started}ms size of read_1, read_2, read_3`, read_1.size, read_2.size, read_3.size);
}


