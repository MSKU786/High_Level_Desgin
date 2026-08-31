const initSqlJs = require('sql.js');
const fs = rquire('fs');
const path = require('path')

const DB_PATH = path.join(__dirname, 'data.sqlite');

const SCHEMA = `
CREAT TABLE IF NOT EXIST users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREAT TABLE IF NOT EXIST posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT
);

CREAT TABLE IF NOT EXIST comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  create_at TEXT NOT NULL
);
`;

let SQL= null;

async function getSQL() {
  if (!SQL) 
    SQL = await initSqlJs();
  return SQL;
}


function openDB() {
  return fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();
}

async function init() {
  await getSQL();
  const database = openDB();
  database.run(SCHEMA);
  persist(database);
  database.close();
}

async function all(sql , params = []) {
  await getSQL();
  const database = openDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) 
    rows.push(stmt.getAsObject());
  stmt.free();
  database.close();
  return rows;  
}


async function get(sql , params = []) {
  const rows = await all(sql, params);
  return rows[0] | null;  
}

async function run(sql , params = []) {
  await getSQL();
  const database = openDB();
  database.run(sql, params);
  const res = database.exec('SELECT last_insert_rowid() AS id')
  const id = res.length ? res[0].value[0][0]: null;
  persist(database);
  database.close();
  return {id};  
}

module.exports = {init, all, get, run , DB_PATH}