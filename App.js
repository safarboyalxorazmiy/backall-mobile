import React, {Component} from 'react';
import {Text} from 'react-native';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {Platform} from 'react-native';
import * as Font from 'expo-font';
import DatabaseService from './services/DatabaseService';
import NetInfo from "@react-native-community/netinfo";
import NavigationService from './services/NavigationService';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TokenService from './services/TokenService';

const tokenService = new TokenService();

AppRegistry.registerComponent(appName, () => App);

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fontsLoaded: false,
			isConnected: null
		};
		
		const {navigation} = this.props;
		tokenService.checkTokens(navigation);
	}
	
	async loadCustomFonts() {
		try {
			await Font.loadAsync({
				'Gilroy-Light': require('./assets/fonts/gilroy/Gilroy-Light.ttf'),
				'Gilroy-Regular': require('./assets/fonts/gilroy/Gilroy-Regular.ttf'),
				'Gilroy-Medium': require('./assets/fonts/gilroy/Gilroy-Medium.ttf'),
				'Gilroy-SemiBold': require('./assets/fonts/gilroy/Gilroy-SemiBold.ttf'),
				'Gilroy-Bold': require('./assets/fonts/gilroy/Gilroy-Bold.ttf'),
				'Gilroy-Black': require('./assets/fonts/gilroy/Gilroy-Black.ttf')
			});
			
			this.setState({fontsLoaded: true})
		} catch (error) {
			console.error('Error loading custom fonts:', error);
		}
	}
	
	async componentDidMount() {
		await this.loadCustomFonts();
		
		if (Platform.OS == 'android' || Platform.OS == 'ios') {
			const dbService = new DatabaseService();
			try {
				await dbService.init();
				console.log("Database initialized successfully");
			} catch (error) {
				console.error("Error initializing database:", error);
			}
			
			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});
			
			this.logInternetStatusInterval = setInterval(() => {
				console.log("Is connected?", this.state.isConnected === null ? 'Loading...' : this.state.isConnected ? 'Yes' : 'No');
			}, 5000);
		}
	}
	
	componentWillUnmount() {
		this.unsubscribe();
		clearInterval(this.logInternetStatusInterval);
	}
	
	render() {
		
		if (!this.state.fontsLoaded) {
			return (
				<>
					<Text>Loading</Text>
				</>
			)
			return null;
		}
		
		return (
			<GestureHandlerRootView style={{flex: 1}}>
				<NavigationService/>
			</GestureHandlerRootView>
		);
	}
}

export default App;