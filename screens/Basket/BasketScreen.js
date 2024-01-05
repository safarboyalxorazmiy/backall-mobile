import React, {Component} from 'react';
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Animated,
} from 'react-native';
import PlusIcon from "../../assets/plus-icon.svg";

import SearchIcon from "../../assets/search-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BasketIcon from "../../assets/basket-icon-light.svg";
import Modal from "react-native-modal";
import Success from "../../assets/success.svg";

const Checkmark = Animated.createAnimatedComponent(View);
const CheckmarkText = Animated.createAnimatedComponent(Text);

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class Basket extends Component {
	constructor(props) {
		super(props);
		this.textInputRef = React.createRef();
		
		this.state = {
			isCreated: "false"
		}
	}
	
	async componentDidMount() {
		await this.getCreated();
		const {navigation} = this.props;
		
		navigation.addListener('focus', async () => {
			await this.getCreated();
		});
	}
	
	async getCreated() {
		let isCreated = await AsyncStorage.getItem("isCreated");
		this.setState({isCreated: isCreated});
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
					/>
				</TouchableOpacity>
				
				<ScrollView style={styles.productList}>
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Coca Cola</Text>
						<Text style={styles.productCount}>10 blok</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Pepsi 1.5L</Text>
						<Text style={styles.productCount}>10 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>50 dona</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>10 dona</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.product}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
					
					<View style={styles.productOdd}>
						<Text style={styles.productTitle}>Qora Gorilla</Text>
						<Text style={styles.productCount}>120 blok</Text>
					</View>
				
				</ScrollView>
				
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => navigation.navigate('ProductAdd')}>
					<PlusIcon/>
				</TouchableOpacity>
				
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
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: '#fff',
		paddingTop: 65,
		position: "relative"
	},
	
	inputWrapper: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		width: screenWidth - (17 + 17),
		marginLeft: 'auto',
		marginRight: 'auto',
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
		fontFamily: 'Gilroy-Medium',
		fontWeight: '500',
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
		bottom: 130,
		borderRadius: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}
	
});

export default Basket;
