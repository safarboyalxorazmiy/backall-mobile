import React, {Component} from "react";
import {Text} from "react-native";
import {AppRegistry} from "react-native";
import {name as appName} from "./app.json";
import {Platform} from "react-native";
import * as Font from "expo-font";
import NetInfo from "@react-native-community/netinfo";
import NavigationService from "./service/NavigationService";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import TokenService from "./service/TokenService";
import DatabaseRepository from "./repository/DatabaseRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductRepository from "./repository/ProductRepository";
import ApiService from "./service/ApiService";

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

		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();
	}
	
	async loadCustomFonts() {
		try {
			await Font.loadAsync({
				"Gilroy-Light": require("./assets/fonts/gilroy/Gilroy-Light.ttf"),
				"Gilroy-Regular": require("./assets/fonts/gilroy/Gilroy-Regular.ttf"),
				"Gilroy-Medium": require("./assets/fonts/gilroy/Gilroy-Medium.ttf"),
				"Gilroy-SemiBold": require("./assets/fonts/gilroy/Gilroy-SemiBold.ttf"),
				"Gilroy-Bold": require("./assets/fonts/gilroy/Gilroy-Bold.ttf"),
				"Gilroy-Black": require("./assets/fonts/gilroy/Gilroy-Black.ttf")
			});
			
			this.setState({fontsLoaded: true})
		} catch (error) {
			console.error("Error loading custom fonts:", error);
		}
	}
	
	async componentDidMount() {
		await this.loadCustomFonts();
		
		if (Platform.OS == "android" || Platform.OS == "ios") {
			const databaseRepository = new DatabaseRepository();
			try {
				await databaseRepository.init();
				console.log("Database initialized successfully");
			} catch (error) {
				console.error("Error initializing database:", error);
			}
			
			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});
			
			this.logInternetStatusInterval = setInterval(async () => {
				console.log(
					"Is connected?", 
					this.state.isConnected === null ? "Loading..." : 
					this.state.isConnected ? "Yes" : "No"
				);

				if (this.state.isConnected) {
					// internet exist do something
					// 

					let isNotSaved = await AsyncStorage.getItem("isNotSaved");
					if (isNotSaved == true) {
						// PRODUCT
						let productNotSaved = await AsyncStorage.getItem("productNotSaved");
						if (productNotSaved == "true") {
							let notSavedProducts = 
								await productRepository.findProductsBySavedFalse();
							for (const product of notSavedProducts) {
								try {
									let response = await this.apiService.createLocalProduct(
										product.serial_number, 
										product.name, 
										product.brand_name
									);
	
									await this.productRepository.updateSavedTrueByProductId(product.id, response.id);

								} catch (e) {
									continue;
								}
							}

							await AsyncStorage.setItem("productNotSaved", "false")
						}

						// SELL
						let sellGroupNotSaved = await AsyncStorage.getItem("sellGroupNotSaved");
						if (sellGroupNotSaved == "true") {

						}

						let sellHistoryNotSaved = await AsyncStorage.getItem("sellHistoryNotSaved");
						if (sellHistoryNotSaved == "true") {

						}

						let sellHistoryGroupNotSaved = await AsyncStorage.getItem("sellHistoryGroupNotSaved");
						if (sellHistoryGroupNotSaved == "true") {

						}

						// PROFIT
						let profitGroupNotSaved = await AsyncStorage.getItem("profitGroupNotSaved");
						if (profitGroupNotSaved == "true") {

						}

						let profitHistoryNotSaved = await AsyncStorage.getItem("profitHistoryNotSaved");
						if (profitHistoryNotSaved == "true") {

						}

						let profitHistoryGroupNotSaved = await AsyncStorage.getItem("profitHistoryGroupNotSaved");
						if (profitHistoryGroupNotSaved == "true") {
							
						}
					}
				}
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