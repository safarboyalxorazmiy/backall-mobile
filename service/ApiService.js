const serverUrl = "http://192.168.0.102:8080";

class ApiService {
	constructor() {}
	
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