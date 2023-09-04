import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Dimensions, TouchableOpacity } from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Login extends Component {
  render() {
    const { navigation } = this.props;
    
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, fontFamily: "Roboto-Black" }}>Assalomu aleykum 👋</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="black"
        />
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="black"
        />

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Kirish</Text>
          </View>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 64,
    width: screenWidth - (24 + 24),
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Roboto-Regular',
  },
  button: {
    width: screenWidth - (24 + 24),
    height: 64,
    backgroundColor: 'black',
    color: 'white',
    paddingVertical: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});

export default Login;
