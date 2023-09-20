import React, {Component} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { AppRegistry } from 'react-native';
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
                'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
                'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
                'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
                'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
                'Roboto-Black': require('./assets/fonts/Roboto-Black.ttf')
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
