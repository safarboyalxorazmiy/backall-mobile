import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, View, Image, TextInput, Dimensions, Text, TouchableOpacity, ScrollView} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Sell extends Component {

    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    <ScrollView style={styles.productList}>
                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>3</Text>
                            <Image source={require("../../assets/edit-icon.png")}/>
                        </View>

                    </ScrollView>


                    <View style={{paddingBottom: 22, paddingTop: 90, position: "relative", width: screenWidth - (17 + 17)}}>
                        <Text style={styles.price}>105,000 so’m</Text>

                        <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Scan')}>
                            <Image source={require("../../assets/navbar/scan-icon.png")}></Image>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Sotuvni amalga oshirish</Text>
                    </TouchableOpacity>

                    <StatusBar style="auto"/>
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
        justifyContent: "center"
    },

    productList: {
        marginTop: 50
    },

    product: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: screenWidth - (17 + 17),
        paddingVertical: 15,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
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

    button: {
        paddingVertical: 24,
        backgroundColor: "#000",
        width: screenWidth - (17 + 17),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginBottom: 12
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Roboto-Bold",
        textTransform: "uppercase"
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

        right: 0,
        bottom: 35
    },

    price: {
        fontSize: 24,
        fontFamily: "Roboto-Black"
    }
});

export default Sell;