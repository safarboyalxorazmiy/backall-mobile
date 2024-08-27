import React, {Component, memo} from "react";
import {StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions} from "react-native";
import GreenCircle from "../../../assets/small-green-circle.svg";
import RedCircle from "../../../assets/small-red-circle.svg"
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../../../service/ApiService";
import TokenService from "../../../service/TokenService";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class RegisterVerificationScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			verificationCode: "",
			error: false,
			focusedKey: null
		};

		this.apiService = new ApiService();
		this.tokenService = new TokenService();
	}

	handleKeyPress = async (key) => {
		// Update verification code state when a key is pressed
		this.setState(prevState => ({
			verificationCode: prevState.verificationCode + key
		}));

		if (this.state.verificationCode.length === 3) {
			if (await AsyncStorage.getItem("isRequestInProgress") == "true") {
				return;
			}

			const {navigation} = this.props;

			let email = await AsyncStorage.getItem("email");
			let password = await AsyncStorage.getItem("password");

			let result = await this.apiService.login(
				email,
				password,
				this.state.verificationCode
			);

			console.log(
				email,
				password,
				this.state.verificationCode
			)

			if (result.access_token && result.refresh_token && result.role) {
				await this.tokenService.storeAccessToken(result.access_token);
				await this.tokenService.storeRefreshToken(result.refresh_token);
				await AsyncStorage.setItem("role", result.role);
				await AsyncStorage.setItem("store_id", result.storeId + "");

				console.log(result.role);

				const accessToken = await this.tokenService.retrieveAccessToken();
				console.log(accessToken);
				console.log(await this.tokenService.retrieveRefreshToken());

				this.setState({
					verificationCode: "",
					error: false
				});

				await AsyncStorage.setItem("loadProfit", "true");
				await AsyncStorage.setItem("loadShopping", "true");
				await AsyncStorage.setItem("loadBasket", "true");
				await AsyncStorage.setItem("isDownloaded", "false");
				
				await navigation.navigate("Home");
			}
			else {
				this.setState({
					verificationCode: "",
					error: true
				});
			}
		}
	}

	handleDelete = () => {
		// Delete the last character from verification code
		this.setState(prevState => ({
			verificationCode: prevState.verificationCode.slice(0, -1)
		}));
	}

	renderCustomKeyboard() {
		// Define custom keyboard layout
		const keyboardLayout = [
			["1", "2", "3"],
			["4", "5", "6"],
			["7", "8", "9"],
			["", "0", ""]
		];

		return keyboardLayout.map((row, rowIndex) => (
			<View key={rowIndex} style={styles.keyboardRow}>
				{row.map((key, keyIndex) => (
					<TouchableOpacity
						key={keyIndex}
						style={this.state.focusedKey == key ? {
							width: 100,
							height: 100,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							marginHorizontal: 5,
							backgroundColor: "#222",
							borderRadius: 50
						} : styles.keyboardKey}

						onPressIn={() => {
							this.setState({focusedKey: key});
							console.log(key);

							if (key === "Delete") {
								this.handleDelete();
							} else {
								this.handleKeyPress(key);
							}
						}}

						onPressOut={() => {
							this.setState({focusedKey: null});
						}}

						activeOpacity={1}>
						<Text style={styles.keyText}>{key}</Text>
					</TouchableOpacity>
				))}
			</View>
		));
	}

	renderCircles() {
		const {verificationCode, error} = this.state;
		const circles = [];

		// Iterate through verification code and render green circles or text accordingly
		for (let i = 0; i < 4; i++) {
			if (verificationCode.length > i) {
				// If verification code has more than 4 characters, display first 4 characters
				circles.push(
					<View key={i}>
						<Text style={styles.codeText}>{verificationCode[i]}</Text>
					</View>
				);
			} else {
				// Render GreenCircle or RedCircle based on the value of error
				circles.push(
					error ? <RedCircle key={i}/> : <GreenCircle key={i}/>
				);
			}
		}

		return circles;
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.circle}></View>

				<View>
					<Text style={styles.headerText}>Tasdiqlash kodi yarating</Text>
				</View>

				<View style={styles.inputContainer}>
					{this.renderCircles()}
				</View>

				<View style={styles.keyboardContainer}>
					{this.renderCustomKeyboard()}
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		marginBottom: 20,
		width: 200,
		textAlign: "center",
		display: "none"
	},

	keyboardRow: {
		display: "flex",
		flexDirection: "row",
		columnGap: 30,
		marginBottom: 25,
	},

	keyboardKey: {
		marginHorizontal: 5,
		width: 100,
		height: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	keyText: {
		fontSize: 38,
		fontFamily: "Gilroy-Regular",
		fontWeight: "400"
	},

	circle: {
		width: 200,
		height: 200,
		backgroundColor: "#F4C23D",
		borderRadius: 100,
		position: "absolute",
		top: -50,
		right: -50
	},

	headerText: {
		color: "#000000",
		fontSize: 38,
		fontFamily: "Gilroy-Bold",
		marginLeft: 20,
		marginTop: (
			screenHeight >= 750 ? 100 :
				screenHeight >= 600 ? 50 :
					20
		)
	},

	headerInfo: {
		fontFamily: "Gilroy-Regular",
		marginLeft: 20,
		width: 311,
		fontSize: 16
	},

	keyboardContainer: {
		display: "flex",
		alignItems: "center",
		position: "absolute",
		bottom: (
			screenHeight >= 750 ? 0 :
				screenHeight >= 600 ? -40 :
					-50
		),
		left: 0,
		right: 0,
		marginTop: 100
	},

	inputContainer: {
		paddingTop: 50,
		paddingBottom: 50,
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 40,
	},

	codeText: {
		fontSize: 38,
		fontFamily: "Gilroy-Bold",
	}

});

export default memo(RegisterVerificationScreen);