import DatabaseRepository from "./DatabaseRepository";

class ProductRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
	}

	async createAndGetProductId(name, brand_name, serial_number) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT id FROM product WHERE brand_name = ? AND serial_number = ? AND name = ?;",
						[brand_name, serial_number, name],
						async (_, results) => {
							if (results.rows.length > 0) {
								const productId = results.rows.item(0).id;
								resolve(productId);
							} else {
								// Product doesn't exist, create it
								const newProductId = await this.createProduct(name, brand_name, serial_number);
								resolve(newProductId);
							}
						},
						(_, error) => {
							reject(error);
						}
					);
				});
			});

			return result;
		} catch (error) {
			//.error(`Error creating or getting product ID: ${error}`);
			throw error;
		}
	}

	async updateSavedTrueByProductId(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE product SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async createProduct(name, brand_name, serial_number) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"INSERT INTO product (name, brand_name, serial_number, type, global_id, saved) VALUES (?, ?, ?, ?, ?, ?);",
						[name, brand_name, serial_number, "LOCAL", null, 0],
						(_, results) => {
							if (results.insertId) {
								resolve(results.insertId);
							} else {
								reject(new Error("Failed to add product"));
							}
						},
						(_, error) => {
							reject(error);
						}
					);
				});
			});

			//.log(`Product created with ID: ${result}`);
			return result;
		} catch (error) {
			//.error(`Error creating product: ${error}`);
			throw error;
		}
	}

	async createProductWithGlobalId(global_id, name, brand_name, serial_number, type, saved) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"INSERT INTO product (name, global_id, brand_name, serial_number, type, saved) VALUES (?, ?, ?, ?, ?, ?);",
						[name, global_id, brand_name, serial_number, type, saved ? 1 : 0],
						(_, results) => {
							if (results.insertId) {
								resolve(results.insertId);
							} else {
								reject(new Error("Failed to add product"));
							}
						},
						(_, error) => {
							reject(error);
						}
					);
				});
			});

			//.log(`Product created with ID: ${result}`);
			return result;
		} catch (error) {
			//.error(`Error creating product: ${error}`);
			throw error;
		}
	}

	async storeProducts(products) {
		for (const currentObject of products) {
			try {
				const result = await new Promise((resolve, reject) => {
					db.transaction((tx) => {
						tx.executeSql(
							"INSERT INTO product (id, name, brand_name, serial_number) VALUES (?, ?, ?, ?);",
							[currentObject.productId, currentObject.productName, currentObject.brandName, currentObject.serialNumber],
							(_tx, results) => {
								if (results.insertId) {
									resolve(results.insertId);
								} else {
									reject(new Error("Failed to add product"));
								}
							},
							(_tx, error) => {
								reject(error);
							}
						);
					});
				});

				//.log(`Product ${currentObject.productId} added with ID: ${result}`);
			} catch (error) {
				//.error(`Error adding product ${currentObject.productId}: ${error.message}`);
			}
		}
	}

	async findProductsBySerialNumber(keyword) {
		if (keyword === "") {
			return [];
		}

		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * FROM product WHERE serial_number LIKE ?;",
						['%' + keyword + '%'],
						(_, results) => {
							//.log('Results:', results.rows);

							const products = Array.from(results.rows._array).map((row) => {
								if (row) {
									return {
										id: row.id,
										name: row.name,
										brand_name: row.brand_name,
										serial_number: row.serial_number,
									};
								} else {
									//.warn("Received undefined row in query results.");
									return null; // or handle it according to your needs
								}
							});

							resolve(products);
						},
						(_, error) => {
							//.error("Error executing SQL query:", error);
							reject(error);
						}
					);
				});
			});

			return result;
		} catch (error) {
			//.error(`Error finding products by serial number: ${error}`);
			throw error;
		}
	}

	async findProductsBySerialNumberAndSavedTrue(serialNumber) {
		if (serialNumber === "") {
			return [];
		}

		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * FROM product WHERE serial_number = ? AND saved = 1;",
						[serialNumber],
						(_, results) => {
							//.log('Results:', results.rows);

							const products = Array.from(results.rows._array).map((row) => {
								if (row) {
									return {
										id: row.id,
										name: row.name,
										brand_name: row.brand_name,
										serial_number: row.serial_number,
									};
								} else {
									//.warn("Received undefined row in query results.");
									return null; // or handle it according to your needs
								}
							});

							resolve(products);
						},
						(_, error) => {
							//.error("Error executing SQL query:", error);
							reject(error);
						}
					);
				});
			});

			return result || []; // Ensure result is an array, return empty array if undefined
		} catch (error) {
			//.error(`Error finding products by serial number: ${error}`);
			return [];
		}
	}

	async findProductsBySavedFalse() {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * FROM product WHERE saved = 0;",
						[],
						(_, results) => {
							//.log('Results:', results.rows);

							const products = Array.from(results.rows._array).map((row) => {
								if (row) {
									return {
										id: row.id,
										name: row.name,
										brand_name: row.brand_name,
										serial_number: row.serial_number,
										type: row.type,
										global_id: row.global_id
									};
								} else {
									//.warn("Received undefined row in query results.");
									return null; // or handle it according to your needs
								}
							});

							resolve(products);
						},
						(_, error) => {
							//.error("Error executing SQL query:", error);
							reject(error);
						}
					);
				});
			});

			return result || []; // Ensure result is an array, return empty array if undefined
		} catch (error) {
			//.error(`Error finding products by serial number: ${error}`);
			return [];
		}
	}

	async findProductsByGlobalId(global_id) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * FROM product WHERE global_id = ?;",
						[global_id],
						(_, results) => {
							//.log('Results:', results.rows);

							const products = Array.from(results.rows._array).map((row) => {
								if (row) {
									return {
										id: row.id,
										name: row.name,
										brand_name: row.brand_name,
										serial_number: row.serial_number,
									};
								} else {
									//.warn("Received undefined row in query results.");
									return null; // or handle it according to your needs
								}
							});

							resolve(products);
						},
						(_, error) => {
							//.error("Error executing SQL query:", error);
							reject(error);
						}
					);
				});
			});

			return result;
		} catch (error) {
			//.error(`Error finding products by serial number: ${error}`);
			throw error;
		}
	}

	async findProductsById(id) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						"SELECT * FROM product WHERE id = ?;",
						[id],
						(_, results) => {
							//.log('Results:', results.rows);

							const products = Array.from(results.rows._array).map((row) => {
								if (row) {
									return {
										id: row.id,
										name: row.name,
										brand_name: row.brand_name,
										serial_number: row.serial_number,
										global_id: row.global_id
									};
								} else {
									//.warn("Received undefined row in query results.");
									return null; // or handle it according to your needs
								}
							});

							resolve(products);
						},
						(_, error) => {
							//.error("Error executing SQL query:", error);
							reject(error);
						}
					);
				});
			});

			return result;
		} catch (error) {
			//.error(`Error finding products by serial number: ${error}`);
			throw error;
		}
	}

	async getProductNameAndBrandById(product_id) {
		try {
			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						`
                SELECT p.name, p.brand_name
                FROM product p
                WHERE p.id = ?;
						`,
						[product_id],
						(_, results) => {
							const productInfo = results.rows._array[0];

							if (productInfo) {
								resolve({
									name: productInfo.name,
									brand_name: productInfo.brand_name,
								});
							} else {
								// Product not found
								resolve(null);
							}
						},
						(_, error) => {
							reject(error);
						}
					);
				});
			});

			return result;
		} catch (error) {
			//.error(`Error getting product name and brand by ID: ${error}`);
			throw error;
		}
	}
}

export default ProductRepository;