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
                    <View style={{width: screenWidth - (16 + 16), display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Basket')} style={{backgroundColor: "#F5F5F7", paddingVertical: 16, paddingHorizontal: 19, borderRadius: 8}}>
                            <Image source={require("../../assets/arrow-left-icon.png")} />
                        </TouchableOpacity>

                        <Text style={{width: 299, textAlign: "center", fontSize: 18, fontFamily: "Gilroy-SemiBold", fontWeight: 600}}>
                            Sotiladigan mahsulotlar
                        </Text>
                    </View>

                    <ScrollView>    
                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Coca Cola</Text>
                            <Text  style={styles.productCount}>10 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Pepsi 1.5L</Text>
                            <Text  style={styles.productCount}>10 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>50 dona</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>10 dona</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text  style={styles.productCount}>120 blok</Text>
                        </View>
                        
                        <View style={styles.product}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>
                    </ScrollView>

                    <View style={{
                        marginTop: 16,
                        marginBottom: 16
                    }}>
                        <TouchableOpacity style={{
                            width: screenWidth - (17 + 17), 
                            paddingVertical: 14, 
                            borderWidth: 1,
                            borderColor: "#222222",
                            borderRadius: 8,
                            
                        }}>
                            <Text style={{textAlign: "center"}}>Mahsulotni qo’lda kiritish</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.scan} onPress={() => navigation.navigate('Scan')}>
                        <Image source={require("../../assets/navbar/scan-icon.png")}></Image>
                    </TouchableOpacity>


                    <View style={{ 
                        // position: "absolute",
                        // bottom: 0,
                        // zIndex: 2,
                        backgroundColor: "#fff"
                    }}>
                        <View style={{
                            paddingBottom: 22, 
                            paddingTop: 16,
                            paddingHorizontal: 17,
                            width: screenWidth,
                            display: "flex", 
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            flexDirection: "row",
                            
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowOffset: { width: 0, height: -10 },
                            shadowOpacity: 1,
                            shadowRadius: 30,
                            borderTopWidth: 1,
                            borderColor: "#EEE",
                        }}>
                            <Text style={styles.priceTitle}>Buyurtma narxi</Text>                        
                            <Text style={styles.price}>105,000 so’m</Text>
                        </View>
                        
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Sotuvni amalga oshirish</Text>
                        </TouchableOpacity>
                    </View> 

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