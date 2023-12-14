import React, {useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	Dimensions,
	TouchableOpacity,
	ScrollView,
	Platform,
} from 'react-native';

import Logo from '../assets/logo.svg';
import TokenService from '../services/TokenService';
import DatabaseService from '../services/DatabaseService';
import ApiService from "../services/ApiService";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const databaseService = new DatabaseService();
const tokenService = new TokenService();
const apiService = new ApiService();

const LoginForm = ({onSubmit}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	
	return (
		<View style={styles.form}>
			<Text style={styles.label}>Loginni kiriting</Text>
			<TextInput
				style={styles.input}
				placeholder="admin"
				placeholderTextColor="black"
				value={email}
				onChangeText={(text) => setEmail(text)}
			/>
			
			<Text style={styles.label}>Parolni kiriting</Text>
			<TextInput
				style={styles.input}
				placeholder="********"
				placeholderTextColor="black"
				secureTextEntry
				value={password}
				onChangeText={(text) => setPassword(text)}
			/>
			
			<TouchableOpacity onPress={() => onSubmit(email, password)}>
				<View style={styles.button}>
					<Text style={styles.buttonText}>Kirish</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

const ForgotPasswordLink = ({onPress}) => (
	<TouchableOpacity onPress={onPress} style={{marginTop: 168}}>
		<View style={styles.forgotPasswordLink}>
			<Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
		</View>
	</TouchableOpacity>
);

const Login = ({navigation}) => {
	let accessToken = "";
	const [loading, setLoading] = useState(false);
	
	const login = async (email, password) => {
		try {
			setLoading(true);
			
			let result;
			result.access_token = null;
			result.refresh_token = null;
			
			result = await apiService.login(email, password);
			
			navigation.navigate("Home");
			
			if (
				result.access_token != null &&
				result.refresh_token != null
			) {
				await tokenService.storeAccessToken(result.access_token);
				await tokenService.storeRefreshToken(result.refresh_token);
			}
			
			accessToken = await tokenService.retrieveAccessToken();
			console.log(accessToken);
			console.log(await tokenService.retrieveRefreshToken());
			
			await getProducts();
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const getProducts = async () => {
		fetch("http://backall.uz/api/v1/product/get/all", {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + accessToken
			}
		})
			.then(response => response.json())
			.then(result => {
				databaseService.createProducts(result);
			})
			.catch(error => console.log('error', error));
	};
	
	return (
		<ScrollView contentContainerStyle={styles.container}>
			{Platform.OS === 'android' || Platform.OS === 'ios' ? (
				<Logo style={styles.logo} resizeMode="cover"/>
			) : (
				<Logo style={styles.logo}/>
			)}
			
			<LoginForm onSubmit={login}/>
			
			<ForgotPasswordLink onPress={() => navigation.navigate('Home')}/>
			
			<StatusBar style="auto"/>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		paddingTop: 104,
		height: screenHeight
	},
	
	logo: {
		display: "block",
		width: 220.313,
		height: 96.563,
		marginBottom: 83
	},
	
	label: {
		fontSize: 16,
		fontWeight: '500',
		fontFamily: 'Gilroy-Medium',
		marginBottom: 4
	},
	
	input: {
		height: 64,
		width: screenWidth - (24 + 24),
		borderWidth: 1,
		borderRadius: 10,
		paddingVertical: 23,
		paddingHorizontal: 20,
		fontSize: 18,
		marginBottom: 16,
		fontFamily: 'Gilroy-Regular',
	},
	
	button: {
		width: screenWidth - (24 + 24),
		backgroundColor: '#222',
		color: 'white',
		paddingVertical: 14,
		borderRadius: 10,
	},
	
	buttonText: {
		color: 'white',
		textAlign: 'center',
		fontSize: 20,
		textTransform: 'capitalize',
		fontWeight: '500',
		fontFamily: 'Gilroy-Medium'
	},
});

export default Login;