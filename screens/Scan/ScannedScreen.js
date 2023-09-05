import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, View, Image, TextInput, Dimensions, Text, TouchableOpacity} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Scanned extends Component {

  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Maxsulot sotish</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Maxsulot nomi: "
                    placeholderTextColor="black"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Maxsulot miqdori: "
                    placeholderTextColor="black"
                />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={() => navigation.navigate('Scan')}>Saqlash</Text>
                </TouchableOpacity>

                <StatusBar style="auto" />
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

    title: {
        fontFamily: "Roboto-Black",
        fontSize: 32
    },

    input: {
        height: 64,
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 23,
        paddingHorizontal: 20,
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        marginTop: 20
    },

    button: {
        width: screenWidth - (17 + 17),
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 10,
        marginTop: 24
    },

    buttonText: {
        color: "white",
        fontSize: 18,
        fontFamily: "Roboto-Bold"
    }
});

export default Scanned;