import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';

class Scan extends Component {
  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                <Image source={require("../../assets/bigscan-icon.png")}></Image>
                <StatusBar style="auto" />
            </View>
            <TouchableOpacity style={styles.navigator} onPress={() => navigation.navigate('Scanned')}>
                <Image style={{marginRight: 15}} source={require("../../assets/rightarrow-icon.png")}></Image>
            </TouchableOpacity>
        </>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: "center"
    },

    navigator: {
        height: 60,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
    }
});

export default Scan;