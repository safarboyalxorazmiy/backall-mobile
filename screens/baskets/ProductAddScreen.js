import React, {Component} from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	TextInput,
	Animated,
	Pressable, Keyboard,
} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import ToggleSwitch from 'toggle-switch-react-native';
import * as Animatable from 'react-native-animatable';
import BackIcon from "../../assets/arrow-left-icon.svg"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TouchableWithoutFeedback} from "react-native-gesture-handler";
import ProductRepository from "../../repository/ProductRepository";
import StoreProductRepository from "../../repository/StoreProductRepository";

const amountData =
	[
		{label: "DONA", value: "1"},
		{label: "KG", value: "2"},
		{label: "GR", value: "3"},
		{label: "LITR", value: "4"}
	];

const priceData = [
	{label: "%", value: "1"},
	{label: "SUM", value: "2"},
	{label: "$", value: "3"},
	{label: "EURO", value: "4"}
];


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
			
			checkmarkScale: new Animated.Value(0),
			isCreated: false,
			
			ndsWrapperStyle: styles.ndsWrapper,
			
			scaleValue: new Animated.Value(1),

			amountType: "DONA",
			sellingPriceType: "SUM"
		};

    this.productRepository = new ProductRepository();
		this.storeProductRepository = new StoreProductRepository();
	}
	
	handlePressIn = () => {
		Animated.spring(this.state.scaleValue, {
			toValue: 0.9,
			useNativeDriver: true,
		}).start();
	};
	
	handlePressOut = () => {
		Animated.spring(this.state.scaleValue, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};
	
	setCheckmarkScale(checkmarkScale) {
		this.setState({checkmarkScale: checkmarkScale});
	}
	
	handleAmountTypeSelect = (value) => {
		this.setState({amountType: value.label});
	};

	handleSellingPriceTypeSelect = (value) => {
		this.setState({sellingPriceType: value.label});
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
		console.log("SELECTED PRODUCT: ", product);
		
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
    console.log(await this.productRepository.findProductsBySerialNumber(seria))
		this.setState({products: await this.productRepository.findProductsBySerialNumber(seria)});
		
		this.defineInputContentStyle(false);
		this.setState({
			seriyaError: false, serialInputStyle: styles.serialInputClicked
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
		if (this.state.sellingPriceInputValue < this.state.priceInputValue) {
			this.setState({
				sellingPriceError: true, priceInput: styles.priceInputErr
			})
		} else {
			this.setState({
				sellingPriceError: false, priceInput: styles.priceInput
			})
		}
	}
	
	handleInputBlur = () => {
		Keyboard.dismiss();
	};
	
	render() {
		const {navigation} = this.props;
		const animatedStyle = {
			backgroundColor: this.state.scaleValue.interpolate({
				inputRange: [0.9, 1],
				outputRange: ['green', 'blue'],
			}),
		};
		
		return (
			<View style={{backgroundColor: "white"}}>
				<View style={[styles.pageTitle, {paddingTop: 52, borderBottomWidth: 1, borderColor: "#F1F1F1"}]}>
					<TouchableOpacity
						onPress={() => navigation.navigate("Basket")}
						style={styles.backIcon}>
						
						<BackIcon/>
					</TouchableOpacity>
					
					<Text style={styles.pageTitleText}>
						Mahsulot qo’shish
					</Text>
				</View>
				
				<ScrollView contentContainerStyle={[styles.container]} ref={myScrollViewRef}>
					<View style={[styles.inputWrapper, {marginTop: 10}]}>
						<Text style={styles.label}>Mahsulot seriyasi</Text>
							<TextInput
								cursorColor="#222222"
								style={this.state.serialInputStyle}
								placeholder="Seriyasini kiriting"
								placeholderTextColor="#AAAAAA"
								value={this.state.seriyaInputValue}
								
								onChangeText={this.onChangeSerialInput}
								onFocus={this.onFocusSerialInput}
								onEndEditing={this.onEndSerialEditing}
								
								onPressIn={() => {
									this.scrollVertically(0);
								}}
								
								onBlur={this.handleInputBlur}
							/>
							
							<View style={{position: "relative", marginTop: 2}}>
								<View style={this.state.serialInputContentStyle}>
									{
										this.state.products.map(
											(item, index) =>
												(
													<Pressable
														onPress={() => {
															console.log(item.brand_name);
															this.selectProduct(item);
														}}
														
														onPressIn={this.handlePressIn}
														onPressOut={this.handlePressOut}
														
														style=
															{({pressed}) => [
																styles.serialInputSuggestion,
																animatedStyle,
																{
																	backgroundColor: pressed ? '#CCCCCC' : '#FBFBFB',
																},
															]}
														key={index}
													>
														
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
						<Text style={styles.label}>Brand nomi</Text>
						<TextInput
							cursorColor="#222222"
							style={this.state.brandInputStyle}
							value={this.state.brandInputValue}
							placeholder="Brand nomini kiriting"
							placeholderTextColor="#AAAAAA"
							
							onChangeText={this.onChangeBrandInput}
							onFocus={this.onFocusBrandInput}
							onEndEditing={this.onEndEditingBrandInput}
						/>
						
						{this.state.brandErr === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>Brand xato kiritildi.</Text>
						</Animatable.View> : null}
					</View>
					
					<View style={styles.inputWrapper}>
						<Text style={styles.label}>Mahsulot nomi</Text>
						<TextInput
							cursorColor="#222222"
							style={this.state.productInputStyle}
							placeholder="Nomini kiriting"
							placeholderTextColor="#AAAAAA"
							value={this.state.productInputValue}
							
							onChangeText={this.onChangeProductInput}
							onFocus={this.onFocusProductInput}
							onEndEditing={this.onEndEditingProductInput}
						/>
						
						{this.state.productNameErr === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>Mahsulot nomi xato kiritildi.</Text>
						</Animatable.View> : null}
					</View>
					
					<View style={styles.inputWrapper}>
						<Text style={styles.label}>Mahsulot miqdori</Text>
						<View style={styles.amountGroup}>
							<TextInput
								cursorColor="#222222"
								keyboardType="numeric"
								style={this.state.amountInputStyle}
								placeholder="Miqdorini kiriting"
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
									value="1"
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
						
						{this.state.amountErr === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>Mahsulot miqdori xato kiritildi.</Text>
						</Animatable.View> : null}
					</View>
					
					<View style={styles.inputWrapper}>
						<Text style={styles.label}>Tan narxi (so’mda)</Text>
						<TextInput
							cursorColor="#222222"
							keyboardType="numeric"
							style={this.state.priceInputStyle}
							placeholder="Narxini kiriting"
							placeholderTextColor="#AAAAAA"
							value={this.state.priceInputValue}
							
							onChangeText={this.onChangePriceInput}
							onFocus={this.onFocusPriceInput}
							onEndEditing={this.onEndEditingPriceInput}
							
							onPressIn={() => {
								this.scrollVertically(200)
							}}
						/>
						
						{this.state.priceInputErr === true ? <Animatable.View animation="shake" duration={500}>
							<Text style={styles.errorMsg}>Tan narxi xato kiritildi.</Text>
						</Animatable.View> : null}
					</View>
					
					<View style={styles.inputWrapper}>
						<Text style={styles.label}>Sotilish narxi</Text>
						<View style={styles.inputGroup}>
							<TextInput
								cursorColor="#222222"
								keyboardType="numeric"
								style={this.state.priceInput}
								placeholder="Sotilish narxi: "
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
									value="1"
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
							<Text style={styles.errorMsg}>Sotilish narxi xato kiritildi.</Text>
						</Animatable.View> : null}
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
							<Text style={{fontSize: 16, fontFamily: "Gilroy-Medium"}}>NDS soliq</Text>
							
							<ToggleSwitch
								onColor="#65C466"
								offColor="gray"
								labelStyle={{color: "black", fontWeight: "900"}}
								size="large"
								
								isOn={this.state.nds}
								onToggle={(isOn) => {
									console.log(isOn)
								}}
								
								animationSpeed={150}
							/>
						
						</TouchableWithoutFeedback>
					</View>
					
					
					<View style={{height: 250}}>
						<TouchableOpacity style={[{display: "block"}, styles.buttonDark]}
						                  onPress={this.createProduct}>
							<Text style={styles.buttonDarkText}>Mahsulotni qo’shish</Text>
						</TouchableOpacity>
						
						<TouchableOpacity
							style={[{display: "block"}, styles.buttonLight]}
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
									
									checkmarkScale: new Animated.Value(0),
									isCreated: false
								});
								
								navigation.navigate("Basket");
							}}>
							<Text style={styles.buttonLightText}>Bekor qilish</Text>
						</TouchableOpacity>
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
		if (seriyaInputValue.length < 6) {
			this.setState({
				seriyaInputValue: "", 
        seriyaError: true, 
        serialInputStyle: styles.serialInputErr
			})
			
			isValidInputValues = false;
			this.scrollVertically(0);
		} else {
			this.setState({
				seriyaError: false, 
        serialInputStyle: styles.serialInput
			})
		}
		
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
			console.log("Seriya Value:", seriyaInputValue);
			console.log("Brand Value:", brandInputValue);
			console.log("Product Value:", productInputValue);
			console.log("Amount Value:", amountInputValue);
			console.log("Price Value:", priceInputValue);
			console.log("Selling Price Value:", sellingPriceInputValue);
			
			Animated.timing(this.state.checkmarkScale, {
				toValue: 1, duration: 500, useNativeDriver: true,
			}).start();
			await AsyncStorage.setItem("isCreated", "true");

			// SAVE.
      

			let productId = await this.productRepository.createAndGetProductId(
				brandInputValue, 
				seriyaInputValue, 
				productInputValue
			)

			await this.storeProductRepository.create(
				productId, 
				this.state.nds, 
				this.state.priceInputValue,
				this.state.sellingPriceInputValue,
				this.state.sellingPriceInputValue,
				this.state.amountInputValue,
				this.state.amountType
			);
		
			this.setState({
				seriyaInputValue: "",
				brandInputValue: "",
				productInputValue: "",
				amountInputValue: "",
				priceInputValue: "",
				sellingPriceInputValue: "",
				nds: false
			});
			
			const {navigation} = this.props;
			navigation.navigate("Basket");
		} else {
			Animated.timing(this.state.checkmarkScale, {
				toValue: 1, duration: 500, useNativeDriver: true,
			}).stop();
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
		shadowColor: 'rgba(0, 0, 0, 0.25)',
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

export default ProductAdd;