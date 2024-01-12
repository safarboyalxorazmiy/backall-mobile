import DatabaseRepository from "../repository/DatabaseRepository";

class DatabaseService {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
	}	
	
	async getAllProducts() {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * from product;",
						[],
						(tx, results) => {
							const products = [];
							for (let i = 0; i < results.rows.length; i++) {
								const row = results.rows.item(i);
								products.push({
									id: row.id,
									name: row.name,
									brand_name: row.brand_name,
									serial_number: row.serial_number
								});
							}
							resolve(products);
						},
						(tx, error) => {
							reject(error);
						}
					);
				});
			});
			
			return result; // Return the products fetched from the database
		} catch (error) {
			console.error(`Error selecting product: ${error}`);
			throw error; // Re-throw the error to handle it elsewhere if needed
		}
	}
	
	async addProductToStore(productId, price, sellingPrice, percentage, count, countType) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"INSERT INTO store_products (product_id, price, sellingPrice, percentage, count, countType) VALUES (?, ?, ?, ?, ?, ?)",
						[productId, price, sellingPrice, percentage, count, countType],
						(tx, results) => {
							if (results.insertId) {
								resolve(results.insertId);
							} else {
								reject(new Error("Failed to add product"));
							}
						},
						(tx, error) => {
							reject(error);
						}
					);
				});
			});
			
			return result;
		} catch (error) {
			throw error;
		}
	}
	
	async getAllStoreProductsData() {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await new Promise((innerResolve, innerReject) => {
					this.db.transaction((tx) => {
						tx.executeSql(
							`SELECT sp.id, p.name AS product_name, sp.count
                             FROM store_products AS sp
                                      INNER JOIN products AS p ON sp.product_id = p.id`,
							[],
							(tx, results) => {
								const productData = [];
								for (let i = 0; i < results.rows.length; i++) {
									const row = results.rows.item(i);
									productData.push({
										id: row.id,
										product_name: row.product_name,
										count: row.count,
									});
								}
								innerResolve(productData);
							},
							(tx, error) => {
								innerReject(error);
							}
						);
					});
				});
				
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
	
	async createSellGroup() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					"INSERT INTO sell_group () VALUES ()",
					[],
					(tx, result) => {
						if (result.insertId) {
							resolve(result.insertId);
						} else {
							reject(new Error("Failed to create sellGroup"));
						}
					},
					(tx, error) => {
						reject(error);
					}
				);
			});
		});
	}
	
	async createSellHistory(product_id, count, countType, created_date) {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					"INSERT INTO sell_history (product_id, count, countType, created_date) VALUES (?, ?, ?, ?)",
					[product_id, count, countType, created_date],
					(tx, results) => {
						if (results.insertId) {
							resolve(results.insertId);
						} else {
							reject(new Error("Failed to create sell history"));
						}
					},
					(tx, error) => {
						reject(error);
					}
				);
			});
		});
	}
	
	async sellProduct(groupId, sell_history_id) {
		try {
			await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"INSERT INTO sell_history_group (group_id, history_id) VALUES (?, ?)",
						[groupId, sell_history_id],
						() => {
							resolve();
						},
						(tx, error) => {
							reject(error);
						}
					);
				});
			});
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}
	
	async getProductHistory() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT p.name                             AS product_name,
                            sh.count || ' ' || sh.countType    AS count_and_type,
                            strftime('%H:%M', sh.created_date) AS formatted_created_date
                     FROM sell_history AS sh
                              INNER JOIN products AS p ON sh.product_id = p.id`,
					[],
					(tx, results) => {
						const productHistory = [];
						for (let i = 0; i < results.rows.length; i++) {
							const row = results.rows.item(i);
							productHistory.push({
								product_name: row.product_name,
								count_and_type: row.count_and_type,
								formatted_created_date: row.formatted_created_date,
							});
						}
						resolve(productHistory);
					},
					(tx, error) => {
						reject(error);
					}
				);
			});
		});
	}
	
	async getSellHistoryGroupData() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT shg.group_id, SUM(sh.count * sp.price) AS selled_price
                     FROM sell_history AS sh
                              INNER JOIN sell_history_group AS shg ON sh.id = shg.history_id
                              INNER JOIN store_products AS sp ON sh.product_id = sp.product_id
                     GROUP BY shg.group_id`,
					[],
					(tx, results) => {
						const sellHistoryGroupData = [];
						for (let i = 0; i < results.rows.length; i++) {
							const row = results.rows.item(i);
							sellHistoryGroupData.push({
								group_id: row.group_id,
								selled_price: row.selled_price,
							});
						}
						resolve(sellHistoryGroupData);
					},
					(tx, error) => {
						reject(error);
					}
				);
			});
		});
	}
}

export default DatabaseService;  