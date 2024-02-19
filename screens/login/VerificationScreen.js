import React, {Component} from "react";
import {StyleSheet, View, Text, TouchableOpacity, TextInput} from "react-native";
import GreenCircle from "../../assets/small-green-circle.svg"

class VerificationScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			verificationCode: ""
		};
	}

	handleKeyPress = (key) => {
		// Update verification code state when a key is pressed
		this.setState(prevState => ({
			verificationCode: prevState.verificationCode + key
		}));
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
			['1', '2', '3'],
			['4', '5', '6'],
			['7', '8', '9'],
			['', '0', '']
		];

		return keyboardLayout.map((row, rowIndex) => (
			<View key={rowIndex} style={styles.keyboardRow}>
				{row.map((key, keyIndex) => (
					<TouchableOpacity
						key={keyIndex}
						style={styles.keyboardKey}
						onPress={() => {
							if (key === 'Delete') {
								this.handleDelete();
							} else {
								this.handleKeyPress(key);
							}
						}}
					>
						<Text style={styles.keyText}>{key}</Text>
					</TouchableOpacity>
				))}
			</View>
		));
	}

	renderCircles() {
		const { verificationCode } = this.state;
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
				// If verification code has less than 4 characters, display GreenCircle component
				circles.push(<GreenCircle key={i} />);
			}
		}

		return circles;
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.circle}></View>

				<View>
					<Text style={styles.headerText}>Tasdiqlash kodi</Text>
					<Text style={styles.headerInfo}>Iltimos administrator tomonidan berilgan tasdiqlash kodini kiriting</Text>
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
		columnGap: 100,
		marginBottom: 50,
	},

	keyboardKey: {
		padding: 10,
		marginHorizontal: 5
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
		marginTop: 100
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
		bottom: 0,
		left: 0,
		right: 0
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

export default VerificationScreen;