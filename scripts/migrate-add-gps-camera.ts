/**
 * Migration script to add GPS and camera columns to existing database
 * Run this once to update your Postgres schema
 */

import { sql } from '@vercel/postgres';

async function migrate() {
    console.log('Starting migration...');

    try {
        // Add GPS columns
        console.log('Adding gps_latitude column...');
        await sql`
            ALTER TABLE proofy_images 
            ADD COLUMN IF NOT EXISTS gps_latitude DOUBLE PRECISION
        `;

        console.log('Adding gps_longitude column...');
        await sql`
            ALTER TABLE proofy_images 
            ADD COLUMN IF NOT EXISTS gps_longitude DOUBLE PRECISION
        `;

        // Add camera columns
        console.log('Adding camera_make column...');
        await sql`
            ALTER TABLE proofy_images 
            ADD COLUMN IF NOT EXISTS camera_make TEXT
        `;

        console.log('Adding camera_model column...');
        await sql`
            ALTER TABLE proofy_images 
            ADD COLUMN IF NOT EXISTS camera_model TEXT
        `;

        console.log('✅ Migration completed successfully!');
        console.log('New columns added:');
        console.log('  - gps_latitude (DOUBLE PRECISION)');
        console.log('  - gps_longitude (DOUBLE PRECISION)');
        console.log('  - camera_make (TEXT)');
        console.log('  - camera_model (TEXT)');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrate()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
