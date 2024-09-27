import React, {Component, memo} from "react";
import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import BackIcon from "../../../assets/arrow-left-icon.svg";
import Logo from "../../../assets/logo.svg";
import * as Animatable from "react-native-animatable";
import ApiService from "../../../service/ApiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

class Register extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isEmailInputActive: false,
			email: "",

			isPhoneInputActive: false,
			phone: "",

			isPasswordInputActive: false,
			password: "",

			isPasswordVerifyInputActive: false,
			passwordVerify: "",

			isStoreNameInputActive: false,
			storeName: "",

			passwordErrMsg: "",
			passwordVerifyErrMsg: "",
			phoneErrMsg: "",
			emailErrMsg: "",
			storeNameErrMsg: ""
		}

		this.apiService = new ApiService();
	}

	render() {
		return (
			<ScrollView contentContainerStyle={styles.container}>
				<TouchableOpacity
					onPress={() => {
						this.props.navigation.navigate("Auth");
					}}
					style={styles.backIcon}>
					<BackIcon/>
				</TouchableOpacity>
				<View style={styles.logoWrapper}>
					<Logo style={styles.logo}/>
				</View>

				<View style={styles.form}>
					<Text style={styles.label}>Dokonni nomini kiriting</Text>
					<TextInput
						scrollEnabled={false}

						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isStoreNameInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 13,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.storeName.length > 0 ? "#FFF" : this.state.isStoreNameInputActive ? "#FFF" : "#EDF0F7"),


						}}
						placeholder="admin"
						placeholderTextColor="#AFAFAF"
						cursorColor={"#000"}
						value={this.state.storeName}
						onFocus={() => {
							this.setState({isStoreNameInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isStoreNameInputActive: false});
						}}
						onChangeText={(text) => this.setState({storeName: text})}
					/>
					{
						this.state.storeNameErrMsg !== "" ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text
									style={{
										color: "red",
										fontFamily: "Montserrat-Regular"
									}}>
									{this.state.storeNameErrMsg}
								</Text>
							</Animatable.View> : null
					}

					<Text style={styles.label}>Dokonni INNsini kiriting</Text>
					<TextInput
						scrollEnabled={false}

						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isEmailInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 13,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.email.length > 0 ? "#FFF" : this.state.isEmailInputActive ? "#FFF" : "#EDF0F7")
						}}
						placeholder="admin"
						placeholderTextColor="#AFAFAF"
						cursorColor={"#000"}
						value={this.state.email}
						onFocus={() => {
							this.setState({isEmailInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isEmailInputActive: false});
						}}
						onChangeText={(text) => this.setState({email: text})}
					/>
					{
						this.state.emailErrMsg !== "" ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text
									style={{
										color: "red",
										fontFamily: "Montserrat-Regular"
									}}>
									{this.state.emailErrMsg}
								</Text>
							</Animatable.View> : null
					}

					<Text style={styles.label}>Telefon raqam</Text>
					<TextInput
						scrollEnabled={false}

						dataDetectorTypes={"phoneNumber"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPhoneInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 13,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.phone.length > 0 ? "#FFF" : this.state.isPhoneInputActive ? "#FFF" : "#EDF0F7"),
						}}
						placeholder="+998 ** *** ** **"
						placeholderTextColor="#AFAFAF"

						cursorColor={"#000"}
						value={this.state.phone}
						onFocus={() => {
							this.setState({isPhoneInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isPhoneInputActive: false});
						}}
						onChangeText={(text) => this.setState({phone: text})}
					/>
					{
						this.state.phoneErrMsg !== "" ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text
									style={{
										color: "red",
										fontFamily: "Montserrat-Regular"
									}}>
									{this.state.phoneErrMsg}
								</Text>
							</Animatable.View> : null
					}

					<Text style={styles.label}>Parolni kiriting</Text>
					<TextInput
						scrollEnabled={false}

						passwordRules={"required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPasswordInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 13,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							backgroundColor: (this.state.password.length > 0 ? "#FFF" : this.state.isPasswordInputActive ? "#FFF" : "#EDF0F7"),
							fontFamily: "Montserrat-Regular"
						}}
						placeholder="********"
						placeholderTextColor="#AFAFAF"
						secureTextEntry
						value={this.state.password}
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
						this.state.passwordErrMsg !== "" ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text
									style={{
										color: "red",
										fontFamily: "Montserrat-Regular"
									}}>
									{this.state.passwordErrMsg}
								</Text>
							</Animatable.View> : null
					}

					<Text style={styles.label}>Parolni tasdiqlang</Text>
					<TextInput
						scrollEnabled={false}

						passwordRules={"required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPasswordVerifyInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 13,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							backgroundColor: (this.state.passwordVerify.length > 0 ? "#FFF" : this.state.isPasswordVerifyInputActive ? "#FFF" : "#EDF0F7"),
							fontFamily: "Montserrat-Regular"
						}}
						placeholder="********"
						placeholderTextColor="#AFAFAF"
						secureTextEntry
						value={this.state.passwordVerify}
						cursorColor={"#000"}
						onFocus={() => {
							this.setState({isPasswordVerifyInputActive: true});
						}}
						onEndEditing={() => {
							this.setState({isPasswordVerifyInputActive: false});
						}}
						onChangeText={(text) => this.setState({passwordVerify: text})}
					/>
					{
						this.state.passwordVerifyErrMsg !== "" ?
							<Animatable.View style={{
								width: screenWidth - (24 + 24),
								marginBottom: 16,
							}} animation="shake" duration={500}>
								<Text
									style={{
										color: "red",
										fontFamily: "Montserrat-Regular"
									}}>
									{this.state.passwordVerifyErrMsg}
								</Text>
							</Animatable.View> : null
					}

					<TouchableOpacity
						onPress={async () => {
							let error = false;

							if (this.state.storeName.length < 3) {
								this.setState({
									storeNameErrMsg: "Nom kamida 3ta harfdan iborat bo'lishi kerak."
								});
								error = true;
							} else {
								if (this.state.storeNameErrMsg === "Nom kamida 3ta harfdan iborat bo'lishi kerak.") {
									this.setState({
										storeNameErrMsg: ""
									});
								}
							}

							if (this.state.email.length < 3) {
								this.setState({
									emailErrMsg: "Bu tog'ri INN nomi emas."
								});
								error = true;
							} else {
								if (this.state.emailErrMsg === "Bu tog'ri INN nomi emas.") {
									this.setState({
										emailErrMsg: ""
									});
								}
							}

							if (!this.state.phone.startsWith("+")) {
								this.setState({
									phoneErrMsg: "Telefon raqam mamlakat kodi bilan boshlanishi shart."
								});
								error = true;
							} else {
								if (this.state.phoneErrMsg === "Telefon raqam mamlakat kodi bilan boshlanishi shart.") {
									this.setState({
										phoneErrMsg: ""
									});
								}
							}

							if (this.state.phone.length !== 13) {
								this.setState({
									phoneErrMsg: "Telefon raqam 13ta belgidan iborat bo'lishi shart."
								});
								error = true;
							} else {
								if (this.state.phoneErrMsg === "Telefon raqam 13ta belgidan iborat bo'lishi shart.") {
									this.setState({
										phoneErrMsg: ""
									});
								}
							}

							const countryCodes = ["+998", "+992", "+993", "+996", "+7"];
							if (!countryCodes.some(code => this.state.phone.startsWith(code))) {
								this.setState({
									phoneErrMsg: "Telefon raqam mamlakat kodi bilan integratsiya mavjud emas."
								});
								error = true;
							} else {
								if (this.state.phoneErrMsg === "Telefon raqam mamlakat kodi bilan integratsiya mavjud emas.") {
									this.setState({
										phoneErrMsg: ""
									});
								}
							}

							if (this.state.password.length < 8 || this.state.passwordVerify.length < 8) {
								this.setState({
									passwordErrMsg: "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
									passwordVerifyErrMsg: "Parol kamida 8 ta belgidan iborat bo'lishi kerak."
								});
								error = true;
							} else {
								if (this.state.passwordVerifyErrMsg === "Parol kamida 8 ta belgidan iborat bo'lishi kerak.") {
									this.setState({
										passwordErrMsg: "",
										passwordVerifyErrMsg: ""
									});
								}
							}

							if (this.state.password !== this.state.passwordVerify) {
								this.setState({
									passwordVerifyErrMsg: "Parollar bir xil emas."
								});
								error = true;
							} else {
								if (this.state.passwordVerifyErrMsg === "Parollar bir xil emas.") {
									this.setState({
										passwordVerifyErrMsg: ""
									});
								}
							}

							let isExist = await this.apiService.checkEmail(this.state.email + "@backall.uz");
							if (isExist) {
								this.setState({
									emailErrMsg: "Bu INN ro'yxatdan o'tgan."
								});
								error = true;
							} else {
								if (this.state.emailErrMsg === "Bu INN ro'yxatdan o'tgan.") {
									this.setState({
										emailErrMsg: ""
									});
								}
							}

							if (error) {
								return;
							}

							await AsyncStorage.setItem("storeName", this.state.storeName);
							await AsyncStorage.setItem("phone", this.state.phone);
							await AsyncStorage.setItem("email", this.state.email + "@backall.uz");
							await AsyncStorage.setItem("password", this.state.password);

							this.props.navigation.navigate("RegisterVerification");
						}}
					>
						<View style={styles.button}>
							<Text style={styles.buttonText}>Ro’yxatdan o’tish</Text>
						</View>
					</TouchableOpacity>
				</View>

			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 70,
		backgroundColor: "#FFF"
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
	logoWrapper: {
		width: "100%",
		display: "flex",
		alignItems: "flex-end",
	},
	form: {
		alignItems: "center",
		marginTop: 50
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "Montserrat-Medium",
		marginBottom: 4,
		width: screenWidth - (24 + 24)
	},
	button: {
		marginTop: 14,
		width: screenWidth - (24 + 24),
		height: 66,
		backgroundColor: "#D9D9D9",
		paddingVertical: 14,
		borderRadius: 10,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	buttonText: {
		color: "#000",
		textAlign: "center",
		fontSize: 20,
		textTransform: "none",
		fontWeight: "500",
		fontFamily: "Montserrat-Medium"
	},
})

export default memo(Register);