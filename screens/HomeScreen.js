import React, {Component, createRef} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Platform,
	SafeAreaView
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Spinner from "react-native-loading-spinner-overlay";
import NetInfo from "@react-native-community/netinfo";
import * as Animatable from "react-native-animatable";

import SellHistoryRepository from "../repository/SellHistoryRepository";
import ProfitHistoryRepository from "../repository/ProfitHistoryRepository";
import StoreProductRepository from "../repository/StoreProductRepository";
import DatabaseRepository from "../repository/DatabaseRepository";
import ProductRepository from "../repository/ProductRepository";
import AmountDateRepository from "../repository/AmountDateRepository";
import ApiService from "../service/ApiService";
import TokenService from "../service/TokenService";

import MenuIcon from "../assets/menu-icon 2.svg";
import LogoutIcon from "../assets/logout-icon.svg";
import CrossIcon from "../assets/cross-icon.svg";
import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";
import ActionSheet from 'react-native-actions-sheet';
import { Feather } from "@expo/vector-icons";
import { TouchableRipple } from 'react-native-paper';
import PaymentForm from "./payment/PaymentForm";

import {ApplicationProvider} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			shoppingCardColors: ["#D7FF01", "#D7FF01"],
			profitCardColors: ["#272822", "#272822"],
			profitAmount: 0,
			sellAmount: 0,
			notAllowed: "",
			spinner: false,
			isConnected: null,
			isLoading: false,
			isDownloaded: "false",

			// PRODUCT
			lastLocalProductsPage: 0,
			lastLocalProductsSize: 10,
			lastGlobalProductsPage: 0,
			lastGlobalProductsSize: 10,
			lastStoreProductsPage: 0,
			lastStoreProductsSize: 10,

			// SELL
			lastSellGroupsPage: 0,
			lastSellGroupsSize: 10,
			lastSellHistoriesPage: 0,
			lastSellHistoriesSize: 10,
			lastSellHistoryGroupPage: 0,
			lastSellHistoryGroupSize: 10,
			lastSellAmountDatePage: 0,
			lastSellAmountDateSize: 10,

			// PROFIT
			lastProfitGroupsPage: 0,
			lastProfitGroupsSize: 10,
			lastProfitHistoriesPage: 0,
			lastProfitHistoriesSize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,

			menuFocused: false,
			crossFocused: false,
			menuOpened: false,
			notPayed: false,
			paymentModalVisible: false,
			intervalStarted: false
		}

		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.storeProductRepository = new StoreProductRepository();
		this.databaseRepository = new DatabaseRepository();
		this.tokenService = new TokenService();
		this.menu = new createRef();
	}

	async componentDidMount() {
		console.log("Component mounted");
		const {navigation} = this.props;

		await this.amountDateRepository.init();
		await this.getAmountInfo();


		let notPayed = await AsyncStorage.getItem("notPayed")
		if (notPayed == "true") {
			this.setState({notPayed: true})
		} else {
			this.setState({notPayed: false})
		}
		

		// this.setState({spinner: true});

		console.log("spinner::",this.state.spinner);
		console.log("notPayed::", this.state.notPayed);

		// let isDownloaded = await AsyncStorage.getItem("isDownloaded");
		// if (isDownloaded !== "true" || isDownloaded == null) {
		// 	await this.initializeScreen();

		// 	this.setState({spinner: true});

		// 	const {navigation} = this.props;

		// 	let isLoggedIn = await this.tokenService.checkTokens();
		// 	if (!isLoggedIn) {
		// 		this.setState({spinner: false});
		// 		navigation.navigate("Login");
		// 	}

		// 	await this.storeProductRepository.init();
		// 	await this.sellHistoryRepository.init();
		// 	await this.profitHistoryRepository.init();
		// 	await this.amountDateRepository.init();

		// 	if (isLoggedIn) {
		// 		console.log("isDownloaded??", isDownloaded);
		// 		if (isDownloaded !== "true" || isDownloaded == null) {
		// 			// LOAD..
		// 			console.log("ABOUT TO LOAD...");

		// 			console.log("Initial isConnected:", this.state.isConnected);

		// 			// Check if setInterval callback is reached
		// 			console.log("Setting up setInterval...");

		// 			if (!this.state.isConnected) {
		// 				this.setState({spinner: false});
		// 				navigation.navigate("Login");
		// 				return;
		// 			}

		// 			try {
		// 				// Has internet connection
		// 				await this.loadProducts();

		// 			} catch (error) {
		// 				console.error("Error loading products:", error);
		// 			} finally {
		// 				this.setState({spinner: false});
		// 			}
		// 		}

		// 		await this.getAmountInfo();

		// 		let notAllowed = await AsyncStorage.getItem("not_allowed");
		// 		this.setState({notAllowed: notAllowed});
		// 	}
		// }

		this.unsubscribe = NetInfo.addEventListener((state) => {
			this.setState({isConnected: state.isConnected});
		});

		navigation.addListener("focus", async () => {
			console.log("HOME NAVIGATED");
			// Login check and download data for the first time**
			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});

			if (this.unsubscribe) {
				this.unsubscribe();
			}

			let isDownloaded = await AsyncStorage.getItem("isDownloaded");
			console.log("isDownloaded::", isDownloaded);
			if (isDownloaded !== "true" || isDownloaded == null) {
				await this.initializeScreen();
				this.setState({spinner: true});

				const {navigation} = this.props;

				let isLoggedIn = await this.tokenService.checkTokens();
				if (!isLoggedIn) {
					this.setState({spinner: false});
					navigation.navigate("Login");
				}

				await this.storeProductRepository.init();
				await this.sellHistoryRepository.init();
				await this.profitHistoryRepository.init();
				await this.amountDateRepository.init();

				if (isLoggedIn) {
					console.log("isDownloaded??", isDownloaded);
					if (isDownloaded !== "true" || isDownloaded == null) {
						// LOAD..
						console.log("ABOUT TO LOAD...");

						console.log("Initial isConnected:", this.state.isConnected);

						// Check if setInterval callback is reached
						console.log("Setting up setInterval...");

						if (!this.state.isConnected) {
							this.setState({spinner: false});
							navigation.navigate("Login");
							return;
						}

						try {
							// Has internet connection
							await this.loadProducts();

						} catch (error) {
							console.error("Error loading products:", error);
						} finally {
							this.setState({spinner: false});
						}
					}

					await this.getAmountInfo();

					let notAllowed = await AsyncStorage.getItem("not_allowed");
					this.setState({notAllowed: notAllowed});
				}
			}
			//####################################################

			console.log("FOCUSED");
			console.log("-------");

			// ROLE ERROR
			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed});


			await this.getAmountInfo();

			// if (this.state.intervalStarted == false) {
			// 	let intervalId = setInterval(async () => {
			// 		if (await AsyncStorage.getItem("window") != "Home") {
			// 			this.setState({intervalStarted: false});
			// 			clearInterval(intervalId);
			// 			return;
			// 		}
	
			// 		let notPayed = await AsyncStorage.getItem("notPayed");
			// 		if (notPayed == "true") {
			// 			console.log("not payed")
			// 			this.setState({notPayed: true});
			// 		} else {
			// 			console.log("payed")
			// 			this.setState({notPayed: false});
			// 		}
	
			// 		console.log("Checking payment from HomeScreen..", notPayed);
			// 	}, 5000)
	
			// 	this.setState({intervalStarted: true});
			// }	
		});
	}

	async initializeScreen() {
		// this.setState({
		// 	shoppingCardColors: ["#E59C0D", "#FDD958"],
		// 	profitCardColors: ["#2C8134", "#1DCB00"],
		// 	profitAmount: 0,
		// 	sellAmount: 0,
		// 	notAllowed: "",
		// 	spinner: false,
		// 	isLoading: false,
		// 	isDownloaded: "false",

		// 	// PRODUCT
		// 	lastLocalProductsPage: 0,
		// 	lastLocalProductsSize: 10,
		// 	lastGlobalProductsPage: 0,
		// 	lastGlobalProductsSize: 10,
		// 	lastStoreProductsPage: 0,
		// 	lastStoreProductsSize: 10,

		// 	// SELL
		// 	lastSellGroupsPage: 0,
		// 	lastSellGroupsSize: 10,
		// 	lastSellHistoriesPage: 0,
		// 	lastSellHistoriesSize: 10,
		// 	lastSellHistoryGroupPage: 0,
		// 	lastSellHistoryGroupSize: 10,
		// 	lastSellAmountDatePage: 0,
		// 	lastSellAmountDateSize: 10,

		// 	// PROFIT
		// 	lastProfitGroupsPage: 0,
		// 	lastProfitGroupsSize: 10,
		// 	lastProfitHistoriesPage: 0,
		// 	lastProfitHistoriesSize: 10,
		// 	lastProfitHistoryGroupPage: 0,
		// 	lastProfitHistoryGroupSize: 10,
		// 	lastProfitAmountDatePage: 0,
		// 	lastProfitAmountDateSize: 10,

		// 	menuFocused: false,
		// 	crossFocused: false,
		// 	menuOpened: false
		// });

		// this.amountDateRepository = new AmountDateRepository();
		// this.apiService = new ApiService();
		// this.productRepository = new ProductRepository();
		// this.sellHistoryRepository = new SellHistoryRepository();
		// this.profitHistoryRepository = new ProfitHistoryRepository();
		// this.storeProductRepository = new StoreProductRepository();
		// this.databaseRepository = new DatabaseRepository();
		// this.tokenService = new TokenService();
	}

	componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	async loadProducts() {
		await Promise.all([
			this.storeProductRepository.init(),
			this.sellHistoryRepository.init(),
			this.profitHistoryRepository.init(),
			this.amountDateRepository.init()
		]);

		if (!this.state.isLoading) {
			try {
				console.log("LOADING STARTED");

				this.setState({isLoading: true}); // loading started

				// Get the current date
				const currentDate = new Date();

				// Extract year, month, and day
				const year = currentDate.getFullYear();
				const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
				const day = String(currentDate.getDate()).padStart(2, "0");

				// Format the date as yyyy-mm-dd
				const formattedDate = `${year}-${month}-${day}`;

				try {
					let sellAmount = await this.apiService.getSellAmountByDate(
						formattedDate,
						this.props.navigation
					);

					let profitAmount = await this.apiService.getProfitAmountByDate(
						formattedDate,
						this.props.navigation
					);

					this.setState({
						sellAmount: sellAmount.amount,
						profitAmount: profitAmount.amount
					})
				} catch (e) {
				}


				try {
					// STORING CURRENT MONTHLY AMOUNTS
					let currentDate = new Date()
					const currentMonth = currentDate.getMonth();
					await AsyncStorage.setItem("month", currentMonth + "");

					let sellMonthAmount = await this.apiService.getSellMonthAmount(this.props.navigation);
					let profitMonthAmount = await this.apiService.getProfitMonthAmount(this.props.navigation);

					console.log("sellMonthAmount:: ", sellMonthAmount);
					console.log("profitMonthAmount:: ", profitMonthAmount);
					await AsyncStorage.setItem(
						"month_sell_amount",
						sellMonthAmount.toString() + ""
					);

					await AsyncStorage.setItem(
						"month_profit_amount",
						profitMonthAmount.toString() + ""
					);
				} catch (e) {
					await AsyncStorage.setItem(
						"month_sell_amount",
						0 + ""
					);

					await AsyncStorage.setItem(
						"month_profit_amount",
						0 + ""
					);
				}

				let isDownloaded = true;

				isDownloaded = isDownloaded && await this.getLocalProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getGlobalProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getStoreProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellGroupsAndHistories();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellAmountDate();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getProfitGroupsAndHistories();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getProfitAmountDate();
				this.setState({spinner: true})

				// storing result of product storing
				await AsyncStorage.setItem("isDownloaded", isDownloaded.toString());
				console.log("LOADING", isDownloaded.toString());

				this.setState({
					isLoading: false, // loading finished
					isDownloaded: isDownloaded.toString()
				});
				console.log("LOADING FINISHED");

			} catch (e) {
				console.log("LOADING ERRORED");
				console.error(e);

				this.setState({
					isLoading: false,
					isDownloaded: "false"
				});
				console.log("LOADING FINISHED");

				// Storing result of product storing
				await AsyncStorage.setItem("isDownloaded", "false");
			}
		}
	}


	// PRODUCT PAGINATION
	async getLocalProducts() {
		console.log("GETTING LOCAL PRODUCTS ⏳⏳⏳");

		let size = this.state.lastLocalProductsSize;
		let page = this.state.lastLocalProductsPage;

		while (true) {
			let downloadedProducts;
			downloadedProducts = await this.apiService.getLocalProducts(page, size, this.props.navigation);

			if (
				!downloadedProducts ||
				!downloadedProducts.content ||
				downloadedProducts.content.length === 0
			) {
				break;
			}

			for (const product of downloadedProducts.content) {
				try {
					await this.productRepository.createProductWithGlobalId(
						product.id,
						product.name,
						product.brandName,
						product.serialNumber,
						"LOCAL",
						true
					);
				} catch (error) {
					console.error("Error creating local products:", error);
				}
			}

			page++;
		}

		return true;
	}

	async getGlobalProducts() {
		console.log("GETTING GLOBAL PRODUCTS ⏳⏳⏳")

		let size = this.state.lastGlobalProductsSize;
		let page = this.state.lastGlobalProductsPage;

		while (true) {
			let response;
			try {
				response =
					await this.apiService.getGlobalProducts(page, size, this.props.navigation);
			} catch (error) {
				console.error("getGlobalProducts()", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				return true; // Indicate success and exit the loop
			}

			for (const product of response.content) {
				try {
					let bySerialNumber =
						await this.productRepository.findProductsBySerialNumberAndSavedTrue(
							product.serialNumber
						);
					if (bySerialNumber.length === 0) {
						await this.productRepository.createProductWithGlobalId(
							product.id,
							product.name,
							product.brandName,
							product.serialNumber,
							"GLOBAL",
							true
						);
					}
				} catch (error) {
					console.error("Error getGlobalProducts:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
		}
	}

	async getStoreProducts() {
		console.log("GETTING STORE PRODUCTS ⏳⏳⏳");

		let size = this.state.lastStoreProductsSize;
		let page = this.state.lastStoreProductsPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getStoreProducts(page, size, this.props.navigation);
			} catch (error) {
				console.error("getStoreProducts()", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				return true; // Indicate success and exit the loop
			}

			for (const storeProduct of response.content) {
				try {
					let products = await this.productRepository.findProductsByGlobalId(storeProduct.productId);
					console.log("Bug:")
					console.log(products);
					await this.storeProductRepository.createStoreProductWithAllValues(
						products[0].id,
						storeProduct.nds,
						storeProduct.price,
						storeProduct.sellingPrice,
						storeProduct.percentage,
						storeProduct.count,
						storeProduct.countType,
						storeProduct.id,
						true
					)
				} catch (error) {
					console.error("Error getStoreProducts:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
		}
	}

	// SELL PAGINATION
	async getSellGroupsAndHistories() {
		// GET LAST ID OF GROUPS
		console.log("GETTING SELL GROUPS ⏳⏳⏳");

		let response;
		try {
			let lastSellGroupGlobalId =
				await this.apiService.getLastSellGroupGlobalId(this.props.navigation);

			if (lastSellGroupGlobalId === -1) { // NO GROUPS EXIST JUST BREAK THE PROCESS
				return true;
			}

			response =
				await this.apiService.getSellGroups(
					lastSellGroupGlobalId,
					0,
					1000000,
					this.props.navigation
				);
		} catch (error) {
			console.error("getSellGroupsAndHistories():", error);
			return false;
		}

		if (!response || !response.content || response.content.length === 0) {
			return true;
		}

		for (const sellGroup of response.content) {
			try {
				await this.sellHistoryRepository.createSellGroupWithAllValues(
					sellGroup.createdDate,
					sellGroup.amount,
					sellGroup.id,
					true
				);
			} catch (error) {
				console.error("Error getSellGroups:", error);
			}
		}


		let lastSellGroupGlobalIdByResponse = response.content[0].id;
		let sellHistoryLinkInfos = await this.apiService.getSellHistoryLinkInfoByGroupId(lastSellGroupGlobalIdByResponse);
		if (sellHistoryLinkInfos.length !== 0) {
			for (let sellHistoryLinkInfoElement of sellHistoryLinkInfos) {
				let products = await this.productRepository.findProductsByGlobalId(sellHistoryLinkInfoElement.sellHistory.productId);
				let createdSellHistoryId = await this.sellHistoryRepository.createSellHistoryWithAllValues(
					products[0].id,
					sellHistoryLinkInfoElement.sellHistory.id,
					sellHistoryLinkInfoElement.sellHistory.count,
					sellHistoryLinkInfoElement.sellHistory.countType,
					sellHistoryLinkInfoElement.sellHistory.sellingPrice,
					sellHistoryLinkInfoElement.sellHistory.createdDate,
					true
				);

				let createdSellGroup =
					await this.sellHistoryRepository.findSellGroupByGlobalId(sellHistoryLinkInfoElement.sellGroupId);

				if (createdSellGroup[0]) {
					await this.sellHistoryRepository.createSellHistoryGroupWithAllValues(
						createdSellHistoryId,
						createdSellGroup[0].id,
						sellHistoryLinkInfoElement.id,
						true
					);
				}
			}
		}

		return true;
	}

	async getSellAmountDate() {
		console.log("GETTING SELL AMOUNT DATE ⏳⏳⏳");
		let response;
		try {
			let lastSellAmountGlobalId =
				await this.apiService.getLastSellAmountDateGlobalId(this.props.navigation);

			if (lastSellAmountGlobalId === -1) {
				return true;
			}

			response = await this.apiService.getSellAmountDate(
				lastSellAmountGlobalId + 1, 0, 1000000, this.props.navigation
			);
		} catch (error) {
			console.error("getSellAmountDate():", error);
			this.setState({
				lastSize: 1000000,
				lastPage: 0
			});

			return false; // Indicate failure
		}

		if (!response || !response.content || response.content.length === 0) {
			return true; // Indicate success and exit the loop
		}

		for (const sellAmountDate of response.content) {
			try {
				await this.amountDateRepository.createSellAmountWithAllValues(
					sellAmountDate.amount,
					sellAmountDate.date,
					sellAmountDate.id,
					true
				);
			} catch (error) {
				console.error("Error getSellAmountDate:", error);
				// Continue with next product
				continue;
			}
		}

		return true;
	}

	// PROFIT
	async getProfitGroupsAndHistories() {
		console.log("GETTING PROFIT GROUPS ⏳⏳⏳");

		let response;
		try {
			let lastProfitGroupGlobalId =
				await this.apiService.getLastProfitGroupGlobalId(this.props.navigation);

			if (lastProfitGroupGlobalId === -1) { // NO GROUPS EXIST JUST BREAK THE PROCESS
				return true;
			}

			response = await this.apiService.getProfitGroups(
				lastProfitGroupGlobalId, 0, 1000000, this.props.navigation
			);
		} catch (error) {
			console.error("Error fetching getProfitGroups():", error);
			this.setState({
				lastSize: 1000000,
				lastPage: 0
			});

			return false;
		}

		if (!response || !response.content || response.content.length === 0) {
			return true;
		}

		for (const profitGroup of response.content) {
			try {
				await this.profitHistoryRepository.createProfitGroupWithAllValues(
					profitGroup.createdDate,
					profitGroup.profit,
					profitGroup.id,
					true
				);
			} catch (error) {
				console.error("Error getProfitGroups:", error);
				// Continue with next product
				continue;
			}
		}

		let lastProfitGroupGlobalIdByResponse = response.content[0].id;
		let profitHistoryLinkInfos = await this.apiService.getProfitHistoryLinkInfoByGroupId(lastProfitGroupGlobalIdByResponse);
		if (profitHistoryLinkInfos.length !== 0) {
			for (let profitHistoryLinkInfoElement of profitHistoryLinkInfos) {
				let products =
					await this.productRepository.findProductsByGlobalId(profitHistoryLinkInfoElement.profitHistory.productId);

				let createdProfitHistoryId = await this.profitHistoryRepository.createProfitHistoryWithAllValues(
					products[0].id,
					profitHistoryLinkInfoElement.profitHistory.id,
					profitHistoryLinkInfoElement.profitHistory.count,
					profitHistoryLinkInfoElement.profitHistory.countType,
					profitHistoryLinkInfoElement.profitHistory.profit,
					profitHistoryLinkInfoElement.profitHistory.createdDate,
					true
				);

				let createdProfitGroup =
					await this.profitHistoryRepository.findProfitGroupByGlobalId(profitHistoryLinkInfoElement.profitGroupId);

				if (createdProfitGroup[0]) {
					await this.profitHistoryRepository.createProfitHistoryGroupWithAllValues(
						createdProfitHistoryId,
						createdProfitGroup[0].id,
						profitHistoryLinkInfoElement.id,
						true
					);
				}
			}
		}

		return true;
	}

	async getProfitAmountDate() {
		console.log("GETTING PROFIT AMOUNT DATE ⏳⏳⏳");
		let response;
		try {
			let lastProfitAmountDateGlobalId =
				await this.apiService.getLastProfitAmountDateId(this.props.navigation);

			if (lastProfitAmountDateGlobalId === -1) {
				return true;
			}

			response = await this.apiService.getProfitAmountDate(
				lastProfitAmountDateGlobalId + 1, 0, 1000000, this.props.navigation
			);
		} catch (error) {
			console.error("getProfitAmountDate():", error);
			this.setState({
				lastSize: 0,
				lastPage: 1000000
			});

			return false;
		}

		if (!response || !response.content || response.content.length === 0) {
			return true; // Indicate success and exit the loop
		}

		for (const profitAmountDate of response.content) {
			try {
				await this.amountDateRepository.createProfitAmountWithAllValues(
					profitAmountDate.amount,
					profitAmountDate.date,
					profitAmountDate.id,
					true
				);
			} catch (error) {
				console.error("Error getProfitAmountDate:", error);
				// Continue with next product
				continue;
			}
		}

		return true;
	}

	async getAmountInfo() {
		// HOW TO GET yyyy-mm-dd from new Date()

		// Get the current date
		const currentDate = new Date();

		// Extract year, month, and day
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, "0");

		// Format the date as yyyy-mm-dd
		const formattedDate = `${year}-${month}-${day}`;


		let profitAmountInfo = await this.amountDateRepository.getProfitAmountInfoByDate(formattedDate);
		let sellAmountInfo = await this.amountDateRepository.getSellAmountInfoByDate(formattedDate);

		this.setState({
			profitAmount: profitAmountInfo,
			sellAmount: sellAmountInfo
		});
	}

	async completePayment() {
		// Oynani yopish va bugun umuman boshqa tekshirmaslik uchun ohirgi sanani saqlash.
		await AsyncStorage.setItem("paymentTryCount", (0).toString());

		const currentDate = new Date();

		const year = currentDate.getFullYear();
		const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month index
		const day = ("0" + currentDate.getDate()).slice(-2);
		const hour = ("0" + currentDate.getHours()).slice(-2); // Get current hour

		const dateString = `${year}-${month}-${day}`;


		if (await AsyncStorage.getItem("lastPaymentShownDate") != dateString) {
			await AsyncStorage.setItem("lastPaymentShownDate", dateString);
		}

		if (await AsyncStorage.getItem("lastPaymentShownHour") != hour.toString()) {
			await AsyncStorage.setItem("lastPaymentShownHour", hour.toString());
		}

		this.setState({
			paymentModalVisible: false,
			notPayed: false
		});
	}

	closePaymentModal() {
		this.setState({
			paymentModalVisible: false
		});
	}

	render() {
		const {navigation} = this.props;

		return (
			<>
				<Spinner
					visible={this.state.spinner}
					cancelable={false}
					textContent={"Yuklanyapti 10%"}
					textStyle={{
						fontFamily: "Gilroy-Bold",
						color: "#FFF"
					}}
				/>

				<View style={styles.container}>
					<View style={styles.header}>
						<Text style={styles.pageTitle}>Bosh sahifa</Text>
						<TouchableOpacity
							onPress={() => {
								this.menu.current?.setModalVisible(true);
							}}
							onPressIn={() => {
								// this.setState(
								// 	{menuFocused: true}
								// )


							}}

							onPressOut={() => {
								// this.setState(
								// 	{menuFocused: false}
								// )

							}}

							activeOpacity={1}>
							<View
								style={this.state.menuFocused ? {
									backgroundColor: "#F4F4F4",
									padding: 10,
									paddingVertical: 15,
									borderRadius: 50,
								} : styles.menuIcon}>
								<MenuIcon/>
							</View>
						</TouchableOpacity>
					</View>

					{
						this.state.notPayed ? (
							<TouchableRipple
						style={{
							width: "100%",
							height: 180,
							backgroundColor: "#D2D7DA",
							borderRadius: 0,
						}}
						onPress={() => {
							this.setState({paymentModalVisible: true});
						}}
						rippleColor="#FFF"
					>
						<View style={{ flex: 1, justifyContent: "space-between" }}>
							<View
								style={{
									marginHorizontal: 16,
									paddingTop: 30,
									paddingBottom: 20,
									borderBottomColor: "#000",
									borderBottomWidth: 1,
								}}
							>
								<Text
									style={{
										fontFamily: "Gilroy-Bold",
										fontWeight: "bold",
										fontSize: 24,
										marginLeft: 6,
										color: "#000",
										width: 275,
									}}
								>
									Siz bugun to'lashingiz kerak
								</Text>
							</View>

							<View
								style={{
									position: "absolute",
									bottom: 20,
									right: 32,
									alignItems: "center",
								}}
							>
								<Feather name="arrow-up-right" size={32} color="#000" />
							</View>
						</View>
					</TouchableRipple> 
						) : null
						
					}

					<View style={styles.cards}>
						<TouchableOpacity
							activeOpacity={1}
							onPressIn={() => {
								this.setState({shoppingCardColors: ["#D7FF01", "#D7FF01"]})
							}}
							onPressOut={() => {
								this.setState({shoppingCardColors: ["#D7FF01", "#D7FF01"]})
							}}
							onPress={() => navigation.navigate("Shopping")}>
							<LinearGradient
								colors={this.state.shoppingCardColors}
								start={{x: 0, y: 0.5}}
								style={styles.card}>

								<ShoppingIcon
									style={styles.shoppingIcon}
									resizeMode="cover"/>

								<Text
									style={[styles.cardTitle, {color: "#272727"}]}>Bugungi kirim</Text>
								<Text
									style={styles.cardDescription}>
									{this.state.sellAmount.toLocaleString()}
									<Text
										style={styles.currency}>UZS</Text>
								</Text>
							</LinearGradient>
						</TouchableOpacity>

						<TouchableOpacity
							activeOpacity={1}
							onPressIn={() => {
								this.setState({profitCardColors: ["#272822", "#272822"]})
							}}
							onPressOut={() => {
								this.setState({profitCardColors: ["#272822", "#272822"]})
							}}
							onPress={() => {
								navigation.navigate("Profit")
							}}>
							<LinearGradient
								style={styles.card}
								colors={this.state.profitCardColors}
								start={{x: 0, y: 0.5}}
							>
								<BenefitIcon
											style={styles.benefitIcon}
											resizeMode="cover"/>

								<Text
									style={[styles.cardTitle, {color: "#FFF"}]}>Bugungi foyda</Text>
								<Text
									style={[styles.cardDescription, {color: "#FFF"}]}>
									{this.state.profitAmount.toLocaleString()}
									<Text
										style={styles.currency}>UZS</Text>
								</Text>
							</LinearGradient>
						</TouchableOpacity>

					</View>
					<StatusBar style="auto"/>
				</View>

				<ActionSheet
					ref={this.menu}
					gestureEnabled={true}
					indicatorStyle={{
						width: 100,
					}}>
					
					<View style={{
							height: 500,
							display: "flex",
							justifyContent: "space-between",
							paddingTop: 40,
						}}>
							<View></View>

							<TouchableOpacity
								activeOpacity={1}
								onPressIn={() => {
									this.setState({
										clearButtonFocused: true
									})
								}}
								onPressOut={() => {
									this.setState({
										clearButtonFocused: false
									})
								}}
								onPress={async () => {
									// if (await AsyncStorage.getItem("isFetchingNotCompleated") == "true") {
									// 	// Actions not saved yet
									// 	return;
									// }

									await this.databaseRepository.clear();
									await AsyncStorage.clear();

									this.setState({
										shoppingCardColors: ["#E59C0D", "#FDD958"],
										profitCardColors: ["#2C8134", "#1DCB00"],
										profitAmount: 0,
										sellAmount: 0,
										notAllowed: "",
										spinner: false,
										isConnected: null,
										isLoading: false,
										isDownloaded: "false",

										// PRODUCT
										lastLocalProductsPage: 0,
										lastLocalProductsSize: 10,
										lastGlobalProductsPage: 0,
										lastGlobalProductsSize: 10,
										lastStoreProductsPage: 0,
										lastStoreProductsSize: 10,

										// SELL
										lastSellGroupsPage: 0,
										lastSellGroupsSize: 10,
										lastSellHistoriesPage: 0,
										lastSellHistoriesSize: 10,
										lastSellHistoryGroupPage: 0,
										lastSellHistoryGroupSize: 10,
										lastSellAmountDatePage: 0,
										lastSellAmountDateSize: 10,

										// PROFIT
										lastProfitGroupsPage: 0,
										lastProfitGroupsSize: 10,
										lastProfitHistoriesPage: 0,
										lastProfitHistoriesSize: 10,
										lastProfitHistoryGroupPage: 0,
										lastProfitHistoryGroupSize: 10,
										lastProfitAmountDatePage: 0,
										lastProfitAmountDateSize: 10,

										menuOpened: false
									})

									const {navigation} = this.props;
									let isLoggedIn = await this.tokenService.checkTokens();
									if (!isLoggedIn) {
										navigation.navigate("Login");
									}
								}}>
								<View style={[
									{
										display: "flex",
										alignItems: "center",
										height: 55,
										justifyContent: "center",
										width: "100%",
										paddingHorizontal: 30,
										borderTopWidth: 1,
										borderTopColor: "#F1F1F1",
										flexDirection: "row",
										gap: 17
									}, this.state.clearButtonFocused ? {
										backgroundColor: "#FAFAFA"
									} : {
										backgroundColor: "#FFF"
									}
								]}>
									<LogoutIcon/>
									<Text
										style={{
											fontFamily: "Gilroy-Bold",
											fontSize: 18,
											color: "#D93E3C",
										}}>
										Hammasini tozalash va chiqish
									</Text>
								</View>
							</TouchableOpacity>
					</View>
					
				</ActionSheet>

				{/* Role error */}
				<Modal
					visible={this.state.notAllowed === "true"}
					animationIn={"slideInUp"}
					animationOut={"slideOutDown"}
					animationInTiming={200}
					transparent={true}>
					<View style={{
						position: "absolute",
						width: "150%",
						height: screenHeight,
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#00000099",
						left: -50,
						right: -50,
						top: 0
					}}></View>

					<Animatable.View
						animation="bounceInUp" delay={0} iterationCount={1} direction="alternate"
						style={{
							height: screenHeight,
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}>
						<View style={{
							width: screenWidth - (16 * 2),
							maxWidth: 343,
							marginLeft: "auto",
							marginRight: "auto",
							flex: 1,
							alignItems: "center",
							justifyContent: "flex-end",
							marginBottom: 120
						}}>
							<View style={{
								width: "100%",
								padding: 20,
								borderRadius: 12,
								backgroundColor: "#fff",
							}}>
								<Text style={{
									fontFamily: "Gilroy-Regular",
									fontSize: 18
								}}>Siz sotuvchi emassiz..</Text>
								<TouchableOpacity
									style={{
										display: "flex",
										alignItems: "center",
										height: 55,
										justifyContent: "center",
										backgroundColor: "#222",
										width: "100%",
										borderRadius: 12,
										marginTop: 22
									}}
									onPress={async () => {
										this.setState({notAllowed: "false"});
										await AsyncStorage.setItem("not_allowed", "false")
									}}>
									<Text
										style={{
											fontFamily: "Gilroy-Bold",
											fontSize: 18,
											color: "#fff",
										}}>Tushunarli</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Animatable.View>
				</Modal>
				
				<ApplicationProvider  {...eva} theme={eva.dark}>
					<Modal
					 	visible={this.state.paymentModalVisible} 
						style={{width: "101%", position: "absolute", left: -20, top: -18}}>

						<PaymentForm
							completePayment={async () => {
								await this.completePayment()
							}}
							closeModal={() => {
								this.closePaymentModal();
							}}
						/>

					</Modal>
				</ApplicationProvider>
			</>
		);
	}
}

const styles = StyleSheet.create({
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},

	loaderText: {
		fontFamily: "Gilroy-Bold",
		color: "#FFF",
		marginTop: 10
	},

	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 52
	},

	header: {
		display: "flex",
		flexDirection: "row",
		height: 44,
		width: screenWidth - (24 + 24),
		// borderBottomColor: "#AFAFAF",
		// borderBottomWidth: 1,
		marginBottom: 24,
		justifyContent: "space-between",
		alignItems: "center"
	},

	menuIcon: {
		backgroundColor: "#FFF",
		padding: 12,
		// paddingVertical: 15,
		borderRadius: 50
	},

	pageTitle: {
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		textAlign: "center",
	},

	shoppingIcon: {
		position: "absolute",
		right: 29,
		top: 22,
	},

	benefitIcon: {
		position: "absolute",
		right: 29,
		top: 22,
		zIndex: 1
	},

	cards: {
		width: screenWidth - (24 + 24),
		marginTop: 10
	},

	card: {
		paddingTop: 24,
		paddingLeft: 24,
		paddingBottom: 24,
		marginBottom: 25,
		borderRadius: 12,
		position: "relative",
		overflow: "hidden",
		height: 170
	},

	cardTitle: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		// marginBottom: 10,
		// marginTop: 10,
		textTransform: "uppercase"
	},

	cardDescription: {
		color: "#272727",
		fontSize: 29,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
		position: "absolute",
		bottom: 28,
		left: 24
	},

	currency: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		marginLeft: 6
	}
});

export default Home;