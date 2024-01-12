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
            `INSERT INTO store_products 
              (product_id, nds, price, sellingPrice, percentage, count, countType) 
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
}

export default StoreProductRepository;