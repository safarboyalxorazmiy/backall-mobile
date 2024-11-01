import React, { Component, createRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ApplicationProvider, Input, Text, Button } from '@ui-kitten/components';
import RightArrow from "../assets/right-arrow.svg";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ApiService from '../service/ApiService';

class PaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: "",
      cardNumberWithoutSpaces: "",
      expirationDate: "",
      expirationDateWithoutSlash: "",
      code: ""
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

  handleExpirationDateChange = (text) => {
    const cleanedText = text.replace(/\D/g, '').slice(0, 4);
    const formattedExpirationDate = cleanedText.length > 2 
      ? `${cleanedText.substring(0, 2)}/${cleanedText.substring(2, 4)}`
      : cleanedText;
    this.setState({
      expirationDate: formattedExpirationDate,
      expirationDateWithoutSlash: cleanedText
    });

    if (cleanedText.length === 4) {
      this.makeCodeRequest();
      this.expirationDateInput.current.blur();
    }
  };

  async makeCodeRequest() {
    let result = await this.apiService.makePaymentRequest(this.state.cardNumberWithoutSpaces, this.state.expirationDateWithoutSlash, this.props.navigation);
    console.log(result);
  }

  handleSubmit = () => {
    console.log('Expiration Date:', this.state.expirationDateWithoutSlash);
  };

  handleCodeChange = (text) => {
    const cleanedText = text.replace(/\D/g, '').slice(0, 4);
    this.setState({ code: cleanedText });
    if(cleanedText.length === 4) {
      console.log('Success');
    }
  };

  render() {
      return (
        <View style={{height: 500, marginTop: 40}}>
          <Input
            textStyle={{ color: 'white' }}
            size="large"
            placeholder="XXXX XXXX XXXX XXXX"
            cursorColor={"white"}
            label={evaProps => <Text {...evaProps}>Karta ma'lumotlarini kiriting:</Text>}
            // caption={
            //   (evaProps) => <Text status="danger">Karta raqam xato.</Text>
            // }
            status='success'
            
            textContentType='creditCardNumber'
            placeholderTextColor={'white'}

            style={{ backgroundColor: 'black', color: "#FFF" }}
            value={this.state.cardNumber}
            accessoryRight={() => {
              return (
                <View style={{ marginRight: 10 }}>
                  <FontAwesome name="credit-card-alt" size={24} color="white" />
                </View>
              );
            }}
            onChangeText={this.handleChange}
            keyboardType="numeric"
            maxLength={19} 
          />

          <Input
            ref={this.expirationDateInput}
            placeholder="MM/YY"
            status='success'
            value={this.state.expirationDate}
            onChangeText={this.handleExpirationDateChange}
            keyboardType="numeric"
            maxLength={5}
            style={{ marginTop: 15, backgroundColor: 'black' }}
            size="large"
          />

          <Input
            ref={this.codeInput}
            label={evaProps => <Text {...evaProps}>Kodni kiriting:</Text>}
            placeholder="XXXX"
            value={this.state.code}
            onChangeText={this.handleCodeChange}
            keyboardType="numeric"
            maxLength={5}
            style={{ marginTop: 50, backgroundColor: 'black' }}
            size="large"
          />
          
          <View style={{ position: "absolute", bottom: 0, width: "100%"}}>
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

export default PaymentForm;