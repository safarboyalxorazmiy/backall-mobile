import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, TextInput } from 'react-native';


const screenWidth = Dimensions.get('window').width;

class Basket extends Component {
  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Qidirish..."
                    placeholderTextColor="white"
                />

                <View style={styles.productList}>
                    <View style={styles.product}>
                        <Text style={styles.productTitle}>Qora Gorilla</Text>
                        <Text  style={styles.productCount}>3</Text>
                        <Image source={require("../assets/edit-icon.png")} />
                    </View>

                    <View style={styles.product}>
                        <Text style={styles.productTitle}>Qora Gorilla</Text>
                        <Text  style={styles.productCount}>3</Text>
                        <Image source={require("../assets/edit-icon.png")} />
                    </View>

                    <View style={styles.product}>
                        <Text style={styles.productTitle}>Qora Gorilla</Text>
                        <Text  style={styles.productCount}>3</Text>
                        <Image source={require("../assets/edit-icon.png")} />
                    </View>

                    <View style={styles.product}>
                        <Text style={styles.productTitle}>Qora Gorilla</Text>
                        <Text  style={styles.productCount}>3</Text>
                        <Image source={require("../assets/edit-icon.png")} />
                    </View>

                </View>

                <StatusBar style="auto" />
            </View>

            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("../assets/dashboard-icon.png")} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                    <View style={styles.activeBorder}></View>
                    <Image source={require("../assets/basket-icon.png")} />
                </TouchableOpacity>
            
                <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Scan')}>
                    <Image source={require("../assets/scan-icon.png")} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                    <View style={styles.inactiveBorder}></View>
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
        paddingTop: 65
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
        borderRadius: "50%",
        marginTop: 10
    },

    input: {
        backgroundColor: "black",
        color: "white",
        width: screenWidth - (17 + 17),
        paddingVertical: 23,
        paddingHorizontal: 21,
        borderRadius: 10,
        fontSize: 18
    },

    productList: {
        marginTop: 20
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
});

export default Basket;
