import AsyncStorage from "@react-native-async-storage/async-storage";
import TokenService from "./TokenService";

const serverUrl = "http://backall.uz";
class ApiService {
	constructor() {
    this.tokenService = new TokenService();
  }

  /**UTIL FUNCTIONS**/ 
  async getStoreId() {
    return await AsyncStorage.getItem("store_id");
  }

  /* GET */

  // GET PRODUCT PAGINATION
  async getLocalProducts(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    const url = `${serverUrl}/api/v1/product/get/local/info?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async getGlobalProducts(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const url = `${serverUrl}/api/v1/product/get/global/info?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async getStoreProducts(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());
  
    const url = `${serverUrl}/api/v1/store/product/get/info?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  // GET SELL PAGINATION 
  async getSellGroups(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/sell/group/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }
  
  async getSellHistories(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/sell/history/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async getSellAmountDate(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/sell/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  // GET PROFIT PAGINATION
  async getProfitGroups(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/group/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }
  
  async getProfitHistories(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/history/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async getProfitHistoryGroup(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/link/info?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async getProfitAmountDate(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  /* POST */

  // PRODUCTS
  async createLocalProduct(
    serialNumber, 
    name,
    brandName
  ) {
    const storeId = parseInt(await this.getStoreId());

    const accessToken = await this.tokenService.retrieveAccessToken();

    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    console.log(
      "Store id", parseInt(await this.getStoreId())
    )
  
    const url = `${serverUrl}/api/v1/product/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serialNumber: serialNumber,
        name: name,
        brandName: brandName,
        type: "LOCAL",
        storeId: storeId
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createStoreProducts(
    productId,
    nds,
    price,
    sellingPrice,
    percentage,
    count,
    countType
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();

    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    const storeId = parseInt(await this.getStoreId());
  
    console.log(
      JSON.stringify({
        storeId: storeId,
        productId: productId,
        nds: nds,
        price: price,
        sellingPrice: sellingPrice,
        percentage: percentage,
        count: count,
        countType: countType
      })
    )

    const url = `${serverUrl}/api/v1/store/product/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        storeId: storeId,
        productId: productId,
        nds: nds,
        price: price,
        sellingPrice: sellingPrice,
        percentage: percentage,
        count: count,
        countType: countType
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  // CREATE SELL
  async createSellGroup(
    createdDate,
    amount
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();

    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    const storeId = parseInt(await this.getStoreId());
  
    const url = `${serverUrl}/api/v1/store/sell/group/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        createdDate: createdDate,
        storeId: storeId,
        amount: amount
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createSellHistory(
    productId,
    count,
    countType,
    sellingPrice,
    createdDate
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());
  
    const url = `${serverUrl}/api/v1/store/sell/history/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: productId,
        storeId: storeId,
        count: count,
        countType: countType,
        sellingPrice: sellingPrice,
        createdDate: createdDate
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createSellHistoryGroup(
    sellHistoryId, sellGroupId
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    const storeId = parseInt(await this.getStoreId());
  
    const url = `${serverUrl}/api/v1/store/sell/link/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sellHistoryId: sellHistoryId,
        sellGroupId: sellGroupId,
        storeId: storeId
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createSellAmountDate(
    date, amount
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/sell/amount/date/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: date,
        amount: amount,
        storeId: storeId
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  // CREATE PROFIT
  async createProfitGroup(
    createdDate,
    profit
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/group/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        createdDate: createdDate,
        storeId: storeId,
        profit: profit
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createProfitHistory(
    productId,
    count,
    countType,
    profit,
    createdDate
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/history/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: productId,
        storeId: storeId,
        count: count,
        countType: countType,
        profit: profit,
        createdDate: createdDate
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createProfitHistoryGroup(
    profitHistoryId, profitGroupId
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    const storeId = parseInt(await this.getStoreId());

    const url = `${serverUrl}/api/v1/store/profit/link/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profitHistoryId: profitHistoryId,
        profitGroupId: profitGroupId,
        storeId: storeId
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  async createSellAmountDate(
    date, amount
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
        const storeId = parseInt(await this.getStoreId());

  
    const url = `${serverUrl}/api/v1/store/profit/amount/date/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: date,
        amount: amount,
        storeId: storeId
      })
    });
  
    if (!response.ok) {
      return new Error('Network response was not ok');
    }
  
    return response.json();
  }

  // AUTH
  async check(email, password) {
    console.log(
      JSON.stringify({
        email: email,
        password: password,
      })
    )
    try {
        const response = await fetch(serverUrl + "/api/v1/auth/check", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        // Check if the response is ok
        if (response.ok) {
            const data = await response.json();
            // Convert the text to boolean
            const result = data;
            return result; // Return the boolean value
        } else {
            // Handle non-successful responses
            console.error('Request failed with status:', response.status);
            return false; // Return false indicating failure
        }
    } catch (error) {
      // Handle fetch errors
      console.error('Error:', error);
      return false; // Return false indicating failure
    }
  }

  async login(email, password, pinCode) {
    try {
        const response = await fetch(serverUrl + "/api/v1/auth/authenticate", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
                pinCode: pinCode
            }),
        });

        // Check if the response is ok
        if (response.ok) {
            // Return the parsed JSON response directly
            return response.json();
        } else {
            // Handle non-successful responses
            console.error('Request failed with status:', response.status);
            return false; // Return false indicating failure
        }
    } catch (error) {
        // Handle fetch errors
        console.error('Error:', error);
        return false; // Return false indicating failure
    }
  }

}

export default ApiService;