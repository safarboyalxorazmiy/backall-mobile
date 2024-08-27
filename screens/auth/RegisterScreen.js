import React, {Component, memo} from "react";
import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import BackIcon from "../../assets/arrow-left-icon.svg";
import Logo from "../../assets/logo.svg";
import * as Animatable from "react-native-animatable";

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
			passwordVerify: ""
		}
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
					<Logo style={styles.logo} />
				</View>

				<View style={styles.form}>
					<Text style={styles.label}>Dokonni INNsini kiriting</Text>
					<TextInput
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isEmailInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 23,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.email.length > 0 ? "#FFF" :this.state.isEmailInputActive ? "#FFF" : "#EDF0F7"),
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
					<Text style={styles.label}>Telefon raqam</Text>
					<TextInput
						dataDetectorTypes={"phoneNumber"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPhoneInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 23,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							fontFamily: "Montserrat-Regular",
							backgroundColor: (this.state.phone.length > 0 ? "#FFF" :this.state.isPhoneInputActive ? "#FFF" : "#EDF0F7"),
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
					<Text style={styles.label}>Parolni tasdiqlang</Text>
					<TextInput
						passwordRules={"required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"}
						autoCapitalize="none"
						style={{
							height: 64,
							width: screenWidth - (24 + 24),
							borderWidth: 1,
							borderRadius: 10,
							borderColor: (this.state.isPasswordVerifyInputActive ? "#000" : this.state.error ? "red" : "#AFAFAF"),
							paddingVertical: 23,
							paddingHorizontal: 20,
							fontSize: 18,
							marginBottom: 16,
							backgroundColor: (this.state.passwordVerify.length > 0 ? "#FFF" : this.state.isPasswordVerifyInputActive ? "#FFF" : "#EDF0F7"),
							fontFamily: "Montserrat-Regular",
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
		backgroundColor: "#FFF",
		height: "100%"
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