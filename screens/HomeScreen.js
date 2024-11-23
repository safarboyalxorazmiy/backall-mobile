import React, {Component, createRef, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	ScrollView
} from "react-native";

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
import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";
import ActionSheet from 'react-native-actions-sheet';
import { Feather } from "@expo/vector-icons";
import { TouchableRipple } from 'react-native-paper';
import PaymentForm from "./payment/PaymentForm";

import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import i18n, { loadLocale, setLocale, t } from '../i18n';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const languages = [
	{ label: "English", value: "English" },
	{ label: "O'zbekcha", value: "UzbekLatin" },
	{ label: "Ўзбекча", value: "UzbekCyrillic" },
	{ label: "Русский", value: "Russian" }
];

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			shoppingCardColors: ["#D7FF01", "#D7FF01"],
			profitAmount: 0,
			sellAmount: 0,
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
			intervalStarted: false,
			diagramData: [0,0,0,0,0,0],
			selectedLanguage: loadLocale()
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
		this.langPicker = new createRef();
	}

	async componentDidMount() {
		console.log("Component mounted");
		await AsyncStorage.setItem("window", "Home");
		
		const {navigation} = this.props;

		// !IMPORTANT 🔭******************************
		// Bu yerda foydalanuvchi tokeni bor yoki yo'qligini tekshiradi 
		// agar token yo'q bo'lsa unda login oynasiga otadi.
		let isLoggedIn = await this.tokenService.checkTokens();
		if (!isLoggedIn) {
			console.log("LOGGED OUT BY 401 FROM HOME")
			await this.databaseRepository.clear();
			await AsyncStorage.clear();
			navigation.navigate("Login");
			return;
		}
		//************************************

		// !IMPORTANT 🔭******************************
		// Bu yerda agar yangi telefondan login bo'lsa ya'ni apidan 401 kelsa login oynasiga otadi.
		let authError = await AsyncStorage.getItem("authError");
		if (authError != null && authError == "true") {
			console.log("LOGGED OUT BY 401 FROM HOME")
			await this.databaseRepository.clear();
			await AsyncStorage.clear();
			navigation.navigate("Login");
			return;	
		}
		//************************************

		// !IMPORTANT 🔭******************************
		// Logina otmiturdig'on bosa Homeni statelarini tozalab 0dan run adishi boshlimiz.
		await this.initializeScreen();
		//************************************

		// !IMPORTANT 🔭******************************
		// Bizar homeni yuklab bo'ldik  
		// shuning uchun asyncStoragedaki logindan galadovn bu parametrni boshlang'ich holatina qaytarib qo'yamiz.
		if (await AsyncStorage.getItem("loadHome") === "true") {			
			await AsyncStorage.setItem("loadHome", "false");
		}
		//************************************
		
		// !IMPORTANT 🔭******************************
		// Internet bor yoki yo'qligini tekshirish.	
		this.unsubscribe = NetInfo.addEventListener((state) => {
			this.setState({isConnected: state.isConnected});
		});

		if (this.unsubscribe) {
			this.unsubscribe();
		}
		//************************************
		
		// !IMPORTANT 🔭******************************
		// Agar data backenddan skachat adilmadik bo'lsa skachat adish.
		this.setState({spinner: true});
		
		let isDownloaded = await AsyncStorage.getItem("isDownloaded");
		if (isDownloaded !== "true" || isDownloaded == null) {
			this.setState({spinner: true});
			this.databaseRepository.clear();

			const {navigation} = this.props;

			let isLoggedIn = await this.tokenService.checkTokens();
			if (!isLoggedIn) {
				this.setState({spinner: false});
				this.databaseRepository.clear();
				await AsyncStorage.clear();
				navigation.navigate("Login");
			}

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
						this.databaseRepository.clear();
						await AsyncStorage.clear();		
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
			}
		}

		this.setState({spinner: false});
		//************************************

		// !IMPORTANT 🔭******************************
		// Dapadaki kirim bilan foydani go'rsatish.
		await this.amountDateRepository.init();
		await this.getAmountInfo();
		//************************************

		// !IMPORTANT 🔭******************************
		// Agar yangi user bo'lsa payment oynasini ochadigan qilib qo'yamiz

		// Agar masheniklik qilib offline ishlataman desa
		// screenga kirganda payment oynasini qayta ochadigan qilib qo'yamiz
		// await AsyncStorage.setItem("paymentScreenOpened", "true");

		if (await AsyncStorage.getItem("isNewUser") == "true" || await AsyncStorage.getItem("paymentScreenOpened") == "true") {
			await AsyncStorage.setItem("paymentScreenOpened", "true");
			this.setState({
				paymentModalVisible: true,
				cardNumber: await AsyncStorage.getItem("cardNumber"),
				cardNumberWithoutSpaces: await AsyncStorage.getItem("cardNumberWithoutSpaces"),
				expirationDate: await AsyncStorage.getItem("expirationDate"),
				expirationDateWithoutSlash: await AsyncStorage.getItem("expirationDateWithoutSlash"),
				cardToken: await AsyncStorage.getItem("cardToken"),
			});
			return;
		}

		// !IMPORTANT 🔭******************************
		// Tolov adadaovn knopkani go'rsatish.
		let notPayed = await AsyncStorage.getItem("notPayed")
		if (notPayed == "true") {
			this.setState({notPayed: true})
		} else {
			this.setState({notPayed: false})
		}
		//************************************

		// !IMPORTANT 🔭******************************
		// LineChart diagramma datasini yuklab olish.
		let sellAmountDateData = await this.amountDateRepository.getSellAmountDate();

		if (this.state.diagramData != sellAmountDateData) {
			this.setState({diagramData: sellAmountDateData});
		}
		//************************************

		navigation.addListener("focus", async () => {
			await AsyncStorage.setItem("window", "Home");

			// !IMPORTANT 🔭******************************
			// Bu yerda foydalanuvchi tokeni bor yoki yo'qligini tekshiradi 
			// agar token yo'q bo'lsa unda login oynasiga otadi
			let isLoggedIn = await this.tokenService.checkTokens();
			if (!isLoggedIn) {
				console.log("LOGGED OUT BY 401 FROM HOME")
				await this.databaseRepository.clear();
				await AsyncStorage.clear();
				navigation.navigate("Login");
				return;
			}
			//************************************

			console.log("HOME NAVIGATED");
			// !IMPORTANT 🔭******************************
			// Internet bor yoki yo'qligini tekshirish.
			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});

			if (this.unsubscribe) {
				this.unsubscribe();
			}
			//************************************
			
			// !IMPORTANT 🔭******************************
			// Agar data backenddan skachat adilmadik bo'lsa skachat adish.
			let isDownloaded = await AsyncStorage.getItem("isDownloaded");
			console.log("isDownloaded::", isDownloaded);
			if (isDownloaded !== "true" || isDownloaded == null) {
				this.databaseRepository.clear();
				this.setState({spinner: true});

				const {navigation} = this.props;

				let isLoggedIn = await this.tokenService.checkTokens();
				if (!isLoggedIn) {
					console.log("FOCUS TOKEN CHECKING FAILED");
					this.setState({spinner: false});
					this.databaseRepository.clear();
					await AsyncStorage.clear();	
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
							this.databaseRepository.clear();
							await AsyncStorage.clear();			
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
				}
			}
			//************************************

			console.log("FOCUSED");
			console.log("-------");

			// !IMPORTANT 🔭******************************
			// Dapadaki kirim bilan foydani go'rsatish.
			await this.amountDateRepository.init();
			await this.getAmountInfo();
			//************************************

			// !IMPORTANT 🔭******************************
			// LineChart diagramma datasini yuklab olish.
			let sellAmountDateData = await this.amountDateRepository.getSellAmountDate();

			if (this.state.diagramData != sellAmountDateData) {
				this.setState({diagramData: sellAmountDateData});
			}
			//************************************

			// !IMPORTANT 🔭******************************
			// If that is new user show payment modal untill he pays
			if (await AsyncStorage.getItem("isNewUser") == "true") {
				this.setState({
					paymentModalVisible: true,
					cardNumber: await AsyncStorage.getItem("cardNumber"),
					cardNumberWithoutSpaces: await AsyncStorage.getItem("cardNumberWithoutSpaces"),
					expirationDate: await AsyncStorage.getItem("expirationDate"),
					expirationDateWithoutSlash: await AsyncStorage.getItem("expirationDateWithoutSlash"),
					cardToken: await AsyncStorage.getItem("cardToken"),
				});
				return;
			}

			// !IMPORTANT 🔭******************************
			// Tolov adadovn knopkani go'rsatish. Orqa fonda tolov adilganmi yo'qmi tekshirib durish.
			if (this.state.intervalStarted == false) {
				let intervalId = setInterval(async () => {
					if (await AsyncStorage.getItem("animation") === "true") {
						return;
					}

					if (await AsyncStorage.getItem("window") != "Home") {
						this.setState({intervalStarted: false});
						clearInterval(intervalId);
						return;
					}
	
					let notPayed = await AsyncStorage.getItem("notPayed");
					if (notPayed == "true") {
						console.log("not payed")
						this.setState({notPayed: true});
					} else {
						console.log("payed")
						this.setState({notPayed: false});
					}
	
					console.log("Checking payment from HomeScreen..", notPayed);
				}, 5000)
	
				this.setState({intervalStarted: true});
			}
			//************************************
		});
	}

	async initializeScreen() {
		this.setState({
			profitAmount: 0,
			sellAmount: 0,
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
			intervalStarted: false,
			diagramData: [0, 0, 0, 0, 0, 0],
			language: "uz"
		});

		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.storeProductRepository = new StoreProductRepository();
		this.databaseRepository = new DatabaseRepository();
		this.tokenService = new TokenService();
		this.menu = new createRef();
		this.langPicker = new createRef();

		this.amountDateRepository.init();
		this.sellHistoryRepository.init();
		this.profitHistoryRepository.init();
		this.storeProductRepository.init();
		
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

		if (this.state.isLoading == true) {
			return;
		}

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
			} catch (e) { }


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

			if (isDownloaded == false) {
				this.databaseRepository.clear();
				await AsyncStorage.clear();
				this.props.navigation.navigate("Login");
				return;
			}

			// storing result of product storing
			await AsyncStorage.setItem("isDownloaded", isDownloaded.toString());
			console.log("LOADING", isDownloaded.toString());

			this.setState({
				isLoading: false, // loading finished
				isDownloaded: isDownloaded.toString()
			});
			console.log("LOADING FINISHED");

		} catch (e) {
			this.setState({
				isLoading: false,
				isDownloaded: "false"
			});
			console.log("LOADING FINISHED");

			// Storing result of product storing
			await AsyncStorage.setItem("isDownloaded", "false");
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
			
				if (response == undefined) {
					return false;
				}
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
				
				
				if (response == undefined) {
					return false;
				}
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

			if (response == undefined) {
				return false;
			}
			
		} catch (error) {
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

			response = 
				await this.apiService.getSellAmountDate(
					lastSellAmountGlobalId + 1, 0, 1000000, this.props.navigation
				);

			if (response == undefined) {
				return false;
			}
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

			response = 
				await this.apiService.getProfitGroups(
					lastProfitGroupGlobalId, 0, 1000000, this.props.navigation
				);
			
			if (response == undefined) {
				return false;
			}
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

			response = 
				await this.apiService.getProfitAmountDate(
					lastProfitAmountDateGlobalId + 1, 0, 1000000, this.props.navigation
				);

			if (response == undefined) {
				return false;
			}
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
			<ScrollView>
				<StatusBar style="auto" backgroundColor="#fff"/>

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
					<View style={{
							flex: 1,
							// padding: 16,
							// backgroundColor: '#FCFCFC',
							// marginTop: 30
						}}>
						

						<Picker
							dropdownIconColor={"#FFF"}
							
							selectedValue={this.state.selectedLanguage}
							onValueChange={(itemValue) => {
								setLocale(itemValue);
								this.setState({
									selectedLanguage: itemValue
								});
								loadLocale();
							}}
							style={{display: "none"}}

							itemStyle={{display: "none"}}
							selectionColor={"red"}
							
							ref={this.langPicker}
						>
								{languages.map((language) => (
										<Picker.Item key={language.value} label={language.label} value={language.value} />
								))}
						</Picker>
					</View>

					<View style={styles.header}>
						<Text style={styles.pageTitle}>{t("homePage")}</Text>
						<View style={{display: "flex", flexDirection: "row", columnGap: 20, height: "100%"}}>
						<TouchableRipple
								delayHoverIn={true}
								delayLongPress={false}
								delayHoverOut={false}
								unstable_pressDelay={false}
								rippleColor="#E5E5E5"
								rippleContainerBorderRadius={50}
								borderless={true} 
								onPress={async () => {
									await AsyncStorage.setItem("animation", "true");
									this.langPicker.current.focus()
								}}
								style={{
										display: "flex", 
										flexDirection: "row", 
										alignItems: "center", 
										justifyContent: "center",
										marginBottom: 10, 
										height: "100%",
										padding: 10,
										borderRadius: 50
									}}>
								{/* <Text style={styles.title}>SUGGESTED LANGUAGES</Text> */}
								<Ionicons name="language" size={24} color="black" />
							</TouchableRipple>
							
							<TouchableRipple
								delayHoverIn={true}
								delayLongPress={false}
								delayHoverOut={false}
								unstable_pressDelay={false}
								rippleColor="#E5E5E5"
								rippleContainerBorderRadius={50}
								borderless={true}
								onPress={async () => {
									await AsyncStorage.setItem("animation", "true");
									this.menu.current?.setModalVisible(true);
								}}
								style={{
									backgroundColor: "#FFF",
									padding: 10,
									paddingVertical: 25,
									borderRadius: 50,
									display: "flex",
									justifyContent: "center",
									alignItems: "center"
								}}>
									<MenuIcon/>
							</TouchableRipple>
						</View>
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
								onPress={async () => {
									await AsyncStorage.setItem("paymentScreenOpened", "true");

									this.setState({
										paymentModalVisible: true,
										cardNumber: await AsyncStorage.getItem("cardNumber"),
										cardNumberWithoutSpaces: await AsyncStorage.getItem("cardNumberWithoutSpaces"),
										expirationDate: await AsyncStorage.getItem("expirationDate"),
										expirationDateWithoutSlash: await AsyncStorage.getItem("expirationDateWithoutSlash"),
										cardToken: await AsyncStorage.getItem("cardToken"),
									});
								}}
								rippleColor="#FFF">
						<View style={{ flex: 1, justifyContent: "space-between" }}>
							<View
								style={{
									marginHorizontal: 16,
									paddingTop: 30,
									paddingBottom: 20,
									borderBottomColor: "#000",
									borderBottomWidth: 1,
								}}>
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
									{t("youHaveToPayToday")}
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
						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							style={styles.card1}
							onPress={() => navigation.navigate("Shopping")}>
							<View style={{paddingTop: 24,paddingLeft: 24, height: 170}}>

								<ShoppingIcon
									style={styles.shoppingIcon}
									resizeMode="cover"/>

								<Text
									style={[styles.cardTitle, {color: "#272727"}]}>{t("todaysIncome")}</Text>
								<Text
									style={styles.cardDescription}>
									{this.state.sellAmount.toLocaleString()}
									<Text
										style={styles.currency}>{t("sum").toUpperCase()}</Text>
								</Text>
							</View>
						</TouchableRipple>

						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							onPress={() => navigation.navigate("Profit")}
							style={styles.card2}>
							<View style={{paddingTop: 24,paddingLeft: 24, height: 170}}>
							<BenefitIcon
								style={styles.benefitIcon}
								resizeMode="cover" />

								<Text
									style={[styles.cardTitle, {color: "#FFF"}]}>{t("todaysProfit")}</Text>
								<Text
									style={[styles.cardDescription, {color: "#FFF"}]}>
									{this.state.profitAmount.toLocaleString()}
									<Text style={styles.currency}>{t("sum").toUpperCase()}</Text>
								</Text>
							</View>
						</TouchableRipple>
					</View>


					<View>
						<LineChart
						
							data={{
								labels: [],
								datasets: [
									{
										data: this.state.diagramData,
										color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Purple line
										strokeWidth: 2 // optional
									}
								],
								legend: [i18n.t("sellState")] 
							}}
							width={Dimensions.get("window").width - 16}
							height={250}
							// yAxisLabel="$"
							// yAxisSuffix="k"
							yAxisInterval={1}
							chartConfig={{
								backgroundColor: "#ffffff",
								backgroundGradientFrom: "#FFF",
								backgroundGradientTo: "#FFF",
								decimalPlaces: 0,
								color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
								labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
								style: {
									borderRadius: 16
								},
								propsForDots: {
									r: "5",
									strokeWidth: "2",
									stroke: "#ffa726"
								}
							}}
							bezier
							style={{
								marginVertical: 8,
								borderRadius: 16
							}}
						/>

					</View>


				</View>

				<ActionSheet
					ref={this.menu}
					onClose={async () => {
						await AsyncStorage.setItem("animation", "false");
					}}
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
										profitAmount: 0,
										sellAmount: 0,
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
										{i18n.t("clearEverythingAndLogout")}
									</Text>
								</View>
							</TouchableOpacity>
					</View>
					
				</ActionSheet>
				
				<Modal
					visible={this.state.paymentModalVisible} 
					// transparent={true}
					style={{width: "101%", height: screenHeight}}
					>

				<View
					style={{width: "101%", height: screenHeight, position: "relative", left: -20, top: 0, overflow: "scroll"}}
					>
					<PaymentForm
						completePayment={async () => {
							await this.completePayment()
						}}
						closeModal={() => {
							this.closePaymentModal();
						}}
						cardNumber={this.state.cardNumber}
						cardNumberWithoutSpaces={this.state.cardNumberWithoutSpaces}
						expirationDate={this.state.expirationDate}
						expirationDateWithoutSlash={this.state.expirationDateWithoutSlash}
						cardToken={this.state.cardToken}

					/>
				</View>

				</Modal>
			</ScrollView>
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

	card2: {
		backgroundColor: "#272822",
		marginBottom: 24,
		borderRadius: 12,
	},

	card1: {
		backgroundColor: "#D7FF01",
		marginBottom: 24,
		borderRadius: 12,
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

export default memo(Home);