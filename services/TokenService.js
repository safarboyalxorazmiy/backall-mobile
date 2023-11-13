import AsyncStorage from '@react-native-async-storage/async-storage';

class TokenService {
    // To store a token
    storeToken = async (token) => {
        try {
            await AsyncStorage.setItem('token', token);
        } catch (error) {
            console.error('Error storing token:', error);
        }
    };

    // To retrieve a token
    retrieveToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            return token;
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
    };
}

export default TokenService;