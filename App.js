import React, {Component} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { AppRegistry } from 'react-native';
import Login from './screens/LoginScreen';
import Home from './screens/HomeScreen';
import * as Font from 'expo-font';
import Basket from './screens/basket/BasketScreen';
import Shopping from './screens/shopping/ShoppingScreen';
import Wallet from './screens/wallet/WalletScreen';
import Scan from './screens/scanning/ScanScreen';
import ProductAdd from "./screens/basket/ProductAddScreen";
import Scanned from "./screens/scanning/ScannedScreen";
import Sell from "./screens/selling/SellScreen";
import DatabaseService from './database/DatabaseService';
import { name as appName } from './app.json';
import NetInfo from "@react-native-community/netinfo";

AppRegistry.registerComponent(appName, () => App);

const Stack = createStackNavigator();

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fontsLoaded: false,
            isConnected: null
        };
    }

    async loadCustomFonts() {
        try {
            await Font.loadAsync({
                'Gilroy-Light': require('./assets/fonts/gilroy/Gilroy-Light.ttf'),
                'Gilroy-Regular': require('./assets/fonts/gilroy/Gilroy-Regular.ttf'),
                'Gilroy-Medium': require('./assets/fonts/gilroy/Gilroy-Medium.ttf'),
                'Gilroy-SemiBold': require('./assets/fonts/gilroy/Gilroy-SemiBold.ttf'),
                'Gilroy-Bold': require('./assets/fonts/gilroy/Gilroy-Bold.ttf'),
                'Gilroy-Black': require('./assets/fonts/gilroy/Gilroy-Black.ttf')
            });
            
            this.setState({fontsLoaded: true})
        } catch (error) {
            console.error('Error loading custom fonts:', error);
        }
    }

    async componentDidMount() {
        this.loadCustomFonts();

        const dbService = new DatabaseService();
        try {
            await dbService.init();
            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
        }

        this.unsubscribe = NetInfo.addEventListener((state) => {
            this.setState({ isConnected: state.isConnected });
        });
      
        this.logInternetStatusInterval = setInterval(() => {
        console.log("Is connected?", this.state.isConnected === null ? 'Loading...' : this.state.isConnected ? 'Yes' : 'No');
        }, 5000);
    }

    componentWillUnmount() {
        this.unsubscribe();
        clearInterval(this.logInternetStatusInterval);
    }

    render() {

        if (!this.state.fontsLoaded) {
            return (
                <>
                    <Text>Loading</Text>
                </>
            )
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
