import DatabaseRepository from "./DatabaseRepository";

class StoreProductRepository {
  constructor() {
    this.db = new DatabaseRepository().getDatabase();
  }

  async create(product_id, nds, price, sellingPrice, percentage, count, countType) {
    try {
      await new Promise((resolve, reject) => {
        this.db.transaction((tx) => {
          tx.executeSql(
            `INSERT INTO store_product 
              (product_id, nds, price, selling_price, percentage, count, count_type, global_id, saved) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_id, nds, price, sellingPrice, percentage, count, countType, null, 0],
            (_, results) => {
              resolve(true);
            },
            (_, error) => {
              console.error("Error creating store product:", error);
              reject(false);
            }
          );
        });
      });
    } catch (error) {
      console.error(`Error creating store product: ${error}`);
      throw error;
    }
  }

  async createStoreProductWithAllValues(
    product_id, 
    nds, 
    price, 
    sellingPrice, 
    percentage, 
    count, 
    countType,
    global_id,
    saved
  ) {
    try {
      await new Promise((resolve, reject) => {
        this.db.transaction((tx) => {
          tx.executeSql(
            `INSERT INTO store_product (
              product_id, 
              nds, 
              price, 
              selling_price, 
              percentage, 
              count, 
              count_type, 
              global_id, 
              saved
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product_id, 
              nds, 
              price, 
              sellingPrice, 
              percentage, 
              count, 
              countType, 
              global_id, 
              saved ? 1 : 0
            ],
            (_, results) => {
              resolve(true);
            },
            (_, error) => {
              console.error("Error creating store product:", error);
              reject(false);
            }
          );
        });
      });
    } catch (error) {
      console.error(`Error creating store product: ${error}`);
      throw error;
    }
  }

  async updateCount(productId, count) {
    try {
      await new Promise((resolve, reject) => {
        this.db.transaction((tx) => {
          tx.executeSql(
            `SELECT count FROM store_product WHERE product_id = ?`,
            [productId],
            (_, results) => {
                if (results.rows.length > 0) {
                    let currentCount = results.rows.item(0).count;
                    let newCount = currentCount - count;
                    if (newCount <= 0) {
                        // If new count is zero or negative, delete the product
                        tx.executeSql(
                            `DELETE FROM store_product WHERE product_id = ?`,
                            [productId],
                            (_, results) => {
                                resolve(true);
                            },
                            (_, error) => {
                                console.error("Error deleting store product:", error);
                          reject(false);
                        }
                      );
                    } else {
                        // Otherwise, update the count
                        tx.executeSql(
                            `UPDATE store_product SET count = ? WHERE product_id = ?`,
                            [newCount, productId],
                            (_, results) => {
                                resolve(true);
                            },
                            (_, error) => {
                                console.error("Error updating store product count:", error);
                                reject(false);
                            }
                        );
                    }
                } else {
                    console.error("Product not found in the store");
                    reject(false);
                }
            },
            (_, error) => {
                console.error("Error fetching store product count:", error);
                reject(false);
            }
          );
        });
      });
    } catch (error) {
      console.error(`Error updating store product count: ${error}`);
      throw error;
    }
  }

  async getStoreProductsInfo() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT 
            sp.id, 
            p.brand_name, 
            p.name, 
            p.product_id,
            sp.count, 
            sp.count_type, 
            sp.selling_price,
            sp.price

           FROM store_product sp
           JOIN product p ON sp.product_id = p.id;`,
          [],
          (_, { rows }) => {
            const storeProductsInfo = rows._array; // Get raw result array
            resolve(storeProductsInfo);
          },
          (_, error) => {
            console.error("Error retrieving store products info:", error);
            reject(error);
          }
        );
      });
    });
  }

  async findByWhereSavedFalse() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM store_product sp WHERE sp.saved = 0;`,
          [],
          (_, { rows }) => {
            const storeProductsInfo = rows._array; // Get raw result array
            resolve(storeProductsInfo);
          },
          (_, error) => {
            console.error("Error retrieving store products info:", error);
            reject(error);
          }
        );
      });
    });
  }

  async findTopStoreProductsInfo(lastId) {
    if (lastId === 0) {
      return new Promise((resolve, reject) => {
        this.db.transaction((tx) => {
            tx.executeSql(
                `SELECT sp.id, p.brand_name, p.name, sp.count, sp.count_type
                FROM store_product sp
                JOIN product p ON sp.product_id = p.id
                WHERE sp.id > ?
                ORDER BY sp.id
                LIMIT 13;`,
                [lastId],
                (_, { rows }) => {
                    const storeProductsInfo = rows._array; // Get raw result array
                    resolve(storeProductsInfo);
                },
                (_, error) => {
                    console.error("Error retrieving store products info:", error);
                    reject(error);
                }
            );
        });
      });
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
          tx.executeSql(
              `SELECT sp.id, p.brand_name, p.name, sp.count, sp.count_type
              FROM store_product sp
              JOIN product p ON sp.product_id = p.id
              WHERE sp.id > ?
              ORDER BY sp.id
              LIMIT 1;`,
              [lastId],
              (_, { rows }) => {
                  const storeProductsInfo = rows._array; // Get raw result array
                  resolve(storeProductsInfo);
              },
              (_, error) => {
                  console.error("Error retrieving store products info:", error);
                  reject(error);
              }
          );
      });
    });
  }

  async searchProductsInfo(query) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT 
            sp.id, 
            sp.count, 
            sp.count_type, 
            sp.selling_price,
            sp.price,
            p.brand_name, 
            p.name, 
            sp.product_id,
            sp.nds,
            sp.percentage
          FROM store_product sp
          JOIN product p ON sp.product_id = p.id
          WHERE p.brand_name LIKE ? OR p.name LIKE ?;`,
          [query, query], // Pass the query parameter twice for brand_name and name
          (_, { rows }) => {
            const storeProductsInfo = rows._array; // Get raw result array
            resolve(storeProductsInfo);
          },
          (_, error) => {
            console.error("Error retrieving store products info:", error);
            reject(error);
          }
        );
      });
    });
  }  

  async getProductInfoBySerialNumber(serial_number) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT sp.id, p.serial_number, p.brand_name, p.name, sp.count, sp.count_type, sp.price, sp.selling_price, sp.nds, sp.percentage, p.id as product_id
          FROM store_product sp
          JOIN product p ON sp.product_id = p.id
          WHERE p.serial_number = ?;`,
          [serial_number],
          (_, { rows }) => {
            const storeProductsInfo = rows._array; // Get raw result
            resolve(storeProductsInfo);
          },
          (_, error) => {
            console.error("Error retrieving store products info:", error);
            reject(error);
          }
        );
      });
    });
  } 
}

export default StoreProductRepository;