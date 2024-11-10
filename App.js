import React, {Component, createRef, memo} from "react";
import {
	Appearance,
	TouchableOpacity,
	View,
	Image,
	Linking,
	StyleSheet,
	AppRegistry,
	Modal,
	Platform,
	Text,
	SafeAreaView,
	Domensions,
	InteractionManager
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import NavigationService from "./service/NavigationService";
import {GestureHandlerRootView, ScrollView} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Asset} from "expo-asset";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";

import {ApplicationProvider} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

import StoreProductRepository from "./repository/StoreProductRepository";
import SellHistoryRepository from "./repository/SellHistoryRepository";
import ProfitHistoryRepository from "./repository/ProfitHistoryRepository";
import AmountDateRepository from "./repository/AmountDateRepository";
import ProductRepository from "./repository/ProductRepository";
import DatabaseRepository from "./repository/DatabaseRepository";
import TokenService from "./service/TokenService";
import ApiService from "./service/ApiService";

import RightArrowLight from "./assets/right-arrow-light.svg"
import PaymentForm from "./screens/payment/PaymentForm";

const tokenService = new TokenService();

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fontsLoaded: false,
			isConnected: null,
			isSavingStarted: false,
			notPayed: null,

			theme: Appearance.getColorScheme(),
			splashLoaded: false
		};

		this.productRepository = new ProductRepository();
		this.storeProductRepository = new StoreProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();

		// Bind methods to maintain correct context
		this.loadCustomFonts = this.loadCustomFonts.bind(this);
		this.checkInternetStatus = this.checkInternetStatus.bind(this);
		this.saveData = this.saveData.bind(this);

		this.touchableRef = createRef();
	}

	async loadCustomFonts() {
		try {
			await Font.loadAsync({
				"Gilroy-Light": require("./assets/fonts/gilroy/Gilroy-Light.ttf"),
				"Gilroy-Regular": require("./assets/fonts/gilroy/Gilroy-Regular.ttf"),
				"Gilroy-Medium": require("./assets/fonts/gilroy/Gilroy-Medium.ttf"),
				"Gilroy-SemiBold": require("./assets/fonts/gilroy/Gilroy-SemiBold.ttf"),
				"Gilroy-Bold": require("./assets/fonts/gilroy/Gilroy-Bold.ttf"),
				"Gilroy-Black": require("./assets/fonts/gilroy/Gilroy-Black.ttf"),
				"Montserrat-Regular": require("./assets/fonts/montserrat/Montserrat-Regular.ttf"),
				"Montserrat-Bold": require("./assets/fonts/montserrat/Montserrat-Bold.ttf"),
				"Montserrat-Medium": require("./assets/fonts/montserrat/Montserrat-Medium.ttf")
			});

			this.setState({fontsLoaded: true});
		} catch (error) {
			console.error("Error loading custom fonts:", error);
		}
	}

	async componentDidMount() {
		SplashScreen.preventAutoHideAsync();
		await this.loadResources();
		SplashScreen.hideAsync();

		await this.loadCustomFonts();

		if (Platform.OS == "android" || Platform.OS == "ios") {
			const databaseRepository = new DatabaseRepository();
			try {
				// await databaseRepository.init();
				// console.log("Database initialized successfully");
			} catch (error) {
				console.error("Error initializing database:", error);
			}

			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});

			this.logInternetStatusInterval = setInterval(
				() => {
					this.checkInternetStatus();
				},
				5000
			);
		}
	}

	loadResources = async () => {
		try {
			const {theme} = this.state;
			let splashImage;
			if (theme === "dark") {
				splashImage = require("./assets/splash-dark.png");
				SystemUI.setBackgroundColorAsync("#000000");
			} else {
				splashImage = require("./assets/splash.png");
				SystemUI.setBackgroundColorAsync("#ffffff");
			}

			// Preload splash image
			await Asset.loadAsync(splashImage);
			this.setState({splashLoaded: true});
		} catch (e) {
			console.warn(e);
		}
	};

	// 🚨 !important background thread 🚨
	async checkInternetStatus() {
		if (await AsyncStorage.getItem("window") === "Calendar") {
			return;
		}
		
		if (await AsyncStorage.getItem("isDownloaded") != "true") {
			return;
		}

		console.log(
			"Is connected?",
			this.state.isConnected === null
				? "Loading..."
				: this.state.isConnected
					? "Yes"
					: "No"
		);

		if (this.state.isConnected) {
			if (await AsyncStorage.getItem("isRequestInProgress") == "true") {
				return;
			}

			// Internet is available, perform actions
			let isNotSaved = await AsyncStorage.getItem("isNotSaved");
			console.log("Is not saved", isNotSaved);
			let email = await AsyncStorage.getItem("email");

			// Get the current date
			let currentDate = new Date();
			// Extract month and year
			let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-based month
			let year = currentDate.getFullYear();
			let monthYear = `${month}/${year}`;

			if (this.state.notPayed) {

				let isPayed = await this.apiService.getPayment(email, monthYear);
				console.log("Payed: ", isPayed)

				if (isPayed == true) {
					await AsyncStorage.setItem("notPayed", "false")
					await AsyncStorage.setItem("paymentTryCount", "0");

					this.setState({
						notPayed: false
					});
				}
			}

			if (isNotSaved == "true") {

				// this.touchableRef.current && this.touchableRef.current.onPress();
				// Keyboard.dismiss();

				let isPayed =
					await this.apiService.getPayment(email, monthYear);

				console.log("Payed: ", isPayed)

				if (isPayed != undefined) {
					await this.saveData();
				} else {
					console.log("Server ain't working.");
				}

				if (isPayed == false) {
					await AsyncStorage.setItem("notPayed", "true")

					const currentDate = new Date();

					const year = currentDate.getFullYear();
					const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
					const day = ("0" + currentDate.getDate()).slice(-2);
					const hour = ("0" + currentDate.getHours()).slice(-2); // Get current hour

					const dateString = `${year}-${month}-${day}`;

					// await AsyncStorage.removeItem("lastPaymentShownDate");


					let lastPaymentShownDate = await AsyncStorage.getItem("lastPaymentShownDate");
					let lastPaymentShownHour = await AsyncStorage.getItem("lastPaymentShownHour");
					console.log("lastPaymentShownDate::", lastPaymentShownDate);
					console.log("lastPaymentShownHour::", lastPaymentShownHour);


					// (If)
					// Date does not equals
					if (lastPaymentShownDate != dateString) {
						// Hour does not equals and morning and evening work
						if (
							(hour >= 2 && hour <= 5) || (hour >= 20 && hour <= 22) &&
							await AsyncStorage.getItem("lastPaymentShownHour") != hour
						) {
							this.setState({
								notPayed: true
							});
						}
					}
				} else {
					await AsyncStorage.setItem("notPayed", "false")
				}

			}
		}
	}

	async saveData() {
		if (this.state.isSavingStarted == false) {
			this.setState({isSavingStarted: true});

			console.log("CREATING NOT SAVED STARTED");

			try {
				// PRODUCT
				let productNotSaved = await AsyncStorage.getItem("productNotSaved");
				if (productNotSaved == "true") {
					console.log("Product creating ⏳⏳⏳")
					let notSavedProducts =
						await this.productRepository.findProductsBySavedFalse();
					for (const product of notSavedProducts) {
						try {
							let response = await this.apiService.createLocalProduct(
								product.serial_number,
								product.name,
								product.brand_name
							);

							if (!response) {
								return;
							}

							console.log("Response:", response);

							await this.productRepository.updateSavedTrueByProductId(product.id, response.id);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					await AsyncStorage.setItem("productNotSaved", "false")
				}

				// STORE PRODUCT
				let storeProductNotSaved = await AsyncStorage.getItem("storeProductNotSaved");
				if (storeProductNotSaved == "true") {
					console.log("Product setting into store ⏳⏳⏳")

					let storeProducts = await this.storeProductRepository.findByWhereSavedFalse();
					for (const storeProduct of storeProducts) {
						try {
							let products = await this.productRepository.findProductsById(storeProduct.product_id);

							console.log("Products by id:: ", products);

							let response = await this.apiService.createStoreProducts(
								products[0].global_id,
								storeProduct.nds == 1,
								storeProduct.price,
								storeProduct.selling_price,
								null,
								storeProduct.count,
								storeProduct.count_type
							);

							if (!response) {
								return;
							}

							console.log("Response: ", response);
							await this.storeProductRepository.updateSavedTrueById(storeProduct.id, response.id);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}
				}

				let shoppingNotSaved = await AsyncStorage.getItem("shoppingNotSaved");
				if (shoppingNotSaved == "true") {
					let sellHistoryGroups = await this.sellHistoryRepository.getSellHistoryGroupSavedFalse();
					let notSavedSellAmountDates = await this.amountDateRepository.getSellAmountDateSavedFalse();
					let sellGroups = await this.sellHistoryRepository.getSellGroupSavedFalse();
					let sellHistories = await this.sellHistoryRepository.getSellHistorySavedFalse();

					let profitHistoryGroups = await this.profitHistoryRepository.getProfitHistoryGroupSavedFalse();
					let notSavedProfitAmountDates = await this.amountDateRepository.getProfitAmountDateSavedFalse();
					let profitGroups = await this.profitHistoryRepository.getProfitGroupSavedFalse();
					let profitHistories = await this.profitHistoryRepository.getProfitHistorySavedFalse();

					console.log("#SellGroup creating ⏳⏳⏳")
					for (const sellGroup of sellGroups) {
						console.log("Group: ", sellGroup)
						try {
							let response = await this.apiService.createSellGroup(
								sellGroup.created_date,
								sellGroup.amount
							);

							if (!response) {
								return;
							}

							await this.sellHistoryRepository.updateSellGroupSavedTrueById(
								sellGroup.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#SellHistory creating started. ⏳⏳⏳");
					for (const sellHistory of sellHistories) {
						console.log("SellHistory: ", sellHistory);

						try {
							let products = await this.productRepository.findProductsById(sellHistory.product_id);

							console.log("Products: ", products);

							let response = await this.apiService.createSellHistory(
								products[0].global_id,
								sellHistory.count,
								sellHistory.count_type,
								sellHistory.selling_price,
								sellHistory.created_date,
								this.props.navigation
							);

							if (!response) {
								return;
							}

							await this.sellHistoryRepository.updateSellHistorySavedTrueById(
								sellHistory.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#SellHistoryLink creating started. ⏳⏳⏳");
					for (const sellHistoryGroup of sellHistoryGroups) {
						console.log(sellHistoryGroup);
						try {
							let sellHistory = await this.sellHistoryRepository.findSellHistoryById(
								sellHistoryGroup.history_id
							);
							let sellGroup = await this.sellHistoryRepository.findSellGroupById(
								sellHistoryGroup.group_id
							);

							let response = await this.apiService.createSellHistoryGroup(
								sellHistory[0].global_id,
								sellGroup[0].global_id,
								this.props.navigation
							);

							if (!response) {
								return;
							}

							this.sellHistoryRepository.updateSellHistoryGroupSavedTrueById(
								sellHistoryGroup.id,
								response.id
							)
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#SellAmountDate creating started. ⏳⏳⏳");
					for (const sellAmountDate of notSavedSellAmountDates) {
						console.log(sellAmountDate)

						try {

							let response =
								await this.apiService.createSellAmountDate(
									sellAmountDate.date,
									sellAmountDate.amount,
									this.props.navigation
								);

							if (!response) {
								return;
							}

							this.amountDateRepository.updateSellAmountDateSavedTrueById(
								sellAmountDate.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#ProfitGroup creating started. ⏳⏳⏳");
					for (const profitGroup of profitGroups) {
						try {
							let response = await this.apiService.createProfitGroup(
								profitGroup.created_date,
								profitGroup.profit,
								this.props.navigation
							);

							if (!response) {
								return;
							}

							await this.profitHistoryRepository.updateProfitGroupSavedTrueById(
								profitGroup.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#ProfitHistory creating started. ⏳⏳⏳");
					for (const profitHistory of profitHistories) {
						try {
							let products = await this.productRepository.findProductsById(
								profitHistory.product_id
							);

							let response = await this.apiService.createProfitHistory(
								products[0].global_id,
								profitHistory.count,
								profitHistory.count_type,
								profitHistory.profit,
								profitHistory.created_date,
								this.props.navigation
							);

							if (!response) {
								return;
							}

							await this.profitHistoryRepository.updateProfitHistorySavedTrueById(
								profitHistory.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#ProfitHistoryLink creating started. ⏳⏳⏳");
					for (const profitHistoryGroup of profitHistoryGroups) {
						try {
							let profitHistory =
								await this.profitHistoryRepository.findProfitHistoryById(
									profitHistoryGroup.history_id
								);

							let profitGroup =
								await this.profitHistoryRepository.findProfitGroupById(
									profitHistoryGroup.group_id
								);

							let response =
								await this.apiService.createProfitHistoryGroup(
									profitHistory[0].global_id,
									profitGroup[0].global_id,
									this.props.navigation
								);

							if (!response) {
								return;
							}

							this.profitHistoryRepository.updateProfitHistoryGroupSavedTrueById(
								profitHistoryGroup.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}

					console.log("#ProfitAmountDate creating started. ⏳⏳⏳");
					for (const profitAmountDate of notSavedProfitAmountDates) {
						try {
							console.log("PROFIT AMOUNT::", profitAmountDate);

							let response =
								await this.apiService.createProfitAmountDate(
									profitAmountDate.date,
									profitAmountDate.amount,
									this.props.navigation
								);

							this.amountDateRepository.updateProfitAmountDateSavedTrueById(
								profitAmountDate.id,
								response.id
							);
						} catch (e) {
							console.error(e);
							await AsyncStorage.setItem("isFetchingNotCompleated", "true");
							await AsyncStorage.setItem("isNotSaved", "true");
							this.setState({isSavingStarted: false});
							return;
						}
					}
				}

				await AsyncStorage.setItem("shoppingNotSaved", "false");
				await AsyncStorage.setItem("isFetchingNotCompleated", "false");
				this.setState({isSavingStarted: false});
			} catch (e) {
				console.error(e);

				await AsyncStorage.setItem("shoppingNotSaved", "true");
				await AsyncStorage.setItem("isNotSaved", "true");
				this.setState({isSavingStarted: false});
			}
		}
	}
	//###################################################

	componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
		if (this.logInternetStatusInterval) {
			clearInterval(this.logInternetStatusInterval);
		}
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
			notPayed: false
		});
	}

	closeModal() {
		this.setState({
			notPayed: false
		});
	}

	render() {
		const {theme, splashLoaded} = this.state;
		if (!splashLoaded) {
			return (
				<View style={styles.container}>
					<Image
						source={theme === "dark" ? require("./assets/splash-dark.png") : require("./assets/splash.png")}
						style={styles.splashImage}
						resizeMode="contain"
					/>
				</View>
			);
		}

		const {fontsLoaded} = this.state;

		if (!fontsLoaded) {
			return (
				<View style={styles.container}>
					<Image
						source={
							theme === "dark" ?
								require("./assets/splash-dark.png") :
								require("./assets/splash.png")
						}
						style={styles.splashImage}
						resizeMode="contain"
					/>
				</View>
			);
		}

		return (
			<ApplicationProvider  {...eva} theme={eva.light}>
				<GestureHandlerRootView style={{flex: 1}}>
					<SafeAreaView>
							{
								this.state.notPayed == true &&
								(
									<Modal visible={this.state.notPayed}>

										<PaymentForm
											completePayment={async () => {
												await this.completePayment();
											}}

											closeModal={() => {
												this.closeModal();
											}}
										/>

									</Modal>
								)
							}
					</SafeAreaView>

					<NavigationService/>
				</GestureHandlerRootView>
			</ApplicationProvider>

		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	splashImage: {
		width: "100%",
		height: "100%",
	},
});

AppRegistry.registerComponent("Backall", () => App);

export default App;