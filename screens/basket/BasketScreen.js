import React, {Component} from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Animated,
} from "react-native";
import PlusIcon from "../../assets/plus-icon.svg";
import SearchIcon from "../../assets/search-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BasketIcon from "../../assets/basket-icon-light.svg";
import Success from "../../assets/success.svg";
import StoreProductRepository from "../../repository/StoreProductRepository";
import { Keyboard } from 'react-native';
import Modal from "react-native-modal";

const Checkmark = Animated.createAnimatedComponent(View);
const CheckmarkText = Animated.createAnimatedComponent(Text);
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Basket extends Component {
	constructor(props) {
		super(props);
		this.textInputRef = React.createRef();
		
		this.state = {
			isCreated: "false",
			storeProducts: [],
			addButtonStyle: styles.addButton,
			searchInputValue: "",
			lastId: 0,
			lastYPos: 0,
			notAllowed: "",
      animation: new Animated.Value(0),
			role: ""
		}
		this.storeProductRepository = new StoreProductRepository();

		this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
    );

		this.loadData();
	}

	keyboardDidShow = () => {
    this.setState({ addButtonStyle: { display: 'none' } });
  };

  keyboardDidHide = () => {
    this.setState({ addButtonStyle: styles.addButton });
  };
	
	async componentDidMount() {
		await this.getCreated();
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			// ROLE ERROR
			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed})

			this.setState(
				{role: await AsyncStorage.getItem("role")}
			);
			
			this.setState(
				{
					isCreated: "false",
					storeProducts: [],
					addButtonStyle: styles.addButton,
					searchInputValue: "",
					lastId: 0,
					lastYPos: 0
				}
			);

			await this.getCreated();
			let storeProducts = await this.storeProductRepository.findTopStoreProductsInfo(this.state.lastId);
			let last = storeProducts[storeProducts.length - 1];
			if (last != undefined) {
				this.setState({
					lastId: last.id
				})

				console.log("LAST ID::", last.id)
			};

			this.setState({
				storeProducts: storeProducts,
				searchInputValue: ""
			});
		});
	}

	async loadData() {
    const newStoreProducts = await this.storeProductRepository.findTopStoreProductsInfo(this.state.lastId);
		let last = newStoreProducts[newStoreProducts.length - 1];
		if (last != undefined) {
			this.setState({
				lastId: last.id
			});

			console.log("LAST ID::", last.id)
		}

		console.log(newStoreProducts);

		let allProducts = this.state.storeProducts.concat(newStoreProducts);

		this.setState({
			storeProducts: allProducts,
			searchInputValue: ""
		});
	}
	
	async getCreated() {
		let isCreated = await AsyncStorage.getItem("isCreated");
		this.setState({isCreated: isCreated});
	}

	onChangeTextSearchInput = async (query) => {
		this.setState({searchInputValue: query});
		let storeProducts = await this.storeProductRepository.searchProductsInfo(query + "%");
		this.setState({storeProducts: storeProducts})
		console.log(storeProducts);
	}
	
	handlePressSearchInput = () => {
		if (this.textInputRef.current) {
			this.textInputRef.current.blur();
			this.textInputRef.current.focus();
		}
	};

	render() {
		const {navigation} = this.props;

		const translateY = this.state.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100] // Adjust the value as needed
		});

		return (
			<View style={styles.container}>
				{/* Search section */}
				<TouchableOpacity
					activeOpacity={1}
					style={styles.inputWrapper}
					onPress={this.handlePressSearchInput}>
					<SearchIcon/>
					
					<TextInput
						ref={this.textInputRef}
						style={styles.input}
						placeholder="Mahsulot qidirish"
						placeholderTextColor="#AAA"
						onChangeText={this.onChangeTextSearchInput}
						value={this.state.searchInputValue}
						defaultValue={""}
						cursorColor={"black"}
					/>
				</TouchableOpacity>
				
				{/* Store products */}
				<ScrollView style={styles.productList}
					onScrollBeginDrag={async (event) => {
						const currentYPos = event.nativeEvent.contentOffset.y;
						console.log("Current Y position:", currentYPos);

						if ((currentYPos - this.state.lastYPos) > 30) {
							this.setState({lastYPos: currentYPos});;
							await this.loadData();
						}
					}}
				>
					{this.state.storeProducts.map((product, index) => (
						<View key={index} style={index % 2 === 0 ? styles.product : styles.productOdd}>
							<Text style={styles.productTitle}>{product.brand_name} {product.name}</Text>
							<Text style={styles.productCount}>{product.count} {product.count_type}</Text>
						</View>
					))}
				</ScrollView>

				{/* Add Button */}
				{this.state.role === "SELLER" ? (
					<TouchableOpacity
						style={this.state.addButtonStyle}
						onPress={() => {
							navigation.navigate("ProductAdd");
						}}>
						<PlusIcon />
					</TouchableOpacity>
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
					<Checkmark
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
					</Checkmark>
					
					<View style={{
						width: screenWidth - (15 * 2),
						marginLeft: "auto",
						marginRight: "auto",
						position: "absolute",
						left: 15,
						bottom: 30
					}}>
						<CheckmarkText
							style={{
								// transform: [{scale: this.state.checkmarkScale}],
								marginLeft: 5,
								color: "black",
								fontSize: 24,
								fontFamily: "Gilroy-SemiBold"
							}}
						>
							Mahsulot muvafaqqiyatli yaratildi!
						</CheckmarkText>
						
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
							}}>SAVATGA QAYTISH</Text>
						</TouchableOpacity>
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
	},
	
	productList: {
		marginTop: 20,
		height: screenHeight - 93
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

export default Basket;