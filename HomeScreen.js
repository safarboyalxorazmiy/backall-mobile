import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';


const screenWidth = Dimensions.get('window').width;

class Home extends Component {
  render() {
    return (
      <>
        <View style={styles.container}>
            <View style={styles.cards}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bugungi kirim</Text>
                    <Text style={styles.cardDescription}>3.000.000<Text style={styles.currency}>UZS</Text></Text>
                </View>

                <View style={styles.card}>
                <Text style={styles.cardTitle}>Bugungi foyda</Text>
                    <Text style={styles.cardDescription}>500.000<Text style={styles.currency}>UZS</Text></Text>
                </View>
            </View>
            <StatusBar style="auto" />
        </View>

        <View style={styles.navbar}>
            <View style={styles.navItem}>
                <View style={styles.activeBorder}></View>
                <Image source={require("./assets/dashboard-icon.png")} />
            </View>

            <View style={styles.navItem}>
                <View style={styles.inactiveBorder}></View>
                <Image source={require("./assets/basket-icon.png")} />
            </View>
        
            <View style={styles.scan}>
                <Image source={require("./assets/scan-icon.png")} />
            </View>
            
            <View style={styles.navItem}>
                <View style={styles.inactiveBorder}></View>
                <Image source={require("./assets/shopping-icon.png")} />
            </View>

            <View style={styles.navItem}>
                <View style={styles.inactiveBorder}></View>
                <Image source={require("./assets/wallet-icon.png")} />
            </View>
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

    cards: {
        width: screenWidth - (24 + 24)
    },

    card: {
        paddingTop: 45,
        paddingLeft: 38,
        paddingBottom: 46,
        backgroundColor: 'black',
        marginBottom: 25,
        borderRadius: 22
    },

    cardTitle: {
        color: "white",
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 5,
        textTransform: "uppercase"
    },

    cardDescription: {
        color: "white",
        fontSize: 38,
        fontWeight: "bold"
    },

    currency: {
        fontSize: 15
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

export default Home;
