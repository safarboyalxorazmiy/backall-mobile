import DatabaseRepository from "./DatabaseRepository";
import ProductRepository from "./ProductRepository";

class SellHistoryRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();

		this.productRepository = new ProductRepository();
	}

	async init() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS sell_history
           (
               id            INTEGER PRIMARY KEY AUTOINCREMENT,
               product_id    INTEGER,
               count         DOUBLE,
               count_type    TEXT,
               selling_price DOUBLE,
               created_date  TIMESTAMP,
               global_id     INTEGER,
               saved         boolean,
               FOREIGN KEY (product_id) REFERENCES product (id)
           );`,
				);

				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS sell_group
           (
               id           INTEGER PRIMARY KEY AUTOINCREMENT,
               created_date TIMESTAMP,
               amount       DOUBLE,
               global_id    INTEGER,
               saved        boolean
           );`
				);

				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS sell_history_group
           (
               id         INTEGER PRIMARY KEY AUTOINCREMENT,
               group_id   INTEGER,
               history_id INTEGER,
               global_id  INTEGER,
               saved      boolean,
               FOREIGN KEY (group_id) REFERENCES sell_group (id),
               FOREIGN KEY (history_id) REFERENCES sell_history (id)
           );`
				);
			});

			resolve(true);
		});
	}

	async createSellGroup(amount) {
		let currentDate = new Date();
		try {
			const query = `
          INSERT INTO sell_group (created_date, global_id, amount, saved)
          VALUES (?, null, ?, 0);
			`;

			// Execute the query
			await this.db.transaction(async (tx) => {
				await tx.executeSql(query, [currentDate.toISOString(), amount]);
			});

			console.log("Sell group created successfully. Day:", currentDate.getDate(), currentDate.toISOString());

			const lastSellHistoryGroup = await this.getLastSellGroup();
			return lastSellHistoryGroup.id;
		} catch (error) {
			console.error("Error createSellHistoryGroup:", error);
			throw error;
		}
	}

	async createSellGroupWithAllValues(
		created_date,
		amount,
		global_id,
		saved
	) {
		try {
			const query = `
          INSERT INTO sell_group (created_date, global_id, amount, saved)
          VALUES (?, ?, ?, ?);
			`;

			// Execute the query
			await this.db.transaction(async (tx) => {
				await tx.executeSql(query, [
					created_date,
					global_id,
					amount,
					saved ? 1 : 0
				]);
			});

			console.log("Sell group created successfully.");

			const lastSellHistoryGroup = await this.getLastSellGroup();
			return lastSellHistoryGroup.id;
		} catch (error) {
			console.error("Error createSellHistoryGroupWithAllValues:", error);
			throw error;
		}
	}

	async getLastSellGroup() {
		try {
			const query = `
          SELECT *
          FROM sell_group
          ORDER BY ID DESC
          LIMIT 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			return rows;
		} catch (error) {
			console.error("Error getLastSellHistoryGroupId:", error);
			throw error;
		}
	}

	async getFirstSellGroup() {
		try {
			const query = `
          SELECT *
          FROM sell_group
          ORDER BY ID ASC
          LIMIT 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			return rows;
		} catch (error) {
			console.error("Error getLastSellHistoryGroupId:", error);
			throw error;
		}
	}

	async createSellHistory(product_id, count, count_type, selling_price) {
		try {
			let created_date = new Date();
			
			console.log("Timezone offset: " + created_date.getTimezoneOffset());
			
			const query = `
          INSERT INTO sell_history (product_id,
                                    count,
                                    count_type,
                                    selling_price,
                                    created_date,
                                    global_id,
                                    saved)
          VALUES (?, ?, ?, ?, ?, null, 0);
			`;

			return new Promise((resolve, reject) => {
				this.db.transaction(tx => {
					tx.executeSql(
						query,
						[
							product_id,
							count,
							count_type,
							selling_price,
							created_date.toISOString()
						],
						async (_, result) => {
							console.log('Sell history created successfully.');
							console.log("=================");
							console.log(await this.getAll());
							console.log("=================");

							let lastIdOfSellHistory = await this.getLastIdOfSellHistory(product_id, created_date.toISOString());
							console.log(lastIdOfSellHistory);
							resolve(lastIdOfSellHistory.id);
						},
						(_, error) => {
							console.error("Transaction error:", error);
							reject(error);
						}
					);
				});
			});
		} catch (error) {
			console.error("Error createSellHistory:", error);
			throw error;
		}
	}

	async createSellHistoryWithAllValues(
		product_id,
		global_id,
		count,
		count_type,
		selling_price,
		created_date,
		saved
	) {
		try {
			const query = `
          INSERT INTO sell_history (product_id,
                                    count,
                                    count_type,
                                    selling_price,
                                    created_date,
                                    global_id,
                                    saved)
          VALUES (?, ?, ?, ?, ?, ?, ?);
			`;

			await this.db.transaction(async (tx) => {
				await tx.executeSql(query, [
					product_id,
					count,
					count_type,
					selling_price,
					created_date,
					global_id,
					saved ? 1 : 0
				]);
			});

			let lastIdOfSellHistory =
				await this.getLastIdOfSellHistory(product_id, created_date);
			return lastIdOfSellHistory.id;
		} catch (error) {
			console.error("Error createSellHistoryWithAllValues:", error);
			throw error;
		}
	}


	async createSellHistoryGroup(history_id, group_id) {
		const insert = `
        INSERT INTO sell_history_group(group_id,
                                       history_id,
                                       global_id,
                                       saved)
        VALUES (?, ?, null, 0);
		`;

		return new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				tx.executeSql(
					insert,
					[group_id, history_id],
					(_, result) => {
						console.log("SELL HISTORY LINKED");
						console.log("History Id: " + history_id + " Group Id: " + group_id);
						resolve(result);
					},
					(_, error) => {
						console.error("Transaction error:", error);
						reject(error);
					}
				);
			});
		});
	}

	async createSellHistoryGroupWithAllValues(
		history_id,
		group_id,
		global_id,
		saved
	) {
		const insert = `
        INSERT INTO sell_history_group(group_id,
                                       history_id,
                                       global_id,
                                       saved)
        VALUES (?, ?, ?, ?);
		`;

		await this.db.transaction(async (tx) => {
			await tx.executeSql(
				insert,
				[group_id, history_id, global_id, saved ? 1 : 0]
			);
		});
	}

	async getLastIdOfSellHistory(product_id, created_date) {
		try {
			const query = `
          SELECT *
          FROM sell_history
          where product_id = ?
            AND created_date = ?
          ORDER BY ID DESC
          LIMIT 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[product_id, created_date],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];
			if (rows == null) {
				return [];
			}

			return rows;
		} catch (error) {
			console.error("Error getLastIdOfSellHistory:", error);
			throw error;
		}
	}

	async getAll() {
		try {
			const query = `
          SELECT *
          FROM sell_history_group;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;

			console.log('Sell history retrieved successfully:', rows);
			return rows;
		} catch (error) {
			console.error("Error getAll:", error);
			throw error;
		}
	}

	async getTop11SellGroup(lastHistoryId) {
		try {
			const query = `
          SELECT *
          FROM sell_group
          where id <= ${lastHistoryId}
          ORDER BY id DESC
          limit 11;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getAllSellGroup:", error);
			throw error;
		}
	}

	async getTop1SellGroup() {
		try {
			const query = `
          SELECT *
          FROM sell_group
          ORDER BY id DESC
          limit 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getAllSellGroup:", error);
			throw error;
		}
	}

	async getTop11SellGroupByDate(lastHistoryId, fromDate, toDate) {
		let fromDateObj = new Date(fromDate);
		fromDateObj.setHours(0, 0, 0, 0); // Set to the end of the day
		const fromUTCDate = new Date(
			fromDateObj.getTime() - fromDateObj.getTimezoneOffset() * 60000
		).toISOString().slice(0, 19).replace('T', ' ');

		let toDateObj = new Date(toDate);
		toDateObj.setHours(23, 59, 59, 999); // Set to the beginning of the day
		const toUTCDate = new Date(
			toDateObj.getTime() - toDateObj.getTimezoneOffset() * 60000
		).toISOString().slice(0, 19).replace('T', ' ');

		try {
			let query;
			if (toDate == fromDate) {
				query = `
            SELECT *
            FROM sell_group
            WHERE id <= ${lastHistoryId}
              AND DATE(created_date) == '${fromDate}'
            ORDER BY id DESC
            limit 11;`
			} 
			else if (fromUTCDate > toUTCDate) {
				fromDateObj.setUTCHours(23, 59, 59, 999); // Set to start of the day in UTC
				const fromUTCDate = fromDateObj.toISOString().slice(0, 19).replace('T', ' ');

				toDateObj.setUTCHours(0, 0, 0, 0); // Set to end of the day in UTC
				const toUTCDate = toDateObj.toISOString().slice(0, 19).replace('T', ' ');

				query = `SELECT *
                 FROM sell_group
                 WHERE id <= ${lastHistoryId}
                   AND DATE(created_date) BETWEEN '${toDate}' AND '${fromDate}'
                 ORDER BY id DESC
                 limit 11;`;
			} 
			else {
				query = `SELECT *
                 FROM sell_group
                 WHERE id <= ${lastHistoryId}
                   AND DATE(created_date) BETWEEN '${fromDate}' AND '${toDate}'
                 ORDER BY id DESC
                 limit 11;`;
			}

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error retrieving sell history:", error);
			throw error;
		}
	}

	async findAll(lastHistoryId) {
		try {
			const query = `
          SELECT DATE(created_date)                  AS date_key,
                 strftime('%B %d, %Y', created_date) AS date_info,
                 SUM(amount)                         AS total_amount,
                 GROUP_CONCAT(id)                    AS history_ids,
                 GROUP_CONCAT(amount)                AS history_amounts,
                 GROUP_CONCAT(created_date)          AS history_created_dates
          FROM sell_group
          GROUP BY date_key
          ORDER BY date_key DESC
          LIMIT 10; -- Limiting results to 10 for example
          ;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getAllSellGroup:", error);
			throw error;
		}
	}

	async getSellGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM sell_group
          where saved = 0;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getSellGroupSavedFalse:", error);
			throw error;
		}
	}

	async getSellHistorySavedFalse() {
		try {
			const query = `
          SELECT *
          FROM sell_history
          where saved = 0;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getSellHistorySavedFalse:", error);
			throw error;
		}
	}

	async updateSellHistorySavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE sell_history SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			console.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateSellGroupSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE sell_group SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			console.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateSellHistoryGroupSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE sell_history_group SET saved = 1, global_id = ? WHERE id = ?;",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			console.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async getSellHistoryGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM sell_history_group
          where saved = 0;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error getSellHistoryGroupSavedFalse:", error);
			throw error;
		}
	}

	async getTop1SellGroup() {
		try {
			const query = `
          SELECT *
          FROM sell_group
          WHERE id >= 0
          ORDER BY id DESC
          LIMIT 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;

			console.log(rows)
			return rows;
		} catch (error) {
			console.error("Error getTop1SellGroup:", error);
			throw error;
		}
	}

	async findSellHistoryById(id) {
		try {
			const query = `
          SELECT *
          FROM sell_history
          where id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error findSellHistoryById:", error);
			throw error;
		}
	}

	async findSellHistoryByGlobalId(global_id) {
		try {
			const query = `
          SELECT *
          FROM sell_history
          where global_id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[global_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error findSellHistoryById:", error);
			throw error;
		}
	}

	async findSellGroupById(id) {
		try {
			const query = `
          SELECT *
          FROM sell_group
          where id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error findSellGroupById:", error);
			throw error;
		}
	}

	async findSellGroupByGlobalId(global_id) {
		try {
			const query = `
          SELECT *
          FROM sell_group
          where global_id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[global_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			console.error("Error findSellGroupById:", error);
			throw error;
		}
	}

	// {peoduct_name, count, count_type}
	async getSellHistoryDetailByGroupId(groupId, lastId) {
		try {
			console.log("group_id ", groupId);
			if (groupId === null) {
				console.log('group_id is null. Skipping query.');
				return [];
			}

			let result;
			if (lastId == 0) {
				const query = `
            SELECT *
            FROM sell_history_group
            WHERE group_id = ?
            ORDER BY id;
				`;
				result = await new Promise((resolve, reject) => {
					this.db.transaction((tx) => {
						tx.executeSql(
							query,
							[groupId],
							(_, resultSet) => resolve(resultSet),
							(_, error) => reject(error)
						);
					});
				});
			}
			else {
				query = `
            SELECT *
            FROM sell_history_group
            WHERE group_id = ?
              and id > ?
            ORDER BY id;
				`;

				result = await new Promise((resolve, reject) => {
					this.db.transaction((tx) => {
						tx.executeSql(
							query,
							[groupId, lastId],
							(_, resultSet) => resolve(resultSet),
							(_, error) => reject(error)
						);
					});
				});
			}

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			console.log("res: ", result.rows._array);
			const historyGroupLinkedArray = result.rows._array;

			let historyInfo = [];

			for (const historyGroupLinked of historyGroupLinkedArray) {
				let profitHistoryInfo = await this.getSellHistoryInfoById(historyGroupLinked.history_id);

				console.log("SELL HISTORY INFO INSIDE OF FOR EACH ", profitHistoryInfo[0]);
				let currentProfitHistoryInfo = profitHistoryInfo[0];
				let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

				currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;

				historyInfo = [...historyInfo, currentProfitHistoryInfo];
				console.log("SELL ARRAY: ", historyInfo);
			}

			console.log("SELL INFO: ", historyInfo);
			return historyInfo;
		} catch (error) {
			console.error("Error retrieving profit history details:", error);
			throw error;
		}
	}

	async getLastSellHistoryDetailByGroupId(groupId) {
		try {
			console.log("group_id ", groupId);

			if (!groupId) {
				console.log('groupId is null or undefined. Skipping query.');
				return [];
			}

			const query = `
          SELECT *
          FROM sell_history_group
          WHERE group_id = ?
          ORDER BY ID DESC
          LIMIT 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[groupId],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || result.rows.length === 0) {
				return [];
			}

			const historyGroupLinkedArray = result.rows._array;

			let historyInfo = [];

			for (const historyGroupLinked of historyGroupLinkedArray) {
				let profitHistoryInfo = await this.getSellHistoryInfoById(historyGroupLinked.history_id);

				if (!profitHistoryInfo || profitHistoryInfo.length === 0) {
					console.log('No profit history info found for history ID:', historyGroupLinked.history_id);
					continue;
				}

				let currentProfitHistoryInfo = profitHistoryInfo[0];
				let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

				if (!product) {
					console.log('No product found for product ID:', currentProfitHistoryInfo.product_id);
					continue;
				}

				currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;
				historyInfo.push(currentProfitHistoryInfo);
			}

			console.log("SELL INFO: ", historyInfo);
			return historyInfo;
		} catch (error) {
			console.error("Error retrieving profit history details:", error);
			throw error;
		}
	}

	async getSellHistoryDetailByGroupId(group_id) {
		try {
			console.log("group_id ", group_id);
			if (group_id === null) {
				console.log('group_id is null. Skipping query.');
				return [];
			}

			const query = `
          SELECT *
          FROM sell_history_group
          WHERE group_id = ?;
			`;


			console.log("===============")
			console.log("ALL INFO sell_history_group")
			console.log(await this.getAll());
			console.log("===============")

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[group_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				throw new Error("Unexpected result structure");
			}

			console.log("res: ", result.rows._array);
			const historyGroupLinkedArray = result.rows._array;

			let historyInfo = [];

			for (const historyGroupLinked of historyGroupLinkedArray) {
				let profitHistoryInfo = await this.getSellHistoryInfoById(historyGroupLinked.history_id);

				console.log("SELL HISTORY INFO INSIDE OF FOR EACH ", profitHistoryInfo[0]);
				let currentProfitHistoryInfo = profitHistoryInfo[0];
				let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

				currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;

				historyInfo = [...historyInfo, currentProfitHistoryInfo];
				console.log("SELL ARRAY: ", historyInfo);
			}

			console.log("SELL INFO: ", historyInfo);
			return historyInfo;
		} catch (error) {
			console.error("Error retrieving profit history details:", error);
			throw error;
		}
	}

	async getSellHistoryInfoById(history_id) {
		try {
			const query = `
          SELECT *
          FROM sell_history
          WHERE id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[history_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;

			console.log("===============;");
			console.log("sell_history WHERE id: " + history_id);
			console.log(rows);
			console.log("===============;");

			return rows;
		} catch (error) {
			console.error("Error getSellHistoryInfoById:", error);
			throw error;
		}
	}

	// GURUHNI MA'LUMOTLARINI ID ORQALI OLISH.
	async getSellGroupInfoById(group_id) {
		try {
			const query = `
          SELECT *
          FROM sell_group
          WHERE id = ?;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[group_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			console.log("ins res: ", result.rows._array);
			return result.rows._array;
		} catch (error) {
			console.error("Error getSellGroupInfoById:", error);
			throw error;
		}
	}

	async deleteByGroupIdLessThan(group_id) {
		let sellHistoryGroups;

		try {
			// Fetch the sell history groups with group_id <= provided group_id
			const selectQuery = `
          SELECT *
          FROM sell_history_group
          WHERE group_id <= ? and saved = 1;
			`;

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						selectQuery,
						[group_id],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			sellHistoryGroups = result.rows._array;
			console.log("Selected sellHistoryGroups:", sellHistoryGroups);
		} catch (error) {
			console.error("Error fetching sell history groups:", error);
			throw error;
		}

		if (sellHistoryGroups.length === 0) {
			return false;
		}

		// Start a new transaction for the deletion process
		try {
			await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					// Delete related entries in the sell_history table
					for (const sellHistoryGroup of sellHistoryGroups) {
						const deleteHistoryQuery = `
                DELETE
                FROM sell_history
                WHERE id = ? and saved = 1;
						`;
						tx.executeSql(
							deleteHistoryQuery,
							[sellHistoryGroup.history_id],
							(_, resultSet) => {
								if (resultSet.rowsAffected > 0) {
									console.log(`Deleted history_id: ${sellHistoryGroup.history_id}`);
								} else {
									console.log(`No rows deleted for history_id: ${sellHistoryGroup.history_id}`);
								}
							},
							(_, error) => {
								console.error("Error deleting from sell_history:", error);
								reject(error); // Reject the promise to roll back the transaction
							}
						);
					}

					// Delete the entries in the sell_group table
					const deleteGroupQuery = `
              DELETE
              FROM sell_group
              WHERE id <= ? and saved = 1;
					`;
					tx.executeSql(
						deleteGroupQuery,
						[group_id],
						(_, resultSet) => {
							if (resultSet.rowsAffected > 0) {
								console.log("Deleted groups with id <= ", group_id);
							} else {
								console.log("No rows deleted in sell_group.");
							}
							resolve(true); // Resolve the promise to commit the transaction
						},
						(_, error) => {
							console.error("Error deleting from sell_group:", error);
							reject(error); // Reject the promise to roll back the transaction
						}
					);
				});
			});

			return true; // All deletions were successful
		} catch (error) {
			console.error("Error during deletion transaction:", error);
			return false; // Return false in case of an error
		}
	}

	async getLastSellHistoryGroupByDate(fromDate, toDate) {
		let fromDateObj = new Date(fromDate);
		fromDateObj.setHours(0, 0, 0, 0); // Set to the end of the day
		const fromUTCDate = new Date(
			fromDateObj.getTime() - fromDateObj.getTimezoneOffset() * 60000
		).toISOString().slice(0, 19).replace('T', ' ');

		let toDateObj = new Date(toDate);
		toDateObj.setHours(23, 59, 59, 999); // Set to the beginning of the day
		const toUTCDate = new Date(
			toDateObj.getTime() - toDateObj.getTimezoneOffset() * 60000
		).toISOString().slice(0, 19).replace('T', ' ');

		try {
			let query;
			if (toDate == fromDate) {
				console.log(fromDate);
				query = `SELECT *
                 FROM sell_group
                 WHERE DATE(created_date) == '${fromDate}'
                 ORDER BY id DESC
                 LIMIT 1;`
			} 
			else if (fromUTCDate > toUTCDate) {
				query = `SELECT *
                 FROM sell_group
                 WHERE DATE(created_date) BETWEEN '${toDate}' AND '${fromDate}'
                 ORDER BY id DESC
                 LIMIT 1;`;
			} 
			else {
				query = `SELECT *
                 FROM sell_group
                 WHERE DATE(created_date) BETWEEN '${fromDate}' AND '${toDate}'
                 ORDER BY id DESC
                 LIMIT 1;`;
			}

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array || result.rows._array.length === 0) {
				return null; // Return null or handle the case when no records are found
			}

			const row = result.rows._array[0];

			return row;
		} catch (error) {
			console.error("Error retrieving sell history:", error);
			throw error;
		}
	}

	async getFirstSellGroupByDate(fromDate, toDate) {
		let fromDateObj = new Date(fromDate);
		fromDateObj.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC
		const fromUTCDate = fromDateObj.toISOString().slice(0, 19).replace('T', ' ');

		let toDateObj = new Date(toDate);
		toDateObj.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC
		const toUTCDate = toDateObj.toISOString().slice(0, 19).replace('T', ' ');

		try {
			let query;
			if (toDate == fromDate) {
				query = `SELECT *
                 FROM sell_group
                 WHERE DATE(created_date) == DATE('${fromDateObj.toISOString()}'
                 ORDER BY ID DESC
                 LIMIT 1;`
			} 
			else if (fromUTCDate > toUTCDate) {
				query = `SELECT *
               FROM sell_group
               WHERE DATE(created_date) BETWEEN '${toDate}' AND '${fromDate}'
               ORDER BY ID ASC
               LIMIT 1;`;
			} 
			else {
				query = `SELECT *
               FROM sell_group
               WHERE DATE(created_date) BETWEEN '${fromDate}' AND '${toDate}'
               ORDER BY ID ASC
               LIMIT 1;`;
			}

			const result = await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					tx.executeSql(
						query,
						[],
						(_, resultSet) => resolve(resultSet),
						(_, error) => reject(error)
					);
				});
			});

			if (!result || !result.rows || !result.rows._array) {
				console.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			console.log("result:: ", rows);

			return rows;
		}
		catch (error) {
			return null;
		}
	}
}

export default SellHistoryRepository;