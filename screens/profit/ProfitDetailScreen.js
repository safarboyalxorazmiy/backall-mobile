import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Dimensions} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

class ProfitDetail extends Component {
    render() {
        const {navigation} = this.props;

        return (
            <ScrollView style={{backgroundColor: "#FFF"}}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profit')}
                            style={styles.backButton}
                        >
                            <Image source={require('../../assets/arrow-left-icon.png')}/>
                        </TouchableOpacity>

                        <Text style={styles.title}>Mahsulotdan qolgan foyda</Text>
                    </View>

                    <View style={styles.infoBar}>
                        <Text style={styles.infoText}>20.000 so’m</Text>
                        <Text style={styles.infoDivider}>//</Text>
                        <Text style={styles.infoText}>10:45</Text>
                        <Text style={styles.infoDivider}>//</Text>
                        <Text style={styles.infoText}>4-oktyabr</Text>
                    </View>

                    <View>
                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>

                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>

                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>

                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>

                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>


                        <View style={styles.profitContainer}>
                            <Text style={styles.profitTitle}>Coca Cola 1.5 L</Text>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Soni</Text>
                                <Text style={styles.profitPrice}>2 ta</Text>
                            </View>

                            <View style={styles.profitRow}>
                                <Text style={styles.profitText}>Qolgan foyda</Text>
                                <Text style={styles.profitPrice}>+1.000 so’m</Text>
                            </View>
                        </View>

                    </View>
                </View>

            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
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
        color: '#FFF',
    },
    infoDivider: {
        color: '#FFF',
    },
    profitContainer: {
        marginTop: 8,
        width: screenWidth - 32,
        borderWidth: 1,
        backgroundColor: "#fff",
        borderColor: '#F1F1F1',
        borderRadius: 8,
        elevation: 5,
        shadowColor: 'rgba(0, 0, 0, 0.07)',
        shadowOffset: {width: 5, height: 5},
        shadowOpacity: 1,
        shadowRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    profitTitle: {
        fontFamily: 'Gilroy-SemiBold',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 12,
    },
    profitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    profitText: {
        color: '#777',
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        fontWeight: '500',
        lineHeight: 24,
    },
    profitPrice: {
        color: '#0EBA2C',
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        fontWeight: '500',
        lineHeight: 24,
    },
});

export default ProfitDetail;