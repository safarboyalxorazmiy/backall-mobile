import React, {Component, createRef, memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {ApplicationProvider, Input, Text, Button} from '@ui-kitten/components';
import RightArrow from "../assets/right-arrow.svg";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import ApiService from '../service/ApiService';
import {ProgressBar} from '@ui-kitten/components';

class PaymentForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cardNumber: "",
			cardNumberWithoutSpaces: "",
			expirationDate: "",
			expirationDateWithoutSlash: "",
			code: "",

			loading: false,
			progress: 0,

			error: true,
			expirationError: true,
			cardNumberError: true,
			cardToken: null
		};
		this.expirationDateInput = createRef();

		this.apiService = new ApiService();
	}

	handleChange = (text) => {
		let formattedNumber = text.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
		let cardNumberWithoutSpaces = formattedNumber.replace(/\s/g, '');

		this.setState({
			cardNumber: formattedNumber,
			cardNumberWithoutSpaces: cardNumberWithoutSpaces
		});
		if (formattedNumber.length === 19) {
			this.expirationDateInput.current.focus();
		}
	};

	handleExpirationDateChange = async (text) => {
		const cleanedText = text.replace(/\D/g, '').slice(0, 4);
		const formattedExpirationDate = cleanedText.length > 2
			? `${cleanedText.substring(0, 2)}/${cleanedText.substring(2, 4)}`
			: cleanedText;

		const formattedExpirationDateWithoutSlash = cleanedText.length > 2
			? `${cleanedText.substring(0, 2)}${cleanedText.substring(2, 4)}`
			: cleanedText;

		// console.log(text.length)
		this.setState({
			expirationDate: formattedExpirationDate
		});

		if (cleanedText.length === 4) {
			this.setState({
				expirationDateWithoutSlash: cleanedText
			});

			console.log("expirationDateWithoutSlash::", cleanedText)

			this.expirationDateInput.current.blur();
			this.setState({
				loading: true
			});

			await this.makeCodeRequest(cleanedText);

			// this.setState({
			// 	loading: false
			// })
		}
	};

	async makeCodeRequest(code) {
		let result;
		try {
			this.setState({
				progress: 40
			});

			console.log("response started")
			result = await this.apiService.makePaymentRequest(this.state.cardNumberWithoutSpaces, code);

		} catch (error) {
			this.setState({
				error: true,
				cardError: true,
				expirationError: true
			})
		}

		if (result == false) {
			this.setState({
				cardToken: null
			});
			return;
		}

		console.log(result);

		console.log("response compleated")
		console.log("makeCodeRequest()::", result);
		if (result) {
			this.setState({
				cardToken: result,
				progress: 100,
				error: false,
				cardNumberError: false,
				expirationError: false
			});
		}
		console.log("cardToken::", result)
	}

	async verifyPayment() {
		if (this.state.cardToken == null) {
			console.log("this.state.cardToken is null")
			this.setState({
				error: true
			});
		} else {
			try {
				await this.apiService.verifyPaymentRequest(
					this.state.cardToken, this.state.code
				);

				console.log(this.state.cardToken, this.state.code)
			} catch (error) {
				if (error == "authError") {
					await this.props.completePayment();
				} else {
					this.setState({
						error: true,
						codeError: true
					});
				}
			}
		}
	}


	handleSubmit = () => {
		console.log('Expiration Date:', this.state.expirationDateWithoutSlash);
	};

	handleCodeChange = async (text) => {
		const cleanedText = text.replace(/\D/g, '').slice(0, 4);
		this.setState({code: cleanedText});
		if (cleanedText.length === 4) {
			await this.verifyPayment();
			console.log('Success');
		}
	};

	render() {
		return (
			<View style={{height: 500, marginTop: 40}}>
				<Input
					// textStyle={{color: 'white'}}
					size="large"
					placeholder="XXXX XXXX XXXX XXXX"
					cursorColor={"white"}
					label={evaProps => <Text {...evaProps}>Karta ma'lumotlarini kiriting:</Text>}
					// caption={
					//   (evaProps) => <Text status="danger">Karta raqam xato.</Text>
					// }
					status={this.state.error ? "danger" : this.state.cardToken != null ? "success" : "default"}

					textContentType='creditCardNumber'
					// placeholderTextColor={'white'}

					style={{backgroundColor: 'black', color: "#FFF"}}
					value={this.state.cardNumber}
					accessoryRight={() => {
						return this.state.cardNumberError ? (
							<TouchableOpacity
								style={{paddingLeft: 10, paddingRight: 10}}
								onPress={() => {
									this.setState({
										cardNumber: "",
										cardToken: null,
										cardNumberError: false
									});

									if (this.state.expirationError) {
										this.setState({
											error: false
										});
									}


								}}>
								<AntDesign name="close" size={24} color="#FF3D71"/>
							</TouchableOpacity>
						) : this.state.cardToken != null ? (
							<View style={{marginRight: 10}}>
								<Feather name="check" size={24} color="#51F0B0"/>
							</View>
						) : (
							<View style={{marginRight: 10}}>
								<FontAwesome name="credit-card-alt" size={24} color="white"/>
							</View>
						)
					}}
					onChangeText={this.handleChange}
					keyboardType="numeric"
					maxLength={19}
				/>

				<Input
					ref={this.expirationDateInput}
					placeholder="MM/YY"
					status={this.state.expirationError ? "danger" : this.state.cardToken != null ? "success" : "default"}
					value={this.state.expirationDate}
					onChangeText={async (text) => {
						await this.handleExpirationDateChange(text)
					}}
					onEndEditing={() => {
						console.log("Editing end mf");
						console.log(this.state.cardToken)
						if (this.state.cardToken == null) {
							this.setState({
								error: true,
								expirationError: true
							});
						}
					}}
					accessoryRight={() => {
						return this.state.expirationError ? (
							<TouchableOpacity
								style={{paddingLeft: 10, paddingRight: 10}}
								onPress={() => {
									this.setState({
										expirationDate: "",
										cardToken: null,
										expirationError: false
									});

									if (this.state.cardNumberError) {
										this.setState({
											error: false
										});
									}

									this.expirationDateInput.current.focus();
								}}>
								<AntDesign name="close" size={24} color="#FF3D71"/>
							</TouchableOpacity>
						) : this.state.cardToken != null ? (
							<View style={{marginRight: 10}}>
								<Feather name="check" size={24} color="#51F0B0"/>
							</View>
						) : (
							<></>
						)
					}}
					keyboardType="numeric"
					maxLength={5}
					style={{marginTop: 15, backgroundColor: 'black'}}
					size="large"
				/>

				{
					this.state.loading
						? <ProgressBar
							progress={this.state.progress}
							animating={true}
							style={{marginTop: 15}}/>
						: null
				}

				<Input
					ref={this.codeInput}
					label={evaProps => <Text {...evaProps}>Kodni kiriting:</Text>}
					placeholder="XXXX"
					value={this.state.code}
					onChangeText={this.handleCodeChange}
					keyboardType="numeric"
					maxLength={5}
					style={{marginTop: 50, backgroundColor: 'black'}}
					size="large"

				/>

				<View style={{position: "absolute", bottom: 0, width: "100%"}}>
					<View style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingTop: 24,
						borderTopWidth: 2,
						borderTopColor: "#07070A",
						marginTop: 200
					}}>
						<Text style={{
							color: "white",
							fontFamily: "Gilroy-Bold",
							fontSize: 24
						}}>JAMI</Text>

						<View style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "flex-end",
						}}>
							<Text style={{
								color: "white",
								fontFamily: "Gilroy-Regular",
								fontSize: 24
							}}>126,529.30 </Text>

							<Text style={{
								color: "white",
								fontFamily: "Gilroy-Regular",
								fontSize: 20
							}}>so’m</Text>
						</View>
					</View>

					{/* <TouchableOpacity
              style={{
                backgroundColor: "black",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 26,
                padding: 16,
                borderRadius: 8,
                marginTop: 18
              }}
              onPress={() => {
                Linking.openURL("https://t.me/backall_admin");
              }}>
              <Text style={{
                fontSize: 18,
                fontFamily: "Gilroy-Black",
                color: "white"
              }}>TO'LASH</Text>
              <RightArrow/>
            </TouchableOpacity> */}

				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	formGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10,
	},
	input: {
		width: 100,
		backgroundColor: 'black',
	},
	separator: {
		color: 'white',
		fontSize: 18,
		marginHorizontal: 5,
	},
	button: {
		marginLeft: 10,
		backgroundColor: 'white',
		borderColor: 'white',
	},
});

export default memo(PaymentForm);