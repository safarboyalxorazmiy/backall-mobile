import DatabaseRepository from "./DatabaseRepository";

class AmountDateRepository {
	constructor() {
		this.db = new DatabaseRepository().getDatabase();
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
                                 SET amount = ?
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
								const insertQuery = `INSERT INTO profit_amount_date (date, amount)
                                     VALUES (?, ?);`;
								tx.executeSql(insertQuery, [date, profitAmount], (tx, insertResults) => {
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
						const insertQuery = `INSERT INTO profit_amount_date (date, amount)
                                 VALUES (?, ?);`;
						tx.executeSql(insertQuery, [date, profitAmount], (tx, insertResults) => {
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
						// If record with the given date exists, add the new sell amount to the existing one
						const currentSell = results.rows.item(0).amount;
						const updatedSell = currentSell + sellAmount;
						const updateQuery = `UPDATE sell_amount_date
                                 SET amount = ?
                                 WHERE date = ?;`;
						tx.executeSql(updateQuery, [updatedSell, date], (tx, updateResults) => {
								if (updateResults.rowsAffected > 0) {
									console.log(`Sell amount updated successfully`);
								} else {
									console.log(`Failed to update sell amount`);
								}
							},
							error => {
							
							});
					} else {
						// If no record with the given date exists, insert a new record
						const insertQuery = `INSERT INTO sell_amount_date (date, amount)
                                 VALUES (?, ?);`;
						tx.executeSql(insertQuery, [date, sellAmount], (tx, insertResults) => {
								if (insertResults.rowsAffected > 0) {
									console.log(`Sell amount inserted successfully`);
								} else {
									console.log(`Failed to insert sell amount`);
								}
							},
							error => {
								// If no record with the given date exists, insert a new record
								
							});
					}
				},
				error => {
					const insertQuery = `INSERT INTO sell_amount_date (date, amount)
                               VALUES (?, ?);`;
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
	
	getProfitAmountInfoByDate(date) {
		return new Promise((resolve, reject) => {
			const selectQuery = `SELECT amount
                           FROM profit_amount_date
                           WHERE date = ?;`;
			this.db.transaction(tx => {
				tx.executeSql(selectQuery, [date], (tx, results) => {
						if (results.rows.length > 0) {
							resolve(results.rows.item(0).amount);
						} else {
							resolve(0.00); // Return null if no record found for the date
						}
					},
					error => {
						reject(`Error retrieving profit amount: ${error.message}`);
					});
			});
		});
	}
	
	getSellAmountInfoByDate(date) {
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
							resolve(0.00); // Return null if no record found for the date
						}
					},
					error => {
						reject(`Error retrieving sell amount: ${error.message}`);
					});
			});
		});
	}
}

export default AmountDateRepository;