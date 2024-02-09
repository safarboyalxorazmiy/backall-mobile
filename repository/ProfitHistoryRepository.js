import DatabaseRepository from "./DatabaseRepository";
import ProductRepository from "./ProductRepository";

class ProfitHistoryRepository {
  constructor() {
    this.db = new DatabaseRepository().getDatabase();
    this.productRepository = new ProductRepository();
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
      console.log(await this.getAll());

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
        [group_id, historyId]
      );
    });

    console.log("History Id: " + historyId + " Group Id: " + group_id)
  }
  
  async getAll() {
    try {
      const query = `
        SELECT * FROM profit_group;
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

  async getLastOfProfitHistoryByDate(fromDate, toDate) {
    try {
        const query = `
            SELECT * FROM profit_history 
            WHERE created_date BETWEEN ? AND ?
            ORDER BY id DESC
            LIMIT 1;
        `;

        const result = await new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(
                    query,
                    [toDate, fromDate], // Corrected the order of fromDate and toDate
                    (_, resultSet) => resolve(resultSet),
                    (_, error) => reject(error)
                );
            });
        });

        if (!result || !result.rows || !result.rows._array || result.rows._array.length === 0) {
            console.log("No profit history found for the specified date range.");
            return null; // Return null or handle the case when no records are found
        }

        const row = result.rows._array[0];

        return row;
    } catch (error) {
        console.error("Error retrieving profit history:", error);
        throw error;
    }
}



  async getTop10ProfitGroupByStartId(startId) {
    try {
      const query = `
        SELECT * FROM profit_group where id <= ${startId} ORDER BY id DESC limit 10;
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

  async getTop10ProfitGroupByStartIdAndDate(startId, fromDate, toDate) {
    console.log(await this.getAll())
    try {
        const query = `
            SELECT * FROM profit_group 
            WHERE id <= ? AND created_date BETWEEN ? AND ?
            ORDER BY id DESC
            LIMIT 10;
        `;

        const result = await new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(
                    query,
                    [startId, toDate, fromDate],
                    (_, resultSet) => resolve(resultSet),
                    (_, error) => reject(error)
                );
            });
        });

        if (!result || !result.rows || !result.rows._array) {
            throw new Error("Unexpected result structure");
        }

        const rows = result.rows._array;

        console.log(result)
        return rows;
    } catch (error) {
        console.error("Error retrieving profit history:", error);
        throw error;
    }
  }


  async getProfitHistoryDetailByGroupId(group_id) {
    try {
      console.log("group_id ", group_id);
      if (group_id === null) {
        console.log('group_id is null. Skipping query.');
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
  
      console.log("res: ", result.rows._array);
      const historyGroupLinkedArray = result.rows._array;
  
      let historyInfo = [];
  
      for (const historyGroupLinked of historyGroupLinkedArray) {
        let profitHistoryInfo = await this.getProfitHistoryInfoById(historyGroupLinked.history_id);
        console.log("PROFIT HISTORY INFO INSIDE OF FOR EACH ", profitHistoryInfo[0]);
        let currentProfitHistoryInfo = profitHistoryInfo[0];
        let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);

        currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;

        historyInfo = [...historyInfo, currentProfitHistoryInfo];
        console.log("PROFIT ARRAY: ", historyInfo);
      }
  
      console.log("HISTORY INFO: ", historyInfo);
      return historyInfo;
    } catch (error) {
      console.error("Error retrieving profit history details:", error);
      throw error;
    }
  }
  

  // TODO =>

  // GURUHNI MA'LUMOTLARINI ID ORQALI OLISH.
  async getProfitGroupInfoById (group_id) {
    try {
      const query = `
        SELECT * FROM profit_group WHERE id = ?;
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
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  // PROFIT HISTORY MA'LUMOTLARINI ID ORQALI OLISH.
  async getProfitHistoryInfoById (history_id) {
    try {
      const query = `
        SELECT * FROM profit_history WHERE id = ?;
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
  
      console.log(result)
      console.log(rows);
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }
}

export default ProfitHistoryRepository;