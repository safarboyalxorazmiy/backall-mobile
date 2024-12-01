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
						`CREATE TABLE IF NOT EXISTS product
             (
                 id            INTEGER PRIMARY KEY AUTOINCREMENT,
                 name          TEXT NOT NULL,
                 brand_name    TEXT NOT NULL,
                 serial_number TEXT NOT NULL,
                 type          TEXT NOT NULL,
                 global_id     INTEGER,
                 saved         INTEGER CHECK (saved IN (0, 1))
             );`,

						`CREATE TABLE IF NOT EXISTS store_product
             (
                 id            INTEGER PRIMARY KEY AUTOINCREMENT,
                 product_id    INTEGER,
                 nds           INTEGER CHECK (nds IN (0, 1)),
                 price         DOUBLE,
                 selling_price DOUBLE,
                 percentage    DOUBLE,
                 count         DOUBLE,
                 count_type    TEXT,
                 global_id     INTEGER,
                 saved         INTEGER CHECK (saved IN (0, 1)),
                 updated       INTEGER CHECK (updated IN (0, 1)),
                 FOREIGN KEY (product_id) REFERENCES product (id)
             );`,

						`CREATE TABLE IF NOT EXISTS sell_history
             (
                 id            INTEGER PRIMARY KEY AUTOINCREMENT,
                 product_id    INTEGER,
                 count         DOUBLE,
                 count_type    TEXT,
                 selling_price DOUBLE,
                 created_date  TIMESTAMP,
                 global_id     INTEGER,
                 saved         INTEGER CHECK (saved IN (0, 1)),
                 FOREIGN KEY (product_id) REFERENCES product (id)
             );`,

						`CREATE TABLE IF NOT EXISTS sell_group
             (
                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                 created_date TIMESTAMP,
                 date         TEXT NOT NULL,
                 amount       DOUBLE,
                 global_id    INTEGER,
                 saved         INTEGER CHECK (saved IN (0, 1))
             );`,

						`CREATE TABLE IF NOT EXISTS sell_history_group
             (
                 id         INTEGER PRIMARY KEY AUTOINCREMENT,
                 group_id   INTEGER,
                 history_id INTEGER,
                 global_id  INTEGER,
                 saved      INTEGER CHECK (saved IN (0, 1)),
                 FOREIGN KEY (group_id) REFERENCES sell_group (id),
                 FOREIGN KEY (history_id) REFERENCES sell_history (id)
             );`,

						`CREATE TABLE IF NOT EXISTS profit_history
             (
                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                 product_id   INTEGER NOT NULL,
                 count        DOUBLE  NOT NULL,
                 count_type   TEXT    NOT NULL,
                 profit       DOUBLE  NOT NULL,
                 created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 global_id    INTEGER,
                 saved        INTEGER CHECK (saved IN (0, 1))

             );`,

						`CREATE TABLE IF NOT EXISTS profit_group
             (
                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                 created_date TIMESTAMP,
                 date         TEXT NOT NULL,
                 profit       DOUBLE,
                 global_id    INTEGER,
                 saved        INTEGER CHECK (saved IN (0, 1))

             );`,

						`CREATE TABLE IF NOT EXISTS profit_history_group
             (
                 id         INTEGER PRIMARY KEY AUTOINCREMENT,
                 global_id  INTEGER,
                 history_id INTEGER NOT NULL,
                 group_id   INTEGER NOT NULL,
                 saved      INTEGER CHECK (saved IN (0, 1))
,
                 FOREIGN KEY (group_id) REFERENCES profit_group (id),
                 FOREIGN KEY (history_id) REFERENCES profit_history (id)
             );`,


						// DATE AMOUNTS.
						`CREATE TABLE IF NOT EXISTS profit_amount_date
             (
                 id        INTEGER PRIMARY KEY AUTOINCREMENT,
                 date      TEXT   NOT NULL,
                 amount    DOUBLE NOT NULL,
                 global_id INTEGER,
                 saved     INTEGER CHECK (saved IN (0, 1))

             );`,

						`CREATE TABLE IF NOT EXISTS sell_amount_date
             (
                 id        INTEGER PRIMARY KEY AUTOINCREMENT,
                 date      TEXT   NOT NULL,
                 amount    DOUBLE NOT NULL,
                 global_id INTEGER,
                 saved     INTEGER CHECK (saved IN (0, 1))

             );`
				];

					//.log(queries)
					await this.executeQueries(tx, queries);
				});
			} catch (error) {
				//.error('Error initializing database:', error);
			}
		}
	}

	async clear() {
        if (this.db !== null) {
        try {
            await this.db.transaction((tx) => {
                const queries = [
                `DELETE FROM profit_amount_date;`,
                `DELETE FROM sell_amount_date;`,
                `DELETE FROM profit_history_group;`,
                `DELETE FROM profit_group;`,
                `DELETE FROM profit_history;`,
                `DELETE FROM sell_history_group;`,
                `DELETE FROM sell_group;`,
                `DELETE FROM sell_history;`,
                `DELETE FROM store_product;`,
                `DELETE FROM product;`
                ];

                queries.forEach((query) => {
                tx.executeSql(query);
                });
            });
            //.log('Database cleared successfully.');
        } catch (error) { }
        }
    }
    

	getDatabase() {
		return this.db;
	}
}

export default DatabaseRepository;