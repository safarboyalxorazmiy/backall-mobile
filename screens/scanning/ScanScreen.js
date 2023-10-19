import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Scan extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <>
                <View style={styles.container}>
                    <View style={{
                        width: screenWidth - (16 + 16),
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16
                    }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Basket')} style={{
                            backgroundColor: "#F5F5F7",
                            paddingVertical: 16,
                            paddingHorizontal: 19,
                            borderRadius: 8
                        }}>
                            <Image source={require("../../assets/arrow-left-icon.png")}/>
                        </TouchableOpacity>

                        <Text style={{
                            width: 299,
                            textAlign: "center",
                            fontSize: 18,
                            fontFamily: "Gilroy-SemiBold",
                            fontWeight: 600
                        }}>
                            Sotuvni amalga oshirish
                        </Text>
                    </View>

                    <View style={{marginTop: 50, display: "flex", alignItems: "center"}}>
                        <Text style={{fontSize: 16, fontFamily: "Gilroy-SemiBold", fontWeight: 600, marginBottom: 12}}>Shtrix
                            kodni kameraga tuting</Text>

                        <View style={{
                            backgroundColor: "#D9D9D9",
                            height: 412,
                            width: screenWidth - 16 - 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 4
                        }}>
                            <Image source={require("../../assets/bigscan-icon.png")}></Image>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Sell')}>
                        <Text style={styles.buttonText}>Mahsulotni qo’lda kiritish</Text>
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
        paddingTop: 68
    },

    button: {
        paddingVertical: 14,
        width: screenWidth - 16 - 16,
        backgroundColor: "#222222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        marginTop: 48
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        fontWeight: "500"
    }
});

export default Scan;