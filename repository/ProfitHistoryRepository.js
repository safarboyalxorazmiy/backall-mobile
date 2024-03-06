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
          `CREATE TABLE IF NOT EXISTS profit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL, 
            count DOUBLE NOT NULL, 
            count_type TEXT NOT NULL,
            profit DOUBLE NOT NULL, 
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            global_id INTEGER,
            saved boolean
          );`
        );
  
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS profit_group (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_date TIMESTAMP,
            profit DOUBLE,
            global_id INTEGER,
            saved boolean
          );`
        );
  
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS profit_history_group (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            global_id INTEGER,
            history_id INTEGER NOT NULL,
            group_id INTEGER NOT NULL, 
            saved boolean, 
            FOREIGN KEY (group_id) REFERENCES profit_group(id), 
            FOREIGN KEY (history_id) REFERENCES profit_history(id)
          );`
        );
      });
    });
  }

  async createProfitGroup(profit) {
    try {
      const createdDate = new Date().toISOString(); // Example: Get current timestamp
      const query = `
        INSERT INTO profit_group (created_date, profit, global_id, saved)
        VALUES (?, ?, ?, ?);`;

      // Execute the query
      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [createdDate, profit, null, 0]);
      });

      let lastProfitHistoryGroup = await this.getLastProfitHistoryGroupId();
      return lastProfitHistoryGroup.id;
    } catch (error) {
      console.error("Error creating profit group:", error);
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
      const query = `
        INSERT INTO profit_group (created_date, profit, global_id, saved)
        VALUES (?, ?, ?, ?);`;

      // Execute the query
      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [
          created_date.toISOString(), 
          profit, 
          global_id, 
          saved ? 1 : 0
        ]);
      });

      let lastProfitHistoryGroup = await this.getLastProfitHistoryGroupId();
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

  async getLastProfitHistoryGroupIdByDate(fromDate, toDate) {
    try {
        const query = `
            SELECT * FROM profit_group 
            WHERE created_date BETWEEN ? AND ?
            ORDER BY id DESC
            LIMIT 1;
        `;

        const result = await new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(
                    query,
                    [toDate, fromDate],
                    (_, resultSet) => resolve(resultSet),
                    (_, error) => reject(error)
                );
            });
        });

        if (!result || !result.rows || !result.rows.length) {
            console.error("No profit history group found for the specified date range.");
            return null; // Return null or handle the case when no records are found
        }

        const row = result.rows.item(0);

        return row;
    } catch (error) {
        console.error("Error retrieving profit history group:", error);
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
        INSERT INTO profit_history (
          product_id,
          count, 
          count_type, 
          profit, 
          created_date,
          global_id, 
          saved
        )
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
            created_date.toISOString(),
            null, 
            0
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
    saved
  ) {
    let created_date = new Date();
    
    try {
      const insertProfitHistoryQuery = `
        INSERT INTO profit_history (
          product_id, 
          count, 
          count_type, 
          profit, 
          created_date,
          global_id, 
          saved
        )
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
            created_date.toISOString(),
            global_id, 
            saved ? 1 : 0
          ]
        );
      });

      let lastIdOfProfitHistory = await this.getLastIdOfProfitHistory(product_id, created_date.toISOString());
      return lastIdOfProfitHistory.id;
    } catch (error) {
      throw error;
    }
  }

  async createProfitHistoryAndLinkWithGroup(product_id, count, count_type, profit, group_id) {
    let historyId = await this.createProfitHistory(product_id, count, count_type, profit);

    const insert = `
      INSERT INTO profit_history_group(
        history_id, 
        group_id,
        global_id,
        saved
      ) VALUES (?, ?, ?);
    `;

    await this.db.transaction(async (tx) => {
      await tx.executeSql(
        insert,
        [historyId, group_id, null, 0]
      );
    });
  }
  
  async createProfitHistoryGroup(history_id, group_id, global_id, saved) {
    const insert = `
      INSERT INTO profit_history_group(
        history_id, 
        global_id, 
        group_id, 
        saved
      )
      VALUES (?, ?, ?, ?);
    `;

    await this.db.transaction(async (tx) => {
      await tx.executeSql(
        insert,
        [history_id, global_id, group_id, saved ? 1 : 0]
      );
    });
  }

  async getAll(group_id) {
    try {
      const query = `
        SELECT * FROM profit_history_group WHERE group_id = ?;
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
  
      const rows = result.rows._array;
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  // PROFIT GETTING SAVED FALSE:::
  async getProfitHistoryGroupSavedFalse() {
    try {
      const query = `
        SELECT * FROM profit_history_group WHERE saved = 0;
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async getProfitGroupSavedFalse() {
    try {
      const query = `
        SELECT * FROM profit_group WHERE saved = 0;
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async getProfitHistorySavedFalse() {
    try {
      const query = `
        SELECT * FROM profit_history WHERE saved = 0;
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
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
      console.error(`Error updating product: ${error}`);
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
      console.error(`Error updating product: ${error}`);
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
      console.error(`Error updating product: ${error}`);
      throw error; // Re-throw to handle the error in the calling code
    }
  }
  //#############################

  // PROFIT GETTING SAVED FALSE:::
  async getProfitHistoryGroupSavedFalse() {
    try {
      const query = `
        SELECT * FROM profit_history_group WHERE saved = 0;
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async getProfitGroupSavedFalse() {
    try {
      const query = `
        SELECT * FROM profit_group WHERE saved = 0;
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }
  //#############################

  // PROFIT BY ID
  async findProfitHistoryById(id) {
    try {
      const query = `
        SELECT * FROM profit_history WHERE id = ?;
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
        console.error("Unexpected result structure:", result);
        throw new Error("Unexpected result structure");
      }
  
      const rows = result.rows._array;
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  async findProfitGroupById(id) {
    try {
      const query = `
        SELECT * FROM profit_group WHERE id = ?;
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
        console.error("Unexpected result structure:", result);
        throw new Error("Unexpected result structure");
      }
  
      const rows = result.rows._array;
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }
  //#############################


  async getLastIdOfProfitHistory(product_id, created_date) {
    try {
      const query = `
        SELECT * FROM profit_history WHERE product_id = ? AND created_date = ? ORDER BY ID DESC LIMIT 1;
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
        return rows;
    } catch (error) {
        console.error("Error retrieving profit history:", error);
        throw error;
    }
  }

  async getProfitHistoryDetailByGroupId(group_id) {
    try {
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
      console.error("Error retrieving profit history details:", error);
      throw error;
    }
  }

  async getProfitHistoryDetailByGroupIdTop6(groupId, lastId) {
    try {
      if (!groupId) {
        console.log('groupId is null or undefined. Skipping query.');
        return [];
      }

      let result;
      if (lastId === 0) {
        let query = `
          SELECT * 
          FROM profit_history_group
          WHERE group_id = ?
          ORDER BY id
          LIMIT 6;
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
      } else {
        let query = `
          SELECT * 
          FROM profit_history_group
          WHERE group_id = ? AND id > ?
          ORDER BY id
          LIMIT 2;
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
        console.log("No profit history found for groupId:", groupId);
        return [];
      }
  
      const historyGroupLinkedArray = result.rows._array;
  
      let historyInfo = [];
  
      for (const historyGroupLinked of historyGroupLinkedArray) {
        let profitHistoryInfo = await this.getProfitHistoryInfoById(historyGroupLinked.history_id);
        let currentProfitHistoryInfo = profitHistoryInfo[0];
        let product = await this.productRepository.getProductNameAndBrandById(currentProfitHistoryInfo.product_id);
  
        if (!product) {
          continue;
        }
  
        currentProfitHistoryInfo.productName = product.brand_name + " " + product.name;
  
        historyInfo = [...historyInfo, currentProfitHistoryInfo]
      }
  
      return historyInfo;
    } catch (error) {
      console.error("Error retrieving profit history details:", error);
      throw error;
    }
  }
  

  async getLastProfitHistoryDetailByGroupId(groupId) {
    try {
      if (!groupId) {
        console.log('groupId is null or undefined. Skipping query.');
        return [];
      }
  
      const query = `
        SELECT * 
        FROM profit_history_group
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
        console.log('No sell history found for groupId:', groupId);
        return [];
      }
  
      const historyGroupLinkedArray = result.rows._array;
  
      let historyInfo = [];
  
      for (const historyGroupLinked of historyGroupLinkedArray) {
        let profitHistoryInfo = await this.getProfitHistoryInfoById(historyGroupLinked.history_id);
        
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
      return rows;
    } catch (error) {
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }
}

export default ProfitHistoryRepository;