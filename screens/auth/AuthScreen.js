import {Component} from "react";
import {StyleSheet, View, Text, TouchableOpacity, ScrollView} from "react-native";
import Outer from "../../assets/outer.svg";

class AuthScreen extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ScrollView contentContainerStyle={styles.container}>
				<Outer/>
				<Text style={styles.headerMainText}>Backallga hush kelibsiz</Text>
				<Text style={styles.headerInfoText}>O’rta osiyodagi dokonlarni avtomatlashtirish uchun eng tez mobil
					dastur. Bu hamyonbop va xavfsiz.</Text>
				<TouchableOpacity style={styles.loginBtn} onPress={() => {
					this.props.navigation.navigate("Login");
				}}>
					<Text style={styles.loginBtnText}>Kirish</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.registerBtn}>
					<Text style={styles.registerBtnText}>Ro’yxatdan o’tish</Text>
				</TouchableOpacity>
			</ScrollView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		paddingHorizontal: 25,
		paddingVertical: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	headerMainText: {
		fontSize: 34,
		fontFamily: "Montserrat-Bold",
		marginTop: 42,
		textAlign: "center",
	},
	headerInfoText: {
		marginTop: 17,
		fontFamily: "Montserrat-Medium",
		fontSize: 14,
		textAlign: "center",
		width: 284
	},
	loginBtn: {
		marginTop: 25,
		width: "100%",
		height: 66,
		backgroundColor: "#171717",
		color: "#FFF",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 11
	},
	registerBtn: {
		marginTop: 11,
		backgroundColor: "#D9D9D9",
		width: "100%",
		height: 66,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 11
	},
	loginBtnText: {
		color: "#FFF",
		fontSize: 18,
		fontFamily: "Montserrat-Medium",
	},
	registerBtnText: {
		fontSize: 18,
		fontFamily: "Montserrat-Medium",
	}
})

export default AuthScreen;