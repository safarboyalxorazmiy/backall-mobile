import DatabaseRepository from "./DatabaseRepository";

class AmountDateRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
	}

	async init() {
		return new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS profit_amount_date
                     (
                         id        INTEGER PRIMARY KEY AUTOINCREMENT,
                         date      TEXT   NOT NULL,
                         amount    DOUBLE NOT NULL,
                         global_id INTEGER,
                         saved     boolean
                     );`
				);

				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS sell_amount_date
                     (
                         id        INTEGER PRIMARY KEY AUTOINCREMENT,
                         date      TEXT   NOT NULL,
                         amount    DOUBLE NOT NULL,
                         global_id INTEGER,
                         saved     boolean
                     );`
				);
			})

			resolve(true)
		});
	}

	async createProfitAmountWithAllValues(profitAmount, date, global_id, saved) {
		const insertQuery = `
            INSERT INTO profit_amount_date (date,
                                            amount,
                                            global_id,
                                            saved)
            VALUES (?, ?, ?, ?);`;
		await this.db.transaction(async (tx) => {
			await tx.executeSql(insertQuery, [
					date,
					profitAmount,
					global_id,
					saved ? 1 : 0
				], (tx, insertResults) => {
					if (insertResults.rowsAffected > 0) {
						console.log(`Profit amount inserted successfully`);
					} else {
						console.log(`Failed to insert profit amount`);
					}
				},
				error => {
					console.error(`Error inserting profit amount: ${error.message}`);
				});
		});
	}

	async createSellAmountWithAllValues(sellAmount, date, global_id, saved) {
		const insertQuery =
			`INSERT INTO sell_amount_date (date, amount, global_id, saved)
             VALUES (?, ?, ?, ?);`;

		await this.db.transaction(async (tx) => {
			await tx.executeSql(
				insertQuery, [date, sellAmount, global_id, saved ? 1 : 0],
				(tx, insertResults) => {
					if (insertResults.rowsAffected > 0) {
						console.log(`Sell amount inserted successfully`);
					} else {
						console.log(`Failed to insert sell amount`);
					}
				},
				error => {
					console.error("Error on createSellAmountWithAllValues: ", error)
				}
			);
		})
	}

	async setProfitAmount(profitAmount, date) {
		const selectQuery = `SELECT amount
                             FROM profit_amount_date
                             WHERE date = ?;`;
		this.db.transaction(tx => {
			tx.executeSql(selectQuery, [date], (tx, results) => {
					if (results.rows.length > 0) {
						// If record with the given date exists, add the new profit amount to the existing one
						const currentProfit = results.rows.item(0).amount;
						const updatedProfit = currentProfit + profitAmount;
						const updateQuery = `UPDATE profit_amount_date
                                             SET amount = ?,
                                                 saved  = 0
                                             WHERE date = ?;`;
						tx.executeSql(updateQuery, [updatedProfit, date], (tx, updateResults) => {
								if (updateResults.rowsAffected > 0) {
									console.log(`Profit amount updated successfully`);
								} else {
									console.log(`Failed to update profit amount`);
								}
							},
							error => {
								// If no record with the given date exists, insert a new record
								const insertQuery = `INSERT INTO profit_amount_date (date, amount, global_id, saved)
                                                     VALUES (?, ?, ?, ?);`;
								tx.executeSql(insertQuery, [date, profitAmount, null, 0], (tx, insertResults) => {
										if (insertResults.rowsAffected > 0) {
											console.log(`Profit amount inserted successfully`);
										} else {
											console.log(`Failed to insert profit amount`);
										}
									},
									error => {
										console.error(`Error inserting profit amount: ${error.message}`);
									});
							});
					} else {
						const insertQuery = `INSERT INTO profit_amount_date (date, amount, global_id, saved)
                                             VALUES (?, ?, ?, ?);`;
						tx.executeSql(insertQuery, [date, profitAmount, null, 0], (tx, insertResults) => {
								if (insertResults.rowsAffected > 0) {
									console.log(`Profit amount inserted successfully`);
								} else {
									console.log(`Failed to insert profit amount`);
								}
							},
							error => {
								console.error(`Error inserting profit amount: ${error.message}`);
							});
					}
				},
				error => {
					// If no record with the given date exists, insert a new record

				});
		});
	}

	async setSellAmount(sellAmount, date) {
		const selectQuery = `SELECT amount
                             FROM sell_amount_date
                             WHERE date = ?;`;
		this.db.transaction(tx => {
			tx.executeSql(selectQuery, [date], (tx, results) => {
					if (results.rows.length > 0) {
						console.log(results.rows.item(0))
						// If record with the given date exists, add the new sell amount to the existing one
						const currentSell = results.rows.item(0).amount;
						const updatedSell = currentSell + sellAmount;

						const updateQuery = `UPDATE sell_amount_date
                                             SET amount = ?,
                                                 saved  = 0
                                             WHERE date = ?;`;
						tx.executeSql(updateQuery, [updatedSell, date], (tx, updateResults) => {
								if (updateResults.rowsAffected > 0) {
									console.log(`Sell amount updated successfully`);
								} else {
									console.log(`Failed to update sell amount`);
								}
							},
							error => {
								console.error("Error setting sell amount", error);
							});
					} else {
						// If no record with the given date exists, insert a new record
						const insertQuery = `INSERT INTO sell_amount_date (date, amount, global_id, saved)
                                             VALUES (?, ?, null, 0);`;
						tx.executeSql(insertQuery, [date, sellAmount], (tx, insertResults) => {
								if (insertResults.rowsAffected > 0) {
									console.log(`Sell amount inserted successfully`);
								} else {
									console.log(`Failed to insert sell amount`);
								}
							},
							error => {
								// If no record with the given date exists, insert a new record
								console.error("Error setting sell amount:", error)
							});
					}
				},
				error => {
					const insertQuery = `INSERT INTO sell_amount_date (date, amount, global_id, saved)
                                         VALUES (?, ?, null, 0);`;
					tx.executeSql(insertQuery, [date, sellAmount], (tx, insertResults) => {
							if (insertResults.rowsAffected > 0) {
								console.log(`Sell amount inserted successfully`);
							} else {
								console.log(`Failed to insert sell amount`);
							}
						},
						error => {
							console.error(`Error inserting sell amount: ${error.message}`);
						});
				});
		});
	}

	async updateProfitAmountDateSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE profit_amount_date SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			console.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async updateSellAmountDateSavedTrueById(local_id, global_id) {
		try {
			await this.db.transaction((tx) => {
				tx.executeSql(
					"UPDATE sell_amount_date SET saved = 1, global_id = ? WHERE id = ?",
					[global_id, local_id]  // Use prepared statement for security
				);
			});
		} catch (error) {
			console.error(`Error updating product: ${error}`);
			throw error; // Re-throw to handle the error in the calling code
		}
	}

	async getProfitAmountDateSavedFalse() {
		return new Promise((resolve, reject) => {
			const selectQuery = `SELECT *
                                 FROM profit_amount_date
                                 WHERE saved = 0;`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [], (tx, results) => {
						if (results.rows.length > 0) {
							resolve(results.rows._array);
						} else {
							resolve([]); // Return null if no record found for the date
						}
					},
					error => {
						reject(`Error retrieving profit amount: ${error.message}`);
					});
			});
		});
	}

	async getSellAmountDateSavedFalse() {
		return new Promise((resolve, reject) => {
			const selectQuery = `SELECT *
                                 FROM sell_amount_date
                                 WHERE saved = 0;`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [], (tx, results) => {
						if (results.rows.length > 0) {
							resolve(results.rows._array);
						} else {
							resolve([]); // Return null if no record found for the date
						}
					},
					error => {
						reject(`Error retrieving sell amount date: ${error.message}`);
					});
			});
		});
	}

	async getSellAmountDate() {
		return new Promise((resolve, reject) => {
			const selectQuery = `
				SELECT * 
				FROM (
					SELECT id, amount AS value 
					FROM sell_amount_date 
					ORDER BY id DESC 
					LIMIT 30
				) subquery 
				ORDER BY id ASC;
			`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [], (tx, results) => {
					if (results.rows.length > 0) {
						// Map the results to an array of numbers
						const values = results.rows._array.map(row => row.value);
						resolve(values); // Return the array of values
					} else {
						resolve([]); // Return an empty array if no records found
					}
				},
				error => {
					reject(`Error retrieving sell amount date: ${error.message}`);
				});
			});
		});
	}	

	async getProfitAmountInfoByDate(date) {
		return new Promise((resolve, reject) => {
			const selectQuery =
				`SELECT amount
                 FROM profit_amount_date
                 WHERE date = ?;`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [date], (tx, results) => {
						if (results.rows.length > 0) {
							resolve(results.rows.item(0).amount);
						} else {
							resolve(0.00);
						}
					});
			});
		});
	}

	async getSellAmountInfoByDate(date) {
		return new Promise((resolve, reject) => {
			const selectQuery =
				`SELECT amount
                 FROM sell_amount_date
                 WHERE date = ?;`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [date], (tx, results) => {
						if (results.rows.length > 0) {
							resolve(results.rows.item(0).amount);
						} else {
							resolve(0.00);
						}
					});
			});
		});
	}


	async getProfitAmountInfoByDates(dates) {
		const selectQuery = `SELECT date, amount
                             FROM sell_amount_date
                             WHERE date IN (${dates.map(() => '?').join(',')});`;

		try {
			const results = await new Promise((resolve, reject) => {
				this.db.transaction(tx => {
					tx.executeSql(
						selectQuery,
						dates,
						(tx, results) => {
							resolve(results);
						},
						error => {
							reject(error);
						}
					);
				});
			});

			// Process results and organize them into an object with date as key and amount as value
			const amountsByDate = {};
			for (let i = 0; i < results.rows.length; i++) {
				const row = results.rows.item(i);
				amountsByDate[row.date] = row.amount;
			}

			return amountsByDate;
		} catch (error) {
			throw new Error(`Error retrieving sell amounts: ${error.message}`);
		}
	}

	async getSellAmountInfoByDates(dates) {
		const selectQuery =
			`SELECT date, amount
             FROM profit_amount_date
             WHERE date IN (${dates.map(() => '?').join(',')});`;

		try {
			const results = await new Promise((resolve, reject) => {
				this.db.transaction(tx => {
					tx.executeSql(
						selectQuery,
						dates,
						(tx, results) => {
							resolve(results);
						},
						error => {
							reject(error);
						}
					);
				});
			});

			// Process results and organize them into an object with date as key and amount as value
			const amountsByDate = {};
			for (let i = 0; i < results.rows.length; i++) {
				const row = results.rows.item(i);
				amountsByDate[row.date] = row.amount;
			}

			return amountsByDate;
		} catch (error) {
			throw new Error(`Error retrieving sell amounts: ${error.message}`);
		}
	}


}

export default AmountDateRepository;