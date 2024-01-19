import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Platform
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";
import TokenService from '../service/TokenService';
import DatabaseService from '../service/DatabaseService';

const screenWidth = Dimensions.get("window").width;
const tokenService = new TokenService();
const databaseService = new DatabaseService();

class Home extends Component {
	constructor(state) {
		super(state);

		this.state = {
			shoppingCardColors: ["#E59C0D", "#FDD958"],
			profitCardColors: ["#2C8134", "#1DCB00"]
		}
	}

	async get() {
		console.log(await databaseService.getAllProducts())
	}

	render() {
		const {navigation} = this.props;
		tokenService.checkTokens(navigation);
		this.get();

		return (
			<>
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

								<Text style={styles.cardTitle}>Bugungi kirim</Text>
								<Text style={styles.cardDescription}>
									3.000.000
									<Text style={styles.currency}>UZS</Text>
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
							onPress={() => navigation.navigate("Profit")}>
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
								<Text style={styles.cardTitle}>Bugungi foyda</Text>
								<Text style={styles.cardDescription}>
									500.000
									<Text style={styles.currency}>UZS</Text>
								</Text>
							</LinearGradient>
						</TouchableOpacity>

					</View>
					<StatusBar style="auto"/>
				</View>
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