const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPromise = open({
  filename: path.join(__dirname, 'swiper.db'),
  driver: sqlite3.Database
});

async function initDB() {
  const db = await dbPromise;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS seniors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      alias TEXT,
      caricature_id TEXT
    );

    CREATE TABLE IF NOT EXISTS traits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      senior_id INTEGER NOT NULL,
      trait_id INTEGER NOT NULL,
      response TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, senior_id, trait_id)
    );

    CREATE TABLE IF NOT EXISTS pair_stats (
      senior_id INTEGER NOT NULL,
      trait_id INTEGER NOT NULL,
      yes_count INTEGER DEFAULT 0,
      no_count INTEGER DEFAULT 0,
      maybe_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      PRIMARY KEY (senior_id, trait_id)
    );
  `);

  return db;
}

module.exports = { dbPromise, initDB };
