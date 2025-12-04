import { sql } from '@vercel/postgres';

const POSTGRES_URL =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NO_SSL ||
    process.env.POSTGRES_URL_POOLED ||
    '';

const shouldUsePostgres = process.env.PROOFY_USE_POSTGRES === 'true' && Boolean(POSTGRES_URL);

export function isPostgresEnabled() {
    return shouldUsePostgres;
}

export function isPostgresAvailable() {
    return Boolean(POSTGRES_URL);
}

export { sql };
