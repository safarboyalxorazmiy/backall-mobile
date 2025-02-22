import DatabaseRepository from "./DatabaseRepository";

class StoreProductRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
	};

	async init() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS product
           (
               id            INTEGER PRIMARY KEY AUTOINCREMENT,
               name          TEXT NOT NULL,
               brand_name    TEXT NOT NULL,
               serial_number TEXT NOT NULL,
               type          TEXT NOT NULL,
               global_id     INTEGER,
               saved         INTEGER CHECK (saved IN (0, 1))
           );`
				);

				tx.executeSql(
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
               saved     		 INTEGER CHECK (saved IN (0, 1)),
               updated       INTEGER CHECK (updated IN (0, 1)),
               FOREIGN KEY (product_id) REFERENCES product (id)
           );`
				);

			});

			resolve(true);
		});
	}

	//#######################################
	async create(product_id, nds, price, sellingPrice, percentage, count, countType) {
		try {
			await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						`SELECT *
             FROM store_product
             where product_id = ?;`,
						[product_id],
						(_, {rows}) => {
							if (rows._array && rows.length >= 1) {
								//.log(rows._array);

								let previousCount = parseFloat(rows._array[0].count);

								//.log(previousCount + parseFloat(count));

								tx.executeSql(
									`UPDATE store_product
                   SET nds           = ?,
                       price         = ?,
                       selling_price = ?,
                       percentage    = ?,
                       count         = ?,
                       count_type    = ?,
                       saved         = 0,
                       updated       = 0
                   WHERE product_id = ?;`,
									[nds ? 1 : 0, price, sellingPrice, percentage, previousCount + parseFloat(count), countType, product_id]
								);

								resolve(true);
							} else {
								// rows array undefined or equals 0;
								tx.executeSql(
									`INSERT INTO store_product
                   (product_id, nds, price, selling_price, percentage, count, count_type, global_id, saved, updated)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
									[product_id, nds ? 1 : 0, price, sellingPrice, percentage, count, countType, null, 0, 0]
								);

								resolve(true);
							}
						},
						(_, error) => {
							//.error("Error creating store product:", error);
							reject(false);
						}
					)
				})
			});
		} catch (error) {
			//.error(`Error creating store product: ${error}`);
			throw error;
		}
	}

	createStoreProduct(product_id, nds, price, sellingPrice, percentage, count, countType, tx) {

	}

	updateValuesStoreProduct(product_id, price, sellingPrice, percentage, count, countType, tx) {

	}

	//#######################################

	async createStoreProductWithAllValues(
		product_id,
		nds,
		price,
		sellingPrice,
		percentage,
		count,
		countType,
		global_id,
		saved
	) {
		// Check if the product exists and update or delete if necessary
		try {
			const productExists = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						`SELECT count
             FROM store_product
             WHERE product_id = ?`,
						[product_id],
						(_, results) => {
							if (results.rows.length > 0) {
								const currentCount = results.rows.item(0).count;
								resolve(true);
							} else {
								resolve(false);
							}
						},
						(_, error) => {
							//.error("Error fetching store product count:", error);
							reject(error);
						}
					);
				});
			});

			if (productExists) {
				if (count === 0) {
					// If the count is zero, delete the product
					await new Promise((resolve, reject) => {
						this.db.transaction((tx) => {
							tx.executeSql(
								`DELETE
                 FROM store_product
                 WHERE product_id = ?`,
								[product_id],
								(_, results) => {
									resolve(true);
								},
								(_, error) => {
									//.error("Error deleting store product:", error);
									reject(error);
								}
							);
						});
					});
				} else {
					// Otherwise, update the count
					await new Promise((resolve, reject) => {
						this.db.transaction((tx) => {
							tx.executeSql(
								`UPDATE store_product
                 SET count   = ?,
                     updated = 0
                 WHERE product_id = ?`,
								[count, product_id],
								(_, results) => {
									resolve(true);
								},
								(_, error) => {
									//.error("Error updating store product count:", error);
									reject(error);
								}
							);
						});
					});
				}
			} else {
				// If the product doesn't exist, create a new one
				await new Promise((resolve, reject) => {
					this.db.transaction((tx) => {
						tx.executeSql(
							`INSERT INTO store_product (product_id,
                                          nds,
                                          price,
                                          selling_price,
                                          percentage,
                                          count,
                                          count_type,
                                          global_id,
                                          saved,
                                          updated)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
							[
								product_id,
								nds,
								price,
								sellingPrice,
								percentage,
								count,
								countType,
								global_id,
								saved ? 1 : 0,
								1
							],
							(_, results) => {
								resolve(true);
							},
							(_, error) => {
								//.error("Error creating store product:", error);
								reject(error);
							}
						);
					});
				});
			}
		} catch (error) {
			//.error(`Error processing store product: ${error}`);
			throw error;
		}
	}

	async updateCount(productId, count) {
		try {
			await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						`SELECT count
             FROM store_product
             WHERE product_id = ?`,
						[productId],
						(_, results) => {
							if (results.rows.length > 0) {
								let currentCount = results.rows.item(0).count;
								let newCount = currentCount - count;

								tx.executeSql(
									`UPDATE store_product
										SET count   = ?,
												updated = 0
										WHERE product_id = ?`,
									[newCount, productId],
									(_, results) => {
										resolve(true);
									},
									(_, error) => {
										//.error("Error updating store product count:", error);
										reject(false);
									}
								);
							} else {
								//.error("Product not found in the store");
								reject(false);
							}
						},
						(_, error) => {
							//.error("Error fetching store product count:", error);
							reject(false);
						}
					);
				});
			});
		} catch (error) {
			//.error(`Error updating store product count: ${error}`);
			throw error;
		}
	}

	async updateSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE store_product SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateUpdatedTrueById(id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE store_product SET updated = 1 WHERE id = ?",
					[id]
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async getStoreProductsInfo() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT sp.id,
                  p.brand_name,
                  p.name,
                  p.product_id,
                  sp.count,
                  sp.count_type,
                  sp.selling_price,
                  sp.price

           FROM store_product sp
                    JOIN product p ON sp.product_id = p.id;`,
					[],
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result array
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}

	async findByWhereSavedFalse() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT *
           FROM store_product sp
           WHERE sp.saved = 0;`,
					[],
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result array
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}

	async findByWhereUpdatedFalse() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT sp.id, sp.global_id, p.brand_name, p.name, sp.count, sp.count_type, sp.updated
           FROM store_product sp
                    JOIN product p ON sp.product_id = p.id
           WHERE sp.updated = 0;`,
					[],
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result array
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}

	async findTopStoreProductsInfo(lastId) {
		if (lastId === 0) {
			return new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						`SELECT sp.id, sp.global_id, p.brand_name, p.name, sp.count, sp.count_type
             FROM store_product sp
                      JOIN product p ON sp.product_id = p.id
             WHERE sp.id > ?
             ORDER BY sp.id
             LIMIT 13;`,
						[lastId],
						(_, {rows}) => {
							const storeProductsInfo = rows._array; // Get raw result array
							resolve(storeProductsInfo);
						},
						(_, error) => {
							//.error("Error retrieving store products info:", error);
							reject(error);
						}
					);
				});
			});
		}

		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT sp.id, p.brand_name, p.name, sp.count, sp.count_type
           FROM store_product sp
                    JOIN product p ON sp.product_id = p.id
           WHERE sp.id > ?
           ORDER BY sp.id
           LIMIT 1;`,
					[lastId],
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result array
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}

	async searchProductsInfo(query) {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT sp.id,
                  sp.count,
                  sp.count_type,
                  sp.selling_price,
                  sp.price,
                  p.brand_name,
                  p.name,
                  sp.product_id,
                  sp.nds,
                  sp.percentage
           FROM store_product sp
                    JOIN product p ON sp.product_id = p.id
           WHERE p.brand_name LIKE ?
              OR p.name LIKE ?;`,
					[query, query], // Pass the query parameter twice for brand_name and name
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result array
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}

	async getProductInfoBySerialNumber(serial_number) {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`SELECT sp.id,
                  p.serial_number,
                  p.brand_name,
                  p.name,
                  sp.count,
                  sp.count_type,
                  sp.price,
                  sp.selling_price,
                  sp.nds,
                  sp.percentage,
                  sp.updated,
                  p.id as product_id
           FROM store_product sp
                    JOIN product p ON sp.product_id = p.id
           WHERE p.serial_number = ?;`,
					[serial_number],
					(_, {rows}) => {
						const storeProductsInfo = rows._array; // Get raw result
						resolve(storeProductsInfo);
					},
					(_, error) => {
						//.error("Error retrieving store products info:", error);
						reject(error);
					}
				);
			});
		});
	}
}

export default StoreProductRepository;