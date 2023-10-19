import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, View, Image, Dimensions, Text, TouchableOpacity, ScrollView} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Sell extends Component {

    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    
                    <StatusBar style="auto"/>
                </View>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 52
    },

    productList: {
    },

    product: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: screenWidth - (17 + 17),
        paddingVertical: 13,
        paddingHorizontal: 4
    },

    productOdd: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: screenWidth - (17 + 17),
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
    
    scan: {
        width: 71,
        height: 71,
        backgroundColor: "#000",
        position: "absolute",
        borderRadius: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        right: 20,
        bottom: 172
    },

    priceTitle: {
        fontFamily: "Gilroy-Regular",
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 24
    },

    price: {
        fontSize: 18,
        flexWeight: 600,
        fontFamily: "Gilroy-SemiBold",
    },

    button: {
        paddingVertical: 14,
        backgroundColor: "#222",
        width: screenWidth - (17 + 17),
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginBottom: 12
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        lineHeight: 24
    }
});

export default Sell;