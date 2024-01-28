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

      let lastProfitHistoryGroup = await this.getLastProfitHistoryGroupId();
      console.log(lastProfitHistoryGroup);
      return lastProfitHistoryGroup.id;
    } catch (error) {
      console.error("Error creating profit group:", error);
      throw error;
    }
  }

  async getLastProfitHistoryGroupId() {
    try {
      const query = `
        SELECT * FROM profit_group ORDER BY ID DESC LIMIT 1;
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
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async createProfitHistory(product_id, count, count_type, profit, created_date, group_id) {
    try {
      const insertProfitHistoryQuery = `
        INSERT INTO profit_history (product_id, count, count_type, profit, created_date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
      `;
      
      await this.db.transaction(async (tx) => {
        await tx.executeSql(
          insertProfitHistoryQuery,
          [product_id, count, count_type, profit]
        );
      });

      let lastIdOfProfitHistory = await this.getLastIdOfProfitHistory();
      console.log(lastIdOfProfitHistory);
      return lastIdOfProfitHistory.id;
    } catch (error) {
      throw error;
    }
  }

  async createProfitHistoryAndLinkWithGroup(product_id, count, count_type, profit, group_id) {
    let historyId = await this.createProfitHistory(product_id, count, count_type, profit);

    const insert = `
      INSERT INTO profit_history_group(group_id, history_id) VALUES (?, ?);
    `;

    await this.db.transaction(async (tx) => {
      await tx.executeSql(
        insert,
        [historyId, group_id]
      );
    });

    console.log(historyId + " " + group_id)

    this.getAll();
  }
  
  async getAll() {
    try {
      const query = `
        SELECT * FROM profit_history_group;
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
  
      console.log(rows);
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async getLastIdOfProfitHistory() {
    try {
      const query = `
        SELECT * FROM profit_history ORDER BY ID DESC LIMIT 1;
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

  async getProfitHistoryDetailByGroupId(group_id) {
    try {
      console.log("group_id ", group_id)
      if (group_id === null) {
        console.log('group_id is null. Skipping query.');
        return [];
      }
  
      const query = `
        SELECT ph.* 
        FROM profit_history ph
        JOIN profit_history_group phg ON ph.id = phg.history_id
        WHERE phg.group_id = ?;
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
  
      const rows = result.rows._array;
      console.log('Profit history details retrieved successfully:', rows);
      
      console.log(await this.getAll())

      return rows;
    } catch (error) {
      console.error("Error retrieving profit history details:", error);
      throw error;
    }
  }
}

export default ProfitHistoryRepository;