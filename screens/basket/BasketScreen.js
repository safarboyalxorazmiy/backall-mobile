import React, {Component, memo} from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	FlatList,
	Keyboard, ActivityIndicator
} from "react-native";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StoreProductRepository from "../../repository/StoreProductRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import PlusIcon from "../../assets/plus-icon.svg";
import SearchIcon from "../../assets/search-icon.svg";
import BasketIcon from "../../assets/basket-icon-light.svg";
import Success from "../../assets/success.svg";
import BasketItem from "./BasketItem";
import _ from "lodash";
import { TouchableRipple } from 'react-native-paper';
import i18n from '../../i18n';
import TokenService from "../../service/TokenService";
import DatabaseRepository from "../../repository/DatabaseRepository";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Basket extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isCreated: "false",
			storeProducts: [],
			addButtonStyle: styles.addButton,
			searchInputValue: "",
			lastId: 0,
			lastYPos: 0,
			role: "",

			loading: false,

			lastNotDownloadedProductsPage: 0,
			lastNotDownloadedProductsSize: 10,
			lastStoreProductsPage: 0,
			lastStoreProductsSize: 10,

			productsLoadingIntervalId: undefined,
			productsLoadingIntervalProccessIsFinished: true,
		}

		this.storeProductRepository = new StoreProductRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();
		this.tokenService = new TokenService();
		this.databaseRepository = new DatabaseRepository();

		this.keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			this.keyboardDidShow
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			this.keyboardDidHide
		);

		this.textInputRef = React.createRef();
		this.onEndReached = _.debounce(this.onEndReached.bind(this), 300);
		this.flatListRef = React.createRef();
	}

	keyboardDidShow = () => {
		this.setState({addButtonStyle: {display: "none"}});
	};

	keyboardDidHide = () => {
		this.setState({addButtonStyle: styles.addButton});
	};

	async componentDidMount() {
		await AsyncStorage.setItem("window", "Basket");

		if (await AsyncStorage.getItem("loadBasket") === "true") {
			await this.initializeScreen();

			await AsyncStorage.setItem("loadBasket", "false");
		}

		//.log("Loaded..")
		const {navigation} = this.props;

		this.setState(
			{
				addButtonStyle: styles.addButton,
				searchInputValue: "",
				lastId: 0,
				lastYPos: 0,
				storeProducts: [],
			}
		);

		await this.loadMore();
		this.setState({role: await AsyncStorage.getItem("role")});

		navigation.addListener("focus",
			async () => {
				await AsyncStorage.setItem("window", "Basket");

				// !IMPORTANT 🔭******************************
				// Bu yerda foydalanuvchi tokeni bor yoki yo'qligini tekshiradi 
				// agar token yo'q bo'lsa unda login oynasiga otadi.
				let isLoggedIn = await this.tokenService.checkTokens();
				if (!isLoggedIn) {
					//.log("LOGGED OUT BY 401 FROM HOME")
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
					//.log("LOGGED OUT BY 401 FROM HOME")
					await this.databaseRepository.clear();
					await AsyncStorage.clear();
					navigation.navigate("Login");
					return;	
				}
				//************************************

				if (await AsyncStorage.getItem("loadBasket") === "true") {
					await this.initializeScreen();

					await AsyncStorage.setItem("loadBasket", "false");
				}

				this.setState(
					{
						addButtonStyle: styles.addButton,
						searchInputValue: "",
						lastYPos: 0
					}
				);

				await this.getCreated();
				this.setState({role: await AsyncStorage.getItem("role")});

				let storeProducts = this.state.storeProducts;

				if (
					await AsyncStorage.getItem("basketFullyLoaded") !== "true" &&
					storeProducts.length > 0
				) {
					let updatedRows = await this.storeProductRepository.findByWhereUpdatedFalse();
					for (const row of updatedRows) {
						let rowIndex = storeProducts.findIndex(product => product.id === row.id);
						if (rowIndex !== -1) {
							storeProducts.splice(rowIndex, 1);
						}
					}

					this.setState({
						storeProducts: [...updatedRows, ...storeProducts]
					});

					this.scrollToTop();

					await AsyncStorage.setItem("basketFullyLoaded", "true");
					return;
				}

				/* FOR BOSS SMTH
				if (await AsyncStorage.getItem("role") === "BOSS") {
					let productsLoadingIntervalId = setInterval(async () => {
						if (await AsyncStorage.getItem("productsLoadingIntervalProccessIsFinished") != "true") {
							return;
						}

						//.log("INTERNAL STARTED SUCCESSFULLY! \n We are on: ");
						//.log(await AsyncStorage.getItem("window"));
						if (await AsyncStorage.getItem("window") != "Basket") {
							if (productsLoadingIntervalId !== undefined) {
								clearInterval(productsLoadingIntervalId);
								//.log("CLEARED " + productsLoadingIntervalId);
								return;
							}
						}

						await AsyncStorage.setItem("productsLoadingIntervalProccessIsFinished", "false")
						
						let isProductsNotEmpty = 
							await this.getNotDownloadedLocalProducts();
						let isStoreProductsNotEmpty = 
							await this.getNotDownloadedStoreProducts();

						await AsyncStorage.setItem("productsLoadingIntervalProccessIsFinished", "true")

						if (isProductsNotEmpty || isStoreProductsNotEmpty) {
							await this.loadData();
						}
					}, 2000)
				}*/


				await this.loadMore();
			}
		);
	}

	async initializeScreen() {
		if (await AsyncStorage.getItem("loadBasket") === "true") {
			this.setState({
				isCreated: "false",
				storeProducts: [],
				addButtonStyle: styles.addButton,
				searchInputValue: "",
				lastId: 0,
				lastYPos: 0,
				role: "",

				lastNotDownloadedProductsPage: 0,
				lastNotDownloadedProductsSize: 10,
				lastStoreProductsPage: 0,
				lastStoreProductsSize: 10,

				productsLoadingIntervalId: undefined,
				productsLoadingIntervalProccessIsFinished: true,
			});

			this.storeProductRepository = new StoreProductRepository();
			this.apiService = new ApiService();
			this.productRepository = new ProductRepository();
		}
	}

	async getCreated() {
		let isCreated = await AsyncStorage.getItem("isCreated");
		this.setState({isCreated: isCreated});
	}

	async onEndReached() {
		//.log("onEndReached()");
		if (!this.state.loading) {
			await this.loadMore();
		}
	}

	scrollToTop = () => {
		this.flatListRef.current?.scrollToOffset({animated: true, offset: 0});
	};

	async loadMore() {
		if (this.state.loading) return false;
		try {
			const newStoreProducts =
				await this.storeProductRepository.findTopStoreProductsInfo(
					this.state.lastId
				);

			if (newStoreProducts.length === 0) {
				this.setState({
					loading: false
				});

				return false;
			}

			let last = newStoreProducts[newStoreProducts.length - 1];
			if (last != undefined) {
				if (this.state.lastId === last.id) {
					this.setState({
						loading: false
					});

					return false;
				}
				this.setState({
					lastId: last.id
				});
			}

			this.setState(prevState => ({
				loading: false,
				storeProducts: [...prevState.storeProducts, ...newStoreProducts],
				searchInputValue: ""
			}));

			return true;
		} catch (error) {
			//.error("Error fetching global products:", error);
			this.setState({
				loading: false
			})
			return false;
		}
	}

	onChangeTextSearchInput = async (query) => {
		this.setState({searchInputValue: query});
		let storeProducts = await this.storeProductRepository.searchProductsInfo(query + "%");
		this.setState({storeProducts: storeProducts})
		//.log(storeProducts);
	}

	handlePressSearchInput = () => {
		if (this.textInputRef.current) {
			this.textInputRef.current.blur();
			this.textInputRef.current.focus();
		}
	};

	render() {
		const {navigation} = this.props;

		return (
			<View style={styles.container}>
				{/* Search section */}
				<TouchableOpacity
					activeOpacity={1}
					style={styles.inputWrapper}
					onPress={this.handlePressSearchInput}>
					<SearchIcon/>

					<TextInput
						autoCapitalize="none"
						ref={this.textInputRef}
						style={styles.input}
						placeholder={i18n.t("searchProduct")}
						placeholderTextColor="#AAA"
						onChangeText={this.onChangeTextSearchInput}
						value={this.state.searchInputValue}
						defaultValue={""}
						cursorColor={"black"}
					/>
				</TouchableOpacity>

				<FlatList
					ref={this.flatListRef}
					style={styles.productList}
					data={this.state.storeProducts}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({item, index}) => (
						<BasketItem product={item} index={index}/>
					)}

					onEndReached={this.onEndReached}

					ListFooterComponent={() => {
						if (!this.state.loading) return null;
						return (
							<View style={{padding: 10}}>
								<ActivityIndicator size="large" color={"#9A50AD"}/>
							</View>
						);
					}}

					onScrollBeginDrag={this.handleScroll}
					horizontal={false}
					scrollEnabled={true}
					contentContainerStyle={{}}
				/>


				{/* Add Button */}
				{this.state.role === "SELLER" || this.state.role === "SELLER_BOSS" ? (
					<TouchableRipple
						delayHoverIn={true}
						delayLongPress={false}
						delayHoverOut={false}
						unstable_pressDelay={false}
						rippleColor="#E5E5E5"
						rippleContainerBorderRadius={50}
						borderless={true}
						style={this.state.addButtonStyle}
						onPress={() => {
							navigation.navigate("ProductAdd");
						}}>
						<PlusIcon/>
					</TouchableRipple>
				) : null}

				{/* Product successfuly created modal. */}
				<Modal
					style={{
						backgroundColor: "#FFFFFF",
						width: "100%",
						height: screenHeight,
						margin: 0,
						padding: 0,
						position: "absolute",
						top: 0,
						left: 0
					}}
					isVisible={this.state.isCreated === "true"}
					animationIn={"slideInUp"}
					animationOut={"slideOutDown"}
					animationInTiming={200}>
					<View
						style={{
							//	transform: [{scale: this.state.checkmarkScale}],
							margin: 0,
							padding: 0,
							width: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}
					>
						<Success/>
					</View>

					<View style={{
						width: screenWidth - (15 * 2),
						marginLeft: "auto",
						marginRight: "auto",
						position: "absolute",
						left: 15,
						bottom: 30
					}}>
						<Text
							style={{
								// transform: [{scale: this.state.checkmarkScale}],
								marginLeft: 5,
								color: "black",
								fontSize: 24,
								fontFamily: "Gilroy-SemiBold"
							}}>
							{i18n.t("productSuccessfulyCreated")}
						</Text>

						<TouchableOpacity style={{
							width: 343,
							backgroundColor: "#222222",
							borderRadius: 8,
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							paddingVertical: 14,
							gap: 20,
							marginTop: 15,
						}} onPress={async () => {
							await AsyncStorage.setItem("isCreated", "false")
							this.setState({isCreated: "false"});
						}}>
							<BasketIcon/>
							<Text style={{
								fontFamily: "Gilroy-Black",
								fontSize: 16,
								color: "#FFFFFF"
							}}>{i18n.t("backToBasket")}</Text>
						</TouchableOpacity>
					</View>
				</Modal>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: "#fff",
		paddingTop: 65,
		position: "relative"
	},

	inputWrapper: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		width: screenWidth - (17 + 17),
		marginLeft: "auto",
		marginRight: "auto",
		borderColor: "#AFAFAF",
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 8,
	},

	input: {
		backgroundColor: "white",
		color: "black",
		paddingLeft: 10,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		borderWidth: 0,
		width: "80%"
	},

	productList: {
		marginTop: 20,
		height: screenHeight - 93,
		overflow: 'hidden',
	},

	product: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		paddingLeft: 17,
		paddingRight: 17,
		paddingVertical: 13,
		paddingHorizontal: 4
	},

	productOdd: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		paddingLeft: 17,
		paddingRight: 17,
		paddingVertical: 13,
		paddingHorizontal: 4,
		backgroundColor: "#F1F1F1"
	},

	productTitle: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500"
	},

	productCount: {
		fontFamily: "Gilroy-Medium",
		fontSize: 16,
		lineHeight: 24,
		fontWeight: "500"
	},

	addButton: {
		width: 60,
		height: 60,
		backgroundColor: "#272727",
		position: "absolute",
		right: 20,
		bottom: 40,
		borderRadius: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}

});

export default memo(Basket);