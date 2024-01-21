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
              (product_id, nds, price, selling_price, percentage, count, count_type) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, nds, price, sellingPrice, percentage, count, countType],
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

  async getStoreProductsInfo() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT sp.id, p.brand_name, p.name, sp.count, sp.count_type
           FROM store_product sp
           JOIN product p ON sp.product_id = p.id`,
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

  async searchProductsInfo(query) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT sp.id, p.brand_name, p.name, sp.count, sp.count_type
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