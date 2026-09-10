// Resilient memory store to support instant out-of-the-box operation without requiring external DB setup.
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Store {
  constructor() {
    this.collections = {
      users: [],
      presentations: [],
      reports: [],
      questions: [],
      answers: [],
      interviewSessions: [],
      payments: [],
      otps: []
    };
    this.load();
  }

  load() {
    Object.keys(this.collections).forEach(col => {
      const filePath = path.join(DATA_DIR, `${col}.json`);
      if (fs.existsSync(filePath)) {
        try {
          this.collections[col] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
          this.collections[col] = [];
        }
      }
    });
  }

  save(col) {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.collections[col], null, 2));
    } catch (e) {
      console.error(`Failed to persist store collection ${col}`, e);
    }
  }

  getCollection(name) {
    return this.collections[name] || [];
  }

  insert(name, item) {
    if (!item._id && !item.id) {
      item._id = 'id_' + Math.random().toString(36).substr(2, 9) + Date.now();
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    this.collections[name].push(item);
    this.save(name);
    return item;
  }

  update(name, query, updates) {
    const item = this.findOne(name, query);
    if (item) {
      Object.assign(item, updates, { updatedAt: new Date().toISOString() });
      this.save(name);
    }
    return item;
  }

  find(name, query = {}) {
    let list = this.collections[name] || [];
    return list.filter(item => {
      return Object.keys(query).every(key => String(item[key]) === String(query[key]));
    });
  }

  findOne(name, query = {}) {
    const results = this.find(name, query);
    return results.length > 0 ? results[0] : null;
  }

  findById(name, id) {
    return this.findOne(name, { _id: id }) || this.findOne(name, { id: id });
  }

  delete(name, id) {
    this.collections[name] = (this.collections[name] || []).filter(item => String(item._id || item.id) !== String(id));
    this.save(name);
    return true;
  }
}

export const inMemoryStore = new Store();
