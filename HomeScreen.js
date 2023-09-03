import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Dimensions, TouchableOpacity } from 'react-native';


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
            <Text  style={{color: "red"}}> dalskfnasdf</Text>
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
        padding: 30,
        width: screenWidth,
        backgroundColor: "black"
    }
});

export default Home;
