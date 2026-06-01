/**
 * إعداد Supabase تلقائياً — شغّل: npm run setup
 * يحتاج في .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_DB_PASSWORD  (كلمة مرور Database من إنشاء المشروع)
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ ملف .env.local غير موجود');
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

function saveEnv(updates) {
  let content = fs.readFileSync(envPath, 'utf8');
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  fs.writeFileSync(envPath, content.trim() + '\n');
}

function getProjectRef(url) {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

function buildDbUrl(ref, password) {
  const enc = encodeURIComponent(password);
  return `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;
}

async function connectDb(ref, password) {
  const regions = [
    'eu-west-1',
    'eu-central-1',
    'us-east-1',
    'us-west-1',
    'ap-southeast-1',
    'ap-northeast-1',
    'sa-east-1',
  ];

  for (const region of regions) {
    const enc = encodeURIComponent(password);
    const url = `postgresql://postgres.${ref}:${enc}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`✓ اتصال بقاعدة البيانات (${region})`);
      return client;
    } catch {
      await client.end().catch(() => {});
    }
  }

  // Direct connection fallback
  const direct = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
  const client = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✓ اتصال مباشر بقاعدة البيانات');
  return client;
}

async function runSchema(client) {
  const sql = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8');
  await client.query(sql);
  console.log('✓ الجداول جاهزة');
}

async function createAdmin(client) {
  const email = 'admin@test.com';
  const password = 'Admin123!';
  const hash = await bcrypt.hash(password, 10);

  const { rows } = await client.query('select id from public.users where email = $1', [email]);
  if (rows.length > 0) {
    console.log('✓ حساب المدير موجود مسبقاً');
    return;
  }

  await client.query(
    `insert into public.users (name, email, phone, password, role, is_approved)
     values ($1, $2, $3, $4, $5, $6)`,
    ['المدير', email, '0550000000', hash, 'super_admin', true]
  );
  console.log('✓ حساب المدير: admin@test.com / Admin123!');
}

async function createBucket(supabaseUrl, serviceKey) {
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.name === 'course-content')) {
    console.log('✓ bucket course-content موجود');
    return;
  }
  const { error } = await admin.storage.createBucket('course-content', { public: true });
  if (error) throw new Error(`Storage: ${error.message}`);
  console.log('✓ bucket course-content تم إنشاؤه');
}

async function main() {
  console.log('\n🚀 إعداد منصة التعليم...\n');

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;
  const dbPassword = env.SUPABASE_DB_PASSWORD;

  const placeholders = ['your_supabase', 'your_anon', 'your_service', 'your_very_long', 'your_database'];
  const missing = [];
  if (!url || placeholders.some((p) => url.includes(p))) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anon || placeholders.some((p) => anon.includes(p))) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!service || placeholders.some((p) => service.includes(p))) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!dbPassword || placeholders.some((p) => dbPassword.includes(p))) missing.push('SUPABASE_DB_PASSWORD');

  if (missing.length) {
    console.log('❌ أضف هذه القيم في .env.local أولاً:\n');
    console.log('  1. Supabase → Project Settings → API');
    console.log('     NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
    console.log('     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
    console.log('     SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    console.log('');
    console.log('  2. Supabase → Project Settings → Database → Database password');
    console.log('     SUPABASE_DB_PASSWORD=كلمة_المرور_التي_اخترتها');
    console.log('');
    console.log(`  ناقص: ${missing.join(', ')}\n`);
    process.exit(1);
  }

  const envUpdates = {};
  if (!env.JWT_SECRET || env.JWT_SECRET.includes('your_')) {
    envUpdates.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.log('✓ JWT_SECRET تم توليده تلقائياً');
  }
  if (Object.keys(envUpdates).length) saveEnv(envUpdates);

  const ref = getProjectRef(url);
  if (!ref) {
    console.error('❌ رابط Supabase غير صالح');
    process.exit(1);
  }

  let client;
  try {
    client = await connectDb(ref, dbPassword);
    await runSchema(client);
    await createAdmin(client);
    await createBucket(url, service);
    console.log('\n✅ الإعداد اكتمل!\n');
    console.log('  شغّل: npm run dev');
    console.log('  افتح: http://localhost:3000/login');
    console.log('  المدير: admin@test.com / Admin123!\n');
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error('\n❌ فشل الإعداد:', err.message);
  console.error('\nتأكد من:');
  console.error('  - المفاتيح صحيحة في .env.local');
  console.error('  - SUPABASE_DB_PASSWORD = كلمة مرور Database (من إنشاء المشروع)');
  console.error('  - المشروع Supabase نشط (ليس paused)\n');
  process.exit(1);
});
