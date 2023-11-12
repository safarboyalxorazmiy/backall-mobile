import React, {Component} from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  Platform
} from 'react-native';


import Logo from '../assets/logo.svg';          

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class Login extends Component {
  render() {
      const {navigation} = this.props;

      return (
        <ScrollView contentContainerStyle={styles.container}>
            {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                <Logo style={styles.logo} resizeMode="cover" />
            ) : (
                <Logo style={styles.logo} />
            )}
              
            <View style={styles.form}>
                <Text style={styles.label}>Loginni kiriting</Text>
                <TextInput
                    style={styles.input}
                    placeholder="admin"
                    placeholderTextColor="black"
                />

                <Text style={styles.label}>Parolni kiriting</Text>
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
            </View>


            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{
                marginTop: 168
            }}>
                <View style={{
                    height: 52,
                    width: screenWidth - (24 + 24),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{fontFamily: 'Gilroy-Medium', fontWeight: '500', fontSize: 16}}>Parolni
                        unutdingizmi?</Text>
                </View>
            </TouchableOpacity>

            <StatusBar style="auto"/>
        </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      paddingTop: 104,
      height: screenHeight
  },

  logo: {
      display: "block",
      width: 220.313,
      height: 96.563,
      marginBottom: 83
  },

  label: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Gilroy-Medium',
      marginBottom: 4
  },

  input: {
      height: 64,
      width: screenWidth - (24 + 24),
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 23,
      paddingHorizontal: 20,
      fontSize: 18,
      marginBottom: 16,
      fontFamily: 'Gilroy-Regular',
  },

  button: {
      width: screenWidth - (24 + 24),
      backgroundColor: '#222',
      color: 'white',
      paddingVertical: 14,
      borderRadius: 10,
  },

  buttonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 20,
      textTransform: 'capitalize',
      fontWeight: '500',
      fontFamily: 'Gilroy-Medium'
  },
});

export default Login;