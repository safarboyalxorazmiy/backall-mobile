import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';


const screenWidth = Dimensions.get('window').width;

class Shopping extends Component {
  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                
                <ScrollView style={styles.productList}>
                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3 ta</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Ko’k Gorilla</Text>
                            <Text  style={styles.productCount}>1 ta</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Shakar</Text>
                            <Text  style={styles.productCount}>1 kg</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>3</Text>
                            <Text style={styles.hour}>20:04</Text>
                        </View>
                        
                </ScrollView>

                <View style={styles.buttons}>
                            <TouchableOpacity>
                                <View style={styles.button}>
                                    <Image source={require("../assets/back-icon.png")} />
                                    <Text style={styles.buttonText}>Oldingi kun</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>Kalendar</Text>
                                    <Image source={require("../assets/calendar-icon.png")} />
                                </View>
                            </TouchableOpacity>
                        </View>
                <StatusBar style="auto" />
            </View>

            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("../assets/dashboard-icon.png")} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("../assets/basket-icon.png")} />
                </TouchableOpacity>
            
                <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Sell')}>
                    <Image source={require("../assets/scan-icon.png")} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                    <View style={styles.activeBorder}></View>
                    <Image source={require("../assets/shopping-icon.png")} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Wallet')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("../assets/wallet-icon.png")} />
                </TouchableOpacity>
            </View>
        </>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 50
        // justifyContent: 'center',
    },

    navbar: {
        paddingHorizontal: 30,
        width: screenWidth,
        backgroundColor: "white",
        height: 93,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },

    navItem: {
        display: "flex",
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    activeBorder: {
        marginBottom: 30,
        width: 47,
        height: 4,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        backgroundColor: "black"
    },

    inactiveBorder: {
        marginBottom: 30,
        width: 47,
        height: 4,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },

    scan: {
        backgroundColor: "black",
        padding: 21,
        borderRadius: 50,
        marginTop: 10
    },

    productList: {
        marginTop: 0
    },

    product: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: screenWidth - (17 + 17),
        paddingVertical: 15,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderColor: "#D9D9D9"
    },

    productTitle: {
        fontSize: 24,
        fontWeight: "bold",
        width: 150
    },

    productCount: {
        fontFamily: "Roboto-Bold",
        fontSize: 24,
        fontWeight: "semibold"
    },

    hour: {
        color: "#6D7696",
        fontSize: 12
    },

    buttons: {
        width: screenWidth - (17 + 17),
        marginTop: 22,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40
    },

    button: {
        backgroundColor: 'black', // Change the background color as needed
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        gap: 12
    },
    
    buttonText: {
        color: 'white', // Change the text color as needed
        fontSize: 16,
        textAlign: 'center',
        fontFamily: "Roboto-Bold",
        textTransform: "uppercase"
    }
});

export default Shopping;