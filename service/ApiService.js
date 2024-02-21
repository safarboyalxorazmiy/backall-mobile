const serverUrl = "http://192.168.0.100:8080";

class ApiService {
	constructor() {}
	
	async login(email, password) {
		const response = 
			await fetch(serverUrl + "/api/v1/auth/authenticate", {
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

		return await response.json();
	}

	async getProducts(accessToken) {
		try {
			const response = await fetch(serverUrl + "/api/v1/product/get/all", {
				method: "GET",
				headers: {
					"Authorization": "Bearer " + accessToken
				}
			});
			return await response.json();
		} catch (error) {
			console.log('error', error);
		}
	}
}

export default ApiService;