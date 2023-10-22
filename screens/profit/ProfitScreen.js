import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, TextInput, View, Dimensions, Image, TouchableOpacity, ScrollView} from 'react-native';

// NAVBAR ICONS
import DashboardIcon from '../../assets/navbar/dashboard-icon.svg';
import BasketIcon from '../../assets/navbar/basket-icon.svg';
import ScanIcon from '../../assets/navbar/scan-icon.svg';
import ShoppingIcon from '../../assets/navbar/shopping-icon.svg';
import WalletIcon from '../../assets/navbar/wallet-icon-active.svg';

import CalendarIcon from "../../assets/calendar-icon.svg";
import ProfitIcon from "../../assets/profit-icon.svg";


const screenWidth = Dimensions.get('window').width;

class Profit extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    <ScrollView>

                        <View style={{
                            borderBottomColor: "black",
                            borderBottomWidth: 1,
                            width: screenWidth - (16 * 2),
                            height: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Text style={{
                                fontFamily: "Gilroy-SemiBold",
                                fontWeight: "600",
                                fontSize: 18,
                                lineHeight: 24
                            }}>Sof foyda</Text>
                        </View>

                        <View style={{
                            marginTop: 24, 
                            width: screenWidth - (16 * 2),
                            marginRight: "auto",
                            marginLeft: "auto"
                        }}>
                            <Text
                                style={{fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, marginBottom: 4}}>Muddatni
                                tanlang</Text>

                            <View>
                                <TextInput
                                    style={{
                                        
                                        position: "relative",
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        borderColor: "#AFAFAF",
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        fontSize: 16,
                                        lineHeight: 24,
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500"
                                    }}
                                    placeholder="--/--/----"
                                    placeholderTextColor="#AAAAAA"/>
                                 <CalendarIcon 
                                    style={{position: "absolute", right: 16, top: 14}}
                                    resizeMode="cover" />
                            </View>
                        </View>

                        <View style={{
                            marginTop: 12,
                            width: screenWidth - (16 * 2),
                            marginRight: "auto",
                            marginLeft: "auto",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            backgroundColor: "#4F579F",
                            borderRadius: 8
                        }}>
                            <Text style={{
                                fontFamily: "Gilroy-Medium",
                                fontWeight: "500",
                                fontSize: 16,
                                lineHeight: 24,
                                color: "#FFF"
                            }}>Jami sotuv</Text>
                            <Text style={{
                                fontFamily: "Gilroy-Medium",
                                fontWeight: "500",
                                fontSize: 16,
                                lineHeight: 24,
                                color: "#FFF"
                            }}>5.000.000 so’m</Text>
                        </View>

                        <View style={{width: screenWidth, paddingLeft: 16, paddingRight: 16}}>
                            <View style={{
                                marginTop: 12,
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                backgroundColor: "#EEEEEE",
                                height: 42,
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                paddingVertical: 10
                            }}>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>4-oktyabr, Chorshanba</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>//</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>5.000.000 so’m</Text>
                            </View>

                            <View>
                                <TouchableOpacity style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }} onPress={() => navigation.navigate('ProfitDetail')}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }} onPress={() => navigation.navigate('ProfitDetail')}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }} onPress={() => navigation.navigate('ProfitDetail')}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{width: screenWidth, paddingLeft: 16, paddingRight: 16}}>
                            <View style={{
                                marginTop: 12,
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                backgroundColor: "#EEEEEE",
                                height: 42,
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                paddingVertical: 10
                            }}>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>4-oktyabr, Chorshanba</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>//</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>5.000.000 so’m</Text>
                            </View>

                            <View>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{width: screenWidth, paddingLeft: 16, paddingRight: 16}}>
                            <View style={{
                                marginTop: 12,
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                backgroundColor: "#EEEEEE",
                                height: 42,
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                // paddingVertical: 10
                            }}>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>4-oktyabr, Chorshanba</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>//</Text>
                                <Text style={{
                                    fontFamily: "Gilroy-Medium",
                                    fontWeight: "500",
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>5.000.000 so’m</Text>
                            </View>

                            <View>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>

                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    height: 50,
                                    marginTop: 4,
                                    paddingHorizontal: 4,
                                    paddingVertical: 6
                                }}>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <ProfitIcon />
                                        <Text style={{
                                            marginLeft: 10,
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                            fontSize: 16,
                                            color: "#0EBA2C"
                                        }}>+25.000 so’m</Text>
                                    </View>

                                    <Text style={{
                                        fontFamily: "Gilroy-Medium",
                                        fontWeight: "500",
                                        fontSize: 14
                                    }}>10:45</Text>
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    <StatusBar style="auto"/>
                </View>

                <View style={styles.navbar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                        <View style={styles.inactiveBorder}></View>
                        <DashboardIcon resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                        <View style={styles.inactiveBorder}></View>
                        <BasketIcon resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Sell')}>
                        <ScanIcon resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                        <View style={styles.inactiveBorder}></View>
                        <ShoppingIcon  resizeMode="cover" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profit')}>
                        <View style={styles.activeBorder}></View>
                        <WalletIcon resizeMode="cover" />
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
        width: 100
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
        marginTop: 22,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: screenWidth - (17 + 17),
        marginBottom: 40
    },

    button: {
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        gap: 12
    },

    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: "Roboto-Bold",
        textTransform: "uppercase"
    }
});

export default Profit;