import React, {Component, memo} from "react";
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
	Pressable,
	FlatList
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

import BackIcon from "../../assets/arrow-left-icon.svg";
import CrossIcon from "../../assets/cross-icon.svg";
import StoreProductRepository from "../../repository/StoreProductRepository";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrashIcon from "../../assets/trash-icon.svg";
import * as Animatable from "react-native-animatable";
import {activateKeepAwakeAsync, deactivateKeepAwake} from 'expo-keep-awake';
import { TouchableRipple } from 'react-native-paper';
import DeleteIcon from "../../assets/delete-icon.svg";
import i18n from "../../i18n";

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

			// MODAL VARIABLES
			isProductNameInputFocused: false,
			isQuantityInputFocused: false,
			isPriceInputFocused: false,
			recommenderProducts: [],
			selectedProduct: {},
			productNameContentStyle: {},
			productNameInputValue: "",
			quantityInputValue: "",
			priceInputValue: "",
			quantityInputError: false,
			productNameInputError: false,
			isUtilizationModalVisible: false,
			

			autoFocus: true,
			SAVE_BUTTON_AVAILABLE: true
		};

		this.keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				this.setState({isKeyboardOn: true});
				//.log("Keyboard on")
			}
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				this.setState({isKeyboardOn: false});
				//.log("Keyboard off")
			}
		);

		this.storeProductRepository = new StoreProductRepository();
		this.sellHistoryRepository = new SellHistoryRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
	}

	async componentDidMount() {
		const {navigation} = this.props;
		await activateKeepAwakeAsync();
		
		let prevWindow = await AsyncStorage.getItem("window");
		await AsyncStorage.setItem("from", prevWindow);
		await AsyncStorage.setItem("window", "Sell");

		navigation.addListener("focus", async () => {
			await activateKeepAwakeAsync();

			let prevWindow = await AsyncStorage.getItem("window");
			await AsyncStorage.setItem("from", prevWindow);
			await AsyncStorage.setItem("window", "Sell");

			let role = await AsyncStorage.getItem("role");

			if (!(role === "SELLER" || role === "SELLER_BOSS")) {
				this.setState({
					autoFocus: false
				})
				await AsyncStorage.setItem("not_allowed", "true")

				let from = await AsyncStorage.getItem("from");
				navigation.navigate(from);
			}

			await this.amountDateRepository.init();
			await this.profitHistoryRepository.init();
			await this.sellHistoryRepository.init();

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({thisMonthSellAmount: currentMonth});
			}
		});
	}

	async componentWillUnmount() {
		await deactivateKeepAwake();
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

					this.setState(prevState => ({
						sellingProducts: prevState.sellingProducts.filter(product => product !== item)
					}));

					if ((item.selling_price * item.count) < 0) {
						return;
					}

					this.setState({
						amount: this.state.amount - (item.count * item.selling_price),
						profit: this.state.profit - (item.count * (item.selling_price - item.price)),
					})
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
		//.log(product);

		this.setState({
			productNameInputValue: product.brand_name + " " + product.name,
			selectedProduct: product,
			productNameInputError: false
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
			//.log(storeProduct[0])
			let newSellingProducts = [...this.state.sellingProducts];

			let existingProductIndex =
				newSellingProducts.findIndex(
					element => element.id === storeProduct[0].id && element.count > 0
				);
			
			if (existingProductIndex !== -1) {
				newSellingProducts[existingProductIndex].count += 1;
				let minusedValue = storeProduct[0].count - newSellingProducts[existingProductIndex].count;
				//.log(minusedValue);
				if (minusedValue < 0) {
					// no product error
					return;
				}

				this.setState(prevState => ({
					amount: prevState.amount + (
						newSellingProducts[existingProductIndex].nds == 1 ? (
							(() => {
								//.log("NDS IS TRUE");

								let a = newSellingProducts[existingProductIndex].selling_price;
								let twelvePercent = a * 0.12;
								a += twelvePercent;
								return a;
							})() // Immediately invoke the function
						) : newSellingProducts[existingProductIndex].selling_price
					)
				}));


				this.setState({
					profit: 
						this.state.profit + 
						((newSellingProducts[existingProductIndex].selling_price - newSellingProducts[existingProductIndex].price))
				});

				console.log("Profit:: ", + this.state.profit);
			} else {
				let newSellingProduct = storeProduct[0];
				if (newSellingProduct.count <= 0) {
					return;
				}

				newSellingProduct.count = 1;
				newSellingProducts.push(newSellingProduct);

				this.setState(prevState => ({
					amount: prevState.amount + (
						newSellingProduct.nds === 1
							? (() => {
								//.log("NDS IS TRUE");
								let a = newSellingProduct.selling_price;
								let twelvePercent = a * 0.12;
								a += twelvePercent;
								return a;
							})() // Immediately invoke the function
							: newSellingProduct.selling_price
					)
				}));

				this.setState({
					profit: this.state.profit + (newSellingProduct.count *
						(newSellingProduct.selling_price -
						newSellingProduct.price)
					)
				});

				console.log("Profit:: ", + this.state.profit);
			}

			//.log("PRODUCT IS ADDING..");
			//.log(newSellingProducts);

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
			this.setState({
				isKeyboardOn: this.state.isKeyboardOn ? 1 : 0
			});
		}
	}

	render() {
		const {navigation} = this.props;
		const {isModalVisible} = this.state;

		return (
			<>
				<View style={styles.container}>
					<View style={styles.pageTitle}>
						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							onPress={() => {
								this.setState({
									isModalVisible: false,
									isFocused: true,
									sellingProducts: [],
									seria: "",
									amount: 0,
									profit: 0,
									SAVE_BUTTON_AVAILABLE: true
								})
								navigation.navigate("Basket")
							}}
							style={styles.backIconWrapper}
						>
							<BackIcon/>
						</TouchableRipple>

						<Text style={styles.pageTitleText}>
							{i18n.t("sellingProducts")}
						</Text>

						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							style={{
								backgroundColor: "#F5F5F7",
								paddingVertical: 10,
								paddingHorizontal: 10,
								borderRadius: 8,
							}}
							onPress={() => {
								// OPEN UTILIZATION MODAL
								if (this.state.isUtilizationModalVisible == true) {
									return;
								}

								this.setState({isUtilizationModalVisible: true});
							}}>
								<DeleteIcon />
						</TouchableRipple>
					</View>

					<TextInput
						autoCapitalize="none"
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
						autoFocus={this.state.autoFocus}
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

					<TouchableRipple
						delayHoverIn={true}
						delayLongPress={false}
						delayHoverOut={false}
						unstable_pressDelay={false}
						rippleColor="#E5E5E5"
						rippleContainerBorderRadius={50}
						borderless={true}
						style={styles.productAddButton}
						onPress={this.toggleModal}>
						<Text style={styles.productAddButtonText}>{i18n.t("enterProductManually")}</Text>
					</TouchableRipple>

					<View style={styles.footer}>
						<View
							style={styles.footerTitle}
						>
							<Text style={styles.priceTitle}>{i18n.t("orderPrice")}</Text>
							<Text style={styles.price}>{this.state.amount} {i18n.t("sum")}</Text>
						</View>

						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							style={styles.button}
							onPress={this.sellProducts}>
							<Text style={styles.buttonText}>{i18n.t("makeASale")}</Text>
						</TouchableRipple>
					</View>

					<StatusBar style="auto"/>

					<Modal
						visible={isModalVisible}
						animationType="slide"
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

						<View
							style={{
								height: screenHeight,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}>
							<View style={(this.state.isKeyboardOn) ?
								{
									width: 343,
									height: "auto",
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "flex-start",

									justifyContent: "flex-start",
									marginTop: 0,
									paddingTop: 20,
								} : {
									width: screenWidth - (16 * 2),
									maxWidth: 343,
									height: "auto",
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "flex-start",
									justifyContent: "center",
									marginTop: 0,
									paddingTop: 20,
								}}>
								<View style={{
									width: "100%",
									padding: 20,
									borderRadius: 12,
									backgroundColor: "#fff",
									paddingTop: 60,
								}}>
									<TouchableOpacity
										style={styles.crossIconWrapper}
										onPress={() => {
											this.setState({
												isProductNameInputFocused: false,
												isQuantityInputFocused: false,
												isPriceInputFocused: false,
												recommenderProducts: [],
												selectedProduct: {},
												productNameContentStyle: {},
												productNameInputValue: "",
												quantityInputValue: "",
												priceInputValue: "",
												quantityInputError: false
											});

											this.toggleModal()
										}}>
										<CrossIcon/>
									</TouchableOpacity>

									<View>
										<Text style={styles.modalLabel}>{i18n.t("productName")}</Text>
										<TextInput
											autoCapitalize="none"
											onChangeText={async (value) => {
												this.setState({
													productNameInputValue: value
												});

												if (value === "" || value === " ") {
													return;
												}

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

											placeholder={i18n.t("enterName")}

											placeholderTextColor="#AAAAAA"

											value={this.state.productNameInputValue}
										/>

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
																		this.setState({
																			scaleValue: 0.9
																		});
																	}}

																	onPressOut={() => {
																		this.setState({
																			scaleValue: 1
																		});
																	}}

																	style={({pressed}) => [
																		{
																			paddingVertical: 14,
																			paddingHorizontal: 16,
																			borderTopWidth: 1,
																			borderColor: "#F1F1F1"
																		},
																		{
																			backgroundColor: pressed ? "#CCCCCC" : "#FBFBFB",
																		},
																	]}
																	key={index}>

																	<Text>{item.brand_name}</Text>
																</Pressable>
															)
													)
												}
											</View>
											{
											this.state.productNameInputError ?
												<Animatable.View animation="shake" duration={500}>
													<Text style={{color: "red"}}>{i18n.t("productMustBeSelected")}</Text>
												</Animatable.View> : null
											}
										</View>
									</View>

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>{i18n.t("quantity")}</Text>
										<TextInput
											autoCapitalize="none"

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
												//.log((parseInt(value) * sellingPrice))
												this.setState({priceInputValue: (parseInt(value) * sellingPrice) + ""})
											}}

											style={{
												paddingHorizontal: 16,
												paddingVertical: 14,
												borderWidth: 1,
												borderColor: (this.state.quantityInputError ? "red" : this.state.isQuantityInputFocused ? "#222" : "#AFAFAF"),
												borderRadius: 8,
												fontFamily: "Gilroy-Medium",
												fontWeight: "500",
												fontSize: 16,
												lineHeight: 24,
												marginTop: 4
											}}

											cursorColor={"#222"}

											placeholder={i18n.t("enterQuantity")}

											keyboardType="numeric"

											placeholderTextColor="#AAAAAA"
											value={this.state.quantityInputValue}/>
										{
											this.state.quantityInputError ?
												<Animatable.View animation="shake" duration={500}>
													<Text style={{color: "red"}}>{i18n.t("quantityIsNotEnough")}</Text>
												</Animatable.View> : null
										}
									</View>

									{/*
										BIZDA IKKITA TEXTINPUT BOR BIRIGA YOZILSA IKKINCHISIGA AVTOMATIK QIYMAT BERILISHI KERAK
										QUANTITY O"ZGARTIRILSA NARXI NARXI O"ZGARTIRILSA QUANTITY 
									*/}
									{/*
										* 1. TextInput valuelarini stateda saqlash.
										* 2. Birinchi textInput onChange bo"lganda ikkinchisini valuesini o"zgartirish.
										* 3. 
										* 4. 
									*/}

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>{i18n.t("priceInSelling")}</Text>
										<TextInput
											autoCapitalize="none"

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

											placeholder={i18n.t("enterPriceInSelling")}

											placeholderTextColor="#AAAAAA"

											cursorColor={"#222"}

											keyboardType="numeric"

											value={this.state.priceInputValue}/>
									</View>

									<TouchableOpacity
										style={styles.modalButton}
										onPress={() => {
											
											let error = false;
											let selectedProduct = this.state.selectedProduct;
											if (Object.keys(this.state.selectedProduct).length === 0 || !this.state.selectedProduct) {
												this.setState({productNameInputError: true});
												error = true;
											}

											if (
												!this.state.quantityInputValue || 
												isNaN(this.state.quantityInputValue) || 
												this.state.quantityInputValue < 0
											) {
												this.setState({quantityInputError: true});
												error = true;
											}

											if (error == true) {
												return;
											}

											let sellingProducts = [...this.state.sellingProducts];

											let existingProductIndex =
												sellingProducts.findIndex(
													element => element.id === selectedProduct.id
												);

											//.log(existingProductIndex);
											if (existingProductIndex !== -1) {

												let minusedValue =
													parseFloat(selectedProduct.count) -
													(
														parseFloat(this.state.quantityInputValue)
														+
														sellingProducts[existingProductIndex].count
													);

												if (minusedValue < 0) {
													this.setState({quantityInputError: true})
													return;
												} else {
													// method will countinue
												}
											} else {
												let minusedValue =
													parseFloat(selectedProduct.count) - parseFloat(this.state.quantityInputValue);
												if (minusedValue < 0) {
													this.setState({quantityInputError: true})
													return;
												} else {

													// method will countinue
												}
											}

											selectedProduct.serial_number = "";
											selectedProduct.count = parseFloat(this.state.quantityInputValue);

											this.setState({
												amount: this.state.amount + (
													selectedProduct.nds == 1 ? (
														(() => {
															let a = selectedProduct.selling_price;
															let twelvePercent = a * 0.12;
															a += twelvePercent;
															a *= selectedProduct.count;
															return a;
														})()
													) : selectedProduct.selling_price * selectedProduct.count
												)
											});


											this.setState({
												profit: this.state.profit + (selectedProduct.count *
													(selectedProduct.selling_price -
													selectedProduct.price)
												)
											});

											let foundProduct =
												this.state.sellingProducts.find(product => product.id === selectedProduct.id);
											if (foundProduct != null) {
												const updatedSellingProducts =
													this.state.sellingProducts.map(product => {
														if (product.id === selectedProduct.id) {
															return {
																...product,
																count: product.count + selectedProduct.count
															};
														}
														return product;
													});

												this.setState((prevState) => ({
													sellingProducts: updatedSellingProducts
												}));
											} else {
												this.setState((prevState) => ({
													sellingProducts: [...prevState.sellingProducts, selectedProduct]
												}));
											}

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
												priceInputValue: "",
												quantityInputError: false,
												productNameInputError: false
											});

											this.toggleModal();
										}}>
										<Text
											style={styles.modalButtonText}>{i18n.t("addToBasket")}</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</Modal>

					<Modal
						visible={this.state.isUtilizationModalVisible}
						animationType="slide"
						style={{}}
						onRequestClose={() => {
							this.setState({isUtilizationModalVisible: false})
						}}
						transparent={true}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={() => {
								this.setState({isUtilizationModalVisible: false})
							}}>
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
							justifyContent: "center",
						}}>
							<View style={
								this.state.isKeyboardOn ?
									{
										width: screenWidth - (16 * 2),
										maxWidth: 343,
										marginLeft: "auto",
										marginRight: "auto",
										flex: 1,
										alignItems: "center",

										justifyContent: "flex-start",
										paddingTop: 20,
									} : {
										width: screenWidth - (16 * 2),
										maxWidth: 343,
										marginLeft: "auto",
										marginRight: "auto",
										flex: 1,
										alignItems: "center",

										justifyContent: "center",
									}}>
								<View style={{
									width: "100%",
									padding: 20,
									borderRadius: 12,
									backgroundColor: "#fff",
									paddingTop: 60,
								}}>
									<TouchableOpacity
										style={styles.crossIconWrapper}
										onPress={() => {
											this.setState({
												isProductNameInputFocused: false,
												isQuantityInputFocused: false,
												isPriceInputFocused: false,
												recommenderProducts: [],
												selectedProduct: {},
												productNameContentStyle: {},
												productNameInputValue: "",
												quantityInputValue: "",
												priceInputValue: "",
												quantityInputError: false
											});

											this.setState((prevState) => ({
												isUtilizationModalVisible: !prevState.isUtilizationModalVisible,
											}));
										}}>
										<CrossIcon/>
									</TouchableOpacity>


									<View>
										<Text style={styles.modalLabel}>{i18n.t("productName")}</Text>
										<TextInput
											autoCapitalize="none"
											autoComplete={"off"}
											autoCorrect={false}

											onChangeText={async (value) => {
												this.setState({
													productNameInputValue: value
												});

												let text = value;
												if (text.length < 1) {
													this.setState({
														recommenderProducts: [],
														isQuantityInputFocused: false,
														isPriceInputFocused: false,
														selectedProduct: {},
														productNameContentStyle: {},
														quantityInputValue: "",
														priceInputValue: ""
													});
													return;
												}

												this.setState({
													productNameInputValue: value
												});



												let storeProducts =
													await this.storeProductRepository.searchProductsInfo(
														text + "%"
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

											placeholder={i18n.t("enterName")}

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
																		this.setState({
																			scaleValue: 0.9,
																		});
																	}}

																	onPressOut={() => {
																		this.setState({
																			scaleValue: 1
																		});
																	}}

																	style={({pressed}) => [
																		{
																			paddingVertical: 14,
																			paddingHorizontal: 16,
																			borderTopWidth: 1,
																			borderColor: "#F1F1F1"
																		},
																		{
																			backgroundColor: pressed ? "#CCCCCC" : "#FBFBFB",
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
										{
											this.state.productNameInputError ?
												<Animatable.View animation="shake" duration={500}>
													<Text style={{color: "red"}}>{i18n.t("productMustBeSelected")}</Text>
												</Animatable.View> : null
										}
									</View>

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>{i18n.t("quantity")}</Text>
										<TextInput
											autoCapitalize="none"

											onFocus={() => {
												this.setState({isQuantityInputFocused: true})
											}}

											onEndEditing={() => {
												this.setState({isQuantityInputFocused: false})
											}}

											onChangeText={(value) => {
												if (Object.keys(this.state.selectedProduct).length === 0 || !this.state.selectedProduct) {
													this.setState({productNameInputError: true})
													return;
												}

												this.setState({quantityInputValue: value});
												// FIST OF ALL GET CURRENT SELLING PRICE.
												let sellingPrice = this.state.selectedProduct.selling_price;
												//.log((parseInt(value) * sellingPrice));
												this.setState({priceInputValue: (parseInt(value) * sellingPrice) + ""});
											}}

											style={{
												paddingHorizontal: 16,
												paddingVertical: 14,
												borderWidth: 1,
												borderColor: (this.state.quantityInputError ? "red" : this.state.isQuantityInputFocused ? "#222" : "#AFAFAF"),
												borderRadius: 8,
												fontFamily: "Gilroy-Medium",
												fontWeight: "500",
												fontSize: 16,
												lineHeight: 24,
												marginTop: 4
											}}

											cursorColor={"#222"}

											placeholder={i18n.t("enterQuantity")}

											keyboardType="numeric"

											placeholderTextColor="#AAAAAA"
											value={this.state.quantityInputValue}/>
										{
											this.state.quantityInputError ?
												<Animatable.View animation="shake" duration={500}>
													<Text style={{color: "red"}}>{i18n.t("quantityIsNotEnough")}</Text>
												</Animatable.View> : null
										}
									</View>

									<View style={styles.inputBlock}>
										<Text style={styles.modalLabel}>{i18n.t("priceInSelling")}</Text>
										<TextInput
											autoCapitalize="none"

											onFocus={() => {
												this.setState({isPriceInputFocused: true});
											}}

											onEndEditing={() => {
												this.setState({isPriceInputFocused: false});
											}}

											onChangeText={(value) => {
												if (Object.keys(this.state.selectedProduct).length === 0 || !this.state.selectedProduct) {
													this.setState({productNameInputError: true})
													return;
												}

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

											placeholder={i18n.t("enterPriceInSelling")}

											placeholderTextColor="#AAAAAA"

											cursorColor={"#222"}

											keyboardType="numeric"

											value={this.state.priceInputValue}/>
									</View>

									<TouchableRipple
										delayHoverIn={true}
										delayLongPress={false}
										delayHoverOut={false}
										unstable_pressDelay={false}
										rippleColor="#E5E5E5"
										rippleContainerBorderRadius={50}
										borderless={true}
										style={styles.modalButton}
										onPress={() => {
											let selectedProduct = this.state.selectedProduct;
											//.log(selectedProduct)

											let error = false;
											if (Object.keys(selectedProduct).length === 0 || !this.state.selectedProduct) {
												this.setState({productNameInputError: true})
												error = true;
											}

											if (
												!this.state.quantityInputValue || 
												this.state.quantityInputValue === "" ||
												this.state.quantityInputValue === "0" || 
												isNaN(this.state.quantityInputValue)
											) {
												this.setState({quantityInputError: true})
												error = true;
											}

											if (error == true) {
												return;
											}

											let sellingProducts = [...this.state.sellingProducts];

											let existingProductIndex =
												sellingProducts.findIndex(
													element => element.id === selectedProduct.id
												);

											//.log(existingProductIndex);
											if (existingProductIndex !== -1) {

												let minusedValue =
													parseFloat(selectedProduct.count) -
													(
														parseFloat(this.state.quantityInputValue)
														+
														sellingProducts[existingProductIndex].count
													);

												if (minusedValue < 0) {
													this.setState({quantityInputError: true})
													return;
												} else {
													// method will countinue
												}
											} else {
												let minusedValue =
													parseFloat(selectedProduct.count) - parseFloat(this.state.quantityInputValue);
												if (minusedValue < 0) {
													this.setState({quantityInputError: true})
													return;
												} else {

													// method will countinue
												}
											}

											selectedProduct.serial_number = "";
											selectedProduct.count = parseFloat(this.state.quantityInputValue);

											// DON'T ADD - value to AMOUNT
											// this.setState({
											// 	amount: this.state.amount + (selectedProduct.selling_price * selectedProduct.count)
											// });

											// NO PROFIT
											// this.setState({
											// 	profit: this.state.profit + (
											// 		selectedProduct.selling_price -
											// 		selectedProduct.price
											// 	)
											// });

											let foundProduct =
												this.state.sellingProducts.find(product => product.id === selectedProduct.id && product.count < 0);
											if (foundProduct != null) {
												const updatedSellingProducts =
													this.state.sellingProducts.map(product => {
														if (product.id === selectedProduct.id && product.count < 0) {
															return {
																...product, count: (
																	product.count +
																	parseFloat("-" + selectedProduct.count)
																)
															};
														}
														return product;
													});

												this.setState((prevState) => ({
													sellingProducts: updatedSellingProducts
												}));
											} else {
												selectedProduct.count = parseFloat("-" + selectedProduct.count);
												//.log("PRODUCT COUNT::")
												//.log(selectedProduct.count)

												this.setState((prevState) => ({
													sellingProducts: [...prevState.sellingProducts, selectedProduct]
												}));
											}

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
												priceInputValue: "",
												quantityInputError: false
											});

											this.setState((prevState) => ({
												isUtilizationModalVisible: !prevState.isUtilizationModalVisible,
											}));
										}}>
										<Text
											style={styles.modalButtonText}>{i18n.t("makeAnUtilization")}</Text>
									</TouchableRipple>
								</View>
							</View>
						</View>
					</Modal>
				</View>
			</>
		);
	}

	sellProducts = async () => {
		if (this.state.sellingProducts.length == 0) {
			// TODO ERROR MESSAGE IF THERE IS NO PRODUCT ADDED
			return;
		}

		if (this.state.SAVE_BUTTON_AVAILABLE == false) {
			//.log("this.state.SAVE_BUTTON_AVAILABLE == false")
			return;
		}

		this.setState({
			SAVE_BUTTON_AVAILABLE: false
		});

		//.log(this.state.sellingProducts);

		let sellGroupId =
			await this.sellHistoryRepository.createSellGroup(this.state.amount);
		//.log(this.state.profit);

		let profitGroupId =
			await this.profitHistoryRepository.createProfitGroup(this.state.profit);

		//.log("PROFIT ", profitGroupId);

		for (const sellingProduct of this.state.sellingProducts) {
			//.log(sellingProduct);

			let historyId =
				await this.sellHistoryRepository.createSellHistory(
					sellingProduct.product_id,
					sellingProduct.count,
					sellingProduct.count_type,
					sellingProduct.selling_price
				);

			await this.sellHistoryRepository.createSellHistoryGroup(historyId, sellGroupId);
		}

		//.log("PROFIT GROUP:::", profitGroupId);
		//.log("SELL GROUP:::", sellGroupId);

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

		for (const sellingProduct of this.state.sellingProducts) {
			if (sellingProduct.selling_price > 0) {
				let historyId;
				if (sellingProduct.count > 0) {
					historyId = await this.profitHistoryRepository.createProfitHistory(
						sellingProduct.product_id,
						sellingProduct.count,
						sellingProduct.count_type,
						sellingProduct.selling_price - sellingProduct.price
					);

					await this.profitHistoryRepository.createProfitHistoryGroup(
						historyId,
						profitGroupId
					);
				} else {
					historyId = await this.profitHistoryRepository.createProfitHistory(
						sellingProduct.product_id,
						sellingProduct.count,
						sellingProduct.count_type,
						0
					);

					await this.profitHistoryRepository.createProfitHistoryGroup(
						historyId,
						profitGroupId
					);
				}

				// sellingProduct.count is -5 make it 5 and run this method
				sellingProduct.count = Math.abs(sellingProduct.count);

				await this.storeProductRepository.updateCount(
					sellingProduct.product_id,
					sellingProduct.count
				);
			}
		}

		// oylik foyda bilan kirimni localStorageda saqlash.
		// + bugungi oyni sonini ham


		// HOW TO GET yyyy-mm-dd from new Date()

		// Get the current date
		const currentDate = new Date();

		// Extract year, month, and day
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, "0");

		// Format the date as yyyy-mm-dd
		const formattedDate = `${year}-${month}-${day}`;

		// UPDATE CURRENT DAY AMOUNTS..
		await this.amountDateRepository.setProfitAmount(
			this.state.profit, formattedDate
		);
		await this.amountDateRepository.setSellAmount(
			this.state.amount, formattedDate
		);

		//.log("setSellAmount::", formattedDate)

		// STORING CURRENT MONTHLY AMOUNTS
		const currentMonth = currentDate.getMonth();
		await AsyncStorage.setItem("month", currentMonth + "");

		let lastSellAmount = await AsyncStorage.getItem("month_sell_amount");
		let lastProfitAmount = await AsyncStorage.getItem("month_profit_amount");

		const newSellAmount = lastSellAmount == null || lastSellAmount === ""
			? this.state.amount
			: parseInt(lastSellAmount) + this.state.amount;

		const newProfitAmount = lastProfitAmount == null || lastProfitAmount === ""
			? this.state.profit
			: parseInt(lastProfitAmount) + this.state.profit;

		await AsyncStorage.setItem("month_sell_amount", newSellAmount.toString());
		await AsyncStorage.setItem("month_profit_amount", newProfitAmount.toString());

		this.setState({
			isModalVisible: false,
			isFocused: true,
			sellingProducts: [],
			seria: "",
			amount: 0,
			profit: 0
		});

		await AsyncStorage.setItem("isNotSaved", "true");
		await AsyncStorage.setItem("shoppingNotSaved", "true");

		await AsyncStorage.setItem("shoppingFullyLoaded", "false");
		await AsyncStorage.setItem("profitFullyLoaded", "false");
		await AsyncStorage.setItem("basketFullyLoaded", "false");

		await AsyncStorage.setItem("window", "Shopping");

		this.setState({
			SAVE_BUTTON_AVAILABLE: true
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

//.log(hourAndMinute);
//.log(currentDay + "-" + currentMonth);
//.log(currentWeekDayName);
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
		// backgroundColor: "red",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},

	pageTitleText: {
		width: 250,
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
		height: 60,
		width: 60,
		borderRadius: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		right: 0
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
		shadowColor: "rgba(0, 0, 0, 0.25)",
		shadowOffset: {width: 2, height: 4},
		shadowOpacity: 1,
		shadowRadius: 4,
	}

});

export default memo(Sell);