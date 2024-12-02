import React, {Component, createRef, memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Input, Text} from '@ui-kitten/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import ApiService from '../../service/ApiService';
import {ProgressBar} from '@ui-kitten/components';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ScrollView} from "react-native-gesture-handler";
import i18n from '../../i18n';
import { TouchableRipple } from 'react-native-paper';

class PaymentForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cardNumber: props.cardNumber || "",
			cardNumberWithoutSpaces: props.cardNumberWithoutSpaces || "",
			expirationDate: "",
			expirationDateWithoutSlash: "",
			code: "",

			loading: false,
			progress: 0,

			error: false,
			expirationError: false,
			cardNumberError: false,
			cardToken: null,
			CLOSE_BUTTON_VISIBLE: true
		};

		this.expirationDateInput = createRef();
		this.scrollView = createRef();
		this.codeInput = createRef();

		this.apiService = new ApiService();
	}

	handleChange = async (text) => {
		let formattedNumber = text.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
		let cardNumberWithoutSpaces = formattedNumber.replace(/\s/g, '');

		this.setState({
			cardNumber: formattedNumber,
			cardNumberWithoutSpaces: cardNumberWithoutSpaces
		});

		await AsyncStorage.setItem("cardNumber", formattedNumber);
		await AsyncStorage.setItem("cardNumberWithoutSpaces", cardNumberWithoutSpaces);

		if (formattedNumber.length === 19) {
			if (this.expirationDateInput.current) {
				this.expirationDateInput.current.focus();
			}
		}
	};

	handleExpirationDateChange = async (text) => {
		const cleanedText = text.replace(/\D/g, '').slice(0, 4);

		const formattedExpirationDate = cleanedText.length > 2
			? `${cleanedText.substring(0, 2)}/${cleanedText.substring(2, 4)}`
			: cleanedText;


		// //.log(text.length)
		this.setState({
			expirationDate: formattedExpirationDate
		});


		if (cleanedText.length === 4) {
			this.setState({
				expirationDateWithoutSlash: cleanedText
			});

			//.log("expirationDateWithoutSlash::", cleanedText)

			if (this.expirationDateInput.current) {
				this.expirationDateInput.current.blur();
			}
			this.setState({
				loading: true
			});

			await this.makeCodeRequest(cleanedText);

			// this.setState({
			// 	loading: false
			// })

			return;
		}

		this.setState({
			error: false,
			cardNumberError: false,
			expirationError: false,
			loading: false,
			cardToken: null
		})

	};

	async makeCodeRequest(code) {
		let result;
		try {
			this.setState({
				progress: 40
			});

			//.log("response started")
			result = await this.apiService.makePaymentRequest(this.state.cardNumberWithoutSpaces, code);

		} catch (error) {
			this.setState({
				error: true,
				cardNumberError: true,
				expirationError: true
			})
		}

		if (result == false) {
			this.setState({
				cardToken: null
			});
			return;
		}

		//.log(result.phone);

		//.log("response compleated")
		//.log("makeCodeRequest()::", result);
		if (result) {
			this.setState({
				cardToken: result.token,
				requestedPhone: result.phone,
				progress: 100,
				error: false,
				cardNumberError: false,
				expirationError: false
			});
			this.codeInput.current.focus();
			this.scrollView.current?.scrollTo({x: 0, y: 400, animated: true});
		}
		//.log("cardToken::", result)
	}

	async verifyPayment(code) {
		if (this.state.cardToken == null) {
			//.log("this.state.cardToken is null")
			this.setState({
				error: true
			});
		} else {
			//.log("token, code", this.state.cardToken, code);

			let result = await this.apiService.verifyPaymentRequest(
				this.state.cardToken, code
			);

			if (result == "authError") {
				this.setState({
					error: true,
					expirationError: true,
					cardNumberError: true
				});

				await this.props.completePayment();
			}

			if (result) {
				this.setState({
					error: false,
					expirationError: false,
					cardNumberError: false
				});

				await this.props.completePayment();

				// Tolov qilindi endi bu oynani boshqa ochish shartmas
				await AsyncStorage.setItem("paymentScreenOpened", "false");
				await AsyncStorage.setItem("isNewUser", "false");	
				return;
			}

			this.setState({
				error: true,
				codeError: true
			});
		}
	}


	handleSubmit = () => {
		//.log('Expiration Date:', this.state.expirationDateWithoutSlash);
	};

	handleCodeChange = async (text) => {
		const cleanedText = text.replace(/\D/g, '').slice(0, 6);
		this.setState({code: cleanedText});
		if (cleanedText.length === 6) {
			await this.verifyPayment(text);
			//.log('Success');
		}
	};

	render() {
		return (
			<ScrollView   
				keyboardShouldPersistTaps="always" 
				contentContainerStyle={{ flexGrow: 1 }} 
				ref={this.scrollView} 
				style={{
					width: "100%",
					// height: "100%",
					backgroundColor: "#181926",
					paddingHorizontal: 16
				}}>
				<Text style={{
					color: "white",
					fontFamily: "Gilroy-SemiBold",
					fontSize: 38,
					width: 280,
					marginTop: 100,
				}}>{i18n.t("paymentModalTitle")}</Text>

				{
					this.state.CLOSE_BUTTON_VISIBLE == true ? (
						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor="#E5E5E5"
							rippleContainerBorderRadius={50}
							borderless={true}
							activeOpacity={1}
							onPress={async () => {

								if (await AsyncStorage.getItem("isNewUser") === "true") {
									this.setState({
										CLOSE_BUTTON_VISIBLE: false
									});

									return;
								}

								let tryCount = parseInt(
									await AsyncStorage.getItem("paymentTryCount")
								);
								if (isNaN(tryCount)) {
									tryCount = 0;
								}

								if (tryCount >= 3) {
									// tryCount ya'ni tolov qilish urunishi
									// 3 tadan kotta bosa bu degani 3 kun bu knopkani bosgandan keyin
									// boshqa bosolmidigan bopqosin.
									let email = await AsyncStorage.getItem("email");

									// Get the current date
									let currentDate = new Date();
									// Extract month and year
									let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-based month
									let year = currentDate.getFullYear();
									let monthYear = `${month}/${year}`;

									let isPayed = await this.apiService.getPayment(email, monthYear);
									//.log("Payed: ", isPayed)

									this.setState({
										CLOSE_BUTTON_VISIBLE: false
									})

									
									// Agar masheniklik qilib offline ishlataman desa
									// screenga kirganda payment oynasini qayta ochadigan qilib qo'yamiz
									await AsyncStorage.setItem("paymentScreenOpened", "true");
									return;
								} else {
									// Kunni oshirish.
									let paymentTryCount = await AsyncStorage.getItem("paymentTryCount");
									//.log("paymentTryCount::", paymentTryCount);

									await AsyncStorage.setItem("paymentTryCount", (tryCount + 1).toString());

									const currentDate = new Date();

									const year = currentDate.getFullYear();
									const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month index
									const day = ("0" + currentDate.getDate()).slice(-2);
									const hour = ("0" + currentDate.getHours()).slice(-2); // Get current hour

									const dateString = `${year}-${month}-${day}`;


									if (await AsyncStorage.getItem("lastPaymentShownDate") != dateString) {
										await AsyncStorage.setItem("lastPaymentShownDate", dateString);
									}

									if (await AsyncStorage.getItem("lastPaymentShownHour") != hour.toString()) {
										await AsyncStorage.setItem("lastPaymentShownHour", hour.toString());
									}

									await AsyncStorage.setItem("paymentScreenOpened", "false");

									this.props.closeModal();
								}
							}}
							style={{
								width: 44,
								height: 44,
								backgroundColor: "#07070A",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								position: "absolute",
								top: 22,
								right: 8,
								zIndex: 5,
								borderRadius: 50
							}}>
							<AntDesign name="close" size={24} color="white"/>
						</TouchableRipple>
					) : null
				}

				<View style={{marginTop: 40}}>
					<Input
						onTouchStart={() => {
							// this.scrollView.current?.scrollToEnd();
							this.scrollView.current?.scrollTo({x: 0, y: 200, animated: true});
						}}
						// textStyle={{color: 'white'}}
						size="large"
						placeholder="XXXX XXXX XXXX XXXX"
						cursorColor={"white"}
						label={evaProps => <Text {...evaProps}>{i18n.t("enterCardDetails")}</Text>}
						// caption={
						//   (evaProps) => <Text status="danger">Karta raqam xato.</Text>
						// }
						status={this.state.error ? "danger" : this.state.cardToken != null ? "success" : "default"}

						textContentType='creditCardNumber'
						placeholderTextColor={'#929cae'}
						selectionColor={"#FFF"}
						textStyle={{color: "#FFF"}}
						style={{backgroundColor: 'black', color: "#FFF"}}
						value={this.state.cardNumber}
						accessoryRight={() => {
							return this.state.cardNumberError ? (
								<TouchableOpacity
									style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10}}
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
								<View style={{marginRight: 10,}}>
									<Feather name="check" size={24} color="#51F0B0"/>
								</View>
							) : (
								<View style={{paddingTop: 5, paddingBottom: 5, marginRight: 10}}>
									<FontAwesome name="credit-card-alt" size={24} color="#929cae"/>
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
						placeholderTextColor={"#929cae"}
						textStyle={{color: "#FFF"}}
						status={this.state.expirationError ? "danger" : this.state.cardToken != null ? "success" : "default"}
						value={this.state.expirationDate}
						onChangeText={async (text) => {
							await this.handleExpirationDateChange(text)
						}}
						accessoryRight={() => {
							return this.state.expirationError ? (
								<TouchableOpacity
									style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10}}
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

										if (this.expirationDateInput.current) {
											this.expirationDateInput.current.focus();
										}
									}}>
									<AntDesign name="close" size={24} color="#FF3D71"/>
								</TouchableOpacity>
							) : this.state.cardToken != null ? (
								<View style={{marginRight: 10}}>
									<Feather name="check" size={24} color="#51F0B0"/>
								</View>
							) : (
								<View style={{paddingTop: 5, paddingBottom: 5}}>
									<Text></Text>
								</View>
							)
						}}
						keyboardType="numeric"
						maxLength={5}
						style={{marginTop: 15, backgroundColor: 'black'}}
						size="large"
					/>

					{
						this.state.loading ? (
								<ProgressBar
									status={this.state.error ? "danger" : this.state.cardToken != null ? "success" : "warning"}
									progress={this.state.progress}
									animating={true}
									style={{marginTop: 15}}/>
							)
							: null
					}

					{
						this.state.cardToken != null ? (
							<Input
							textStyle={{color: "#FFF"}}
								ref={this.codeInput}
								label={evaProps => <Text {...evaProps}>Kodni kiriting:</Text>}
								placeholder="XXXX"
								value={this.state.code}
								onChangeText={this.handleCodeChange}
								keyboardType="numeric"
								maxLength={7}
								style={{marginTop: 50, backgroundColor: 'black'}}
								size="large"

							/>
						) : null
					}

					<View style={{marginTop: 0, paddingBottom: 100}}>
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
							}}>{i18n.t("total")}</Text>

							<View style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "flex-end",
							}}>
								<Text style={{
									color: "white",
									fontFamily: "Gilroy-Regular",
									fontSize: 24
								}}>128 000 </Text>

								<Text style={{
									color: "white",
									fontFamily: "Gilroy-Regular",
									fontSize: 20
								}}>{i18n.t("sum")}</Text>
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

			</ScrollView>
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

export default PaymentForm;