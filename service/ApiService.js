class ApiService {
	constructor() {}
	
	async login(email, password) {
		const response = await fetch('http://backall.uz/api/v1/auth/authenticate', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		});

		return await response.json();
	}
}

export default ApiService;