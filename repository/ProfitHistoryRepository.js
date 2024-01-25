import DatabaseRepository from "./DatabaseRepository";

class ProfitHistoryRepository {
  constructor() {
    this.db = new DatabaseRepository().getDatabase();
  }

  async createProfitHistoryGroup(profit) {
    try {
      const createdDate = new Date().toISOString(); // Example: Get current timestamp
      const query = `
        INSERT INTO profit_group (created_date, profit)
        VALUES (?, ?);`;

      // Execute the query
      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [createdDate, profit]);
      });

    } catch (error) {
      console.error("Error creating profit group:", error);
      throw error;
    }
  }

  async createSellHistory(product_id, count, count_type, profit, created_date) {
    try {
      const query = `
        INSERT INTO sell_history (product_id, count, count_type, profit, created_date)
        VALUES (?, ?, ?, ?);`;

      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [product_id, count, count_type, profit, created_date.toISOString()]);
      });

      console.log('Sell group created successfully.');
    } catch (error) {
      console.error("Error creating sell group:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const query = `
        SELECT * FROM sell_history;
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
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async getAllProfitGroup() {
    try {
      const query = `
        SELECT * FROM profit_group ORDER BY created_date DESC;
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
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }
}

export default ProfitHistoryRepository;