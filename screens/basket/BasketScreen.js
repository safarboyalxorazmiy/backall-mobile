import React, {Component} from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	ScrollView,
} from "react-native";
import PlusIcon from "../../assets/plus-icon.svg";
import SearchIcon from "../../assets/search-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BasketIcon from "../../assets/basket-icon-light.svg";
import Success from "../../assets/success.svg";
import { Keyboard } from 'react-native';
import Modal from "react-native-modal";

import StoreProductRepository from "../../repository/StoreProductRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";
import * as Animatable from "react-native-animatable";

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
			notAllowed: "",
			role: "",

			lastNotDownloadedProductsPage: 0,
			lastNotDownloadedProductsSize: 10,
      lastStoreProductsPage: 0,
			lastStoreProductsSize: 10,

      productsLoadingIntervalId: undefined,
      productsLoadingIntervalProccessIsFinished: true

		}
		
		this.storeProductRepository = new StoreProductRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();

		this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
    );

		this.textInputRef = React.createRef();
		this.loadData();
	}

	keyboardDidShow = () => {
    this.setState({ addButtonStyle: { display: 'none' } });
  };

  keyboardDidHide = () => {
    this.setState({ addButtonStyle: styles.addButton });
  };
	
	async componentDidMount() {
		const {navigation} = this.props;

		await AsyncStorage.setItem("productsLoadingIntervalProccessIsFinished", "true");

		navigation.addListener("focus", 
			async () => {
				await this.storeProductRepository.init();
				
				if (await AsyncStorage.getItem("role") === "BOSS") {
					let productsLoadingIntervalId = setInterval(async () => {
						if (await AsyncStorage.getItem("productsLoadingIntervalProccessIsFinished") != "true") {
							return;
						}

						console.log("INTERNAL STARTED SUCCESSFULLY! \n We are on: ");
						console.log(await AsyncStorage.getItem("window"));
						if (await AsyncStorage.getItem("window") != "Basket") {
							if (productsLoadingIntervalId !== undefined) {
								clearInterval(productsLoadingIntervalId);
								console.log("CLEARED " + productsLoadingIntervalId);
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
				}

				// ROLE ERROR
				let notAllowed = await AsyncStorage.getItem("not_allowed");
				this.setState({notAllowed: notAllowed});

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
				
				
				await this.load();
			}
		);	
	}

	async load() {
		let storeProducts = 
			await this.storeProductRepository.findTopStoreProductsInfo(this.state.lastId);
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

		console.log("Hello world!")
		this.setState(
			{role: await AsyncStorage.getItem("role")}
		);

		console.log(this.state.role === "SELLER");

		await this.storeProductRepository.init();
	}

	async getNotDownloadedLocalProducts() {
		console.log("GETTING NOT DOWNLOADED NOT DOWNLOADED PRODUCTS ⏳⏳⏳");

		let products = [];
		let size = this.state.lastNotDownloadedProductsSize;
		let page = this.state.lastNotDownloadedProductsPage;
	
		while (true) {
			let downloadedProducts;
			downloadedProducts = 
				await this.apiService.getNotDownloadedLocalProducts(
					page, size, this.props.navigation
				);
	
			if (
				!downloadedProducts || 
				!downloadedProducts.content || 
				downloadedProducts.content.length === 0
			) {
				console.log(products);
				return false;
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
				} 
        catch (error) {
					console.error("Error creating local products:", error);
          
          this.setState({
            lastNotDownloadedProductsSize: size,
            lastNotDownloadedProductsPage: page
          });
          
          break; 
				}
			}

			page++;
			products.push(downloadedProducts);
      return true;
    }
	}

  async getNotDownloadedStoreProducts() {
		console.log("GETTING NOT DOWNLOADED STORE PRODUCTS ⏳⏳⏳");

		let storeProducts = [];
		let size = this.state.lastStoreProductsSize;
		let page = this.state.lastStoreProductsPage;
	
		while (true) {
			let response;
			try {
				response = await this.apiService.getStoreProductsNotDownloaded(
					page, size, this.props.navigation
				);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastStoreProductsSize: size,
					lastStoreProductsPage: page
				});
				
				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				return false; 
			}
	
			for (const storeProduct of response.content) {

				console.log("Accepted response: ", response.content)

				try {
					const updatedStoreProducts = this.state.storeProducts.map((product) => {
						const storeProduct = response.content.find(p => p.id === product.global_id);
						
						if (storeProduct) {
							console.log("Log the updated product")
							console.log({
								brand_name: product.brand_name,
								count: storeProduct.count,
								count_type: product.count_type,
								id: product.id,
								name: product.name,
							});
		
							return {
								brand_name: product.brand_name,
								count: storeProduct.count,
								count_type: product.count_type,
								id: product.id,
								name: product.name,
							}; // Return the updated product
						}

						return product; // Return the original product if no update is needed
					});
		
					console.log("⏳⏳⏳⏳⏳⏳");
					console.log(updatedStoreProducts);
		
					this.setState({ storeProducts: updatedStoreProducts });
		

						

					// console.log(
					// 	updatedStoreProducts
					// )

					
					
					let products = 
						await this.productRepository.findProductsByGlobalId(
							storeProduct.productId
						);

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
      return true;
		}
	}

	async loadData() {
		await this.storeProductRepository.init();

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

		await this.getCreated();
		await this.storeProductRepository.init();

		this.setState(
			{role: await AsyncStorage.getItem("role")}
		);

		console.log("LOAD DATA ENDED")
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

						let basketLoaded = await AsyncStorage.getItem("BasketLoaded")

						if ((currentYPos - this.state.lastYPos) > 30 || basketLoaded == "true") {
							this.setState({lastYPos: currentYPos});;
							await this.loadData();
							await AsyncStorage.setItem("BasketLoaded", "false")
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
							}}
						>
							Mahsulot muvafaqqiyatli yaratildi!
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