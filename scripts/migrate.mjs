/**
 * Run SQL migrations against Supabase directly from terminal.
 *
 * Usage:
 *   node scripts/migrate.mjs "ALTER TABLE circles ADD COLUMN ..."
 *   node scripts/migrate.mjs < migration.sql
 *
 * Reads .env.local for SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple .env parser (no dotenv dependency needed)
function loadEnv(filepath) {
  const text = readFileSync(filepath, 'utf-8');
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv(resolve(__dirname, '..', '.env.local'));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Get SQL from argument or stdin
let sql = process.argv[2];
if (!sql) {
  sql = readFileSync(process.stdin.fd, 'utf-8');
}

if (!sql || !sql.trim()) {
  console.error('Usage: node scripts/migrate.mjs "ALTER TABLE ..."');
  console.error('   or: node scripts/migrate.mjs < migration.sql');
  process.exit(1);
}

console.log('Running migration...');
const preview = sql.trim().substring(0, 150);
console.log(`SQL: ${preview}${sql.trim().length > 150 ? '...' : ''}`);

try {
  // Use the REST API directly (more reliable than rpc)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql.trim() }),
  });

  const result = await res.json();
  if (res.ok) {
    console.log('Migration complete ✅');
    if (result) console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('Migration failed:', JSON.stringify(result, null, 2));
    process.exit(1);
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
