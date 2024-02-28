import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	View,
	Dimensions,
	Text,
	TextInput,
	TouchableOpacity,
	Modal,
	Keyboard,
	Animated,
	Pressable,
	FlatList
} from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';

import BackIcon from "../../assets/arrow-left-icon.svg";
import CrossIcon from "../../assets/cross-icon.svg";
import StoreProductRepository from "../../repository/StoreProductRepository";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrashIcon from "../../assets/trash-icon.svg"

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const renderItem = ({item}) => {
	return item.key % 2 === 1 ? (
		<View style={styles.productOdd}>
			<Text style={styles.productTitle}>{item.brand_name} {item.name}</Text>
			<Text style={styles.productCount}>{item.count} {item.count_type}</Text>
		</View>
	) : (
		<View style={styles.product}>
			<Text style={styles.productTitle}>{item.brand_name} {item.name}</Text>
			<Text style={styles.productCount}>{item.count} {item.count_type}</Text>
		</View>
	);
};


const keyExtractor = (item) => item.id;


class Sell extends Component {
	constructor(props) {
		super(props);
		this.inputRef = React.createRef();
		this.state = {
			isModalVisible: false,
			isFocused: true,
			sellingProducts: [],
			seria: "",
			amount: 0,
			profit: 0,
			isKeyboardOn: false,

			animation: new Animated.Value(0),
			checkmarkScale: new Animated.Value(0),
			scaleValue: new Animated.Value(1),

			// MODAL VARIABLES
			isProductNameInputFocused: false,
			isQuantityInputFocused: false,
			isPriceInputFocused: false,
			recommenderProducts: [],
			selectedProduct: {},
			productNameContentStyle: {},
			productNameInputValue: "",
			quantityInputValue: "",
			priceInputValue: ""
		};

		this.keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => {
				this.setState({isKeyboardOn: true});
			}
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				this.setState({isKeyboardOn: false});
			}
		);

		this.storeProductRepository = new StoreProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
	}

	async componentDidMount() {
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			let role = await AsyncStorage.getItem("role");
			
			if (role !== "SELLER") {
				await AsyncStorage.setItem("not_allowed", "true")

				let from = await AsyncStorage.getItem("from");
				navigation.navigate(from);
			}

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));
			
			if (currentMonth === lastStoredMonth) {
				this.setState({thisMonthSellAmount: thisMonthSellAmount});
			}
			
			await this.initSellingHistoryGroup();
		});
	}

	renderQuickActions = (item) => (
		<View>
			<TouchableOpacity
				onPress={() => {
					let sellingProducts = this.state.sellingProducts;

					let index = sellingProducts.indexOf(item);

					if (index !== -1) {
						sellingProducts.splice(index, 1);
					}

					console.log(sellingProducts)
					this.setState(prevState => ({
						sellingProducts: prevState.sellingProducts.filter(product => product !== item)
					}));

					console.log(this.state.sellingProducts);
				}}
				style={{
					flex: 1,
					backgroundColor: "#D53B38",
					justifyContent: "center",
					alignItems: "flex-end",
					paddingLeft: 18,
					paddingRight: 18,
					borderTopRightRadius: 8,
					borderBottomRightRadius: 8,
					marginLeft: 20
				}}>
					<TrashIcon/>
			</TouchableOpacity>
		</View>
	);

	renderItem = ({item}) => {
		return (
			<Swipeable renderRightActions={() => this.renderQuickActions(item)}>
				<View style={item.key % 2 === 1 ? styles.productOdd : styles.product}>
					<Text style={styles.productTitle}>{item.brand_name} {item.name}</Text>
					<Text style={styles.productCount}>{item.count} {item.count_type}</Text>
				</View>
			</Swipeable>
		);
	};

	selectProduct = (product) => {
		console.log(product);

		this.setState({
			productNameInputValue: product.brand_name + " " + product.name,
			selectedProduct: product
		})

		this.defineInputContentStyle(true);
	}

	defineInputContentStyle = (hide) => {
		if (hide) {
			this.setState({productNameContentStyle: {display: "none"}});
			// this.setState({serialInputStyle: styles.input});
			return;
		}

		if (this.state.recommenderProducts.length === 0) {
			this.setState({productNameContentStyle: {display: "none"}});
			// this.setState({serialInputStyle: styles.serialInputClicked});
		} else {
			// this.setState({serialInputStyle: styles.serialInputClicked})
			this.setState({productNameContentStyle: styles.productNameContentStyle});
		}
	}

	toggleModal = () => {
		this.setState((prevState) => ({
			isModalVisible: !prevState.isModalVisible,
		}));


		//
	};

	handleFocus = () => {
		this.setState({isFocused: true});
		this.inputRef.current.focus();
	};

	handleBlur = () => {
		this.inputRef.current.focus();
	};

	onChangeTextSerialInput = async (seriya) => {
		this.setState({seria: seriya});
		let storeProduct = await this.storeProductRepository.getProductInfoBySerialNumber(seriya);

		if (storeProduct[0]) {
			let newSellingProducts = [...this.state.sellingProducts];

			let existingProductIndex =
				newSellingProducts.findIndex(
					element => element.id === storeProduct[0].id
				);

			if (existingProductIndex !== -1) {
				newSellingProducts[existingProductIndex].count += 1;

				this.setState({
					amount: this.state.amount + newSellingProducts[existingProductIndex].selling_price
				});
				this.setState({
					profit: this.state.profit + (
						newSellingProducts[existingProductIndex].selling_price -
						newSellingProducts[existingProductIndex].price
					)
				});
			} else {
				let newSellingProduct = storeProduct[0];
				newSellingProduct.count = 1;
				newSellingProducts.push(newSellingProduct);

				this.setState({
					amount: this.state.amount + newSellingProduct.selling_price
				});
				this.setState({
					profit: this.state.profit + (
						newSellingProduct.selling_price -
						newSellingProduct.price
					)
				});
			}

			console.log("PRODUCT IS ADDING..");
			console.log(newSellingProducts);

			this.setState(
				{
					sellingProducts: newSellingProducts,
					seria: ""
				});
			Keyboard.dismiss();
		}
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevState.isKeyboardOn !== this.state.isKeyboardOn) {
			Animated.timing(this.state.animation, {
				toValue: this.state.isKeyboardOn ? 1 : 0,
				duration: 300, // Adjust the duration as needed
				useNativeDriver: false // Ensure useNativeDriver is set to false for justifyContent animation
			}).start();
		}
	}

	render() {
		const {navigation} = this.props;
		const {isModalVisible} = this.state;

		const translateY = this.state.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100] // Adjust the value as needed
		});

		const animatedStyle = {
			backgroundColor: this.state.scaleValue.interpolate({
				inputRange: [0.9, 1],
				outputRange: ['green', 'blue'],
			}),
		};

		return (
			<>
				<View style={styles.container}>
					<View style={styles.pageTitle}>
						<TouchableOpacity
							onPress={() => {
								this.setState({
									isModalVisible: false,
									isFocused: true,
									sellingProducts: [],
									seria: "",
									amount: 0,
									profit: 0
								})
								navigation.navigate("Basket")
							}}
							style={styles.backIconWrapper}
						>
							<BackIcon/>
						</TouchableOpacity>

						<Text style={styles.pageTitleText}>
							Sotiladigan mahsulotlar
						</Text>
					</View>

					<TextInput
						ref={this.inputRef}
						style={{
							backgroundColor: "white",
							width: screenWidth - (16 + 16),
							marginBottom: 10,
							padding: 15,
							borderRadius: 8,
							fontFamily: "Gilroy-Medium",
							fontSize: 16,
							borderColor: "#222",
							borderWidth: 1
						}}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur}
						autoFocus={true}
						editable={true}
						cursorColor={"#222"}
						onChangeText={this.onChangeTextSerialInput}
						value={this.state.seria}
					/>

					<FlatList
						data={this.state.sellingProducts}
						renderItem={this.renderItem}
						keyExtractor={keyExtractor}
					/>

					<TouchableOpacity
						style={styles.productAddButton}
						onPress={this.toggleModal}
					>
						<Text style={styles.productAddButtonText}>Mahsulotni qo’lda kiritish</Text>
					</TouchableOpacity>

					<View style={styles.footer}>
						<View
							style={styles.footerTitle}
						>
							<Text style={styles.priceTitle}>Buyurtma narxi</Text>
							<Text style={styles.price}>{this.state.amount} so'm</Text>
						</View>

						<TouchableOpacity
							style={styles.button}
							onPress={this.sellProducts}
						>
							<Text style={styles.buttonText}>Sotuvni amalga oshirish</Text>
						</TouchableOpacity>
					</View>

					<StatusBar style="auto"/>

					<Modal
						visible={isModalVisible}
						animationType="none"
						style={{}}
						transparent={true}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={this.toggleModal}>
							<View style={{
								position: "absolute",
								width: screenWidth,
								height: screenHeight,
								flex: 1,
								backgroundColor: "#00000099"
							}}></View>
						</TouchableOpacity>
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

								justifyContent: (this.state.isKeybardOn ? "flex-start" : "center"),
								marginTop: (this.state.isKeybardOn ? 120 : 0),
								transform: [{translateY}]
							}}>
								<View style={{
									width: "100%",
									padding: 20,
									borderRadius: 12,
									backgroundColor: "#fff",
								}}>
									<View style={styles.crossIconWrapper}>
										<TouchableOpacity onPress={() => {
											this.setState({
												isProductNameInputFocused: false,
												isQuantityInputFocused: false,
												isPriceInputFocused: false,
												recommenderProducts: [],
												selectedProduct: {},
												productNameContentStyle: {},
												productNameInputValue: "",
												quantityInputValue: "",
												priceInputValue: ""
											});

											this.toggleModal()
										}}>
											<CrossIcon/>
										</TouchableOpacity>
									</View>

									<View>
										<Text style={styles.modalLabel}>Mahsulot nomi</Text>
										<TextInput
											onChangeText={async (value) => {
												this.setState({
													productNameInputValue: value
												});

												if (value !== "" || value !== " ") {
													let storeProducts =
														await this.storeProductRepository.searchProductsInfo(
															value + "%"
														);

													this.setState({
														recommenderProducts: storeProducts
													});

													this.setState({
														isQuantityInputFocused: false,
														isPriceInputFocused: false,
														selectedProduct: {},
														productNameContentStyle: {},
														quantityInputValue: "",
														priceInputValue: ""
													});
												}
											}}

											onFocus={() => {
												this.setState({
													isProductNameInputFocused: true
												});
											}}

											onEndEditing={() => {
												this.setState({
													isProductNameInputFocused: false
												});
											}}

											style={{
												paddingHorizontal: 16,
												paddingVertical: 14,
												borderWidth: 1,
												borderColor: (this.state.isProductNameInputFocused ? "#222" : "#AFAFAF"),
												borderRadius: 8,
												fontFamily: "Gilroy-Medium",
												fontWeight: "500",
												fontSize: 16,
												lineHeight: 24,
												marginTop: 4
											}}

											cursorColor={"#222"}

											placeholder="Nomini kiriting"

											placeholderTextColor="#AAAAAA"

											value={this.state.productNameInputValue}/>

										<View style={{marginTop: 2}}>
											<View style={this.state.productNameContentStyle}>
												{
													this.state.recommenderProducts.map(
														(item, index) =>
															(
																<Pressable
																	onPress={() => {
																		this.selectProduct(item);
																	}}

																	onPressIn={() => {
																		Animated.spring(this.state.scaleValue, {
																			toValue: 0.9,
																			useNativeDriver: true,
																		}).start();
																	}}

																	onPressOut={() => {
																		Animated.spring(this.state.scaleValue, {
																			toValue: 1,
																			useNativeDriver: true,
																		}).start();
																	}}

																	style={({pressed}) => [
																		{
																			paddingVertical: 14,
																			paddingHorizontal: 16,
																			borderTopWidth: 1,
																			borderColor: "#F1F1F1"
																		},
																		animatedStyle,
																		{
																			backgroundColor: pressed ? '#CCCCCC' : '#FBFBFB',
																		},
																	]}
																	key={index}>

																	<Text>{item.brand_name}</Text>
																</Pressable>
															)
													)
												}
											</View>
										</View>
									</View>

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>Qiymati</Text>
										<TextInput
											onFocus={() => {
												this.setState({isQuantityInputFocused: true})
											}}

											onEndEditing={() => {
												this.setState({isQuantityInputFocused: false})
											}}

											onChangeText={(value) => {
												this.setState({quantityInputValue: value});
												// FIST OF ALL GET CURRENT SELLING PRICE.
												let sellingPrice = this.state.selectedProduct.selling_price;
												console.log((parseInt(value) * sellingPrice))
												this.setState({priceInputValue: (parseInt(value) * sellingPrice) + ""})
											}}

											style={{
												paddingHorizontal: 16,
												paddingVertical: 14,
												borderWidth: 1,
												borderColor: (this.state.isQuantityInputFocused ? "#222" : "#AFAFAF"),
												borderRadius: 8,
												fontFamily: "Gilroy-Medium",
												fontWeight: "500",
												fontSize: 16,
												lineHeight: 24,
												marginTop: 4
											}}

											cursorColor={"#222"}

											placeholder="Sonini kiriting"

											keyboardType="numeric"

											placeholderTextColor="#AAAAAA"
											value={this.state.quantityInputValue}/>
									</View>

									{/* 
										BIZDA IKKITA TEXTINPUT BOR BIRIGA YOZILSA IKKINCHISIGA AVTOMATIK QIYMAT BERILISHI KERAK
										QUANTITY O'ZGARTIRILSA NARXI NARXI O'ZGARTIRILSA QUANTITY 
									*/}
									{/* 
										* 1. TextInput valuelarini stateda saqlash.
										* 2. Birinchi textInput onChange bo'lganda ikkinchisini valuesini o'zgartirish.
										* 3. 
										* 4. 
									*/}

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>Sotuvdagi narxi (1 kg/dona)</Text>
										<TextInput
											onFocus={() => {
												this.setState({isPriceInputFocused: true});
											}}

											onEndEditing={() => {
												this.setState({isPriceInputFocused: false});
											}}

											onChangeText={(value) => {
												this.setState({priceInputValue: value})
												let productSellingPrice = this.state.selectedProduct.selling_price;
												let quantity = (parseFloat(value) / productSellingPrice).toFixed(2);
												this.setState({quantityInputValue: quantity})
											}}

											style={{
												paddingHorizontal: 16,
												paddingVertical: 14,
												borderWidth: 1,
												borderColor: (this.state.isPriceInputFocused ? "#222" : "#AFAFAF"),
												borderRadius: 8,
												fontFamily: "Gilroy-Medium",
												fontWeight: "500",
												fontSize: 16,
												lineHeight: 24,
												marginTop: 4
											}}

											placeholder="1 kg/dona narxini kiriting"

											placeholderTextColor="#AAAAAA"

											cursorColor={"#222"}

											keyboardType="numeric"

											value={this.state.priceInputValue}/>
									</View>

									<TouchableOpacity
										style={styles.modalButton}
										onPress={() => {
											let selectedProduct = this.state.selectedProduct;
											if (!selectedProduct) {
												// TODO RED ERROR
												return;
											}

											selectedProduct.serial_number = "";
											selectedProduct.count = parseFloat(this.state.quantityInputValue);

											this.setState({
												amount: this.state.amount + selectedProduct.selling_price
											});

											this.setState({
												profit: this.state.profit + (
													selectedProduct.selling_price -
													selectedProduct.price
												)
											});

											let allSellingProducts = this.state.sellingProducts.concat(selectedProduct);
											this.setState({sellingProducts: allSellingProducts});

											// TODO CLEAR STATE:::
											this.setState({
												isProductNameInputFocused: false,
												isQuantityInputFocused: false,
												isPriceInputFocused: false,
												recommenderProducts: [],
												selectedProduct: {},
												productNameContentStyle: {},
												productNameInputValue: "",
												quantityInputValue: "",
												priceInputValue: ""
											});

											this.toggleModal();
										}}>
										<Text
											style={styles.modalButtonText}>Savatga qo’shish</Text>
									</TouchableOpacity>
								</View>
							</Animated.View>
						</View>
					</Modal>
				</View>
			</>
		);
	}

	sellProducts = async () => {
		console.log(
			this.state.sellingProducts
		);

		let sellGroupId = await this.sellHistoryRepository.createSellHistoryGroup(this.state.amount);
		let profitGroupId = await this.profitHistoryRepository.createProfitGroup(this.state.profit);


		console.log("PROFIT ", this.state.profit);

		this.state.sellingProducts.forEach(
			async (sellingProduct) => {
				await this.sellHistoryRepository.createSellHistoryAndLinkWithGroup(
					sellingProduct.product_id,
					sellingProduct.count,
					sellingProduct.count_type,
					sellingProduct.selling_price,
					sellGroupId
				)
			});


		console.log("PROFIT GROUP:::", profitGroupId)
		// SMALL TASKS
		/*
			* Find selling price and actual price then profit.
		*/


		/* 
		[
			{
				"brand_name": "123", 
				"count": 1, 
				"count_type": "DONA", 
				"id": 9, 
				"name": "123", 
				"nds": 1, 
				"percentage": 20,
				"price": 123000, 
				"product_id": 9, 
				"selling_price": 147600, 
				"serial_number": "123"
			}
		]
		*/


		// price and selling_price

		this.state.sellingProducts.forEach(
			async (sellingProduct) => {
				await this.profitHistoryRepository.createProfitHistoryAndLinkWithGroup(
					sellingProduct.product_id,
					sellingProduct.count,
					sellingProduct.count_type,
					sellingProduct.selling_price - sellingProduct.price,
					profitGroupId
				);


				this.storeProductRepository.updateCount(
					sellingProduct.product_id,
					sellingProduct.count
				);
			});


		// oylik foyda bilan kirimni localStorageda saqlash.
		// + bugungi oyni sonini ham


		// HOW TO GET yyyy-mm-dd from new Date()

		// Get the current date
		const currentDate = new Date();

		// Extract year, month, and day
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, '0');

		// Format the date as yyyy-mm-dd
		const formattedDate = `${year}-${month}-${day}`;

		// UPDATE CURRENT DAY AMOUNTS..
		await this.amountDateRepository.setProfitAmount(
			this.state.profit, formattedDate
		);
		await this.amountDateRepository.setSellAmount(
			this.state.amount, formattedDate
		);

		// STORING CURRENT MONTHLY AMOUNTS
		const currentMonth = currentDate.getMonth();
		await AsyncStorage.setItem("month", currentMonth + "");

		let lastSellAmount = await AsyncStorage.getItem("month_sell_amount")
		let lastProfitAmount = await AsyncStorage.getItem("month_profit_amount")

		if (lastSellAmount) {
			await AsyncStorage.setItem("month_sell_amount", this.state.amount + "");
		} else {
			let calc = parseInt(lastSellAmount) + this.state.amount;
			await AsyncStorage.setItem(
				"month_sell_amount",
				calc + ""
			);
		}

		if (lastProfitAmount) {
			await AsyncStorage.setItem("month_profit_amount", this.state.profit + "");
		} else {
			let calc = parseInt(lastProfitAmount) + this.state.profit;
			await AsyncStorage.setItem(
				"month_profit_amount",
				calc + ""
			);
		}

		this.setState({
			isModalVisible: false,
			isFocused: true,
			sellingProducts: [],
			seria: "",
			amount: 0,
			profit: 0
		});
		// Navigate screen
		const {navigation} = this.props;
		navigation.navigate("Shopping");
	}
}

