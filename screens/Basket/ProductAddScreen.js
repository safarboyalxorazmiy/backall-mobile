import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { CheckBox } from 'react-native-elements';

const screenWidth = Dimensions.get('window').width;

class ProductAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriyaInputValue: '',
      brandInputValue: '',
      productInputValue: '',
      amountInputValue: '',
      priceInputValue: '',
      sellingPriceInputValue: '',
      percentageInputValue: '',
    };
  }

  handleButtonClick = () => {
    const {
      seriyaInputValue,
      brandInputValue,
      productInputValue,
      amountInputValue,
      priceInputValue,
      sellingPriceInputValue,
      percentageInputValue,
    } = this.state;

    console.log('Seriya Value:', seriyaInputValue);
    console.log('Brand Value:', brandInputValue);
    console.log('Product Value:', productInputValue);
    console.log('Amount Value:', amountInputValue);
    console.log('Price Value:', priceInputValue);
    console.log('Selling Price Value:', sellingPriceInputValue);
    console.log('Percentage Value:', percentageInputValue);

    // You can do further processing with the values here
  };

  render() {
    const { navigation } = this.props;

    return (
      <>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={{ fontSize: 28, fontFamily: "Roboto-Black", marginBottom: 21 }}>Maxsulot qo’shish</Text>
          <TextInput
              style={styles.input}
              placeholder="Seriya"
              placeholderTextColor="black"
              onChangeText={(text) => this.setState({ seriyaInputValue: text })}
          />

          <TextInput
              style={styles.input}
              placeholder="Brand nomi: "
              placeholderTextColor="black"
              onChangeText={(text) => this.setState({ brandInputValue: text })}
          />

          <TextInput
              style={styles.input}
              placeholder="Maxsulot nomi: "
              placeholderTextColor="black"
              onChangeText={(text) => this.setState({ productInputValue: text })}
          />

          <View style={styles.amountGroup}>
            <TextInput
                style={styles.amountInput}
                placeholder="Maxsulot miqdori: "
                placeholderTextColor="black"
                onChangeText={(text) => this.setState({ amountInputValue: text })}
            />
            <View style={styles.amountType}>
              <Text style={{ color: "white", fontSize: 18, fontFamily: "Roboto-Regular" }}>KG</Text>
            </View>
          </View>

          <TextInput
              style={styles.input}
              placeholder="Tan narxi: "
              placeholderTextColor="black"
              onChangeText={(text) => this.setState({ priceInputValue: text })}
          />

          <View style={styles.inputGroup}>
            <TextInput
                style={styles.priceInput}
                placeholder="Sotilish narxi: "
                placeholderTextColor="black"
                onChangeText={(text) => this.setState({ sellingPriceInputValue: text })}
            />

            <Text style={{ fontSize: 18, fontFamily: 'Roboto-Regular' }}>yoki</Text>

            <TextInput
                style={styles.percentageInput}
                placeholder="%"
                placeholderTextColor="black"
                onChangeText={(text) => this.setState({ percentageInputValue: text })}
            />
          </View>

          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", width: screenWidth - (17 + 17) }}>
            <CheckBox
                checked={true}
                // onPress={() => {nds = true}}
                containerStyle={{ margin: 0, padding: 0, borderWidth: 0, backgroundColor: 'transparent' }}
            />
            <Text style={{ fontSize: 18, fontFamily: 'Roboto-Regular' }}>NDS soliq</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Basket')}>
              <Text style={styles.buttonText}>Bekor qilish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.handleButtonClick}>
              <Text style={styles.buttonText}>Saqlash</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: "center",
    paddingTop: 70,
    position: "relative",
    gap: 10
  },

  input: {
    height: 64,
    width: screenWidth - (17 + 17),
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Roboto-Regular'
  },

  inputGroup: {
    width: screenWidth - (17 + 17),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  priceInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 20,
    width: "50%",
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
  },

  percentageInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 20,
    width: "30%",
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
  },

  amountGroup: {
    display: "flex",
    flexDirection: "row"
  },

  amountInput: {
    borderWidth: 1,
    paddingVertical: 23,
    paddingHorizontal: 20,
    width: screenWidth - (17 + 17 + 90),
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },

  amountType: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "center",
    width: 90,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },

  buttons: {
    width: screenWidth - (17 + 17),
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    backgroundColor: "black",
    paddingVertical: 16,
    paddingHorizontal: 47,
    borderRadius: 10
  },

  buttonText: {
    color: "white",
    fontFamily: "Roboto-Bold",
    fontSize: 16
  }
});

export default ProductAdd;