import DatabaseRepository from "./DatabaseRepository";
import ProductRepository from "./ProductRepository";

class SellHistoryRepository {
  constructor() {
    this.db = new DatabaseRepository().getDatabase();

    this.productRepository = new ProductRepository();
  }

  async createSellHistoryGroup(amount) {
    try {
      const query = `
        INSERT INTO sell_group (created_date, amount)
        VALUES (CURRENT_DATE, ?);
      `;

      // Execute the query
      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [amount]);
      });

      console.log("Sell group created successfully.");

      console.log(this.getAll());

      let lastSellHistoryGroup = await this.getLastSellHistoryGroupId();
      console.log(lastSellHistoryGroup);
      console.log(lastSellHistoryGroup.id);
      console.log("&&&&&&&&&&&&&&");
      return lastSellHistoryGroup.id;
    } catch (error) {
      console.error("Error creating sell group:", error);
      throw error;
    }
  }

  async getLastSellHistoryGroupId() {
    try {
      const query = `
        SELECT * FROM sell_group ORDER BY ID DESC LIMIT 1;
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

  async getLastSellHistoryGroupByDate(fromDate, toDate) {
    try {
        const query = `
            SELECT * FROM sell_group 
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

        if (!result || !result.rows || !result.rows._array || result.rows._array.length === 0) {
            console.error("No sell history found for the specified date range.");
            return null; // Return null or handle the case when no records are found
        }

        const row = result.rows._array[0];

        return row;
    } catch (error) {
        console.error("Error retrieving sell history:", error);
        throw error;
    }
  }

  async createSellHistory(
    product_id, 
    count, 
    count_type, 
    selling_price
  ) {
    try {
      let created_date = new Date();

      const query = `
        INSERT INTO sell_history (
          product_id, 
          count, 
          count_type, 
          selling_price, 
          created_date
        )
        VALUES (?, ?, ?, ?, ?);
      `;

      await this.db.transaction(async (tx) => {
        await tx.executeSql(query, [
            product_id, 
            count, 
            count_type, 
            selling_price,
            created_date.toISOString()
          ]);
      });

      // TODO BIRLASHTIRISH
      
      console.log('Sell group created successfully.');
      console.log("=================");
      console.log(await this.getAll());
      console.log("=================");

      let lastIdOfSellHistory = await this.getLastIdOfSellHistory(product_id, created_date.toISOString());
      console.log(lastIdOfSellHistory);
      return lastIdOfSellHistory.id;
    } catch (error) {
      console.error("Error creating sell group:", error);
      throw error;
    }
  }

  async createSellHistoryAndLinkWithGroup(
    product_id, 
    count, 
    count_type, 
    selling_price, 
    group_id
  ) {
    let historyId = await this.createSellHistory(
      product_id, 
      count, 
      count_type, 
      selling_price
    );

    const insert = `
      INSERT INTO sell_history_group(
        group_id, 
        history_id
      ) 
      VALUES (?, ?);
    `;

    await this.db.transaction(async (tx) => {
      await tx.executeSql(
        insert,
        [group_id, historyId]
      );
    });

    console.log("SELL HISTORY LINKED");
    console.log("History Id: " + historyId + " Group Id: " + group_id);
  }

  async getLastIdOfSellHistory(product_id, created_date) {
    try {
      const query = `
        SELECT * FROM sell_history where product_id = ? AND created_date = ? ORDER BY ID DESC LIMIT 1;
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

  async getAll() {
    try {
      const query = `
        SELECT * FROM sell_history_group;
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

  async getAllSellGroup(lastHistoryId) {
    try {
      const query = `
        SELECT * FROM sell_group where id <= ${lastHistoryId} ORDER BY id DESC limit 10;
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

  async getTop10SellGroupByDate(lastHistoryId, fromDate, toDate) {
    try {
        const query = `
            SELECT * FROM sell_group 
            WHERE id <= ? AND created_date BETWEEN ? AND ?
            ORDER BY id DESC
            LIMIT 10;
        `;

        const result = await new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(
                    query,
                    [lastHistoryId, fromDate, toDate],
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
        console.error("Error retrieving sell history:", error);
        throw error;
    }
  }

  // {peoduct_name, count, count_type}
  async getSellHistoryDetailByGroupIdTop6(groupId, lastId) {
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
        query = `
          SELECT * 
          FROM sell_history_group
          WHERE group_id = ? and id > ?
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
        console.log('No sell history found for groupId:', groupId);
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
        SELECT * FROM sell_history WHERE id = ?;
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
      console.error("Error retrieving sell history:", error);
      throw error;
    }
  }

  // GURUHNI MA'LUMOTLARINI ID ORQALI OLISH.
  async getSellGroupInfoById (group_id) {
    try {
      const query = `
        SELECT * FROM sell_group WHERE id = ?;
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


}

export default SellHistoryRepository;