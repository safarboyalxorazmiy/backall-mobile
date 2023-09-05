import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Text} from 'react-native';

import Login from './screens/LoginScreen';
import Home from './screens/HomeScreen';
import Basket from './screens/Basket/BasketScreen'
import * as Font from 'expo-font';
import Shopping from './screens/ShoppingScreen';
import Wallet from './screens/WalletScreen';
import Scan from './screens/Scan/ScanScreen';
import ProductAdd from "./screens/Basket/ProductAddScreen";
import Scanned from "./screens/Scan/ScannedScreen";
import Sell from "./screens/Sell/SellScreen";

const Stack = createStackNavigator();

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false,
        };
    }

    async loadCustomFonts() {
        try {
            await Font.loadAsync({
                'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
                'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
                'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
                'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
                'Roboto-Black': require('./assets/fonts/Roboto-Black.ttf')
            });
            this.setState({fontsLoaded: true}); // Assuming you have a state variable for tracking font loading
        } catch (error) {
            console.error('Error loading custom fonts:', error);
        }
    }

    componentDidMount() {
        this.loadCustomFonts();
    }

    render() {

        if (!this.state.fontsLoaded) {
            return (
                <>
                    <Text>Loading</Text>
                </>
            )
            // Return a loading indicator or some other UI until fonts are loaded
            return null;
        }

        return (
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={({navigation}) => ({
                            title: '',
                            headerShown: false
                        })}
                    />

                    <Stack.Screen name="Home" component={Home}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="Basket" component={Basket}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="ProductAdd" component={ProductAdd}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="Sell" component={Sell}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />
                    <Stack.Screen name="Scan" component={Scan}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="Scanned" component={Scanned}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="Shopping" component={Shopping}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />

                    <Stack.Screen name="Wallet" component={Wallet}
                                  options={({navigation}) => ({
                                      title: '',
                                      headerShown: false
                                  })}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}

export default App;
