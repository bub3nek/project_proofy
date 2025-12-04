import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { isPostgresEnabled, sql } from './database';

const STORES_FILE = path.join(process.cwd(), 'data', 'stores.json');

export interface StoreRecord {
    id: string;
    name: string;
    createdAt: string;
}

type StoreAdapter = {
    getStores(): Promise<StoreRecord[]>;
    addStore(name: string): Promise<StoreRecord>;
};

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

function createFileAdapter(): StoreAdapter {
    return {
        async getStores() {
            const stores = await readStores();
            return stores.sort((a, b) => a.name.localeCompare(b.name));
        },
        async addStore(name: string) {
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
        },
    };
}

function createPostgresAdapter(): StoreAdapter {
    let ensured = false;

    async function ensureTable() {
        if (ensured) return;
        await sql`
            CREATE TABLE IF NOT EXISTS proofy_stores (
                id UUID PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `;
        ensured = true;
    }

    function mapRow(row: Record<string, unknown>): StoreRecord {
        return {
            id: row.id as string,
            name: row.name as string,
            createdAt:
                row.created_at instanceof Date
                    ? row.created_at.toISOString()
                    : ((row.created_at as string | null) ?? new Date().toISOString()),
        };
    }

    return {
        async getStores() {
            await ensureTable();
            const result = await sql`
                SELECT *
                FROM proofy_stores
                ORDER BY name ASC
            `;
            return result.rows.map(mapRow);
        },
        async addStore(name: string) {
            const normalized = normalizeName(name);
            if (!normalized) {
                throw new Error('Store name is required');
            }
            await ensureTable();
            const existing = await sql`
                SELECT *
                FROM proofy_stores
                WHERE name = ${normalized}
                LIMIT 1
            `;
            if (existing.rows[0]) {
                return mapRow(existing.rows[0]);
            }

            const record: StoreRecord = {
                id: crypto.randomUUID(),
                name: normalized,
                createdAt: new Date().toISOString(),
            };
            await sql`
                INSERT INTO proofy_stores (id, name, created_at)
                VALUES (${record.id}, ${record.name}, ${record.createdAt})
            `;
            return record;
        },
    };
}

const storeAdapter: StoreAdapter = isPostgresEnabled() ? createPostgresAdapter() : createFileAdapter();

export async function getStores() {
    return storeAdapter.getStores();
}

export async function addStore(name: string) {
    return storeAdapter.addStore(name);
}
