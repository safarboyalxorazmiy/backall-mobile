import DatabaseRepository from "./DatabaseRepository";

class SellHistoryRepository {
  constructor() {
    this.db = new DatabaseRepository().getDatabase();
  }

  async createSellHistoryGroup(amount) {
    try {
      const createdDate = new Date().toISOString(); // Example: Get current timestamp
      const query = `
        INSERT INTO sell_group (created_date, amount)
        VALUES (?, ?);`;

      // Execute the query
      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [createdDate, amount]);
      });

      console.log(this.selectAll("sell_group"))

      console.log('Sell group created successfully.');
    } catch (error) {
      console.error("Error creating sell group:", error);
      throw error;
    }
  }

  async createSellHistory(product_id, count, count_type, selling_price, created_date) {
    try {
      const query = `
        INSERT INTO sell_history (product_id, count, count_type, selling_price, created_date)
        VALUES (?, ?, ?, ?);`;

      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [product_id, count, count_type, selling_price, created_date.toISOString()]);
      });

      console.log('Sell group created successfully.');
    } catch (error) {
      console.error("Error creating sell group:", error);
      throw error;
    }
  }

  async selectAll(tableName) {
    try {
      const query = `SELECT * FROM ${tableName};`;

      const result = await new Promise((resolve, reject) => {
        this.db.transaction((tx) => {
          tx.executeSql(
            query,
            [],
            (_, { rows }) => resolve(rows),
            (_, error) => reject(error)
          );
        });
      });

      // Log the selected rows
      result._array.forEach((row) => {
        console.log(row);
      });

      return result._array;
    } catch (error) {
      console.error(`Error selecting all rows from ${tableName}:`, error);
      throw error;
    }
  }

}

export default SellHistoryRepository;