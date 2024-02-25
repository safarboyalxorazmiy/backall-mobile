import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	Animated,
	TouchableOpacity,
	Platform
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";
import DatabaseService from '../service/DatabaseService';
import AmountDateRepository from "../repository/AmountDateRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TokenService from '../service/TokenService';
import Modal from "react-native-modal";
import Spinner from 'react-native-loading-spinner-overlay';

const tokenService = new TokenService();
const databaseService = new DatabaseService();

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Home extends Component {
	constructor(state) {
		super(state);
		
		this.state = {
			shoppingCardColors: ["#E59C0D", "#FDD958"],
			profitCardColors: ["#2C8134", "#1DCB00"],
			profitAmount: 0,
			sellAmount: 0,
			notAllowed: "",
			animation: new Animated.Value(0),
      spinner: true,
		}
		
		this.amountDateRepository = new AmountDateRepository();
		
		this.getAmountInfo();
	}
	
	async componentDidMount() {
		const {navigation} = this.props;
		navigation.addListener("focus", async () => {
			await this.getAmountInfo();

			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed})
		});
	}
	
	async getAmountInfo() {
		// HOW TO GET yyyy-mm-dd from new Date()
		
		// Get the current date
		const currentDate = new Date();
		
		// Extract year, month, and day
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, '0');
		
		// Format the date as yyyy-mm-dd
		const formattedDate = `${year}-${month}-${day}`;
		
		
		let profitAmountInfo = await this.amountDateRepository.getProfitAmountInfoByDate(formattedDate);
		let sellAmountInfo = await this.amountDateRepository.getSellAmountInfoByDate(formattedDate);
		
		console.log("PROFIT AMOUNT INFO:: ", profitAmountInfo);
		console.log("SELL AMOUNT INFO:: ", sellAmountInfo);
		
		this.setState({
			profitAmount: profitAmountInfo,
			sellAmount: sellAmountInfo
		})
	}
	
	async get() {
		console.log(await databaseService.getAllProducts())
	}
	// 
	render() {
		const {navigation} = this.props;
		tokenService.checkTokens(navigation);
		this.get();

		const translateY = this.state.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100] // Adjust the value as needed
		});
		
		return (
			<>
			<Spinner
          visible={this.state.spinner}
          textContent={'Yuklanyapti 10%'}
          textStyle={{
						fontFamily: "Gilroy-Bold",
						color: "#FFF"
					}}
        />

				<View style={styles.container}>
					<Text style={styles.pageTitle}>Bosh sahifa</Text>
					
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
									{Platform.OS === 'android' || Platform.OS === 'ios' ? (
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
									{Platform.OS === 'android' || Platform.OS === 'ios' ? (
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
			</>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 52
	},
	
	pageTitle: {
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		height: 44,
		borderBottomColor: "#AFAFAF",
		borderBottomWidth: 1,
		width: screenWidth - (24 + 24),
		textAlign: "center",
		marginBottom: 24
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