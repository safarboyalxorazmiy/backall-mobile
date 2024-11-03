import AsyncStorage from "@react-native-async-storage/async-storage";

import TokenService from "./TokenService";
import DatabaseRepository from "../repository/DatabaseRepository";

const serverUrl = "http://api.backall.uz";

class ApiService {
	constructor() {
		this.tokenService = new TokenService();
		this.databaseRepository = new DatabaseRepository();
	}

	async logout(navigation) {
		await this.databaseRepository.clear();
		await AsyncStorage.clear();
		navigation.navigate("Login");
	}

	/**UTIL FUNCTIONS**/
	async getStoreId() {
		return await AsyncStorage.getItem("store_id");
	}

	/* GET */

	async getPayment(email, monthYear) {
		try {
			await AsyncStorage.setItem("isRequestInProgress", "true");
			const accessToken = await this.tokenService.retrieveAccessToken();

			const requestOptions = {
				method: "GET",
			};

			const response =
				await fetch(
					`${serverUrl}/payment/get?email=${email}&monthYear=${monthYear}`,
					requestOptions
				);

			const responseBody = await response.json();

			console.log(response.status);
			if (!response.ok) {
				await AsyncStorage.setItem("isRequestInProgress", "false");
				throw new Error("Network response was not ok");
			}

			await AsyncStorage.setItem("isRequestInProgress", "false");
			return responseBody;
		} catch (error) {
			await AsyncStorage.setItem("isRequestInProgress", "false");
		}
	}

