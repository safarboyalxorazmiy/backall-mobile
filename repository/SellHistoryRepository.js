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

  async getAllSellGroup() {
    try {
      const query = `
        SELECT * FROM sell_group ORDER BY created_date DESC;
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

export default SellHistoryRepository;