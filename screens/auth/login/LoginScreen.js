import React, {Component} from "react";
import {
	StatusBar,
	StyleSheet,
	Text,
	View,
	TextInput,
	Dimensions,
	TouchableOpacity,
	ScrollView,
	Platform,
	Linking
} from "react-native";
import Logo from "../../../assets/logo.svg";
import ApiService from "../../../service/ApiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import BackIcon from "../../../assets/arrow-left-icon.svg";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: "",
			error: false,
			isLoginInputActive: false,
			isPasswordInputActive: false,
			loading: false
		};

		this.apiService = new ApiService();
	}

	login = async () => {
		if (await AsyncStorage.getItem("isRequestInProgress") == "true") {
			return;
		}

		const {email, password} = this.state;
		try {
			this.setState({loading: true});
			const result = await this.apiService.check(email + "@backall.uz", password);
			console.log(result);

			if (result) {
				await AsyncStorage.setItem("email", email + "@backall.uz");
				await AsyncStorage.setItem("password", password);

				this.props.navigation.navigate("Verification");
			} else {
				this.setState({
					error: true
				})
			}

		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			this.setState({loading: false});
		}
	};

	forgotPasswordLink = () => {
		this.props.navigation.navigate("Home");
	};

	render() {
		const {email, password, loading} = this.state;
		return (
			<ScrollView contentContainerStyle={styles.container}>
				<TouchableOpacity
					onPress={() => {
						this.props.navigation.navigate("Auth");
					}}
					style={styles.backIcon}>
					<BackIcon/>
				</TouchableOpacity>

				{(Platform.OS === "android" || Platform.OS === "ios") ?
					<Logo style={styles.logo} resizeMode="cover"/> :
					<Logo style={styles.logo}/>}
				<View style={styles.form}>
					<Text style={styles.label}>Loginni kiriting</Text>
					<TextInput
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isLoginInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 23,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.email.length > 0 ? "#FFF" :this.state.isLoginInputActive ? "#FFF" : "#EDF0F7"),
						}}
						placeholder="admin"
						placeholderTextColor="#AFAFAF"
						cursorColor={"#000"}
						value={email}
						onFocus={() => {
							this.setState({isLoginInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isLoginInputActive: false});
						}}
						onChangeText={(text) => this.setState({email: text})}
					/>
					<Text style={styles.label}>Parolni kiriting</Text>
					<TextInput
						passwordRules={"required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPasswordInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 23,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							backgroundColor: (this.state.password.length > 0 ? "#FFF" : this.state.isPasswordInputActive ? "#FFF" : "#EDF0F7"),
							fontFamily: "Montserrat-Regular",
						}}
						placeholder="********"
						placeholderTextColor="#AFAFAF"
						secureTextEntry
						value={password}
						cursorColor={"#000"}
						onFocus={() => {
							this.setState({isPasswordInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isPasswordInputActive: false});
						}}
						onChangeText={(text) => this.setState({password: text})}
					/>
					{
						this.state.error === true ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text style={{color: "red", fontFamily: "Montserrat-Regular"}}>Login va parol xato.</Text>
							</Animatable.View> : null}
					<TouchableOpacity onPress={async () => {
						await this.login()
					}}>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Kirish</Text>
						</View>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={() => {
						Linking.openURL("https://t.me/backall_admin");
					}}
					style={{marginTop: 100}}>
					<View style={styles.forgotPasswordLink}>
						<Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
					</View>
				</TouchableOpacity>
				<StatusBar style="auto"/>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 142,
		height: screenHeight
	},
	backIcon: {
		backgroundColor: "#F5F5F7",
		paddingVertical: 16,
		paddingHorizontal: 19,
		borderRadius: 50,
		position: "absolute",
		top: 50,
		left: 20
	},
	logo: {
		display: "block",
		width: 220.313,
		height: 96.563,
		marginBottom: 83
	},
	form: {
		alignItems: "center"
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "Montserrat-Medium",
		marginBottom: 4,
		width: screenWidth - (24 + 24)
	},
	input: {
		height: 64,
		width: screenWidth - (24 + 24),
		borderWidth: 1,
		borderRadius: 10,
		paddingVertical: 23,
		paddingHorizontal: 20,
		fontSize: 18,
		marginBottom: 16,
		backgroundColor: "#EDF0F7",
		fontFamily: "Montserrat-Regular",
	},
	button: {
		marginTop: 14,
		width: screenWidth - (24 + 24),
		height: 66,
		backgroundColor: "#222",
		color: "white",
		paddingVertical: 14,
		borderRadius: 10,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	buttonText: {
		color: "white",
		textAlign: "center",
		fontSize: 20,
		textTransform: "capitalize",
		fontWeight: "500",
		fontFamily: "Montserrat-Medium"
	},
	forgotPasswordLink: {
		alignItems: "center"
	},
	forgotPasswordText: {
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "Montserrat-Medium"
	}
});

export default Login;
