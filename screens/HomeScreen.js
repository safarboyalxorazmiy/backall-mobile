import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	Animated,
	TouchableOpacity,
	Platform
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";
import DatabaseService from '../service/DatabaseService';
import AmountDateRepository from "../repository/AmountDateRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TokenService from '../service/TokenService';
import Modal from "react-native-modal";
import Spinner from 'react-native-loading-spinner-overlay';
import ApiService from "../service/ApiService";
import ProductRepository from "../repository/ProductRepository";
import NetInfo from "@react-native-community/netinfo";
import SellHistoryRepository from "../repository/SellHistoryRepository";
import ProfitHistoryRepository from "../repository/ProfitHistoryRepository";
import StoreProductRepository from "../repository/StoreProductRepository";

import MenuIcon from "../assets/menu-icon 2.svg";
import LogoutIcon from "../assets/logout-icon.svg";
import CrossIcon from "../assets/cross-icon.svg";
import DatabaseRepository from "../repository/DatabaseRepository";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Home extends Component {
	constructor(state) {
		super(state);
		
		this.state = {
			shoppingCardColors: ["#E59C0D", "#FDD958"],
			profitCardColors: ["#2C8134", "#1DCB00"],
			profitAmount: 0,
			sellAmount: 0,
			notAllowed: "",
			animation: new Animated.Value(0),
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
		}
		
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.storeProductRepository = new StoreProductRepository();
		this.databaseRepository = new DatabaseRepository();
		this.tokenService = new TokenService();

		this.getAmountInfo();
		this.animatedValue = new Animated.Value(0);
	}

	startAnimation = () => {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Note: Native driver is not supported for changing borderRadius
    }).start();
  };
	
	async componentDidMount() {
		this.unsubscribe = NetInfo.addEventListener((state) => {
			this.setState({isConnected: state.isConnected});
		});

		const {navigation} = this.props;
		navigation.addListener("focus", 
			async () => {
				// await AsyncStorage.clear();

				let isLoggedIn = await this.tokenService.checkTokens()
				if (isLoggedIn) {
					let isDownloaded = await AsyncStorage.getItem("isDownloaded");
					if (isDownloaded != "true" && isDownloaded != null) {
						// LOAD..
	
						let intervalId = setInterval(async () => {
							if (this.state.isConnected) { // Has internet connection
								console.log(this.state.isDownloaded)
								if (this.state.isDownloaded === "true") {
									clearInterval(intervalId);
									console.log("CLEARED");
									return;
								}
		
								if (this.state.isLoading) { // is loading don't load again
									return;
								}
		
								console.log("LOADING STARTED")
								this.setState({ // loading started
									isLoading: true
								})
								this.setState({spinner: true});
								
								let isDownloaded = 
									await this.getLocalProducts() && 
									await this.getGlobalProducts() && 
									await this.getStoreProducts() &&
									await this.getSellGroups() &&
									await this.getSellHistories() &&
									await this.getSellHistoryGroup() &&
									await this.getSellAmountDate() &&
									await this.getProfitGroups() &&
									await this.getProfitHistories() &&
									await this.getProfitHistoryGroup() &&
									await this.getProfitAmountDate();

								// storing result of product storing
								await AsyncStorage.setItem("isDownloaded", isDownloaded.toString());
						
								this.setState({ // loading finished
									isLoading: false,
									isDownloaded: isDownloaded.toString()
								});
								console.log("LOADING FINISHED");
						
								this.setState({spinner: false});
							}
						}, 5000);
					}
	
					await this.getAmountInfo();
	
					let notAllowed = await AsyncStorage.getItem("not_allowed");
					this.setState({notAllowed: notAllowed})
				}
			}
		);
	}

	// PRODUCT PAGINATION
	async getLocalProducts() {
		let products = [];
		let size = this.state.lastLocalProductsSize;
		let page = this.state.lastLocalProductsPage;
	
		while (true) {
			let downloadedProducts;
			try {
				downloadedProducts = await this.apiService.getLocalProducts(page, size);
			} catch (error) {
				console.error("Error fetching local products:", error);
				return false;
			}
	
			if (
				!downloadedProducts || 
				!downloadedProducts.content || 
				downloadedProducts.content.length === 0
			) {
				console.log(products);
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
					console.error("Error creating local product:", error);
				}
			}

			page++;
			products.push(downloadedProducts);
		}

		return true;
	}

	async getGlobalProducts() {
		let products = [];
		let size = this.state.lastGlobalProductsSize;
		let page = this.state.lastGlobalProductsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getGlobalProducts(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(products);
				return true; // Indicate success and exit the loop
			}
	
			for (const product of response.content) {
				try {
					let bySerialNumber = await this.productRepository.findProductsBySerialNumberAndSavedTrue(product.serialNumber);
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
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			products.push(response);
		}
	}

	async getStoreProducts() {
		let storeProducts = [];
		let size = this.state.lastStoreProductsSize;
		let page = this.state.lastStoreProductsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getStoreProducts(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(storeProducts);
				return true; // Indicate success and exit the loop
			}
	
			for (const storeProduct of response.content) {
				try {
					let products = await this.productRepository.findProductsByGlobalId(storeProduct.productId)
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
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			storeProducts.push(response);
		}
	}

	// SELL PAGINATION
	async getSellGroups() {
		let sellGroups = [];
		let size = this.state.lastSellGroupsSize;
		let page = this.state.lastSellGroupsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellGroups(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(sellGroups);
				return true; // Indicate success and exit the loop
			}
	
			for (const sellGroup of response.content) {
				try {
					await this.sellHistoryRepository.createSellHistoryGroupWithAllValues(
						sellGroup.createdDate,
						sellGroup.amount,
						sellGroup.id,
						true
					);
				} catch (error) {
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellGroups.push(response);
		}
	}

	async getSellHistories() {
		let sellHistories = [];
		let size = this.state.lastSellHistoriesSize;
		let page = this.state.lastSellHistoriesPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistories(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(sellHistories);
				return true; // Indicate success and exit the loop
			}
	
			for (const sellHistory of response.content) {
				try {
					await this.sellHistoryRepository.createSellHistoryWithAllValues(
						sellHistory.productId,
						sellHistory.id,
						sellHistory.count,
						sellHistory.countType,
						sellHistory.sellingPrice,
						sellHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellHistories.push(response);
		}
	}

	async getSellHistoryGroup() {
		let sellHistoryGroup = [];
		let size = this.state.lastSellHistoryGroupSize;
		let page = this.state.lastSellHistoryGroupPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistoryGroup(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(sellHistoryGroup);
				return true; // Indicate success and exit the loop
			}
	
			for (const sellHistoryGroup of response.content) {
				try {
					await this.sellHistoryRepository.createSellHistoryGroupWithAllValues(
						sellHistoryGroup.sellHistoryId,
						sellHistoryGroup.sellGroupId,
						sellHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellHistoryGroup.push(response);
		}
	}

	async getSellAmountDate() {
		let sellAmountDate = [];
		let size = this.state.lastSellAmountDateSize;
		let page = this.state.lastSellAmountDatePage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellAmountDate(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(sellAmountDate);
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
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellAmountDate.push(response);
		}
	}

	// PROFIT
	async getProfitGroups() {
		let profitGroups = [];
		let size = this.state.lastProfitGroupsSize;
		let page = this.state.lastProfitGroupsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitGroups(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(profitGroups);
				return true; // Indicate success and exit the loop
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
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitGroups.push(response);
		}
	}

	async getProfitHistories() {
		let profitHistories = [];
		let size = this.state.lastProfitHistoriesSize;
		let page = this.state.lastProfitHistoriesPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistories(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(profitHistories);
				return true; // Indicate success and exit the loop
			}
	
			for (const profitHistory of response.content) {
				try {
					await this.profitHistoryRepository.createProfitHistoryWithAllValues(
						profitHistory.productId,
						profitHistory.id,
						profitHistory.count,
						profitHistory.countType,
						profitHistory.profit,
						profitHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error processing product:", error);
					continue;
				}
			}
	
			page++;
			profitHistories.push(response);
		}
	}
	
	async getProfitHistoryGroup() {
		let profitHistoryGroup = [];
		let size = this.state.lastProfitHistoryGroupSize;
		let page = this.state.lastProfitHistoryGroupPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistoryGroup(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(profitHistoryGroup);
				return true; // Indicate success and exit the loop
			}
	
			for (const profitHistoryGroup of response.content) {
				try {
					await this.profitHistoryRepository.createProfitHistoryGroup(
						profitHistoryGroup.sellHistoryId,
						profitHistoryGroup.sellGroupId,
						profitHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitHistoryGroup.push(response);
		}
	}

	async getProfitAmountDate() {
		let profitAmountDate = [];
		let size = this.state.lastProfitAmountDateSize;
		let page = this.state.lastProfitAmountDatePage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitAmountDate(page, size);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});
				
				return false; // Indicate failure
			}
	
			if (!response || !response.content || response.content.length === 0) {
				console.log(profitAmountDate);
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
					console.error("Error processing product:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitAmountDate.push(response);
		}
	}

	async getAmountInfo() {
		// HOW TO GET yyyy-mm-dd from new Date()
		
		// Get the current date
		const currentDate = new Date();
		
		// Extract year, month, and day
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, '0');
		
		// Format the date as yyyy-mm-dd
		const formattedDate = `${year}-${month}-${day}`;
		
		
		let profitAmountInfo = await this.amountDateRepository.getProfitAmountInfoByDate(formattedDate);
		let sellAmountInfo = await this.amountDateRepository.getSellAmountInfoByDate(formattedDate);
				
		this.setState({
			profitAmount: profitAmountInfo,
			sellAmount: sellAmountInfo
		})
	}
	
	render() {
		const {navigation} = this.props;
		this.tokenService.checkTokens(navigation);

		const translateY = this.state.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100] // Adjust the value as needed
		});

		const backgroundColor = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFF', '#F1F1F1'],
    });
		
		return (
			<>
				<Spinner
						visible={this.state.spinner}
						textContent={'Yuklanyapti 10%'}
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
									this.setState({
										menuOpened: true
									})

									this.startAnimation()
								}}
								onPressIn={() => {
									this.setState(
										{menuFocused: true}
									)

									this.startAnimation()
								}}

								onPressOut={() => {
									this.setState(
										{menuFocused: false}
									)

									this.startAnimation();
								}}

								activeOpacity={1}>
								<Animated.View 
									style={this.state.menuFocused ? {
										backgroundColor: backgroundColor,
										padding: 10,
										paddingVertical: 15,
										borderRadius: 50,
									} : styles.menuIcon}>
									<MenuIcon />
								</Animated.View>
							</TouchableOpacity>
						</View>
						
						<View style={styles.cards}>
							<TouchableOpacity
								activeOpacity={1}
								onPressIn={() => {
									this.setState({shoppingCardColors: ["#E59C0D", "#E59C0D"]})
								}}
								onPressOut={() => {
									this.setState({shoppingCardColors: ["#E59C0D", "#FDD958"]})
								}}
								onPress={() => navigation.navigate("Shopping")}>
								<LinearGradient
									colors={this.state.shoppingCardColors}
									start={{x: 0, y: 0.5}}
									style={styles.card}>
									
									<View style={styles.shoppingIconWrapper}>
										{Platform.OS === 'android' || Platform.OS === 'ios' ? (
											<ShoppingIcon
												style={styles.shoppingIcon}
												resizeMode="cover"/>
										) : (
											<ShoppingIcon
												style={styles.shoppingIcon}/>
										)}
									</View>
									
									<Text
										style={styles.cardTitle}>Bugungi kirim</Text>
									<Text
										style={styles.cardDescription}>
										{this.state.sellAmount}
										<Text
											style={styles.currency}>UZS</Text>
									</Text>
								</LinearGradient>
							</TouchableOpacity>
							
							<TouchableOpacity
								activeOpacity={1}
								onPressIn={() => {
									this.setState({profitCardColors: ["#1EC703", "#1EC703"]})
								}}
								onPressOut={() => {
									this.setState({profitCardColors: ["#2C8134", "#1DCB00"]})
								}}
								onPress={() => {
									navigation.navigate("Profit")
								}}>
								<LinearGradient
									style={styles.card}
									colors={this.state.profitCardColors}
									start={{x: 0, y: 0.5}}
								>
									<View style={styles.benefitIconWrapper}>
										{Platform.OS === 'android' || Platform.OS === 'ios' ? (
											<BenefitIcon
												style={styles.benefitIcon}
												resizeMode="cover"/>
										) : (
											<BenefitIcon
												style={styles.benefitIcon}/>
										)}
									</View>
									<Text
										style={styles.cardTitle}>Bugungi foyda</Text>
									<Text
										style={styles.cardDescription}>
										{this.state.profitAmount}
										<Text
											style={styles.currency}>UZS</Text>
									</Text>
								</LinearGradient>
							</TouchableOpacity>
						
						</View>
						<StatusBar style="auto"/>
					</View>

					<Modal
						visible={this.state.notAllowed === "true"}
						animationIn={"slideOutUp"}
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

							<View style={{
								height: screenHeight,
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<Animated.View style={{
									width: screenWidth - (16 * 2),
									maxWidth: 343,
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "center",
									justifyContent: "flex-end",
									marginBottom: 120,
									transform: [{translateY}]
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
								</Animated.View>
							</View>
					</Modal>

					<Modal
						visible={this.state.menuOpened}
						animationIn={"slideInUp"}
						animationOut={"slideInDown"}
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

							<View style={{
								height: screenHeight,
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<Animated.View style={{
									width: screenWidth,
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "center",
									justifyContent: "flex-end",
									marginBottom: 0,
									marginLeft: "-5.5%"
								}}>
									<View style={{
										width: "100%",
										height: 500,
										display: "flex",
										justifyContent: "space-between",
										paddingTop: 40,
										borderRadius: 0,
										backgroundColor: "#fff",
										borderTopRightRadius: 20,
										borderTopLeftRadius: 20
									}}>
										<View style={{
											height: 24,
											width: "100%",
											display: "flex",
											alignItems: "flex-end",
											justifyContent: "flex-end",
											marginBottom: 24,
										}}>
										<TouchableOpacity 
											onPressIn={() => {
												this.startAnimation();
												this.setState({
													crossFocused: true
												})
											}}

											onPressOut={() => {
												this.setState({
													crossFocused: false
												})
											}}

											activeOpacity={1}
											
											onPress={async() => {
												this.setState({menuOpened: false});
											}}>
											<Animated.View style={this.state.crossFocused ? {
												backgroundColor: backgroundColor,
												borderRadius: 50,
												padding: 20
											} : {
												backgroundColor: "#FFF",
												borderRadius: 50,
												padding: 20
											}}>
												<CrossIcon/>
											</Animated.View>

										</TouchableOpacity>
									</View>

										<TouchableOpacity
											style={{
												display: "flex",
												alignItems: "center",
												height: 55,
												justifyContent: "center",
												backgroundColor: "#fff",
												width: "100%",
												borderRadius: 12,
												paddingHorizontal: 30,
												borderTopWidth: 1,
												borderTopColor: "#F1F1F1",
												display: "flex",
												flexDirection: "row",
												gap: 17,
											}}
											onPress={async () => {
												await this.databaseRepository.clear();
												await AsyncStorage.clear();

												this.setState({
													shoppingCardColors: ["#E59C0D", "#FDD958"],
													profitCardColors: ["#2C8134", "#1DCB00"],
													profitAmount: 0,
													sellAmount: 0,
													notAllowed: "",
													animation: new Animated.Value(0),
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
												await this.tokenService.checkTokens(navigation);
											}}>
												<LogoutIcon />
											<Text
												style={{
													fontFamily: "Gilroy-Bold",
													fontSize: 18,
													color: "#D93E3C",
												}}>Hammasini tozalash va chiqish</Text>
										</TouchableOpacity>
									</View>
								</Animated.View>
							</View>
					</Modal>
				</>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 52
	},
	
	header : {
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
		padding: 10,
		paddingVertical: 15,
		borderRadius: 50
	},

	pageTitle: {
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		textAlign: "center",
	},

	shoppingIconWrapper: {
		width: 141,
		height: 141,
		borderRadius: 100,
		backgroundColor: "#F8E08D",
		position: "absolute",
		right: -70,
		top: -70,
		shadowColor: "rgba(0, 0, 0, 0.05)",
		shadowOffset: {
			width: -10,
			height: 10,
		},
		shadowOpacity: 1,
		shadowRadius: 20,
		elevation: 5
	},
	
	shoppingIcon: {
		position: "absolute",
		bottom: 28,
		left: 25
	},
	
	benefitIconWrapper: {
		width: 141,
		height: 141,
		borderRadius: 100,
		backgroundColor: "#1EC703",
		position: "absolute",
		right: -70,
		top: -70,
		elevation: 5,
		shadowColor: "rgba(0, 0, 0, 0.05)",
		shadowOffset: {
			width: -10,
			height: 10,
		},
		shadowRadius: 20
	},
	
	benefitIcon: {
		position: "absolute",
		bottom: 28,
		left: 25,
		zIndex: 1
	},
	
	cards: {
		width: screenWidth - (24 + 24)
	},
	
	card: {
		paddingTop: 24,
		paddingLeft: 24,
		paddingBottom: 24,
		marginBottom: 25,
		borderRadius: 12,
		position: "relative",
		overflow: "hidden"
	},
	
	cardTitle: {
		color: "white",
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		marginBottom: 10,
		textTransform: "uppercase"
	},
	
	cardDescription: {
		color: "white",
		fontSize: 24,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600"
	},
	
	currency: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		marginLeft: 4
	}
});

export default Home;