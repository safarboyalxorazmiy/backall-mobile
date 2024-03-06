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
              serial_number TEXT NOT NULL,
              type TEXT NOT NULL,
              global_id INTEGER,
              saved boolean
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
              global_id INTEGER,
              saved boolean,
              FOREIGN KEY (product_id) REFERENCES product(id)
            );`,
            
            `CREATE TABLE IF NOT EXISTS sell_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              product_id INTEGER, 
              count DOUBLE, 
              count_type TEXT, 
              selling_price DOUBLE, 
              created_date TIMESTAMP, 
              global_id INTEGER,
              saved boolean,
              FOREIGN KEY (product_id) REFERENCES product(id)
            );`,

            `CREATE TABLE IF NOT EXISTS sell_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              created_date TIMESTAMP, 
              amount DOUBLE,
              global_id INTEGER,
              saved boolean
            );`,

            `CREATE TABLE IF NOT EXISTS sell_history_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              group_id INTEGER,
              history_id INTEGER,
              global_id INTEGER,
              saved boolean, 
              FOREIGN KEY (group_id) REFERENCES sell_group(id), 
              FOREIGN KEY (history_id) REFERENCES sell_history(id)
            );`,
          
            `CREATE TABLE IF NOT EXISTS profit_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              product_id INTEGER NOT NULL, 
              count DOUBLE NOT NULL, 
              count_type TEXT NOT NULL,
              profit DOUBLE NOT NULL, 
              created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              global_id INTEGER,
              saved boolean,
            );`,

            `CREATE TABLE IF NOT EXISTS profit_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              created_date TIMESTAMP,
              profit DOUBLE,
              global_id INTEGER,
              saved boolean,
            );`,

            `CREATE TABLE IF NOT EXISTS profit_history_group (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              global_id INTEGER,
              history_id INTEGER NOT NULL,
              group_id INTEGER NOT NULL, 
              saved boolean, 
              FOREIGN KEY (group_id) REFERENCES profit_group(id), 
              FOREIGN KEY (history_id) REFERENCES profit_history(id)
            );`,


            // DATE AMOUNTS.
            `CREATE TABLE IF NOT EXISTS profit_amount_date (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              amount DOUBLE NOT NULL,
              global_id INTEGER, 
              saved boolean
            );`,

            `CREATE TABLE IF NOT EXISTS sell_amount_date (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,              
              amount DOUBLE NOT NULL,
              global_id INTEGER,
              saved boolean
            );`,

            // `DROP TABLE profit_amount_date;`,
            // `DROP TABLE sell_amount_date;`
            // `DELETE FROM sell_history_group;`,
            // `DELETE FROM sell_history;`,
            // `DELETE FROM sell_group;`,

            // `DELETE FROM profit_history_group;`,
            // `DELETE FROM profit_history;`,
            // `DELETE FROM profit_group;`,

            // `DELETE FROM store_product;`,
            // `DELETE FROM product;`,
	          // `DROP TABLE profit_amount_date;`,
	          // `DELETE FROM sell_amount_date;`,
            
            // `DROP TABLE sell_history; DROP TABLE sell_group; DROP TABLE sell_history_group;`
            // `DROP TABLE profit_history;`,
          ];

          console.log(queries)
          await this.executeQueries(tx, queries);
        });
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    }
  }

  async clear() {
    if (this.db !== null) {
      try {
        await this.db.transaction(async (tx) => {
          await this.executeQueries(tx, [
            // DROP TABLES
            `DROP TABLE IF EXISTS profit_amount_date;`,
            `DROP TABLE IF EXISTS sell_amount_date;`,
            `DROP TABLE IF EXISTS profit_history_group;`,
            `DROP TABLE IF EXISTS profit_group;`,
            `DROP TABLE IF EXISTS profit_history;`,
            `DROP TABLE IF EXISTS sell_history_group;`,
            `DROP TABLE IF EXISTS sell_group;`,
            `DROP TABLE IF EXISTS sell_history;`,
            `DROP TABLE IF EXISTS store_product;`,
            `DROP TABLE IF EXISTS product;`
          ]);
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