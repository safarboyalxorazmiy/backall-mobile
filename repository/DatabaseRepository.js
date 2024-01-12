import * as SQLite from 'expo-sqlite';

class DatabaseRepository {
  constructor() {
    this.db = SQLite.openDatabase('backall.db', 1);
  }

  async executeQueries(tx, queries) {
    for (const query of queries) {
      await tx.executeSql(query);
    }
  }

  async init() {
    if (this.db !== null) {
      try {
        this.db.transaction(async (tx) => {
          const queries = [
            'CREATE TABLE IF NOT EXISTS product (id INTEGER PRIMARY KEY, name TEXT NOT NULL, brand_name TEXT NOT NULL, serial_number TEXT NOT NULL);',
            'CREATE TABLE IF NOT EXISTS store_products (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, nds BOOLEAN, price DOUBLE, sellingPrice DOUBLE, percentage DOUBLE, count DOUBLE, countType TEXT, FOREIGN KEY (product_id) REFERENCES product(id));',
            'CREATE TABLE IF NOT EXISTS sell_history (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, count DOUBLE, countType TEXT, created_date TIMESTAMP, FOREIGN KEY (product_id) REFERENCES product(id));',
            'CREATE TABLE IF NOT EXISTS sell_group (id INTEGER PRIMARY KEY AUTOINCREMENT);',
            'CREATE TABLE IF NOT EXISTS sell_history_group (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER, history_id INTEGER, FOREIGN KEY (group_id) REFERENCES sell_group(id), FOREIGN KEY (history_id) REFERENCES sell_history(id));',
          ];

          await this.executeQueries(tx, queries);
        });
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    }
  }

  getDatabase() {
    return this.db;
  }
}

export default DatabaseRepository;