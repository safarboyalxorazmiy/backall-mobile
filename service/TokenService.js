import AsyncStorage from '@react-native-async-storage/async-storage';

class TokenService {
	constructor() {
		
		this.isLoggedIn = false;
	}
	
	storeAccessToken = async (access_token) => {
		try {
			await AsyncStorage.setItem('access_token', access_token);
		} catch (error) {
			console.error('Error storing token:', error);
		}
	};
	
	storeRefreshToken = async (refresh_token) => {
		try {
			await AsyncStorage.setItem('refresh_token', refresh_token);
		} catch (error) {
			console.error('Error storing token:', error);
		}
	};
	
	retrieveAccessToken = async () => {
		try {
			const token = await AsyncStorage.getItem('access_token');
			return token;
		} catch (error) {
			console.error('Error retrieving token:', error);
		}
	};
	
	retrieveRefreshToken = async () => {
		try {
			const token = await AsyncStorage.getItem('refresh_token');
			return token;
		} catch (error) {
			console.error('Error retrieving token:', error);
		}
	};
	
	checkTokens = async () => {
		const access_token = await this.retrieveAccessToken();
		
		console.log(access_token)
		
		if (access_token == null) {
			return false;
		}
		
		this.isLoggedIn = true;
		return true;
	}
	
	clearAsyncStorage = async () => {
		try {
			await AsyncStorage.clear();
			console.log('AsyncStorage cleared successfully!');
		} catch (error) {
			console.error('Error clearing AsyncStorage: ', error);
		}
	};
	
}

export default TokenService;