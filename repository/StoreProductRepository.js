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
              console.log("Store product created successfully:", results);
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
            console.log("Store products info retrieved successfully:", storeProductsInfo);
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