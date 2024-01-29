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
            `CREATE TABLE IF NOT EXISTS product(
              id INTEGER PRIMARY KEY, 
              name TEXT NOT NULL, 
              brand_name TEXT NOT NULL, 
              serial_number TEXT NOT NULL
            );`,
            
            `CREATE TABLE IF NOT EXISTS store_product(
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              product_id INTEGER, 
              nds BOOLEAN, 
              price DOUBLE, 
              selling_price DOUBLE, 
              percentage DOUBLE, 
              count DOUBLE, 
              count_type TEXT, 
              FOREIGN KEY (product_id) REFERENCES product(id)
            );`,
            
            `CREATE TABLE IF NOT EXISTS sell_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              product_id INTEGER, 
              count DOUBLE, 
              count_type TEXT, 
              selling_price DOUBLE, 
              created_date TIMESTAMP, 
              FOREIGN KEY (product_id) REFERENCES product(id)
            );`,
            'CREATE TABLE IF NOT EXISTS sell_group (id INTEGER PRIMARY KEY AUTOINCREMENT, created_date TIMESTAMP, amount DOUBLE);',
            'CREATE TABLE IF NOT EXISTS sell_history_group (id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER, history_id INTEGER, FOREIGN KEY (group_id) REFERENCES sell_group(id), FOREIGN KEY (history_id) REFERENCES sell_history(id));',
          
            // `DROP TABLE profit_history;`,
            
            `CREATE TABLE IF NOT EXISTS profit_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              product_id INTEGER NOT NULL, 
              count DOUBLE NOT NULL, 
              count_type TEXT NOT NULL,
              profit DOUBLE NOT NULL, 
              created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,

            `CREATE TABLE IF NOT EXISTS profit_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              created_date TIMESTAMP,
              profit DOUBLE
            );`,

            `CREATE TABLE IF NOT EXISTS profit_history_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              group_id INTEGER NOT NULL, 
              history_id INTEGER NOT NULL, 
              FOREIGN KEY (group_id) REFERENCES profit_group(id), 
              FOREIGN KEY (history_id) REFERENCES profit_history(id)
            );`
          ];

          console.log(queries)
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