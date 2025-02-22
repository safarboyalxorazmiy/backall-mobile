import React, {Component, memo} from "react";
import {StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions} from "react-native";
import BlackCircle from "../../../assets/small-black-circle.svg";
import RedCircle from "../../../assets/small-red-circle.svg"
import BackspaceIcon from "../../../assets/backspace-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../../../service/ApiService";
import TokenService from "../../../service/TokenService";
import uuid from 'react-native-uuid';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class RegisterVerificationScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			verificationCode: "",
			error: false,
			focusedKey: null,
			idempotencyKey: this.generateIdempotencyKey()
		};

		this.apiService = new ApiService();
		this.tokenService = new TokenService();
	}

	generateIdempotencyKey() {
    return uuid.v4();
	}

	handleKeyPress = async (key) => {
		this.setState(prevState => ({
			verificationCode: prevState.verificationCode + key
		}));

		if (this.state.verificationCode.length === 3) {
			if (await AsyncStorage.getItem("isRequestInProgress") === "true") {
				return;
			}

			const {navigation} = this.props;

			let storeName = await AsyncStorage.getItem("storeName");
			let phone = await AsyncStorage.getItem("phone");
			let email = await AsyncStorage.getItem("email");
			let password = await AsyncStorage.getItem("password");

			//.log(this.state.idempotencyKey)
			let result = await this.apiService.register(
				this.state.idempotencyKey,
				"Userjon",
				"Userjonov",
				storeName,
				phone,
				email,
				password,
				this.state.verificationCode
			);

			if (
				result.access_token &&
				result.refresh_token &&
				result.role
			) {
				await this.tokenService.storeAccessToken(result.access_token);
				await this.tokenService.storeRefreshToken(result.refresh_token);
				await AsyncStorage.setItem("role", result.role);
				await AsyncStorage.setItem("store_id", result.storeId + "");

				//.log(result.role);

				const accessToken = await this.tokenService.retrieveAccessToken();
				//.log(accessToken);
				//.log(await this.tokenService.retrieveRefreshToken());

				this.setState({
					verificationCode: "",
					error: false
				});

				await AsyncStorage.setItem("loadProfit", "true");
				await AsyncStorage.setItem("loadShopping", "true");
				await AsyncStorage.setItem("loadBasket", "true");
				await AsyncStorage.setItem("isDownloaded", "false");

				await AsyncStorage.setItem("isNewUser", "true");

				await AsyncStorage.setItem("fromScreen", "RegisterVerification");

				await navigation.navigate("Home");
			} else {
				this.setState({
					verificationCode: "",
					error: true
				});
			}
		}
	}

	handleDelete = () => {
		this.setState(prevState => ({
			verificationCode: prevState.verificationCode.slice(0, -1)
		}));
	}

	renderCustomKeyboard() {
		// Define custom keyboard layout
		const keyboardLayout = [
			['1', '2', '3'],
			['4', '5', '6'],
			['7', '8', '9'],
			['0', 'Delete'],
		];

		return (
			keyboardLayout.map((row, rowIndex) => (
				<View key={rowIndex} style={styles.keyboardRow}>
					{row.map((key, keyIndex) => (
						<TouchableOpacity
							key={keyIndex}
							style={this.state.focusedKey === key ? styles.focusedKey : key === 'Delete' ? styles.keyboardBackspaceKey : styles.keyboardKey}
							onPressIn={() => {
								this.setState({focusedKey: key});
								if (key === 'Delete') {
									this.handleDelete();
								} else {
									this.handleKeyPress(key);
								}
							}}
							onPressOut={() => {
								this.setState({focusedKey: null});
							}}
							activeOpacity={1}
						>
							{key === 'Delete' ? <BackspaceIcon/> : <Text style={styles.keyText}>{key}</Text>}
						</TouchableOpacity>
					))}
				</View>
			))
		);
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
					<View key={i} style={{height: 38, display: "flex", alignItems: "center", justifyContent: "center"}}>
						{error ? <RedCircle key={i}/> : <BlackCircle key={i}/>}
					</View>
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
		columnGap: 40,
		marginBottom: 25,
	},

	keyboardKey: {
		marginHorizontal: 5,
		width: 80,
		height: 80,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#D9D9D9",
		borderRadius: 9
	},

	focusedKey: {
		marginHorizontal: 5,
		width: 80,
		height: 80,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#eae9e9",
		borderRadius: 9
	},

	keyboardBackspaceKey: {
		marginHorizontal: 5,
		width: 80,
		height: 80,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 9
	},

	keyText: {
		fontSize: 38,
		fontFamily: "Gilroy-Regular",
		fontWeight: "400"
	},

	circle: {
		width: 200,
		height: 200,
		backgroundColor: "#D9D9D9",
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
		alignItems: "flex-end",
		position: "absolute",
		bottom: 25,
		left: 25,
		right: 25,
		marginTop: 20,

	},

	inputContainer: {
		paddingTop: 50,
		paddingBottom: 0,
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 40,
	},

	codeText: {
		fontSize: 38,
		fontFamily: "Gilroy-Bold"
	}

});

export default memo(RegisterVerificationScreen);