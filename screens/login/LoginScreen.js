import React, { Component } from 'react';
import { StatusBar, StyleSheet, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Logo from '../../assets/logo.svg';
import DatabaseService from '../../service/DatabaseService';
import ApiService from "../../service/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const databaseService = new DatabaseService();
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            loading: false
        };

        this.apiService = new ApiService();
    }

    login = async () => {
			const { email, password } = this.state;
			try {
				this.setState({ loading: true });
				const result = await this.apiService.check(email + "@backall.uz", password);
				console.log(result);

				if (result) {
                    await AsyncStorage.setItem("email", email + "@backall.uz");
                    await AsyncStorage.setItem("password", password);

                    this.props.navigation.navigate("Verification");
                }
                
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				this.setState({ loading: false });
			}
    };

    forgotPasswordLink = () => {
        this.props.navigation.navigate('Home');
    };

    render() {
        const { email, password, loading } = this.state;
        return (
            <ScrollView contentContainerStyle={styles.container}>
                {(Platform.OS === 'android' || Platform.OS === 'ios') ?
                    <Logo style={styles.logo} resizeMode="cover" /> :
                    <Logo style={styles.logo} />}
                <View style={styles.form}>
                    <Text style={styles.label}>Loginni kiriting</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="admin"
                        placeholderTextColor="black"
                        value={email}
                        onChangeText={(text) => this.setState({ email: text })}
                    />
                    <Text style={styles.label}>Parolni kiriting</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="black"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => this.setState({ password: text })}
                    />
                    <TouchableOpacity onPress={async () => {
											await this.login()
										}}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>Kirish</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={this.forgotPasswordLink} style={{ marginTop: 168 }}>
                    <View style={styles.forgotPasswordLink}>
                        <Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
                    </View>
                </TouchableOpacity>
                <StatusBar style="auto" />
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
    form: {
        alignItems: 'center'
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
    forgotPasswordLink: {
        alignItems: 'center'
    },
    forgotPasswordText: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Gilroy-Medium'
    }
});

export default Login;
