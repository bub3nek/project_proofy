import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const STORES_FILE = path.join(process.cwd(), 'data', 'stores.json');

export interface StoreRecord {
    id: string;
    name: string;
    createdAt: string;
}

async function readStores(): Promise<StoreRecord[]> {
    try {
        const file = await fs.readFile(STORES_FILE, 'utf-8');
        const stores = JSON.parse(file) as StoreRecord[];
        return Array.isArray(stores) ? stores : [];
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeStores(stores: StoreRecord[]) {
    await fs.writeFile(STORES_FILE, JSON.stringify(stores, null, 4), 'utf-8');
}

function normalizeName(name: string) {
    return name.trim().toUpperCase();
}

export async function getStores() {
    const stores = await readStores();
    return stores.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addStore(name: string) {
    const normalized = normalizeName(name);
    if (!normalized) {
        throw new Error('Store name is required');
    }

    const stores = await readStores();
    if (stores.some((store) => store.name === normalized)) {
        return stores.find((store) => store.name === normalized)!;
    }

    const newStore: StoreRecord = {
        id: crypto.randomUUID(),
        name: normalized,
        createdAt: new Date().toISOString(),
    };
    stores.push(newStore);
    await writeStores(stores);
    return newStore;
}
