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
import ProfitHistoryRepository from "./repository/ProfitHistoryRepository";
import AmountDateRepository from "./repository/AmountDateRepository";

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
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
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
			
			// this.logInternetStatusInterval = setInterval(async () => {
			// 	console.log(
			// 		"Is connected?", 
			// 		this.state.isConnected === null ? "Loading..." : 
			// 		this.state.isConnected ? "Yes" : "No"
			// 	);

			// 	if (this.state.isConnected) {
			// 		// internet exist do something
			// 		// 

			// 		let isNotSaved = await AsyncStorage.getItem("isNotSaved");
			// 		if (isNotSaved == true) {
						
			// 			// PRODUCT
			// 			let productNotSaved = await AsyncStorage.getItem("productNotSaved");
			// 			if (productNotSaved == "true") {
			// 				let notSavedProducts = 
			// 					await productRepository.findProductsBySavedFalse();
			// 				for (const product of notSavedProducts) {
			// 					try {
			// 						let response = await this.apiService.createLocalProduct(
			// 							product.serial_number, 
			// 							product.name, 
			// 							product.brand_name
			// 						);
	
			// 						await this.productRepository.updateSavedTrueByProductId(product.id, response.id);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}

			// 				await AsyncStorage.setItem("productNotSaved", "false")
			// 			}

			// 			let storeProductNotSaved = await Async.getItem("storeProductNotSaved");
			// 			if (storeProductNotSaved == "true") {
			// 				let storeProducts = await this.storeProductRepository.findByWhereSavedFalse();
			// 				for (const storeProduct of storeProducts) {
			// 					try {
			// 						let products = await this.productRepository.findProductsById(storeProduct.product_id);

			// 						let response = await this.apiService.createStoreProducts(
			// 							products[0].id,
			// 							storeProduct.nds,
			// 							storeProduct.price,
			// 							storeProduct.selling_price,
			// 							storeProduct.percentage,
			// 							storeProduct.count,
			// 							storeProduct.count_type
			// 						);

			// 						await this.storeProductRepository.updateSavedTrueById(storeProduct.id, response.id);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			// SELL
			// 			let sellGroupNotSaved = await AsyncStorage.getItem("sellGroupNotSaved");
			// 			if (sellGroupNotSaved == "true") {
			// 				let sellGroups = await this.sellHistoryRepository.getSellGroupSavedFalse();
			// 				for (const sellGroup of sellGroups) {
			// 					try {
			// 						let response = await this.apiService.createSellGroup(
			// 							sellGroup.created_date, 
			// 							sellGroup.amount
			// 						);

			// 						await this.sellHistoryRepository.updateSellGroupSavedTrueById(
			// 							sellGroup.id, 
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let sellHistoryNotSaved = await AsyncStorage.getItem("sellHistoryNotSaved");
			// 			if (sellHistoryNotSaved == "true") {
			// 				let sellHistories = await this.sellHistoryRepository.getSellHistorySavedFalse();
			// 				for (const sellHistory of sellHistories) {
			// 					try {
			// 						let products = await this.productRepository.findProductsById(sellHistory.product_id);

			// 						let response = await this.apiService.createSellHistory(
			// 							products[0].id,
			// 							sellHistory.count,
			// 							sellHistory.count_type,
			// 							sellHistory.selling_price,
			// 							sellHistory.created_date
			// 						);

			// 						await this.sellHistoryRepository.updateSellHistoryGroupSavedTrueById(
			// 							sellHistory.id, 
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let sellHistoryGroupNotSaved = await AsyncStorage.getItem("sellHistoryGroupNotSaved");
			// 			if (sellHistoryGroupNotSaved == "true") {
			// 				let sellHistoryGroups = 
			// 					await this.sellHistoryRepository.getSellHistorySavedFalse();
			// 				for (const sellHistoryGroup of sellHistoryGroups) {
			// 					try {
			// 						let sellHistory = await this.sellHistoryRepository.findSellHistoryById(
			// 							sellHistoryGroup.history_id
			// 						);
			// 						let sellGroup = await this.sellHistoryRepository.findSellGroupById(
			// 							sellHistoryGroup.group_id
			// 						);
									
			// 						let response = await this.apiService.createSellHistoryGroup(
			// 							sellHistory[0].global_id,
			// 							sellGroup[0].global_id
			// 						);

			// 						this.sellHistoryRepository.updateSellHistoryGroupSavedTrueById(
			// 							sellHistoryGroup.id,
			// 							response.id
			// 						)
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let sellAmountDateNotSaved = await Async.getItem("sellAmountDateNotSaved");
			// 			if (sellAmountDateNotSaved == "true") {
			// 				let notSavedSellAmountDates = 
			// 					await this.amountDateRepository.getSellAmountDateSavedFalse();
			// 				for (const sellAmountDate of notSavedSellAmountDates) {
			// 					try {
									
			// 						let response = 
			// 							await this.apiService.createSellAmountDate(
			// 								sellAmountDate.date,
			// 								sellAmountDate.amount
			// 							);

			// 						this.amountDateRepository.updateSellAmountDateSavedTrueById(
			// 							sellAmountDate.id,
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			// PROFIT
			// 			let profitGroupNotSaved = await AsyncStorage.getItem("profitGroupNotSaved");
			// 			if (profitGroupNotSaved == "true") {
			// 				let profitGroups = await this.profitHistoryRepository.getProfitGroupSavedFalse();
			// 				for (const profitGroup of profitGroups) {
			// 					try {
			// 						let response = await this.apiService.createProfitGroup(
			// 							profitGroup.created_date, 
			// 							profitGroup.profit
			// 						);

			// 						await this.profitHistoryRepository.updateProfitGroupSavedTrueById(
			// 							profitGroup.id, 
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let profitHistoryNotSaved = await AsyncStorage.getItem("profitHistoryNotSaved");
			// 			if (profitHistoryNotSaved == "true") {
			// 				let profitHistories = await this.profitHistoryRepository.getProfitHistorySavedFalse();
			// 				for (const profitHistory of profitHistories) {
			// 					try {
			// 						let products = await this.productRepository.findProductsById(
			// 							profitHistory.product_id
			// 						);

			// 						let response = await this.apiService.createProfitHistory(
			// 							products[0].id,
			// 							profitHistory.count,
			// 							profitHistory.count_type,
			// 							profitHistory.profit,
			// 							profitHistory.created_date
			// 						);

			// 						await this.profitHistoryRepository.updateProfitHistoryGroupSavedTrueById(
			// 							profitHistory.id, 
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let profitHistoryGroupNotSaved = await AsyncStorage.getItem("profitHistoryGroupNotSaved");
			// 			if (profitHistoryGroupNotSaved == "true") {
			// 				let profitHistoryGroups = 
			// 					await this.profitHistoryRepository.getProfitHistorySavedFalse();
			// 				for (const profitHistoryGroup of profitHistoryGroups) {
			// 					try {
			// 						let profitHistory = 
			// 							await this.profitHistoryRepository.findProfitHistoryById(
			// 								profitHistoryGroup.history_id
			// 							);

			// 						let profitGroup = 
			// 							await this.profitHistoryRepository.findProfitGroupById(
			// 								profitHistoryGroup.group_id
			// 							);

			// 						let response = 
			// 							await this.apiService.createProfitHistoryGroup(
			// 								profitHistory[0].global_id,
			// 								profitGroup[0].global_id
			// 							);

			// 						this.profitHistoryRepository.updateProfitHistoryGroupSavedTrueById(
			// 							profitHistoryGroup.id,
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			let profitAmountDateNotSaved = await Async.getItem("profitAmountDateNotSaved");
			// 			if (profitAmountDateNotSaved == "true") {
			// 				let notSavedProfitAmountDates = 
			// 					await this.amountDateRepository.getProfitAmountDateSavedFalse();
			// 				for (const profitAmountDate of notSavedProfitAmountDates) {
			// 					try {
									
			// 						let response = 
			// 							await this.apiService.createSellAmountDate(
			// 								profitAmountDate.date,
			// 								profitAmountDate.amount
			// 							);

			// 						this.amountDateRepository.updateProfitAmountDateSavedTrueById(
			// 							profitAmountDate.id,
			// 							response.id
			// 						);
			// 					} catch (e) {
			// 						console.error(e)
			// 						continue;
			// 					}
			// 				}
			// 			}

			// 			await AsyncStorage.setItem("isNotSaved", "false")
			// 		}
			// 	}
			// }, 5000);
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