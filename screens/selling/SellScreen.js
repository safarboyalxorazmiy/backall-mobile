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
	Animated
} from "react-native";
import SwipeableFlatList from "react-native-swipeable-list";

import BackIcon from "../../assets/arrow-left-icon.svg";
import CrossIcon from "../../assets/cross-icon.svg";
import StoreProductRepository from "../../repository/StoreProductRepository";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const renderQuickActions = () => (
	<View style={{
		flex: 1,
		backgroundColor: "red",
		justifyContent: "center",
		alignItems: "flex-end"
	}}>
		<Text style={{
			color: "white",
			padding: 10
		}}>Delete</Text>
	</View>
);

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
			isKeybardOn: false,
			animation: new Animated.Value(0),
			isProductNameInputFocused: false,
			isQuantityInputFocused: false,
			isPriceInputFocused: false
		};

		this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
				this.setState({isKeybardOn: true});
			}
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
				this.setState({isKeybardOn: false});	
			}
    );

		this.storeProductRepository = new StoreProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
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
				})
			}

			this.setState(
				{
					sellingProducts: newSellingProducts,
					seria: ""
				});
			Keyboard.dismiss();
		}
	};

	componentDidUpdate(prevProps, prevState) {
    if (prevState.isKeybardOn !== this.state.isKeybardOn) {
      Animated.timing(this.state.animation, {
        toValue: this.state.isKeybardOn ? 1 : 0,
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

					<SwipeableFlatList
						data={this.state.sellingProducts}
						renderItem={renderItem}
						renderQuickActions={renderQuickActions}
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
						style={{
						}}
						transparent={true}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={this.toggleModal}>
							<View style={{
								position: "absolute",
								width: screenWidth,
								height: screenHeight,
								flex: 1,
								backgroundColor: "#00000099",
								
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
								transform: [{ translateY }]
							}}>
								<View style={{
									width: "100%",
									padding: 20,
									borderRadius: 12,
									backgroundColor: "#fff",
								}}>
									<View style={styles.crossIconWrapper}>
										<TouchableOpacity onPress={this.toggleModal}>
											<CrossIcon/>
										</TouchableOpacity>
									</View>

									<View>
										<Text style={styles.modalLabel}>Mahsulot nomi</Text>
										<TextInput
											onChangeText={() => {
												// TODO FIND BY NAME;
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
											placeholderTextColor="#AAAAAA"/>
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

											placeholderTextColor="#AAAAAA"/>
									</View>

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>Sotuvdagi narxi (1 kg/dona)</Text>
										<TextInput
											onFocus={() => {
												this.setState({isPriceInputFocused: true});
											}}

											onEndEditing={() => {
												this.setState({isPriceInputFocused: false});
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
										/>
									</View>

									<TouchableOpacity
										style={styles.modalButton}
										onPress={this.toggleModal}>
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
		let profitGroupId = await this.profitHistoryRepository.createProfitHistoryGroup(this.state.profit);


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
	}

});


export default Sell;