import AsyncStorage from "@react-native-async-storage/async-storage";
import TokenService from "./TokenService";

const serverUrl = "http://192.168.0.105:8080";
class ApiService {
	constructor() {
    this.tokenService = new TokenService();
  }

  async getStoreId() {
    return await AsyncStorage.getItem("store_id");
  }
	
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

  async getLocalProducts(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = 1;

    console.log({
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })
  
    if (!storeId) {
      return new Error('Invalid storeId');
    }
  
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
    const storeId = 1;
  
    if (!storeId) {
      return new Error('Invalid storeId');
    }
  
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

  async getSellGroups(page, size) {
    const accessToken = await this.tokenService.retrieveAccessToken();
    const storeId = 1;
  
    if (!storeId) {
      return new Error('Invalid storeId');
    }
  
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
    const storeId = 1;
  
    if (!storeId) {
      return new Error('Invalid storeId');
    }
  
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
}

export default ApiService;