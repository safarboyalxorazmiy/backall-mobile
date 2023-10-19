import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, TextInput, ScrollView} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Basket extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    <View style={styles.inputWrapper}>
                        <Image source={require("../../assets/search-icon.png")}/>

                        <TextInput
                            style={styles.input}
                            placeholder="Mahsulot qidirish"
                            placeholderTextColor="#AAA"
                        />
                    </View>

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

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                    </ScrollView>

                    <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProductAdd')}>
                        <Image source={require("../../assets/plus-icon.png")}></Image>
                    </TouchableOpacity>

                    <StatusBar style="auto"/>
                </View>

                <View style={styles.navbar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                        <View style={styles.inactiveBorder}></View>
                        <Image source={require("../../assets/navbar/dashboard-icon.png")}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Basket')}>
                        <View style={styles.activeBorder}></View>
                        <Image source={require("../../assets/navbar/basket-icon-active.png")}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Scan')}>
                        <Image source={require("../../assets/navbar/scan-icon.png")}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Shopping')}>
                        <View style={styles.inactiveBorder}></View>
                        <Image source={require("../../assets/navbar/shopping-icon.png")}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profit')}>
                        <View style={styles.inactiveBorder}></View>
                        <Image source={require("../../assets/navbar/wallet-icon.png")}/>
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
        paddingTop: 65,
        position: "relative"
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
    },

    scan: {
        backgroundColor: "black",
        padding: 21,
        borderRadius: 50,
        marginTop: 10
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
        fontWeight: '500'
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

    addButton: {
        width: 60,
        height: 60,
        backgroundColor: "#272727",
        position: "absolute",
        right: 20,
        bottom: 20,
        borderRadius: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }

});

export default Basket;
