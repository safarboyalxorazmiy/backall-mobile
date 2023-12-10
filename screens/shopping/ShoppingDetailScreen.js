import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import BackIcon from '../../assets/arrow-left-icon.svg'


const screenWidth = Dimensions.get('window').width;

class ShoppingDetail extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <ScrollView style={styles.body}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Shopping')}
                            style={styles.backButton}
                        >
                            <BackIcon/>
                        </TouchableOpacity>

                        <Text style={styles.title}>Sotilgan mahsulotlar</Text>
                    </View>

                    <View style={styles.infoBar}>
                        <Text style={styles.infoText}>20.000 so’m</Text>
                        <Text style={styles.infoDivider}>//</Text>
                        <Text style={styles.infoText}>10:45</Text>
                        <Text style={styles.infoDivider}>//</Text>
                        <Text style={styles.infoText}>4-oktyabr</Text>
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

                        <View style={styles.productOdd}>
                            <Text style={styles.productTitle}>Qora Gorilla</Text>
                            <Text style={styles.productCount}>120 blok</Text>
                        </View>

                    </ScrollView>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: "#FFF"
    },

    container: {
        marginTop: 52,
        width: screenWidth - 32,
        marginLeft: 'auto',
        marginRight: 'auto',
        flex: 1,
        alignItems: 'center'
    },

    header: {
        width: screenWidth - 34,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    backButton: {
        backgroundColor: '#F5F5F7',
        paddingVertical: 16,
        paddingHorizontal: 19,
        borderRadius: 8,
    },

    title: {
        width: 299,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Gilroy-SemiBold',
        fontWeight: '600',
    },

    infoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: screenWidth - 32,
        marginLeft: 'auto',
        backgroundColor: '#272727',
        padding: 10,
    },

    infoText: {
        color: "#fff"
    },

    infoDivider: {
        color: "#fff"
    },

    productList: {
        marginTop: 4
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
    }
});

export default ShoppingDetail;