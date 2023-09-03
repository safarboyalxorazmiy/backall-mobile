import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';


const screenWidth = Dimensions.get('window').width;

class Shopping extends Component {
  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                
                <StatusBar style="auto" />
            </View>

            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("./assets/dashboard-icon.png")} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("./assets/basket-icon.png")} />
                </TouchableOpacity>
            
                <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Scan')}>
                    <Image source={require("./assets/scan-icon.png")} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                    <View style={styles.activeBorder}></View>
                    <Image source={require("./assets/shopping-icon.png")} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Wallet')}>
                    <View style={styles.inactiveBorder}></View>
                    <Image source={require("./assets/wallet-icon.png")} />
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
        paddingTop: 120
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
        // backgroundColor: "black"
    },

    scan: {
        backgroundColor: "black",
        padding: 21,
        borderRadius: "50%",
        marginTop: 10
    }
});

export default Shopping;