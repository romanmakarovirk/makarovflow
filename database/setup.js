// Скрипт для создания таблиц в Neon.tech базе данных
import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MRQwX1ByEA3z@ep-winter-thunder-ag7de0em-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🔄 Подключение к базе данных...');

    // Читаем SQL схему
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    console.log('📝 Создание таблиц...');
    await pool.query(schemaSQL);

    console.log('✅ База данных успешно настроена!');
    console.log('');
    console.log('Созданы таблицы:');
    console.log('  - users');
    console.log('  - journal_entries');
    console.log('  - tasks');
    console.log('  - homework');
    console.log('  - schedule');
    console.log('  - ai_messages');
    console.log('  - user_settings');
    console.log('  - promo_codes');
    console.log('  - promo_code_usage');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error.message);
    process.exit(1);
  }
}

setupDatabase();