/*
let currentDate = new Date();
const weekDays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];	

let hourAndMinute = currentDate.getHours() + ":" + currentDate.getMinutes();
let currentMonth = currentDate.toLocaleString("uz-UZ", { month: "long" }).toLocaleLowerCase();
let currentDay = currentDate.getDate();
let currentWeekDayName = weekDays[currentDate.getDay()];

console.log(hourAndMinute);
console.log(currentDay + "-" + currentMonth);
console.log(currentWeekDayName);
*/

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 52
	},

	pageTitle: {
		width: screenWidth - (16 + 16),
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},

	pageTitleText: {
		width: 299,
		textAlign: "center",
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
	},

	backIconWrapper: {
		backgroundColor: "#F5F5F7",
		paddingVertical: 16,
		paddingHorizontal: 19,
		borderRadius: 8,
	},

	productList: {},

	product: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: screenWidth - (17 + 17),
		paddingVertical: 13,
		paddingHorizontal: 4,
		backgroundColor: "white"
	},

	productOdd: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: screenWidth - (17 + 17),
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

	scan: {
		width: 71,
		height: 71,
		backgroundColor: "#000",
		position: "absolute",
		borderRadius: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		right: 20,
		bottom: 172
	},

	priceTitle: {
		fontFamily: "Gilroy-Regular",
		fontWeight: "400",
		fontSize: 16,
		lineHeight: 24
	},

	price: {
		fontSize: 18,
		fontWeight: "600",
		fontFamily: "Gilroy-SemiBold",
	},

	button: {
		paddingVertical: 14,
		backgroundColor: "#222",
		width: screenWidth - (17 + 17),
		marginLeft: "auto",
		marginRight: "auto",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
		marginBottom: 12
	},

	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		lineHeight: 24
	},

	productAddButton: {
		width: screenWidth - (17 + 17),
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: "#222222",
		borderRadius: 8,
		marginTop: 16
	},

	productAddButtonText: {
		textAlign: "center"
	},

	crossIconWrapper: {
		height: 24,
		width: "100%",
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "flex-end",
		marginBottom: 24,
		marginTop: 10
	},

	crossIcon: {
		backgroundColor: "blue",
		width: 24,
		height: 24
	},

	footer: {
		backgroundColor: "#fff",
		width: "100%",
	},

	footerTitle: {
		paddingBottom: 22,
		paddingTop: 16,
		paddingHorizontal: 17,
		width: "100%",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-end",
		flexDirection: "row",

		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOffset: {width: 0, height: -10},
		shadowOpacity: 1,
		shadowRadius: 30,
	},

	modalLabel: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 24
	},

	inputBlock: {
		marginTop: 16
	},

	modalButton: {
		marginTop: 24,
		backgroundColor: "#222222",
		paddingVertical: 14,
		borderRadius: 8
	},

	modalButtonText: {
		color: "#fff",
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		textAlign: "center"
	},

	productNameContentStyle: {
		borderWidth: 1,
		borderColor: "#F1F1F1",
		borderRadius: 10,
		borderTopWidth: 0,
		backgroundColor: "#FBFBFB",
		position: "absolute",
		top: -1,
		width: screenWidth - (17 + 17),
		zIndex: 10,
		overflow: "hidden",
		elevation: 4,
		shadowColor: 'rgba(0, 0, 0, 0.25)',
		shadowOffset: {width: 2, height: 4},
		shadowOpacity: 1,
		shadowRadius: 4,
	}

});

export default Sell;