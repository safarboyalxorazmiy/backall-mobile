import React, { Component } from "react";
import { Appearance, Text, TouchableOpacity, View, Image, Linking, StyleSheet } from "react-native";
import { AppRegistry } from "react-native";
import Constants from 'expo-constants';  // Import Constants
import { Platform } from "react-native";
import * as Font from "expo-font";
import NetInfo from "@react-native-community/netinfo";
import NavigationService from "./service/NavigationService";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TokenService from "./service/TokenService";
import DatabaseRepository from "./repository/DatabaseRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductRepository from "./repository/ProductRepository";
import ApiService from "./service/ApiService";
import StoreProductRepository from "./repository/StoreProductRepository";
import SellHistoryRepository from "./repository/SellHistoryRepository";
import ProfitHistoryRepository from "./repository/ProfitHistoryRepository";
import AmountDateRepository from "./repository/AmountDateRepository";
import RightArrow from "./assets/right-arrow.svg";
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

const tokenService = new TokenService();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false,
      isConnected: null,
      isSavingStarted: false,
			notPayed: false,

			theme: Appearance.getColorScheme(),
      splashLoaded: false
    };

    if (this.props.navigation) {
      let isLoggedIn = tokenService.checkTokens();

			if (!isLoggedIn) {
				this.props.navigation.navigate("Login");
			} 
    } 

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
      });

      this.setState({ fontsLoaded: true });
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
        this.setState({ isConnected: state.isConnected });
      });

      this.logInternetStatusInterval = setInterval(
        this.checkInternetStatus,
        5000
      );
    }
  }

	loadResources = async () => {
    try {
      const { theme } = this.state;
      let splashImage;
      if (theme === 'dark') {
        splashImage = require('./assets/splash-dark.png');
        SystemUI.setBackgroundColorAsync('#000000');
      } else {
        splashImage = require('./assets/splash.png');
        SystemUI.setBackgroundColorAsync('#ffffff');
      }

      // Preload splash image
      await Asset.loadAsync(splashImage);
      this.setState({ splashLoaded: true });
    } catch (e) {
      console.warn(e);
    }
  };

  async checkInternetStatus() {
    console.log(
      "Is connected?",
      this.state.isConnected === null
        ? "Loading..."
        : this.state.isConnected
        ? "Yes"
        : "No"
    );

    if (this.state.isConnected) {
			// Internet is available, perform actions
			let isNotSaved = await AsyncStorage.getItem("isNotSaved");
			console.log("Is not saved", isNotSaved);
			let email = await AsyncStorage.getItem("email");
			
			// Get the current date
			let currentDate = new Date();
			// Extract month and year
			let month = String(currentDate.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month
			let year = currentDate.getFullYear();
			let monthYear = `${month}/${year}`;
			
			if (this.state.notPayed) {
				const {navigation} = this.props;
				
				let isPayed = await this.apiService.getPayment(email, monthYear, navigation);
				console.log("Payed: ", isPayed)
				
				if (isPayed == true) {						
					this.setState({
						notPayed: false
					})
				}
			}
		
			if (isNotSaved == "true") {

				console.log(email)
				
				
				const {navigation} = this.props;
				let isPayed = await this.apiService.getPayment(email, monthYear, navigation);
				console.log("Payed: ", isPayed)
				if (isPayed == false) {
					this.setState({
						notPayed: true
					})
				}
		
				await this.saveData();
			}
		}
  }

  async saveData() {
		if (!this.state.isSavingStarted) {
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
								product.brand_name, 
								this.props.navigation
							);

							if (!response) {
								return;
							}

							console.log("Response:", response);

							await this.productRepository.updateSavedTrueByProductId(product.id, response.id);
						} catch (e) {
							console.error(e)
							continue;
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
								storeProduct.count_type, 
								this.props.navigation
							);

							if (!response) {
								return;
							}

							console.log("Response: ", response);
							await this.storeProductRepository.updateSavedTrueById(storeProduct.id, response.id);
						} catch (e) {
							console.error(e)
							continue;
						}
					}
				}

				// SELL GROUP
				let sellGroupNotSaved = await AsyncStorage.getItem("sellGroupNotSaved");
				if (sellGroupNotSaved == "true") {
					console.log("Sell group creating ⏳⏳⏳")

					let sellGroups = await this.sellHistoryRepository.getSellGroupSavedFalse();
					for (const sellGroup of sellGroups) {
						console.log("Group: ", sellGroup)
						try {
							let response = await this.apiService.createSellGroup(
								sellGroup.created_date, 
								sellGroup.amount, 
								this.props.navigation
							);

							if (!response) {
								return;
							}

							await this.sellHistoryRepository.updateSellGroupSavedTrueById(
								sellGroup.id, 
								response.id
							);
						} catch (e) {
							console.error(e)
							continue;
						}
					}
				}

				// SELL HISTORY
				let sellHistoryNotSaved = await AsyncStorage.getItem("sellHistoryNotSaved");
				if (sellHistoryNotSaved == "true") {
					console.log("Sell history creating started. ⏳⏳⏳");
					
					let sellHistories = await this.sellHistoryRepository.getSellHistorySavedFalse();
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
							console.error(e)
							continue;
						}
					}
				}

				// SELL HISTORY GROUP
				let sellHistoryGroupNotSaved = await AsyncStorage.getItem("sellHistoryGroupNotSaved");
				if (sellHistoryGroupNotSaved == "true") {
					console.log("Sell history group creating started. ⏳⏳⏳");

					let sellHistoryGroups = 
						await this.sellHistoryRepository.getSellHistoryGroupSavedFalse();
					for (const sellHistoryGroup of sellHistoryGroups) {
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
							console.error(e)
							continue;
						}
					}
				}

				// SELL AMOUNT DATE
				let sellAmountDateNotSaved = await AsyncStorage.getItem("sellAmountDateNotSaved");
				if (sellAmountDateNotSaved == "true") {
					console.log("Sell amount date creating started. ⏳⏳⏳");

					let notSavedSellAmountDates = 
						await this.amountDateRepository.getSellAmountDateSavedFalse();
					for (const sellAmountDate of notSavedSellAmountDates) {
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
							continue;
						}
					}
				}

				// PROFIT GROUP
				let profitGroupNotSaved = await AsyncStorage.getItem("profitGroupNotSaved");
				if (profitGroupNotSaved == "true") {
					console.log("Profit group date creating started. ⏳⏳⏳");

					let profitGroups = await this.profitHistoryRepository.getProfitGroupSavedFalse();
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
							console.error(e)
							continue;
						}
					}
				}

				// PROFIT HISTORY
				let profitHistoryNotSaved = await AsyncStorage.getItem("profitHistoryNotSaved");
				if (profitHistoryNotSaved == "true") {
					console.log("Profit history creating started. ⏳⏳⏳");

					let profitHistories = await this.profitHistoryRepository.getProfitHistorySavedFalse();
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
							console.error(e)
							continue;
						}
					}
				}

				// PROFIT HISTORY GROUP
				let profitHistoryGroupNotSaved = await AsyncStorage.getItem("profitHistoryGroupNotSaved");
				if (profitHistoryGroupNotSaved == "true") {
					console.log("Profit history group creating started. ⏳⏳⏳");

					let profitHistoryGroups = 
						await this.profitHistoryRepository.getProfitHistoryGroupSavedFalse();
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
							console.error(e)
							continue;
						}
					}
				}

				let profitAmountDateNotSaved = await AsyncStorage.getItem("profitAmountDateNotSaved");
				if (profitAmountDateNotSaved == "true") {
					console.log("Profit amount date creating started. ⏳⏳⏳");

					let notSavedProfitAmountDates = 
						await this.amountDateRepository.getProfitAmountDateSavedFalse();
					for (const profitAmountDate of notSavedProfitAmountDates) {
						try {
							console.log("PROFIT AMOUNT::", profitAmountDate);
							
							let response = 
								await this.apiService.createSellAmountDate(
									profitAmountDate.date,
									profitAmountDate.amount, 
									this.props.navigation
								);

							this.amountDateRepository.updateProfitAmountDateSavedTrueById(
								profitAmountDate.id,
								response.id
							);
						} catch (e) {
							console.error(e)
							continue;
						}
					}
				}

				await AsyncStorage.setItem("isNotSaved", "false");
				this.setState({isSavingStarted: false});
			} catch (e) {
				console.error(e);	
				await AsyncStorage.setItem("isNotSaved", "true");
				this.setState({isSavingStarted: false});
			}
		}
	}

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.logInternetStatusInterval) {
      clearInterval(this.logInternetStatusInterval);
    }
  }

  render() {
		const { theme, splashLoaded } = this.state;
    if (!splashLoaded) {
      return (
				<View style={styles.container}>
					<Image
						source={theme === 'dark' ? require('./assets/splash-dark.png') : require('./assets/splash.png')}
						style={styles.splashImage}
						resizeMode="contain"
					/>
				</View>
			); // Or a loading indicator if preferred
    }

    const { fontsLoaded } = this.state;

    if (!fontsLoaded) {
      return (
				<View style={styles.container}>
					<Image
						source={theme === 'dark' ? require('./assets/splash-dark.png') : require('./assets/splash.png')}
						style={styles.splashImage}
						resizeMode="contain"
					/>
				</View>
			);
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
				{
					this.state.notPayed && (<View style={{
						width: "100%", 
						height: "100%", 
						backgroundColor: "#181926", 
						paddingTop: 100,
						paddingHorizontal: 16
					}}>
						<Text style={{
							color: "white",
							fontFamily: "Gilroy-SemiBold",
							fontSize: 38
						}}>Oylik abonent to'lovi muddati keldi!</Text>
						<Image
							source={require("./assets/cards.png")}
							style={{width: 367, height: 254, marginTop: 50}}
						/>
						<View style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingTop: 24,
							borderTopWidth: 2,
							borderTopColor: "#07070A",
							marginTop: 40
						}}>
							<Text style={{
								color: "white",
								fontFamily: "Gilroy-Bold",
								fontSize: 24
							}}>JAMI</Text>
	
							<View style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "flex-end",
							}}>
								<Text style={{
									color: "white",
									fontFamily: "Gilroy-Regular",
									fontSize: 24
								}}>126,529.30 </Text>
	
								<Text style={{
									color: "white",
									fontFamily: "Gilroy-Regular",
									fontSize: 20
								}}>so’m</Text>
							</View>
						</View>
	
						<TouchableOpacity 
							style={{
								backgroundColor: "black",
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								gap: 26,
								padding: 16,
								borderRadius: 8,
								marginTop: 18
							}}
							onPress={() => {
								Linking.openURL('https://t.me/backall_admin');
							}}>
							<Text style={{
								fontSize: 18,
								fontFamily: "Gilroy-Black",
								color: "white"
							}}>TO'LASH</Text>
							<RightArrow />
						</TouchableOpacity>
					</View>)
				}

        <NavigationService />
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});

AppRegistry.registerComponent("Backall", () => App);

export default App;