	// GET PRODUCT PAGINATION
	async getLocalProducts(page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/product/get/local/info?storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/product/get/local/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Local fucking product error: ", error)
		}
	}

	async getNotDownloadedLocalProducts(page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const response = await fetch(`${serverUrl}/api/v1/product/get/local/info/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Local fucking product error: ", error)
		}
	}


	async getGlobalProducts(
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/product/get/global/info?storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/product/get/global/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return await response.json(); // Return the parsed JSON directly
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getStoreProducts(
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/product/get/info?storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/product/get/info?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getStoreProductsNotDownloaded(
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const response =
				await fetch(`${serverUrl}/api/v1/store/product/get/info/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);

			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}


	// GET SELL PAGINATION
	async getSellGroups(
		lastId,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/sell/group/get?storeId=${storeId}&page=${page}&size=${size}&lastId=${lastId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);

			console.log(response.status)
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellGroupsByDate(
		lastId,
		fromDate,
		toDate,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/sell/group/get/by?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&page=${page}&size=${size}&lastId=${lastId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellGroupsNotDownloaded(
		lastId,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/sell/group/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellGroupsNotDownloadedByDate(
		lastId,
		fromDate,
		toDate,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/sell/group/get/not/downloaded/by?fromDate=${fromDate}&toDate=${toDate}&lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastSellGroupGlobalId(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}

			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const url = `http://api.backall.uz/api/v1/store/sell/group/get/lastId?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			if (response.status === 404) {
				return -1;
			}

			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.message || response.statusText}`);
			}

			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			console.error("Error occurred:", error);
			throw error;
		}
	}

	async getLastSellGroupGlobalIdByDate(
		fromDate,
		toDate,
		navigation
	) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/sell/group/get/lastId/by?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			// Parse and log the response body
			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getSellGroupByGlobalId(globalId, navigation) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/sell/group/get/by/${globalId}?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			return response.json();
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getSellHistories(lastId, page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/sell/history/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellHistoriesNotDownloaded(
		lastId,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/history/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/sell/history/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastSellHistoryGlobalId(navigation) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/sell/history/get/lastId?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			// Parse and log the response body
			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}


	async getSellHistoriesBySellGroupGlobalId(
		groupId,
		navigation
	) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/sell/history/get/detail/by?groupId=${groupId}&storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			// Parse and log the response body
			return response.json();
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getSellAmountDate(
		lastId,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/amount/date/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/sell/amount/date/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellAmountDateNotDownloaded(lastId, page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/amount/date/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/sell/amount/date/get/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastSellAmountDateGlobalId(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}

			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const url = `http://api.backall.uz/api/v1/store/sell/amount/date/get/lastId?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			if (response.status === 404) {
				return -1;
			}

			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			console.error("Error occurred:", error);
			throw error;
		}
	}

	async getSellAmountByDate(date, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/amount/date/get/by?date=${date}&storeId=${storeId}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/sell/amount/date/get/by?date=${date}&storeId=${storeId}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellHistoryGroup(lastId, page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/link/info?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/sell/link/info?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getSellHistoryGroupNotDownloaded(lastId, page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/link/info/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response =
				await fetch(`${serverUrl}/api/v1/store/sell/link/info/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastSellHistoryGroupGlobalId(navigation) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/sell/link/get/lastId?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getSellHistoryLinkInfoByGroupId(
		groupId, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/link/info/by?groupId=${groupId}&storeId=${storeId}`);
			//("Request body:", requestOptions);

			const response = await fetch(
				`${serverUrl}/api/v1/store/sell/link/info/by?groupId=${groupId}&storeId=${storeId}`,
				requestOptions
			);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}


	// GET PROFIT PAGINATION
	async getProfitGroups(lastId, page, size, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/group/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/group/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return await response.json(); // Return the parsed JSON directly
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitGroupsByDate(
		lastId,
		fromDate,
		toDate,
		page,
		size,
		navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			const url = `${serverUrl}/api/v1/store/profit/group/get/by?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&page=${page}&size=${size}&lastId=${lastId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error(`Network response was not ok: ${responseBody.message || response.statusText}`);
			}

			return responseBody;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitGroupsNotDownloaded(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};


			const response =
				await fetch(
					`${serverUrl}/api/v1/store/profit/group/get/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`,
					requestOptions
				);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return await response.json(); // Return the parsed JSON directly
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastProfitGroupGlobalId(navigation) {
		try {
			const accessToken =
				await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId);
			} else {
				storeId = BigInt(storeId);
			}

			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const url = `http://api.backall.uz/api/v1/store/profit/group/lastId?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			if (response.status === 404) {
				return -1;
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			//("Error occurred: ", error);
			throw error;
		}
	}

	async getProfitGroupByGlobalId(globalId, navigation) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/profit/group/get/by/${globalId}?storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			return response.json;
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getProfitHistories(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/history/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/history/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitHistoriesNotDownloaded(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/history/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/history/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastProfitHistoryId(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			// Updated URL to match the new API endpoint
			const url = `${serverUrl}/api/v1/store/profit/history/lastId?storeId=${storeId}`;

			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Read the response body as text
			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			//("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitHistoriesByProfitGroupGlobalId(
		groupId,
		navigation
	) {
		try {
			// Retrieve the access token and store ID
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			// Define request options
			const requestOptions = {
				method: "GET",
				headers: {
					"accept": "*/*",
					"Authorization": `Bearer ${accessToken}`
				}
			};

			// Construct the request URL
			const url = `http://api.backall.uz/api/v1/store/profit/history/get/detail/by?groupId=${groupId}&storeId=${storeId}`;
			//("Sending request to:", url);
			//("Request options:", requestOptions);

			// Send the request
			const response = await fetch(url, requestOptions);


			// Handle 401 Unauthorized response
			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			// Check if the response is not OK
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}

			return response.json();
		} catch (error) {
			console.error("Error occurred:", error);
			throw error; // Re-throw the error for handling in the calling code
		}
	}

	async getProfitHistoryGroup(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/link/info?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/link/info?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitHistoryLinkInfoByGroupId(
		groupId, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/link/info/by?groupId=${groupId}&storeId=${storeId}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/link/info/by?groupId=${groupId}&storeId=${storeId}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitHistoryGroupNotDownloaded(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/link/info/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/link/info/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastProfitHistoryGroupId(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			// Updated URL to match the new API endpoint
			const url = `${serverUrl}/api/v1/store/profit/link/get/lastId?storeId=${storeId}`;

			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);


			if (response.status === 401) {
				//(`Bearer ${accessToken}`, `${serverUrl}/api/v1/store/profit/link/get/lastId?storeId=${storeId}`)
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.text();

			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody); // Convert to a Number if it's safe
			} else {
				return BigInt(responseBody); // Convert to a BigInt if the number is large
			}
		} catch (error) {
			//("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitAmountDate(
		lastId, page, size, navigation
	) {
		try {
			const accessToken =
				await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			for (const string of await AsyncStorage.getAllKeys()) {
				console.log(string);
			}

			console.log("getProfitAmountDate() storeId::", storeId);

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/amount/date/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/amount/date/get?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getProfitAmountDateNotDownloaded(
		lastId, page, size, navigation
	) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/amount/date/get/not/downloaded?lastId=${lastId}&storeId=${storeId}&page=${page}&size=${size}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/amount/date/get/not/downloaded?storeId=${storeId}&page=${page}&size=${size}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json(); // Read JSON response only once


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody; // Return the JSON response
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	async getLastProfitAmountDateId(navigation) {
		try {
			const accessToken =
				await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`,
					"Accept": "*/*"
				}
			};

			// Updated URL to match the new API endpoint
			const url = `${serverUrl}/api/v1/store/profit/amount/date/lastId?storeId=${storeId}`;

			//("Sending request to:", url);
			//("Request options:", requestOptions);

			const response = await fetch(url, requestOptions);
			const responseBody = await response.text();

			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}

			if (response.status === 404) {
				return -1;
			}

			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody); // Convert to a Number if it's safe
			} else {
				return BigInt(responseBody); // Convert to a BigInt if the number is large
			}
		} catch (error) {
			//("Error occurred:", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}


	// Function to handle common request logic
	async sendRequest(url, requestOptions) {
		try {
			const response = await fetch(url, requestOptions);

			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await AsyncStorage.setItem("authError", "true");
				return false;
			}

			const responseBody = await response.json();

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error;
		}
	}

	// Function to create local product
	async createLocalProduct(serialNumber, name, brandName) {
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}

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

		//("Sending request to:", `${serverUrl}/api/v1/product/create`);
		//("Request body:", requestOptions);

		return await this.sendRequest(
			`${serverUrl}/api/v1/product/create`, requestOptions
		);
	}

	// Function to create store products
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
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		//("Sending request to:", `${serverUrl}/api/v1/store/product/create`);
		//("Request body:", requestOptions);

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/product/create`,
			requestOptions
		);
	}

	// ***SELL CREATION***
	// Function to create sell group
	async createSellGroup(createdDate, amount, navigation) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		//("Sending request to:", `${serverUrl}/api/v1/store/sell/group/create`);
		//("Request body:", requestOptions);

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/sell/group/create`,
			requestOptions
		);
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
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/sell/history/create`,
			requestOptions
		);
	}

	// Function to create sell history group
	async createSellHistoryGroup(
		sellHistoryId, sellGroupId, navigation
	) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/sell/link/create`,
			requestOptions
		);
	}


	async createSellAmountDate(
		date, amount
	) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/sell/amount/date/create`,
			requestOptions
		);
	}


	// ***PROFIT CREATION***
	// Function to create profit group
	async createProfitGroup(createdDate, profit) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		//("Sending request to:", `${serverUrl}/api/v1/store/profit/group/create`);
		//("Request body:", requestOptions);

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/profit/group/create`, requestOptions
		);
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
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/profit/history/create`, requestOptions
		);
	}

	// Function to create profit history group
	async createProfitHistoryGroup(
		profitHistoryId, profitGroupId
	) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/profit/link/create`, requestOptions
		);
	}

	async createProfitAmountDate(
		date, amount
	) {
		const accessToken = await this.tokenService.retrieveAccessToken();
		let storeId = await this.getStoreId();

		if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			storeId = Number(storeId); // Convert to a Number if it's safe
		} else {
			storeId = BigInt(storeId); // Convert to a BigInt if the number is large
		}


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

		return await this.sendRequest(
			`${serverUrl}/api/v1/store/profit/amount/date/create`, requestOptions
		);
	}

	async getProfitAmountByDate(date, navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			let storeId = await this.getStoreId();

			if (BigInt(storeId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				storeId = Number(storeId); // Convert to a Number if it's safe
			} else {
				storeId = BigInt(storeId); // Convert to a BigInt if the number is large
			}


			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/profit/amount/date/get/by?date=${date}&storeId=${storeId}`);
			//("Request body:", requestOptions);

			const response = await fetch(`${serverUrl}/api/v1/store/profit/amount/date/get/by?date=${date}&storeId=${storeId}`, requestOptions);


			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await this.logout(navigation);
				return;
			}

			const responseBody = await response.json();


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}

	// AUTH
	async check(email, password) {
		await AsyncStorage.setItem("isRequestInProgress", "true");

		//(serverUrl + "/api/v1/auth/check")
		try {
			const response = await fetch(serverUrl + "/api/v1/auth/check?email=" + email + "&password=" + password, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			});

			// Check if the response is ok
			if (response.ok) {
				const data = await response.json();
				// Convert the text to boolean
				const result = data;

				await AsyncStorage.setItem("isRequestInProgress", "false");
				return result; // Return the boolean value
			} else {
				// Handle non-successful responses
				console.error("Request failed with status:", response.status);

				await AsyncStorage.setItem("isRequestInProgress", "false");
				return false; // Return false indicating failure
			}
		} catch (error) {
			// Handle fetch errors
			console.error("Error:", error);

			await AsyncStorage.setItem("isRequestInProgress", "false");
			return false; // Return false indicating failure
		}
	}

	async checkEmail(email) {
		await AsyncStorage.setItem("isRequestInProgress", "true");

		//(serverUrl + "/api/v1/auth/check?email=" + email)
		try {
			const response = await fetch(serverUrl + "/api/v1/auth/check?email=" + email, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				const result = data;

				await AsyncStorage.setItem("isRequestInProgress", "false");
				return result;
			} else {
				console.error("Request failed with status:", response.status);

				await AsyncStorage.setItem("isRequestInProgress", "false");
				return false;
			}
		} catch (error) {
			console.error("Error:", error);

			await AsyncStorage.setItem("isRequestInProgress", "false");
			return false;
		}
	}

	async login(email, password, pinCode) {
		await AsyncStorage.setItem("isRequestInProgress", "true");

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

				await AsyncStorage.setItem("isRequestInProgress", "false")
				return response.json();
			} else {
				// Handle non-successful responses
				console.error("Request failed with status:", response.status);

				await AsyncStorage.setItem("isRequestInProgress", "false")
				return false; // Return false indicating failure
			}
		} catch (error) {
			// Handle fetch errors
			console.error("Error:", error);

			await AsyncStorage.setItem("isRequestInProgress", "false");
			return false; // Return false indicating failure
		}
	}

	async register(idempotencyKey, firstName, lastName, storeName, phone, email, password, pinCode) {
		await AsyncStorage.setItem("isRequestInProgress", "true");

		try {
			const response = await fetch(serverUrl + "/api/v1/auth/register", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"Idempotency-Key": idempotencyKey
				},
				body: JSON.stringify({
					firstname: firstName,
					lastname: lastName,
					storeName: storeName,
					phone: phone,
					email: email,
					password: password,
					pinCode: pinCode
				}),
			});

			if (response.ok) {
				await AsyncStorage.setItem("isRequestInProgress", "false")
				return response.json();
			} else {
				console.error("Request failed with status:", response.status);

				await AsyncStorage.setItem("isRequestInProgress", "false")
				return false;
			}
		} catch (error) {
			console.error("Error:", error);

			await AsyncStorage.setItem("isRequestInProgress", "false");
			return false;
		}
	}


	async getSellMonthAmount(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			const storeId = BigInt(await this.getStoreId());

			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			//("Sending request to:", `${serverUrl}/api/v1/store/sell/month/amount?storeId=${storeId}`);
			//("Request body:", requestOptions);

			const response = await fetch(
				`${serverUrl}/api/v1/store/profit/month/amount?storeId=${storeId}`,
				requestOptions
			);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Parse and log the response body
			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			//("Error occurred: ", error);
			throw error; // Re-throwing the error for handling in the calling code
		}
	}


	async getProfitMonthAmount(navigation) {
		try {
			const accessToken = await this.tokenService.retrieveAccessToken();
			const storeId = BigInt(await this.getStoreId());

			const requestOptions = {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${accessToken}`
				}
			};

			const response = await fetch(
				`${serverUrl}/api/v1/store/profit/month/amount?storeId=${storeId}`,
				requestOptions
			);


			if (response.status === 401) {
				await this.logout(navigation);
				return;
			}


			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const responseBody = await response.text();


			if (BigInt(responseBody) <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(responseBody);
			} else {
				return BigInt(responseBody);
			}
		} catch (error) {
			throw error;
		}
	}

	async makePaymentRequest(number, expire) {
		const accessToken = await this.tokenService.retrieveAccessToken();

		const requestBody = {
			number: number,
			expire: expire
		};

		const requestOptions = {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(requestBody)
		};

		try {
			const response = await fetch(`${serverUrl}/payment/make`, requestOptions);

			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await AsyncStorage.setItem("authError", "true");
				return false;
			}

			let responseBody = await response.json();

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			throw error;
		}
	}

	async verifyPaymentRequest(token, code) {
		const accessToken = await this.tokenService.retrieveAccessToken();

		const requestBody = {
			token: token,
			code: code
		};

		const requestOptions = {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(requestBody)
		};

		try {
			const response = await fetch(`${serverUrl}/payment/verify`, requestOptions);

			if (response.status == 401) {
				console.log("unauthorized::" + response.url);
				await AsyncStorage.setItem("authError", "true");
				throw new Error("authError");
			}

			const responseBody = await response.json();

			console.log(responseBody);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return responseBody;
		} catch (error) {
			throw error;
		}
	}
}

export default ApiService;