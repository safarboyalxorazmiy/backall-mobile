import React, {Component, memo} from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Dimensions,
	TextInput,
	Pressable,
	Keyboard,
} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import ToggleSwitch from "toggle-switch-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TouchableWithoutFeedback} from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";

import ProductRepository from "../../repository/ProductRepository";
import StoreProductRepository from "../../repository/StoreProductRepository";

import BackIcon from "../../assets/arrow-left-icon.svg"
import { TouchableRipple } from 'react-native-paper';
import i18n from '../../i18n';

const screenWidth = Dimensions.get("window").width;
const myScrollViewRef = React.createRef();

class ProductAdd extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedItem: null,

			brandInputValue: "",
			brandInputStyle: styles.input,
			brandErr: false,

			productInputValue: "",
			productInputStyle: styles.input,
			productNameErr: false,

			amountInputValue: "",
			amountInputStyle: styles.amountInput,
			amountErr: false,

			priceInputValue: "",
			priceInputStyle: styles.input,
			priceInputErr: false,

			sellingPriceInputValue: "",
			products: [],
			nds: false,

			seriyaInputValue: "",
			seriyaError: false,
			serialInputStyle: styles.serialInput,
			serialInputContentStyle: {display: "none"},
			isSerialInputActive: false,
			focusedContentIndex: null,

			sellingPriceError: false,
			priceInput: styles.priceInput,

			isCreated: false,

			ndsWrapperStyle: styles.ndsWrapper,

			amountType: "dona",
			sellingPriceType: "so'm",

			profitCalculation: "",
			profitCalculationIsVisible: false,

			sellingPrice: null,
			percentageOfPrice: null
		};

		this.productRepository = new ProductRepository();
		this.storeProductRepository = new StoreProductRepository();
	}

	initializeScreen() {
		this.setState({
			selectedItem: null,

			brandInputValue: "",
			brandInputStyle: styles.input,
			brandErr: false,

			productInputValue: "",
			productInputStyle: styles.input,
			productNameErr: false,

			amountInputValue: "",
			amountInputStyle: styles.amountInput,
			amountErr: false,

			priceInputValue: "",
			priceInputStyle: styles.input,
			priceInputErr: false,

			sellingPriceInputValue: "",
			products: [],
			nds: false,

			seriyaInputValue: "",
			seriyaError: false,
			serialInputStyle: styles.serialInput,
			serialInputContentStyle: {display: "none"},
			isSerialInputActive: false,
			focusedContentIndex: null,

			sellingPriceError: false,
			priceInput: styles.priceInput,

			isCreated: false,

			ndsWrapperStyle: styles.ndsWrapper,

			amountType: "dona",
			sellingPriceType: "so'm",

			profitCalculation: "",
			profitCalculationIsVisible: false,

			sellingPrice: null,
			percentageOfPrice: null
		});

		this.productRepository = new ProductRepository();
		this.storeProductRepository = new StoreProductRepository();
	}

	componentDidMount() {
		const {navigation} = this.props;
		navigation.addListener("focus", async () => {
			if (await AsyncStorage.getItem("loadProductAdd") == "true") {
				this.initializeScreen();
			}
		});
	}

	handlePressIn = () => {
	};

	handlePressOut = () => {
	};

	setCheckmarkScale(checkmarkScale) {
		this.setState({checkmarkScale: checkmarkScale});
	}

	handleAmountTypeSelect = (value) => {
		this.setState({amountType: value.value});
	};

	handleSellingPriceTypeSelect = (value) => {
		this.setState({sellingPriceType: value.value});
	}

	defineInputContentStyle = (hide) => {
		if (hide) {
			this.setState({serialInputContentStyle: {display: "none"}});
			this.setState({serialInputStyle: styles.input});
			return;
		}

		if (this.state.products.length === 0) {
			this.setState({serialInputContentStyle: {display: "none"}});
			this.setState({serialInputStyle: styles.serialInputClicked});
		} else {
			this.setState({serialInputStyle: styles.serialInputClicked})
			this.setState({serialInputContentStyle: styles.serialContent});
		}
	}

	serialInputPressOut = () => {
		this.setState({serialInputStyle: styles.input})

		this.defineInputContentStyle(false);
	}

	setSerialInputNotActive = () => {
		this.setState({serialInputStyle: styles.serialInput})
	}

	selectProduct = (product) => {
		this.setState({seriyaInputValue: product.serial_number})
		this.setState({brandInputValue: product.brand_name})
		this.setState({productInputValue: product.name})

		this.defineInputContentStyle(true);
	}

	scrollVertically = (y) => {
		myScrollViewRef.current?.scrollTo({x: 0, y: y, animated: true});
	};

	ndsPressIn = () => {
		this.setState({ndsWrapperStyle: styles.ndsWrapperActive})
	}

	ndsPressOut = () => {
		this.setState({ndsWrapperStyle: styles.ndsWrapper})
	}

	// SERIAL INPUT FUNCTIONS
	onChangeSerialInput = async (seria) => {
		this.setState({seriyaInputValue: seria});
		this.setState({products: await this.productRepository.findProductsBySerialNumber(seria)});

		this.defineInputContentStyle(false);
		this.setState({
			seriyaError: false,
			serialInputStyle: styles.serialInputClicked
		})
	}

	onFocusSerialInput = () => {
		this.setState({
			serialInputStyle: styles.serialInputClicked,
			isSerialInputActive: true
		})
	}

	onEndSerialEditing = (e) => {
		this.setSerialInputNotActive();
	}

	// BRAND INPUT FUNCTIONS
	onChangeBrandInput = (text) => {
		this.setState({brandInputValue: text})

		if (text.length < 3) {
			this.setState({
				brandInputStyle: styles.inputActive, brandErr: false,
			})
		}
	}

	onFocusBrandInput = () => {
		this.defineInputContentStyle(true);

		this.setState({brandInputStyle: styles.inputActive});
	}

	onEndEditingBrandInput = () => {
		this.setState({brandInputStyle: styles.input});
	}

	// PRODUCT NAME INPUT FUNCTIONS
	onChangeProductInput = (text) => {
		this.setState({
			productInputValue: text
		})
	}

	onFocusProductInput = () => {
		this.defineInputContentStyle(true);

		this.setState({
			productInputStyle: styles.inputActive
		})
	}

	onEndEditingProductInput = () => {
		this.setState({
			productInputStyle: styles.input
		})
	}

	// AMOUNT INPUT FUNCTIONS
	onChangeAmountInput = (text) => {
		this.setState({amountInputValue: text});
	}

	onFocusAmountInput = () => {
		this.defineInputContentStyle(true);

		this.setState({amountInputStyle: styles.amountInputActive});
	}

	onEndEditingAmountInput = () => {
		this.setState({amountInputStyle: styles.amountInput});
	}

	// PRICE INPUT FUNCTIONS
	onChangePriceInput = (text) => {
		this.setState({priceInputValue: text})
	}

	onFocusPriceInput = () => {
		this.defineInputContentStyle(true);

		this.setState({priceInputStyle: styles.inputActive})
	}

	onEndEditingPriceInput = () => {
		this.setState({priceInputStyle: styles.input})
	}

	// SELLING PRICE INPUT FUNCTIONS
	onChangeSellingPriceInput = (text) => {
		this.setState({sellingPriceInputValue: text});
	}

	onFocusSellingPriceInput = () => {
		this.defineInputContentStyle(true);

		this.setState({
			priceInput: styles.priceInputActive
		})
	}

	onEndEditingSellingPriceInput = () => {
		if (this.state.sellingPriceType === "so'm") {
			if (
				this.state.priceInputValue == ""
			) {
				this.setState({
					priceInputValue: "",
					priceInputStyle: styles.inputErr,
					priceInputErr: true,
				})

				return;
			} else {
				this.setState({
					priceInputStyle: styles.input,
					priceInputErr: false,
				})
			}

			const percentage = ((this.state.sellingPriceInputValue - this.state.priceInputValue) / this.state.priceInputValue) * 100;
			this.setState({
				profitCalculation: percentage + "%",
				profitCalculationIsVisible: true,

				sellingPrice: this.state.sellingPriceInputValue,
				percentageOfPrice: percentage
			});

		} else {
			const exactSellingPrice = (this.state.priceInputValue * this.state.sellingPriceInputValue) / 100;
			this.state.profitCalculation = exactSellingPrice;
			this.setState({
				profitCalculation: (parseFloat(this.state.priceInputValue) + exactSellingPrice) + " so'm",
				profitCalculationIsVisible: true,

				sellingPrice: parseFloat(this.state.priceInputValue) + exactSellingPrice,
				percentageOfPrice: this.state.sellingPriceInputValue
			});
		}
	}

	handleInputBlur = () => {
		Keyboard.dismiss();
	};

	render() {
		const amountData = [
			{label: i18n.t('dona'), value: "dona"},
			{label: i18n.t("kg"), value: "kg"},
			{label: i18n.t("litr"), value: "litr"}
		];
		
		const priceData = [
			{label: "%", value: "%"},
			{label: i18n.t("sum"), value: "so'm"}
		];

		const {navigation} = this.props;

		return (
			<View style={{
				backgroundColor: "white"
			}}>
				<View
					style={[
						styles.pageTitle,
						{
							paddingTop: 52,
							borderBottomWidth: 1,
							borderColor: "#F1F1F1"
						}
					]}>
					<TouchableRipple
						delayHoverIn={true}
						delayLongPress={false}
						delayHoverOut={false}
						unstable_pressDelay={false}
						rippleColor="#E5E5E5"
						rippleContainerBorderRadius={50}
						borderless={true}
						onPress={() => {
							navigation.navigate("Basket")
						}}
						style={styles.backIcon}>

						<BackIcon/>
					</TouchableRipple>

					<Text style={styles.pageTitleText}>
						{i18n.t("addProduct")}
					</Text>
				</View>

				<ScrollView
					contentContainerStyle={[styles.container]}
					ref={myScrollViewRef}>
					<View style={[
						styles.inputWrapper,
						{
							marginTop: 10
						}]}>

						{/* CODE FOR INIT RANDOM PRODUCTS WHEN IT"S EMPTY.. */}
						{/* <View style={{padding: 20}}>
							<TouchableOpacity 
								onPress={async () => {
									await this.init();
								}}
							 	style={{backgroundColor: "#000", padding: 10}}>
								<Text style={{color: "#FFF"}}>INIT FUCKING PRODUCTS ... </Text>
							</TouchableOpacity>
						</View> */}

						<Text
							style={styles.label}>{i18n.t("productSerial")}</Text>
						<TextInput
							autoCapitalize="none"
							cursorColor="#222222"
							style={this.state.serialInputStyle}
							placeholder={i18n.t("enterSerial")}
							placeholderTextColor="#AAAAAA"
							value={this.state.seriyaInputValue}

							onChangeText={this.onChangeSerialInput}
							onFocus={this.onFocusSerialInput}
							onEndEditing={this.onEndSerialEditing}

							onPressIn={() => {
								this.scrollVertically(0);
							}}
						/>

						<View style={{position: "relative", marginTop: 2}}>
							<View style={this.state.serialInputContentStyle}>
								{
									this.state.products.map(
										(item, index) =>
											(
												<Pressable
													onPress={() => {
														this.selectProduct(item);
													}}

													onPressIn={() => {
													}}
													onPressOut={() => {
													}}

													style={({pressed}) => [
														styles.serialInputSuggestion,
														{
															backgroundColor: pressed ? "#CCCCCC" : "#FBFBFB",
														},
													]} key={index}>

													<Text>{item.brand_name}</Text>
												</Pressable>
											)
									)
								}
							</View>
						</View>

						{this.state.seriyaError === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>Seriya xato kiritildi.</Text>
						</Animatable.View> : null}
					</View>

					<View style={styles.inputWrapper}>
						<Text style={styles.label}>{i18n.t("brandName")}</Text>
						<TextInput
							autoCapitalize="none"
							cursorColor="#222222"
							style={this.state.brandInputStyle}
							value={this.state.brandInputValue}
							placeholder={i18n.t("enterBrandName")}
							placeholderTextColor="#AAAAAA"

							onChangeText={this.onChangeBrandInput}
							onFocus={this.onFocusBrandInput}
							onEndEditing={this.onEndEditingBrandInput}
						/>

						{this.state.brandErr === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>{i18n.t("incorrectBrandName")}</Text>
						</Animatable.View> : null}
					</View>

					<View style={styles.inputWrapper}>
						<Text style={styles.label}>{i18n.t("productName")}</Text>
						<TextInput
							autoCapitalize="none"
							cursorColor="#222222"
							style={this.state.productInputStyle}
							placeholder={i18n.t("enterName")}
							placeholderTextColor="#AAAAAA"
							value={this.state.productInputValue}

							onChangeText={this.onChangeProductInput}
							onFocus={this.onFocusProductInput}
							onEndEditing={this.onEndEditingProductInput}
						/>

						{this.state.productNameErr === true ?
							<Animatable.View animation="shake" duration={500}>
								<Text style={styles.errorMsg}>{i18n.t("incorrectProductName")}</Text>
							</Animatable.View> : null}
					</View>

					<View style={styles.inputWrapper}>
						<Text style={styles.label}>{i18n.t("productCount")}</Text>
						<View style={styles.amountGroup}>
							<TextInput
								autoCapitalize="none"
								cursorColor="#222222"
								keyboardType="numeric"
								style={this.state.amountInputStyle}
								placeholder={i18n.t("enterName")}
								placeholderTextColor="#AAAAAA"
								value={this.state.amountInputValue}

								onChangeText={this.onChangeAmountInput}
								onFocus={this.onFocusAmountInput}
								onEndEditing={this.onEndEditingAmountInput}
							/>

							<View style={styles.amountType}>
								<Dropdown
									data={amountData}
									labelField="label"
									valueField="value"
									value={this.state.amountType}
									onChange={this.handleAmountTypeSelect}

									style={[
										styles.dropdown,
										{borderRadius: 8}
									]}

									baseColor="white"

									selectedTextProps={{
										style: {
											fontSize: 16,
											color: "white",
											fontFamily: "Gilroy-Medium",
											fontWeight: "500",
										},
									}}

									activeColor="black"
									selectedTextStyle={{
										fontSize: 16,
										color: "white"
									}}

									fontFamily="Gilroy-Medium"

									containerStyle={{
										backgroundColor: "#444444",
										borderTopRightRadius: 8,
										borderBottomRightRadius: 8,
										overflow: "hidden"
									}}

									itemContainerStyle={{
										backgroundColor: "#444444"
									}}

									itemTextStyle={{
										color: "white"
									}}

									iconStyle={{
										tintColor: "white",
										width: 24,
										height: 24
									}}
								/>
							</View>
						</View>

						{
							this.state.amountErr === true ?
								<Animatable.View animation="shake" duration={500}>
									<Text style={styles.errorMsg}>{i18n.t("incorrectCount")}</Text>
								</Animatable.View> : null
						}
					</View>

					<View style={styles.inputWrapper}>
						<Text style={styles.label}>{i18n.t("netWorth")}</Text>
						<TextInput
							autoCapitalize="none"
							cursorColor="#222222"
							keyboardType="numeric"
							style={this.state.priceInputStyle}
							placeholder={i18n.t("enterPrice")}
							placeholderTextColor="#AAAAAA"
							value={this.state.priceInputValue}

							onChangeText={this.onChangePriceInput}
							onFocus={this.onFocusPriceInput}
							onEndEditing={this.onEndEditingPriceInput}

							onPressIn={() => {
								this.scrollVertically(200)
							}}
						/>

						{
							this.state.priceInputErr === true ?
								<Animatable.View animation="shake" duration={500}>
									<Text style={styles.errorMsg}>{i18n.t("incorrectNetWorth")}</Text>
								</Animatable.View> : null
						}
					</View>

					<View style={styles.inputWrapper}>
						<Text style={styles.label}>{i18n.t("sellingPrice")}</Text>
						<View style={styles.inputGroup}>
							<TextInput
								autoCapitalize="none"
								cursorColor="#222222"
								keyboardType="numeric"
								style={this.state.priceInput}
								placeholder={i18n.t("enterSellingPrice")}
								placeholderTextColor="#AAAAAA"
								value={this.state.sellingPriceInputValue}
								onChangeText={this.onChangeSellingPriceInput}
								onEndEditing={this.onEndEditingSellingPriceInput}
								onFocus={this.onFocusSellingPriceInput}

								onPressIn={() => {
									this.scrollVertically(200)
								}}
							/>

							<View style={styles.priceType}>
								<Dropdown
									data={priceData}
									labelField="label"
									valueField="value"
									value={this.state.sellingPriceType}
									onChange={this.handleSellingPriceTypeSelect}

									style={[styles.dropdown, {borderRadius: 8}]}

									baseColor="white"

									selectedTextProps={{
										style: {
											fontSize: 16,
											color: "white",
											fontFamily: "Gilroy-Medium",
											fontWeight: "500",
										},
									}}

									activeColor="black"
									selectedTextStyle={{
										fontSize: 16, color: "white"
									}}

									fontFamily="Gilroy-Medium"

									containerStyle={{
										backgroundColor: "#444444",
										borderTopRightRadius: 8,
										borderBottomRightRadius: 8,
										overflow: "hidden"
									}}
									itemContainerStyle={{backgroundColor: "#444444"}}

									itemTextStyle={{color: "white"}}

									iconStyle={{tintColor: "white", width: 24, height: 24}}
								/>
							</View>
						</View>

						{this.state.sellingPriceError === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>{i18n.t("incorrectSellingPrice")}</Text>
						</Animatable.View> : null}

						<View style={{marginTop: 16}}>
							{this.state.profitCalculationIsVisible === true ?
								<Animatable.View animation="slideInUp" duration={500}>
									<Text style={{fontFamily: "Gilroy-Bold", fontSize: 16, fontWeight: "bold", color: "#65C466"}}>
										{this.state.profitCalculation}
									</Text>
								</Animatable.View>
								: null}
						</View>
					</View>

					<View>
						<TouchableWithoutFeedback
							style={this.state.ndsWrapperStyle}
							onPress={() => {
								this.setState({nds: !this.state.nds});
							}}
							onPressIn={() => {
								this.ndsPressIn();
							}}
							onPressOut={() => {
								this.ndsPressOut();
							}}>
							<Text style={{
								fontSize: 16,
								fontFamily: "Gilroy-Medium"
							}}>{i18n.t("ndsTax")}</Text>

							<ToggleSwitch
								onColor="#65C466"
								offColor="gray"
								labelStyle={{color: "black", fontWeight: "900"}}
								size="large"

								onToggle={() => {
								}}

								isOn={this.state.nds}

								animationSpeed={150}
							/>

						</TouchableWithoutFeedback>
					</View>


					<View style={{
						height: 250
					}}>
						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							style={[
								{display: "block"},
								styles.buttonDark
							]}
							onPress={this.createProduct}>
							<Text style={styles.buttonDarkText}>{i18n.t("addProduct")}</Text>
						</TouchableRipple>

						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							style={[
								{display: "block"},
								styles.buttonLight
							]}
							onPress={() => {
								this.setState({
									selectedItem: null,

									brandInputValue: "",
									brandInputStyle: styles.input,
									brandErr: false,

									productInputValue: "",
									productInputStyle: styles.input,
									productNameErr: false,

									amountInputValue: "",
									amountInputStyle: styles.amountInput,
									amountErr: false,

									priceInputValue: "",
									priceInputStyle: styles.input,
									priceInputErr: false,

									sellingPriceInputValue: "",
									products: [],
									nds: false,

									seriyaInputValue: "",
									seriyaError: false,
									serialInputStyle: styles.serialInput,
									serialInputContentStyle: {display: "none"},

									sellingPriceError: false,
									priceInput: styles.priceInput,

									isCreated: false,

									profitCalculation: "",
									profitCalculationIsVisible: false,
								});

								navigation.navigate("Basket");
							}}>
							<Text style={styles.buttonLightText}>{i18n.t("cancel")}</Text>
						</TouchableRipple>
					</View>
				</ScrollView>
			</View>);
	}

	createProduct = async () => {
		const {
			seriyaInputValue,
			brandInputValue,
			productInputValue,
			amountInputValue,
			priceInputValue,
			sellingPriceInputValue,
		} = this.state;

		let isValidInputValues = true;

		if (brandInputValue.length < 3) {
			if (!isValidInputValues) {
				this.scrollVertically(0);
			} else {
				this.scrollVertically(110);
			}

			this.setState({
				brandInputValue: "",
				brandInputStyle: styles.inputErr,
				brandErr: true,
			})

			isValidInputValues = false;
		} else {
			this.setState({
				brandErr: false,
				brandInputStyle: styles.input,
			})
		}

		if (productInputValue.length < 3) {
			this.setState({
				productInputValue: "",
				productInputStyle: styles.inputErr,
				productNameErr: true,
			})

			isValidInputValues = false;
		} else {
			this.setState({
				productNameErr: false,
				productInputStyle: styles.input,
			})
		}

		if (amountInputValue <= 0 || amountInputValue.length <= 0) {
			this.setState({
				amountInputValue: "",
				amountInputStyle: styles.amountInputErr,
				amountErr: true,
			})

			isValidInputValues = false;
		} else {
			this.setState({
				amountErr: false,
				amountInputStyle: styles.amountInput,
			})
		}

		if (priceInputValue <= 0 || priceInputValue.length <= 0) {
			this.setState({
				priceInputValue: "",
				priceInputStyle: styles.inputErr,
				priceInputErr: true,
			})

			isValidInputValues = false;
		} else {
			this.setState({
				priceInputErr: false,
				priceInputStyle: styles.input,
			})
		}

		if (sellingPriceInputValue <= 0 || sellingPriceInputValue.length <= 0) {
			this.setState({
				sellingPriceError: true,
				priceInput: styles.priceInputErr
			})

			isValidInputValues = false;
		} else {
			this.setState({
				sellingPriceError: false,
				priceInput: styles.priceInput
			})
		}

		if (isValidInputValues) {
			await AsyncStorage.setItem("isCreated", "true");

			let productId = await this.productRepository.createAndGetProductId(
				productInputValue,
				brandInputValue,
				seriyaInputValue,
			)

			await this.storeProductRepository.create(
				productId,
				this.state.nds,
				this.state.priceInputValue,
				this.state.sellingPrice,
				this.state.percentageOfPrice,
				this.state.amountInputValue,
				this.state.amountType
			);

			await AsyncStorage.setItem("isNotSaved", "true")
			await AsyncStorage.setItem("productNotSaved", "true");
			await AsyncStorage.setItem("storeProductNotSaved", "true");

			this.setState({
				seriyaInputValue: "",
				brandInputValue: "",
				productInputValue: "",
				amountInputValue: "",
				priceInputValue: "",
				sellingPriceInputValue: "",
				nds: false,
				profitCalculation: "",
				profitCalculationIsVisible: false,
			});

			const {navigation} = this.props;
			navigation.navigate("Basket");
		} else {
		}
	};
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		alignItems: "center",
		height: "auto",
		gap: 10
	},

	label: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		marginBottom: 4
	},

	inputWrapper: {
		marginBottom: 16
	},

	input: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "#AFAFAF",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium"
	},

	inputErr: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "red",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium"
	},

	inputActive: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "#222",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium"
	},

	serialInput: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "#AFAFAF",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	serialInputErr: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "red",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	serialInputClicked: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		backgroundColor: "#FFF",
		borderColor: "#222222",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	serialInputValued: {
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "#AFAFAF",
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	serialContent: {
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
	},

	serialInputSuggestion: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderColor: "#F1F1F1"
	},

	inputGroup: {
		width: screenWidth - (17 + 17),
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between"
	},

	priceInput: {
		borderWidth: 1,
		borderColor: "#AFAFAF",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	priceInputActive: {
		borderWidth: 1,
		borderColor: "#222",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	priceInputErr: {
		borderWidth: 1,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		borderColor: "red"
	},

	priceType: {
		display: "flex",
		flexDirection: "row",
		gap: 25,
		alignItems: "center",
		justifyContent: "center",
		width: 122,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		backgroundColor: "#444444"
	},

	amountGroup: {
		display: "flex",
		flexDirection: "row"
	},

	amountInput: {
		borderWidth: 1,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderColor: "#AFAFAF",
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		borderRightWidth: 0
	},

	amountInputActive: {
		borderWidth: 1,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderColor: "#222",
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		borderRightWidth: 0
	},

	amountInputErr: {
		borderWidth: 1,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderColor: "red",
		width: screenWidth - (17 + 17 + 122),
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		borderRightWidth: 0
	},

	amountType: {
		display: "flex",
		flexDirection: "row",
		gap: 25,
		alignItems: "center",
		justifyContent: "center",
		width: 122,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		backgroundColor: "#444444",
		color: "white"
	},

	dropdown: {
		width: 122,
		paddingHorizontal: 16,
		backgroundColor: "#444444"
	},

	buttons: {
		width: screenWidth - (17 + 17),
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	buttonDark: {
		backgroundColor: "#222222",
		paddingVertical: 14,
		paddingHorizontal: 47,
		borderRadius: 8,
		width: screenWidth - (17 + 17),
		marginBottom: 16
	},

	buttonLight: {
		backgroundColor: "#fff",
		paddingVertical: 14,
		paddingHorizontal: 47,
		borderRadius: 8,
		width: screenWidth - (17 + 17),
		borderWidth: 1,
		borderColor: "#222222",
		marginBottom: 12
	},

	buttonLightText: {
		color: "black",
		fontFamily: "Gilroy-Medium",
		fontSize: 16,
		textAlign: "center",
	},

	buttonDarkText: {
		color: "white",
		fontFamily: "Gilroy-Medium",
		fontSize: 16,
		textAlign: "center"
	},

	pageTitle: {
		width: screenWidth,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginRight: "auto",
		marginLeft: "auto",
		paddingBottom: 16,
		paddingHorizontal: 17
	},

	pageTitleText: {
		width: 300,
		textAlign: "center",
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600"
	},

	backIcon: {
		backgroundColor: "#F5F5F7",
		paddingVertical: 16,
		paddingHorizontal: 19,
		borderRadius: 8
	},

	errorMsg: {
		color: "red"
	},

	ndsWrapper: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: screenWidth,
		paddingVertical: 10,
		paddingHorizontal: 17
	},

	ndsWrapperActive: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: screenWidth,
		backgroundColor: "#F5F5F7",
		paddingVertical: 10,
		paddingHorizontal: 17
	}
});

export default memo(ProductAdd);