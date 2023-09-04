import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

class Scan extends Component {
  render() {
    const { navigation } = this.props;

    return (
        <>
            <View style={styles.container}>
                
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
        paddingTop: 120
    }
});

export default Scan;