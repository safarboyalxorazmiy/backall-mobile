import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import { Dropdown } from 'react-native-element-dropdown';

import BackIcon from '../../assets/arrow-left-icon.svg'

const data = [
  { label: 'Dona', value: '1' },
  { label: 'KG', value: '2' },
  { label: 'GR', value: '3' },
  { label: 'Litr', value: '4' }
];


const screenWidth = Dimensions.get('window').width;

class ProductAdd extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            selectedItem: null,

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

    handleDropdownSelect = (value) => {
        this.setState({ value });
      };
    
      getSelectedItem = () => {
        const selectedItem = data.find((item) => item.value === this.state.value);
        return selectedItem ? selectedItem.label : 'Dona';
      };

    render() {
        const {navigation} = this.props;

        return (
            <>
                 <View style={styles.container}>
                    
                </View>

                <ScrollView contentContainerStyle={styles.container}>
                    <View style={{
                        width: screenWidth - (17 + 17),
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16
                    }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Basket')} style={{
                            backgroundColor: "#F5F5F7",
                            paddingVertical: 16,
                            paddingHorizontal: 19,
                            borderRadius: 8
                        }}>
                            <BackIcon />
                        </TouchableOpacity>

                        <Text style={{
                            width: 299,
                            textAlign: "center",
                            fontSize: 28,
                            fontFamily: "Gilroy-SemiBold",
                            fontWeight: 600
                        }}>
                            Mahsulot qo’shish
                        </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot seriyasi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Seriyasini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({seriyaInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Brand nomi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brand nomini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({brandInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot nomi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nomini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({productInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot miqdori</Text>
                        <View style={styles.amountGroup}>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="Miqdorini kiriting"
                                placeholderTextColor="#AAAAAA"
                                onChangeText={(text) => this.setState({amountInputValue: text})}
                            />

                            <View style={styles.amountType}>
                            <Dropdown
                                data={data}
                                labelField="label"
                                valueField="value"
                                value="1"
                                onChange={this.handleDropdownSelect}
                                style={styles.dropdown}
                                baseColor="white"

                                selectedTextProps={{
                                    style: {
                                      fontSize: 20, 
                                      color: 'white',
                                    },
                                }}

                                selectedTextStyle={{
                                  fontSize: 13,
                                  color: 'black',
                                }}
                            />
                             {/* {this.state.value && (
                                <Text style={{
                                    color: "white",
                                    fontSize: 16,
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500"
                                }}>
                                    {this.getSelectedItem()}
                                </Text>
                            )}  */}
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tan narxi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Narxini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({priceInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Sotilish narxi (so’mda)</Text>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Sotilish narxi: "
                                placeholderTextColor="#AAAAAA"
                                onChangeText={(text) => this.setState({sellingPriceInputValue: text})}
                            />

                            <View style={styles.priceType}>
                                <Text style={{
                                    color: "white",
                                    fontSize: 16,
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500"
                                }}>
                                    %
                                </Text>

                                {/* <Image source={require("../../assets/dropdown-icon.png")}/> */}
                            </View>
                        </View>
                    </View>

                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: screenWidth - (17 + 17)
                    }}>
                        <CheckBox
                            checked={true}
                            // onPress={() => {nds = true}}
                            containerStyle={{margin: 0, padding: 0, borderWidth: 0, backgroundColor: 'transparent'}}
                        />
                        <Text style={{fontSize: 18, fontFamily: 'Gilroy-Medium'}}>NDS soliq</Text>
                    </View>

                    <TouchableOpacity style={styles.buttonDark} onPress={this.handleButtonClick}>
                        <Text style={styles.buttonDarkText}>Mahsulotni qo’shish</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonLight} onPress={() => navigation.navigate('Basket')}>
                        <Text style={styles.buttonLightText}>Bekor qilish</Text>
                    </TouchableOpacity>
                </ScrollView>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: 52,
        gap: 10,
        height: "auto"
    },

    label: {
        fontFamily: "Gilroy-Medium",
        fontWeight: "500",
        fontSize: 16,
        marginBottom: 4
    },

    inputWrapper: {
        marginBottom: 16
    },

    input: {
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Gilroy-Medium'
    },

    inputGroup: {
        width: screenWidth - (17 + 17),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    priceInput: {
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        width: screenWidth - (17 + 17 + 122),
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
    },

    priceType: {
        display: "flex",
        flexDirection: "row",
        gap: 25,
        alignItems: "center",
        justifyContent: "center",
        width: 122,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: "#444444"
    },

    amountGroup: {
        display: "flex",
        flexDirection: "row"
    },

    amountInput: {
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderColor: "#AFAFAF",
        width: screenWidth - (17 + 17 + 122),
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10
    },

    amountType: {
        display: "flex",
        flexDirection: "row",
        gap: 25,
        alignItems: "center",
        justifyContent: "center",
        width: 122,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: "#444444",
        color: "white"
    },

    dropdown: {
        width: 122,
    },

    buttons: {
        width: screenWidth - (17 + 17),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    buttonDark: {
        backgroundColor: "#222222",
        paddingVertical: 14,
        paddingHorizontal: 47,
        borderRadius: 8,
        width: screenWidth - (17 + 17)
    },

    buttonLight: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 47,
        borderRadius: 8,
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#222222",
        marginBottom: 12
    },

    buttonLightText: {
        color: "black",
        fontFamily: "Gilroy-Medium",
        fontSize: 16,
        textAlign: "center",
    },

    buttonDarkText: {
        color: "white",
        fontFamily: "Gilroy-Medium",
        fontSize: 16,
        textAlign: "center"
    }
});

export default ProductAdd;