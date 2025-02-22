import DatabaseRepository from "./DatabaseRepository";
import ProductRepository from "./ProductRepository";

class ProfitHistoryRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
		this.productRepository = new ProductRepository();
	}

	async init() {
		return new Promise((resolve, reject) => {
			this.db.transaction((tx) => {
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS profit_history
           (
               id           INTEGER PRIMARY KEY AUTOINCREMENT,
               product_id   INTEGER NOT NULL,
               count        DOUBLE  NOT NULL,
               count_type   TEXT    NOT NULL,
               profit       DOUBLE  NOT NULL,
               created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               global_id    INTEGER,
               saved     		INTEGER CHECK (saved IN (0, 1))
           );`
				);

				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS profit_group
           (
               id           INTEGER PRIMARY KEY AUTOINCREMENT,
               created_date TIMESTAMP,
							 date         TEXT NOT NULL,
               profit       DOUBLE,
               global_id    INTEGER,
               saved     		INTEGER CHECK (saved IN (0, 1))
           );`
				);

				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS profit_history_group
           (
               id         INTEGER PRIMARY KEY AUTOINCREMENT,
               history_id INTEGER NOT NULL,
               group_id   INTEGER NOT NULL,
               global_id  INTEGER,
               saved    	INTEGER CHECK (saved IN (0, 1)),
               FOREIGN KEY (group_id) REFERENCES profit_group (id),
               FOREIGN KEY (history_id) REFERENCES profit_history (id)
           );`
				);
			});

			resolve(true)
		});
	}

	async createProfitGroup(profit) {
		let current_date = new Date();
		const date = `${current_date.getFullYear()}-${(current_date.getMonth() + 1).toString().padStart(2, '0')}-${current_date.getDate().toString().padStart(2, '0')}`;

		try {
			const query = `
          INSERT INTO profit_group (created_date, date, profit, global_id, saved)
          VALUES (?, ?, ?, null, 0);`;

			// Execute the query
			await this.db.transaction(async (tx) => {
				tx.executeSql(query, [current_date.toISOString(), date, profit]);
			});

			let lastProfitHistoryGroup = await this.getLastProfitHistoryGroupId();
			return lastProfitHistoryGroup;
		} catch (error) {
			//.error("Error creating profit group:", error);
			throw error;
		}
	}

	async createProfitGroupWithAllValues(
		created_date,
		profit,
		global_id,
		saved
	) {
		try {
			let current_date = new Date(created_date);
			const date = `${current_date.getFullYear()}-${(current_date.getMonth() + 1).toString().padStart(2, '0')}-${current_date.getDate().toString().padStart(2, '0')}`;

			const query = `
          INSERT INTO profit_group (created_date, date, profit, global_id, saved)
          VALUES (?, ?, ?, ?, ?);`;

			// Execute the query
			await this.db.transaction(async (tx) => {
				await tx.executeSql(query, [
					created_date,
					date,
					profit,
					global_id,
					saved ? 1 : 0
				]);
			});

			let lastProfitHistoryGroup = await this.getLastProfitHistoryGroupId();
			return lastProfitHistoryGroup;
		} catch (error) {
			//.error("Error creating profit group:", error);
			throw error;
		}
	}

	async getLastProfitHistoryGroupId() {
		try {
			const query = `
          SELECT *
          FROM profit_group
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0].id;

			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getTop1ProfitGroup() {
		try {
			const query = `
          SELECT *
          FROM profit_group
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

			//.log(rows)
			return rows;
		} catch (error) {
			//.error("Error getTop10ProfitGroupByDate:", error);
			throw error;
		}
	}

	async createProfitHistory(
		product_id,
		count,
		count_type,
		profit
	) {
		let created_date = new Date();

		try {
			const insertProfitHistoryQuery = `
          INSERT INTO profit_history (product_id,
                                      count,
                                      count_type,
                                      profit,
                                      created_date,
                                      global_id,
                                      saved)
          VALUES (?, ?, ?, ?, ?, null, 0);
			`;

			await this.db.transaction(async (tx) => {
				await tx.executeSql(
					insertProfitHistoryQuery,
					[
						product_id,
						count,
						count_type,
						profit,
						created_date.toISOString()
					]
				);
			});

			let lastIdOfProfitHistory = await this.getLastIdOfProfitHistory(product_id, created_date.toISOString());
			return lastIdOfProfitHistory.id;
		} catch (error) {
			throw error;
		}
	}

	async createProfitHistoryWithAllValues(
		product_id,
		global_id,
		count,
		count_type,
		profit,
		created_date,
		saved
	) {

		try {
			const insertProfitHistoryQuery = `
          INSERT INTO profit_history (product_id,
                                      count,
                                      count_type,
                                      profit,
                                      created_date,
                                      global_id,
                                      saved)
          VALUES (?, ?, ?, ?, ?, ?, ?);
			`;

			await this.db.transaction(async (tx) => {
				await tx.executeSql(
					insertProfitHistoryQuery,
					[
						product_id,
						count,
						count_type,
						profit,
						created_date,
						global_id,
						saved ? 1 : 0
					]
				);
			});

			let lastIdOfProfitHistory =
				await this.getLastIdOfProfitHistory(
					product_id,
					created_date
				);
			return lastIdOfProfitHistory.id;
		} catch (error) {
			throw error;
		}
	}

	async createProfitHistoryGroup(history_id, group_id) {

		const insert = `
        INSERT INTO profit_history_group(history_id,
                                         group_id,
                                         global_id,
                                         saved)
        VALUES (?, ?, null, 0);
		`;

		await this.db.transaction(async (tx) => {
			await tx.executeSql(
				insert,
				[history_id, group_id]
			);
		});
	}

	async createProfitHistoryGroupWithAllValues(
		history_id, group_id, global_id, saved
	) {
		const insert = `
        INSERT INTO profit_history_group(history_id,
                                         group_id,
                                         global_id,
                                         saved)
        VALUES (?, ?, ?, ?);
		`;

		await this.db.transaction(async (tx) => {
			await tx.executeSql(
				insert,
				[history_id, group_id, global_id, saved ? 1 : 0]
			);
		});
	}

	async getAll(group_id) {
		try {
			const query = `
          SELECT *
          FROM profit_history_group
          WHERE group_id = ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	// PROFIT GETTING SAVED FALSE:::
	async getProfitHistoryGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM profit_history_group
          WHERE saved = 0;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getProfitGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM profit_group
          WHERE saved = 0;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getProfitHistorySavedFalse() {
		try {
			const query = `
          SELECT *
          FROM profit_history
          WHERE saved = 0;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	//#############################


	// PROFIT UPDATING SAVED TRUE
	async updateProfitGroupSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE profit_group SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateProfitHistorySavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE profit_history SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateProfitHistoryGroupSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE profit_history_group SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			//.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	//#############################

	// PROFIT GETTING SAVED FALSE:::
	async getProfitHistoryGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM profit_history_group
          WHERE saved = 0;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getProfitGroupSavedFalse() {
		try {
			const query = `
          SELECT *
          FROM profit_group
          WHERE saved = 0;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	//#############################

	// PROFIT BY ID
	async findProfitHistoryById(id) {
		try {
			const query = `
          SELECT *
          FROM profit_history
          WHERE id = ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async findProfitHistoryByGlobalId(global_id) {
		try {
			const query = `
          SELECT *
          FROM profit_history
          WHERE global_id = ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async findProfitGroupById(id) {
		try {
			const query = `
          SELECT *
          FROM profit_group
          WHERE id = ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async findProfitGroupByGlobalId(global_id) {
		try {
			const query = `
          SELECT *
          FROM profit_group
          WHERE global_id = ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	//#############################


	async getLastIdOfProfitHistory(product_id, created_date) {
		try {
			const query = `
          SELECT *
          FROM profit_history
          WHERE product_id = ?
            AND created_date = ?
          ORDER BY id DESC
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getTop11ProfitGroup(startId) {
		try {
			const query = `
          SELECT *
          FROM profit_group
          where id <= ${startId}
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
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getTop11ProfitGroupByDate(lastHistoryId, fromDate, toDate) {
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
            FROM profit_group
            WHERE id <= ${lastHistoryId}
              AND DATE(date) = DATE('${fromDate}')
            ORDER BY id DESC
            limit 11;`
			} else if (fromUTCDate > toUTCDate) {
				query = `SELECT *
                 FROM profit_group
                 WHERE id <= ${lastHistoryId}
									AND DATE(date) 
									BETWEEN DATE('${toDate}') 
											AND DATE('${fromDate}') 
                 ORDER BY id DESC
                 limit 11;`;
			} else {
				query = `SELECT *
                 FROM profit_group
                 WHERE id <= ${lastHistoryId}
                  AND DATE(date) 
									BETWEEN DATE('${fromDate}') 
											AND DATE('${toDate}') 
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
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}


	async getProfitHistoryDetailByGroupId(group_id) {
		try {
			if (group_id === null) {
				//.log('group_id is null. Skipping query.');
				return [];
			}

			const query = `
          SELECT *
          FROM profit_history_group
          WHERE group_id = ?;
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
				throw new Error("Unexpected result structure");
			}

			const historyGroupLinkedArray = result.rows._array;

			let historyInfo = [];

			for (const historyGroupLinked of historyGroupLinkedArray) {
				let profitHistoryInfo = await this.getProfitHistoryInfoById(historyGroupLinked.history_id);
				let currentProfitHistoryInfo = profitHistoryInfo[0];
				let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

				currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;

				historyInfo = [...historyInfo, currentProfitHistoryInfo];
			}

			return historyInfo;
		} catch (error) {
			//.error("Error retrieving profit history details:", error);
			throw error;
		}
	}

	async getLastProfitHistoryDetailByGroupId(groupId) {
		try {
			if (!groupId) {
				//.log('groupId is null or undefined. Skipping query.');
				return [];
			}

			const query = `
          SELECT *
          FROM profit_history_group
          WHERE group_id = ?
          ORDER BY id DESC
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
				let profitHistoryInfo = await this.getProfitHistoryInfoById(historyGroupLinked.history_id);

				if (!profitHistoryInfo || profitHistoryInfo.length === 0) {
					continue;
				}

				let currentProfitHistoryInfo = profitHistoryInfo[0];
				let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

				if (!product) {
					continue;
				}

				currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;
				historyInfo.push(currentProfitHistoryInfo);
			}

			return historyInfo;
		} catch (error) {
			//.error("Error retrieving profit history details:", error);
			throw error;
		}
	}

	// TODO =>

	// GURUHNI MA'LUMOTLARINI ID ORQALI OLISH.
	async getProfitGroupInfoById(group_id) {
		try {
			const query = `
          SELECT *
          FROM profit_group
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			return result.rows._array;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	// PROFIT HISTORY MA'LUMOTLARINI ID ORQALI OLISH.
	async getProfitHistoryInfoById(history_id) {
		try {
			const query = `
          SELECT *
          FROM profit_history
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array;
			return rows;
		} catch (error) {
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getLastProfitGroup() {
		try {
			const query = `
          SELECT *
          FROM profit_group
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			return rows;
		} catch (error) {
			//.error("Error getLastProfitHistoryGroupId:", error);
			throw error;
		}
	}

	async getFirstProfitGroup() {
		try {
			const query = `
          SELECT *
          FROM profit_group
          ORDER BY id ASC
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			return rows;
		} catch (error) {
			//.error("Error getLastProfitHistoryGroupId:", error);
			throw error;
		}
	}

	async deleteByGroupIdLessThan(group_id) {
		let profitHistoryGroups;

		try {
			// Fetch the profit history groups with group_id <= provided group_id
			const selectQuery = `
          SELECT *
          FROM profit_history_group
          WHERE group_id <= ?;
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			profitHistoryGroups = result.rows._array;
			//.log("Selected profitHistoryGroups:", profitHistoryGroups);
		} catch (error) {
			//.error("Error fetching profit history groups:", error);
			throw error;
		}

		if (profitHistoryGroups.length === 0) {
			return false;
		}

		// Start a new transaction for the deletion process
		try {
			await new Promise((resolve, reject) => {
				this.db.transaction((tx) => {
					// Delete related entries in the profit_history table
					for (const profitHistoryGroup of profitHistoryGroups) {
						const deleteHistoryQuery = `
                DELETE
                FROM profit_history
                WHERE id = ?;
						`;
						tx.executeSql(
							deleteHistoryQuery,
							[profitHistoryGroup.history_id],
							(_, resultSet) => {
								if (resultSet.rowsAffected > 0) {
									//.log(`Deleted history_id: ${profitHistoryGroup.history_id}`);
								} else {
									//.log(`No rows deleted for history_id: ${profitHistoryGroup.history_id}`);
								}
							},
							(_, error) => {
								//.error("Error deleting from profit_history:", error);
								reject(error); // Reject the promise to roll back the transaction
							}
						);
					}

					// Delete the entries in the profit_group table
					const deleteGroupQuery = `
              DELETE
              FROM profit_group
              WHERE id <= ?;
					`;
					tx.executeSql(
						deleteGroupQuery,
						[group_id],
						(_, resultSet) => {
							if (resultSet.rowsAffected > 0) {
								//.log("Deleted groups with id <= ", group_id);
							} else {
								//.log("No rows deleted in profit_group.");
							}
							resolve(true); // Resolve the promise to commit the transaction
						},
						(_, error) => {
							//.error("Error deleting from profit_group:", error);
							reject(error); // Reject the promise to roll back the transaction
						}
					);
				});
			});

			return true; // All deletions were successful
		} catch (error) {
			//.error("Error during deletion transaction:", error);
			return false; // Return false in case of an error
		}
	}

	async getAllProfitGroup(lastHistoryId) {
		try {
			const query = `
          SELECT *
          FROM profit_group
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
			//.error("Error getAllProfitGroup:", error);
			throw error;
		}
	}


	async getLastProfitHistoryGroupByDate(fromDate, toDate) {
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
                 FROM profit_group
                 WHERE DATE(date) = DATE('${fromDate}')
                 ORDER BY id DESC
                 LIMIT 1;`
			} else if (fromUTCDate > toUTCDate) {
				query = `SELECT *
                 FROM profit_group
                 WHERE 
									DATE(date) 
										BETWEEN DATE('${toDate}') 
												AND DATE('${fromDate}') 
                 ORDER BY id DESC
                 LIMIT 1;`;
			} else {
				query = `SELECT *
                 FROM profit_group
                 WHERE 
								 	DATE(date) 
									BETWEEN DATE('${fromDate}') 
											AND DATE('${toDate}') 
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
			//.error("Error retrieving profit history:", error);
			throw error;
		}
	}

	async getFirstProfitGroupByDate(fromDate, toDate) {
		let fromDateObj = new Date(fromDate);
		fromDateObj.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC
		const fromUTCDate = fromDateObj.toISOString().slice(0, 19).replace('T', ' ');
		const fromDateISOString = new Date(fromDateObj.getTime() - fromDateObj.getTimezoneOffset() * 60000).toISOString().slice(0, -1); 

		let toDateObj = new Date(toDate);
		toDateObj.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC
		const toUTCDate = toDateObj.toISOString().slice(0, 19).replace('T', ' ');
		const toDateISOString = new Date(toDateObj.getTime() - toDateObj.getTimezoneOffset() * 60000).toISOString().slice(0, -1); 


		try {
			let query;
			if (toDate == fromDate) {
				query = `SELECT *
                 FROM profit_group
                 WHERE DATE(date) = DATE('${fromDate}')
                 ORDER BY id ASC
                 LIMIT 1;`
			} 
			else if (fromUTCDate > toUTCDate) {
				query = `SELECT *
               FROM profit_group
								WHERE 
								 	DATE(date) 
									BETWEEN DATE('${toDate}') 
											AND DATE('${fromDate}')                
               ORDER BY id ASC
               LIMIT 1;`;
			} 	
			else {
				query = `SELECT * FROM profit_group
								WHERE 
								 	DATE(date) 
									BETWEEN DATE('${fromDate}') 
											AND DATE('${toDate}')                
								ORDER BY id ASC
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
				//.error("Unexpected result structure:", result);
				throw new Error("Unexpected result structure");
			}

			const rows = result.rows._array[0];

			//.log("result:: ", rows);

			return rows;
		} catch (error) {
			//.error("Error getFirstProfitGroupByDate:", error);
			throw error;
		}
	}

}

export default ProfitHistoryRepository;