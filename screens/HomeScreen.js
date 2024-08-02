import React, { Component } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Platform,
	ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Home extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
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

			menuFocused: false,
			crossFocused: false,
			menuOpened: false
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
	}

	async componentDidMount() {	
		const {navigation} = this.props;

		this.unsubscribe = NetInfo.addEventListener((state) => {
			this.setState({isConnected: state.isConnected});
		});

		navigation.addListener("focus", async () => {
			// ROLE ERROR
			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed});

			if (this.unsubscribe) {
        this.unsubscribe();
			}

			this.unsubscribe = NetInfo.addEventListener((state) => {
				this.setState({isConnected: state.isConnected});
			});

			console.log("HOME NAVIGATED");

			await this.getAmountInfo();

			let isDownloaded = await AsyncStorage.getItem("isDownloaded");
			if (isDownloaded !== "true" || isDownloaded == null) {
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
				this.setState({ notAllowed: notAllowed });
			} 
		}
	});
	
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
	
				this.setState({ isLoading: true }); // loading started
	
				let isDownloaded = true;
	
				isDownloaded = isDownloaded && await this.getLocalProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getGlobalProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getStoreProducts();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellGroups();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellHistories();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellHistoryGroup();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getSellAmountDate();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getProfitGroups();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getProfitHistories();
				this.setState({spinner: true})
				isDownloaded = isDownloaded && await this.getProfitHistoryGroup();
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

		let products = [];
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
					console.error("Error creating local products:", error);
				}
			}

			page++;
			products.push(downloadedProducts);
		}

		return true;
	}

	async getGlobalProducts() {
		console.log("GETTING GLOBAL PRODUCTS ⏳⏳⏳")

		let products = [];
		let size = this.state.lastGlobalProductsSize;
		let page = this.state.lastGlobalProductsPage;
	
		while (true) {
			let response;
			try {
				response = 
					await this.apiService.getGlobalProducts(page, size, this.props.navigation);
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
					console.error("Error getGlobalProducts:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			products.push(response);
		}
	}

	async getStoreProducts() {
		console.log("GETTING STORE PRODUCTS ⏳⏳⏳");

		let storeProducts = [];
		let size = this.state.lastStoreProductsSize;
		let page = this.state.lastStoreProductsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getStoreProducts(page, size, this.props.navigation);
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
					console.error("Error getStoreProducts:", error);
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
		console.log("GETTING SELL GROUPS ⏳⏳⏳");

		let sellGroups = [];
		let size = this.state.lastSellGroupsSize;
		let page = this.state.lastSellGroupsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellGroups(page, size, this.props.navigation);
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
					await this.sellHistoryRepository.createSellGroupWithAllValues(
						sellGroup.createdDate,
						sellGroup.amount,
						sellGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getSellGroups:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellGroups.push(response);
		}
	}

	async getSellHistories() {
		console.log("GETTING SELL HISTORIES ⏳⏳⏳");

		let sellHistories = [];
		let size = this.state.lastSellHistoriesSize;
		let page = this.state.lastSellHistoriesPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistories(page, size, this.props.navigation);
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
				let productsByGlobalId = await this.productRepository.findProductsByGlobalId(sellHistory.productId);
				try {
					await this.sellHistoryRepository.createSellHistoryWithAllValues(
						productsByGlobalId[0].id,
						sellHistory.id,
						sellHistory.count,
						sellHistory.countType,
						sellHistory.sellingPrice,
						sellHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error getSellHistories:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellHistories.push(response);
		}
	}

	async getSellHistoryGroup() {
		console.log("GETTING SELL HISTORY GROUP ⏳⏳⏳");

		let sellHistoryGroup = [];
		let size = this.state.lastSellHistoryGroupSize;
		let page = this.state.lastSellHistoryGroupPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistoryGroup(page, size, this.props.navigation);
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
				let sellGroupId = await this.sellHistoryRepository.findSellGroupByGlobalId(sellHistoryGroup.sellGroupId);
				let sellHistoryId = await this.sellHistoryRepository.findSellHistoryByGlobalId(sellHistoryGroup.sellHistoryId);

				try {
					await this.sellHistoryRepository.createSellHistoryGroupWithAllValues(
						sellHistoryId[0].id,
						sellGroupId[0].id,
						sellHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getSellHistoryGroup:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			sellHistoryGroup.push(response);
		}
	}

	async getSellAmountDate() {
		console.log("GETTING SELL AMOUNT DATE ⏳⏳⏳");

		let sellAmountDate = [];
		let size = this.state.lastSellAmountDateSize;
		let page = this.state.lastSellAmountDatePage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getSellAmountDate(page, size, this.props.navigation);
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
					console.error("Error getSellAmountDate:", error);
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
		console.log("GETTING PROFIT GROUPS ⏳⏳⏳");

		let profitGroups = [];
		let size = this.state.lastProfitGroupsSize;
		let page = this.state.lastProfitGroupsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitGroups(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching getProfitGroups():", error);
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
					console.error("Error getProfitGroups:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitGroups.push(response);
		}
	}

	async getProfitHistories() {
		console.log("GETTING PROFIT HISTORIES ⏳⏳⏳");

		let profitHistories = [];
		let size = this.state.lastProfitHistoriesSize;
		let page = this.state.lastProfitHistoriesPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistories(page, size, this.props.navigation);
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
				console.log("PROFIT HISTORY FROM BACKEND::", profitHistory);
				try {
					let localProductsById = await this.productRepository.findProductsByGlobalId(profitHistory.productId);

					console.log("LOCAL PRODUCTS FOUND::", localProductsById);

					await this.profitHistoryRepository.createProfitHistoryWithAllValues(
						localProductsById[0].id,
						profitHistory.id,
						profitHistory.count,
						profitHistory.countType,
						profitHistory.profit,
						profitHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error getProfitHistories:", error);
					continue;
				}
			}
	
			page++;
			profitHistories.push(response);
		}
	}
	
	async getProfitHistoryGroup() {
		console.log("GETTING PROFIT HISTORY GROUP ⏳⏳⏳")
		let profitHistoryGroup = [];
		let size = this.state.lastProfitHistoryGroupSize;
		let page = this.state.lastProfitHistoryGroupPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistoryGroup(page, size, this.props.navigation);
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
				let profitGroupId = await this.profitHistoryRepository.findProfitGroupByGlobalId(profitHistoryGroup.profitGroupId);
			 	let profitHistoryId = await this.profitHistoryRepository.findProfitHistoryByGlobalId(profitHistoryGroup.profitHistoryId);

				try {
					await this.profitHistoryRepository.createProfitHistoryGroupWithAllValues(
						profitHistoryId[0].id,
						profitGroupId[0].id,
						profitHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getProfitHistoryGroup:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitHistoryGroup.push(response);
		}
	}

	async getProfitAmountDate() {
		console.log("GETTING PROFIT AMOUNT DATE ⏳⏳⏳");

		let profitAmountDate = [];
		let size = this.state.lastProfitAmountDateSize;
		let page = this.state.lastProfitAmountDatePage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitAmountDate(page, size, this.props.navigation);
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
					console.error("Error getProfitAmountDate:", error);
					// Continue with next product
					continue;
				}
			}
	
			page++;
			profitAmountDate.push(response);
		}
	}

	async getAmountInfo() {
		await this.amountDateRepository.init();

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
									this.setState({
										menuOpened: true
									})

								}}
								onPressIn={() => {
									this.setState(
										{menuFocused: true}
									)

								}}

								onPressOut={() => {
									this.setState(
										{menuFocused: false}
									)

								}}

								activeOpacity={1}>
								<View 
									style={this.state.menuFocused ? {
										backgroundColor: "black",
										padding: 10,
										paddingVertical: 15,
										borderRadius: 50,
									} : styles.menuIcon}>
									<MenuIcon />
								</View>
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
										{Platform.OS === "android" || Platform.OS === "ios" ? (
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
										{Platform.OS === "android" || Platform.OS === "ios" ? (
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
						visible={this.state.menuOpened}
						// animationIn={"slideInUp"}
						// animationOut={"slideInDown"}
						// animationInTiming={200}
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
								<View style={{
									width: screenWidth,
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "center",
									justifyContent: "flex-end",
									marginLeft: "-5.5%"
								}}>
									<Animatable.View 
										animation="slideInUp" 
										delay={0.4} 
										// duration={1}
										iterationCount={1} 
										direction={"alternate"} 
										// easing={"ease-in"}
										style={ !this.state.menuOpened ? {
											marginBottom: -500
										} : {
											width: "100%",
											marginBottom: (
												screenHeight >= 750 ? 0 : 
												screenHeight >= 600 ? 10 : 
												10
											),
											borderRadius: 0,
											borderTopRightRadius: 20,
											borderTopLeftRadius: 20,
											backgroundColor: "#FFF",
										}}>
											<View style={{
												height: 500,
												display: "flex",
												justifyContent: "space-between",
												paddingTop: 40,
											}}>
												<View style={{
													height: 24,
													width: "100%",
													display: "flex",
													alignItems: "flex-end",
													justifyContent: "flex-end",
													// marginBottom: 24,
												}}>
													<TouchableOpacity 
														onPressIn={() => {
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

														<View style={this.state.crossFocused ? {
															backgroundColor: "#FAFAFA",
															borderRadius: 50,
															padding: 20,

															// how to add transition.
														} : {
															backgroundColor: "transparent",
															borderRadius: 50,
															padding: 20
														}}>
															<CrossIcon/>
														</View>

													</TouchableOpacity>
												</View>

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
																display: "flex",
																flexDirection: "row",
																gap: 17
															}, this.state.clearButtonFocused ? {
																backgroundColor: "#FAFAFA"
															}: {
																backgroundColor: "#FFF"
															}
														]}>
															<LogoutIcon />
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
										
									</Animatable.View>
								</View>
							</View>
					</Modal>

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