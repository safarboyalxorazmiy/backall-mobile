import React, { Component, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, TextInput, ScrollView, TouchableWithoutFeedback  } from 'react-native';
import PlusIcon from "../../assets/plus-icon.svg";

import SearchIcon from "../../assets/search-icon.svg";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class Basket extends Component {
    
    constructor(props) {
        super(props);
        this.textInputRef = React.createRef();
    }

    handlePress = () => {
        if (this.textInputRef.current) {
          this.textInputRef.current.focus();
        }
    };

    render() {
        const {navigation} = this.props;

        return (
          <View style={styles.container}>
            <TouchableOpacity style={styles.inputWrapper} onPress={this.handlePress}>
                <SearchIcon />

                <TextInput 
                    ref={this.textInputRef}
                    style={styles.input}
                    placeholder="Mahsulot qidirish"
                    placeholderTextColor="#AAA"
                />
            </TouchableOpacity >

            <ScrollView style={styles.productList}>
                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Coca Cola</Text>
                    <Text style={styles.productCount}>10 blok</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Pepsi 1.5L</Text>
                    <Text style={styles.productCount}>10 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>50 dona</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>10 dona</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.product}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

                <View style={styles.productOdd}>
                    <Text style={styles.productTitle}>Qora Gorilla</Text>
                    <Text style={styles.productCount}>120 blok</Text>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProductAdd')}>
                <PlusIcon />
            </TouchableOpacity>
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        height: "100%", // + 40
        backgroundColor: '#fff',
        // alignItems: 'center',
        paddingTop: 65,
        position: "relative"
    },

    inputWrapper: {
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        width: screenWidth - (17 + 17),
        marginLeft: 'auto',
        marginRight: 'auto',
        borderColor: "#AFAFAF",
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
    },

    input: {
        backgroundColor: "white",
        color: "black",
        paddingLeft: 10,
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        fontWeight: '500',
        borderWidth: 0
    },

    productList: {
        marginTop: 20,
        height: screenHeight - 93
    },

    product: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingLeft: 17,
        paddingRight: 17,
        paddingVertical: 13,
        paddingHorizontal: 4
    },

    productOdd: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingLeft: 17,
        paddingRight: 17,
        paddingVertical: 13,
        paddingHorizontal: 4,
        backgroundColor: "#F1F1F1"
    },

    productTitle: {
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        fontWeight: "500"
    },

    productCount: {
        fontFamily: "Gilroy-Medium",
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "500"
    },

    addButton: {
        width: 60,
        height: 60,
        backgroundColor: "#272727",
        position: "absolute",
        right: 20,
        bottom: 130,
        borderRadius: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }

});

export default Basket;
