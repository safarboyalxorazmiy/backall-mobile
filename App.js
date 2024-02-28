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
import StoreProductRepository from "./repository/StoreProductRepository";
import SellHistoryRepository from "./repository/SellHistoryRepository";

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
		this.storeProductRepository = new StoreProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
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

						let storeProductNotSaved = await Async.getItem("storeProductNotSaved");
						if (storeProductNotSaved == "true") {
							let storeProducts = await this.storeProductRepository.findByWhereSavedFalse();
							for (const storeProduct of storeProducts) {
								try {
									let products = await this.productRepository.findProductsById(storeProduct.product_id);

									await this.apiService.createStoreProducts(
										products[0].id,
										storeProduct.nds,
										storeProduct.price,
										storeProduct.selling_price,
										storeProduct.percentage,
										storeProduct.count,
										storeProduct.count_type
									);
								} catch (e) {
									continue;
								}
							}
						}

						// SELL
						let sellGroupNotSaved = await AsyncStorage.getItem("sellGroupNotSaved");
						if (sellGroupNotSaved == "true") {
							let sellGroups = await this.sellHistoryRepository.getSellGroupSavedFalse();
							for (const sellGroup of sellGroups) {
								try {
									await this.apiService.createSellGroup(sellGroup.created_date, sellGroup.amount);
								} catch (e) {
									continue;
								}
							}
						}

						let sellHistoryNotSaved = await AsyncStorage.getItem("sellHistoryNotSaved");
						if (sellHistoryNotSaved == "true") {
							let sellHistories = await this.sellHistoryRepository.getSellHistorySavedFalse();
							for (const sellHistory of sellHistories) {
								try {
									let products = await this.productRepository.findProductsById(sellHistory.product_id);

									await this.apiService.createSellHistory(
										products[0].id,
										sellHistory.count,
										sellHistory.count_type,
										sellHistory.selling_price,
										sellHistory.created_date
									);
								} catch (e) {
									continue;
								}
							}
						}

						let sellHistoryGroupNotSaved = await AsyncStorage.getItem("sellHistoryGroupNotSaved");
						if (sellHistoryGroupNotSaved == "true") {
							let sellHistoryGroups = 
								await this.sellHistoryRepository.getSellHistorySavedFalse();
							for (const sellHistoryGroup of sellHistoryGroups) {
								try {
									let sellHistory = await this.sellHistoryRepository.findSellHistoryById(
										sellHistoryGroup.history_id
									);
									let sellGroup = await this.sellHistoryRepository.findSellGroupById(
										sellHistoryGroup.group_id
									);
									
									await this.apiService.createSellHistoryGroup(
										sellHistory[0].global_id,
										sellGroup[0].global_id
									);
								} catch (e) {
									continue;
								}
							}
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