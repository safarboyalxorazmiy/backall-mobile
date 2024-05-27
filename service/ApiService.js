import AsyncStorage from "@react-native-async-storage/async-storage";
import TokenService from "./TokenService";

const serverUrl = "http://api.backall.uz";
class ApiService {
	constructor() {
    this.tokenService = new TokenService();
  }

  /**UTIL FUNCTIONS**/ 
  async getStoreId() {
    return await AsyncStorage.getItem("store_id");
  }

  /* GET */

  async getPayment(email, monthYear) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();

        const requestOptions = {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/payment/get?email=${email}&monthYear=${monthYear}`);
        console.log('Request body:', requestOptions);

        const response = 
          await fetch(
            `${serverUrl}/payment/get?email=${email}&monthYear=${monthYear}`, 
            requestOptions
          );

        console.log('Response status:', response.status);
        const responseBody = await response.json();
        console.log('Response body:', responseBody);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody;
    } catch (error) {
      console.log("Local fucking product error: ", error)
    }
}

    // GET PRODUCT PAGINATION
  async getLocalProducts(page, size) {
      try {
          const accessToken = await this.tokenService.retrieveAccessToken();
          const storeId = parseInt(await this.getStoreId());

          const requestOptions = {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          };

          console.log('Sending request to:', `${serverUrl}/api/v1/product/get/local/info?storeId=${storeId}&page=${page}&size=${size}`);
          console.log('Request body:', requestOptions);

          const response = await fetch(`${serverUrl}/api/v1/product/get/local/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

          console.log('Response status:', response.status);
          const responseBody = await response.json();
          console.log('Response body:', responseBody);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          return responseBody;
      } catch (error) {
          console.log("Local fucking product error: ", error)
      }
  }

  async getNotDownloadedLocalProducts(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
        };

        const response = await fetch(`${serverUrl}/api/v1/product/get/local/info/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        const responseBody = await response.json();

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody;
    } catch (error) {
        console.log("Local fucking product error: ", error)
    }
  }
  

  async getGlobalProducts(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/product/get/global/info?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/product/get/global/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json(); // Return the parsed JSON directly
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }

  async getStoreProducts(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/store/product/get/info?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/store/product/get/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);
        const responseBody = await response.json();
        console.log('Response body:', responseBody);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody;
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }

  async getStoreProductsNotDownloaded(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
        };

        const response = await fetch(`${serverUrl}/api/v1/store/product/get/info/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);
        const responseBody = await response.json();

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        return responseBody;
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }



  // GET SELL PAGINATION 
  async getSellGroups(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/store/sell/group/get?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/store/sell/group/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);
        const responseBody = await response.json();
        console.log('Response body:', responseBody);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody;
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }

  async getSellHistories(page, size) {
      try {
          const accessToken = await this.tokenService.retrieveAccessToken();
          const storeId = parseInt(await this.getStoreId());

          const requestOptions = {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          };

          console.log('Sending request to:', `${serverUrl}/api/v1/store/sell/history/get?storeId=${storeId}&page=${page}&size=${size}`);
          console.log('Request body:', requestOptions);

          const response = await fetch(`${serverUrl}/api/v1/store/sell/history/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

          console.log('Response status:', response.status);
          const responseBody = await response.json();
          console.log('Response body:', responseBody);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          return responseBody;
      } catch (error) {
          console.log("Error occurred: ", error);
          throw error; // Re-throwing the error for handling in the calling code
      }
  }

  async getSellAmountDate(page, size) {
      try {
          const accessToken = await this.tokenService.retrieveAccessToken();
          const storeId = parseInt(await this.getStoreId());

          const requestOptions = {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          };

          console.log('Sending request to:', `${serverUrl}/api/v1/store/sell/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`);
          console.log('Request body:', requestOptions);

          const response = await fetch(`${serverUrl}/api/v1/store/sell/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

          console.log('Response status:', response.status);
          const responseBody = await response.json();
          console.log('Response body:', responseBody);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          return responseBody;
      } catch (error) {
          console.log("Error occurred: ", error);
          throw error; // Re-throwing the error for handling in the calling code
      }
  }

  async getSellHistoryGroup(page, size) {
      try {
          const accessToken = await this.tokenService.retrieveAccessToken();
          const storeId = parseInt(await this.getStoreId());

          const requestOptions = {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          };

          console.log('Sending request to:', `${serverUrl}/api/v1/store/sell/link/info?storeId=${storeId}&page=${page}&size=${size}`);
          console.log('Request body:', requestOptions);

          const response = await fetch(`${serverUrl}/api/v1/store/sell/link/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

          console.log('Response status:', response.status);
          const responseBody = await response.json();
          console.log('Response body:', responseBody);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          return responseBody;
      } catch (error) {
          console.log("Error occurred: ", error);
          throw error; // Re-throwing the error for handling in the calling code
      }
  }


  // GET PROFIT PAGINATION
  async getProfitGroups(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/store/profit/group/get?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/store/profit/group/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json(); // Return the parsed JSON directly
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }


  async getProfitHistories(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/store/profit/history/get?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/store/profit/history/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);
        const responseBody = await response.json(); // Read JSON response only once
        console.log('Response body:', responseBody);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody; // Return the JSON response
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }

  async getProfitHistoryGroup(page, size) {
      try {
          const accessToken = await this.tokenService.retrieveAccessToken();
          const storeId = parseInt(await this.getStoreId());

          const requestOptions = {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          };

          console.log('Sending request to:', `${serverUrl}/api/v1/store/profit/link/info?storeId=${storeId}&page=${page}&size=${size}`);
          console.log('Request body:', requestOptions);

          const response = await fetch(`${serverUrl}/api/v1/store/profit/link/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

          console.log('Response status:', response.status);
          const responseBody = await response.json(); // Read JSON response only once
          console.log('Response body:', responseBody);

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          return responseBody; // Return the JSON response
      } catch (error) {
          console.log("Error occurred: ", error);
          throw error; // Re-throwing the error for handling in the calling code
      }
  }

  async getProfitAmountDate(page, size) {
    try {
        const accessToken = await this.tokenService.retrieveAccessToken();
        const storeId = parseInt(await this.getStoreId());

        const requestOptions = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        console.log('Sending request to:', `${serverUrl}/api/v1/store/profit/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`);
        console.log('Request body:', requestOptions);

        const response = await fetch(`${serverUrl}/api/v1/store/profit/amount/date/get?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

        console.log('Response status:', response.status);
        const responseBody = await response.json(); // Read JSON response only once
        console.log('Response body:', responseBody);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return responseBody; // Return the JSON response
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error; // Re-throwing the error for handling in the calling code
    }
  }

  // Function to handle common request logic
  async sendRequest(url, requestOptions) {
    try {
        const response = await fetch(url, requestOptions);
        console.log('Response status:', response.status);
        const responseBody = await response.json();
        console.log('Response body:', responseBody);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return responseBody;
    } catch (error) {
        console.log("Error occurred: ", error);
        throw error;
    }
  }

  // Function to create local product
  async createLocalProduct(serialNumber, name, brandName) {
    const storeId = parseInt(await this.getStoreId());
    const accessToken = await this.tokenService.retrieveAccessToken();

    const requestBody = {
        serialNumber: serialNumber,
        name: name,
        brandName: brandName,
        type: "LOCAL",
        storeId: storeId
    };

    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    console.log('Sending request to:', `${serverUrl}/api/v1/product/create`);
    console.log('Request body:', requestOptions);

    return await this.sendRequest(`${serverUrl}/api/v1/product/create`, requestOptions);
  }

  // Function to create store products
  async createStoreProducts(productId, nds, price, sellingPrice, percentage, count, countType) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestBody = {
        storeId: storeId,
        productId: productId,
        nds: nds,
        price: price,
        sellingPrice: sellingPrice,
        percentage: percentage,
        count: count,
        countType: countType
    };

    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    console.log('Sending request to:', `${serverUrl}/api/v1/store/product/create`);
    console.log('Request body:', requestOptions);

    return await this.sendRequest(`${serverUrl}/api/v1/store/product/create`, requestOptions);
  }

  // ***SELL CREATION***
  // Function to create sell group
  async createSellGroup(createdDate, amount) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestBody = {
        createdDate: createdDate,
        storeId: storeId,
        amount: amount
    };

    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    console.log('Sending request to:', `${serverUrl}/api/v1/store/sell/group/create`);
    console.log('Request body:', requestOptions);

    return await this.sendRequest(`${serverUrl}/api/v1/store/sell/group/create`, requestOptions);
  }

  // Function to create sell history
  async createSellHistory(
    productId,
    count,
    countType,
    sellingPrice,
    createdDate
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());
  
    const requestOptions = {
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
    }
  
    return await this.sendRequest(`${serverUrl}/api/v1/store/sell/history/create`, requestOptions);
  }

  // Function to create sell history group
  async createSellHistoryGroup(
    sellHistoryId, sellGroupId
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestOptions = {
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
    };
  
    return await this.sendRequest(`${serverUrl}/api/v1/store/sell/link/create`, requestOptions);
  }

  
  async createSellAmountDate(
    date, amount
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestOptions = {
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
    };

    return await this.sendRequest(`${serverUrl}/api/v1/store/sell/amount/date/create`, requestOptions);
  }


  // ***PROFIT CREATION***
  // Function to create profit group
  async createProfitGroup(createdDate, profit) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestBody = {
        createdDate: createdDate,
        storeId: storeId,
        profit: profit
    };

    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    console.log('Sending request to:', `${serverUrl}/api/v1/store/profit/group/create`);
    console.log('Request body:', requestOptions);

    return await this.sendRequest(`${serverUrl}/api/v1/store/profit/group/create`, requestOptions);
  }

  // Function to create profit history
  async createProfitHistory(
    productId,
    count,
    countType,
    profit,
    createdDate
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestOptions = {
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
    }

    return await this.sendRequest(`${serverUrl}/api/v1/store/profit/history/create`, requestOptions);
  }

  // Function to create profit history group
  async createProfitHistoryGroup(
    profitHistoryId, profitGroupId
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestOptions = {
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
    };
  
    return await this.sendRequest(`${serverUrl}/api/v1/store/profit/link/create`, requestOptions);
  }

  async createProfitAmountDate(
    date, amount
  ) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = parseInt(await this.getStoreId());

    const requestBody = {
      date: date,
      amount: amount,
      storeId: storeId
    };

    const requestOptions = {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    };

    return await this.sendRequest(`${serverUrl}/api/v1/store/profit/amount/date/create`, requestOptions);
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