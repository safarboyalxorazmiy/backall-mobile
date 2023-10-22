import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// NAVBAR ICONS
import Dashboard from '../assets/navbar/dashboard-icon-active.svg';
import Basket from '../assets/navbar/basket-icon.svg';
import Scan from '../assets/navbar/scan-icon.svg';
import Shopping from '../assets/navbar/shopping-icon.svg';
import Wallet from '../assets/navbar/wallet-icon.svg';

import ShoppingIcon from "../assets/home/shopping-icon.svg";
import BenefitIcon from "../assets/home/benefit-icon.svg";

const screenWidth = Dimensions.get('window').width;

class Home extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    <Text style={{
                        fontSize: 18,
                        fontFamily: "Gilroy-SemiBold",
                        height: 44,
                        borderBottomColor: "#AFAFAF",
                        borderBottomWidth: 1,
                        width: screenWidth - (24 + 24),
                        textAlign: 'center',
                        marginBottom: 24
                    }}>Statistika</Text>

                    <View style={styles.cards}>
                        <TouchableOpacity onPress={() => navigation.navigate('Shopping')}>
                            <LinearGradient
                                colors={['#E59C0D', '#FDD958']}
                                start={{x: 0, y: 0.5}}
                                style={styles.card}>

                                <View style={{
                                    width: 141,
                                    height: 141,
                                    borderRadius: 100,
                                    backgroundColor: "#F8E08D",
                                    position: 'absolute',
                                    right: -70,
                                    top: -70,
                                    shadowColor: 'rgba(0, 0, 0, 0.05)',
                                    shadowOffset: {
                                        width: -10,
                                        height: 10,
                                    },
                                    shadowOpacity: 1,
                                    shadowRadius: 20,
                                    elevation: 5
                                }}>
                                    <ShoppingIcon 
                                        style={{position: 'absolute', bottom: 28, left: 25}} 
                                        resizeMode="cover"  />
                                </View>

                                <Text style={styles.cardTitle}>Bugungi kirim</Text>
                                <Text style={styles.cardDescription}>3.000.000 <Text
                                    style={styles.currency}>UZS</Text></Text>
                            </LinearGradient>
                        </TouchableOpacity>                        

                        <TouchableOpacity onPress={() => navigation.navigate('Profit')}>
                            <LinearGradient
                                style={styles.card}
                                colors={['#2C8134', '#1DCB00']}
                                start={{x: 0, y: 0.5}}
                            >
                                <View style={{
                                    width: 141,
                                    height: 141,
                                    borderRadius: 100,
                                    backgroundColor: "#1EC703",
                                    position: 'absolute',
                                    right: -70,
                                    top: -70,
                                    elevation: 5,
                                    shadowColor: 'rgba(0, 0, 0, 0.05)',
                                    shadowOffset: {
                                        width: -10,
                                        height: 10,
                                    },
                                    shadowRadius: 20
                                }}>
                                    <BenefitIcon  
                                        style={{position: 'absolute', bottom: 28, left: 25, zIndex: 1}}
                                        resizeMode="cover"/>
                                </View>
                                <Text style={styles.cardTitle}>Bugungi foyda</Text>
                                <Text style={styles.cardDescription}>500.000 <Text style={styles.currency}>UZS</Text></Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                    </View>
                    <StatusBar style="auto"/>
                </View>

                <View style={styles.navbar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                        <View style={styles.activeBorder}></View>
                        <Dashboard resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                        <View style={styles.inactiveBorder}></View>
                        <Basket resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Sell')}>
                        <Scan resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                        <View style={styles.inactiveBorder}></View>
                        <Shopping  resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profit')}>
                        <View style={styles.inactiveBorder}></View>
                        <Wallet resizeMode="cover" />
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
        paddingTop: 52
        // justifyContent: 'center',
    },

    cards: {
        width: screenWidth - (24 + 24)
    },

    card: {
        paddingTop: 24,
        paddingLeft: 24,
        paddingBottom: 24,
        marginBottom: 25,
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden'
    },

    cardTitle: {
        color: "white",
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        fontWeight: "500",
        marginBottom: 10,
        textTransform: "uppercase"
    },

    cardDescription: {
        color: "white",
        fontSize: 24,
        fontFamily: "Gilroy-SemiBold",
        fontWeight: "600"
    },

    currency: {
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        fontWeight: "500",
        marginLeft: 4
    },

    navbar: {
        borderTopWidth: 1,
        borderTopColor: "#EFEFEF",
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
        borderRadius: 50,
        marginTop: 10
    }
});

export default Home;
