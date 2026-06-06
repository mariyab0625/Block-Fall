const low    = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path   = require('path');
const fs     = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const adapter = new FileSync(path.join(dbDir, 'blockfall.json'));
const db = low(adapter);

// Set defaults — these are the "tables"
db.defaults({
  users:    [],
  scores:   [],
  progress: [],
  _nextId: { users: 1, scores: 1, progress: 1 },
}).write();

// Helper: auto-increment ID
function nextId(table) {
  const id = db.get(`_nextId.${table}`).value();
  db.set(`_nextId.${table}`, id + 1).write();
  return id;
}

module.exports = { db, nextId };
