import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, TextInput, ScrollView, TouchableWithoutFeedback  } from 'react-native';

import Home from './screens/HomeScreen';
import Basket from './screens/basket/BasketScreen';
import Sell from './screens/selling/SellScreen';
import Shopping from './screens/shopping/ShoppingScreen';
import Profit from './screens/profit/ProfitScreen';
import ProfitDetail from './screens/profit/ProfitDetailScreen';

import DashboardIcon from './assets/navbar/dashboard-icon.svg';
import DashboardIconActive from './assets/navbar/dashboard-icon-active.svg';
import BasketIcon from './assets/navbar/basket-icon.svg';
import BasketIconActive from './assets/navbar/basket-icon-active.svg';
import ScanIcon from './assets/navbar/scan-icon.svg';
import ShoppingIcon from './assets/navbar/shopping-icon.svg';
import ShoppingIconActive from './assets/navbar/shopping-icon-active.svg';
import WalletIcon from "./assets/navbar/wallet-icon.svg";
import WalletIconActive from "./assets/navbar/wallet-icon-active.svg";


const Tab = createBottomTabNavigator();

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

function CustomTabBar({ state, descriptors, navigation }) {
    const focusedRouteName = state.routes[state.index].name;
  
    if (focusedRouteName === 'Sell' || focusedRouteName == "ProfitDetail") {
      return null; // Do not render the navbar when the focused route is 'Sell'
    }
  
    return (
      <View style={styles.navbar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!isFocused && !event.defaultPrevented) {
              // Only navigate if not focused and the press event is not prevented
              navigation.navigate(route.name);
            }
          };
  
          return (
            <TouchableOpacity key={index} style={styles.navItem} onPress={onPress}>
                {isFocused && route.name !== 'Sell' && <View style={styles.activeBorder}></View>}
                {!isFocused && route.name !== 'Sell' && <View style={styles.inactiveBorder}></View>}
                {route.name === 'Home' && (isFocused ? <DashboardIconActive /> : <DashboardIcon />)}
                {route.name === 'Basket' && (isFocused ? <BasketIconActive /> : <BasketIcon />)}
                {route.name === 'Sell' && <View style={{height: 93, display: "flex", justifyContent: "center"}}><ScanIcon /></View>}
                {route.name === 'Shopping' && (isFocused ? <ShoppingIconActive /> : <ShoppingIcon />)}
                {route.name === 'Profit' && (isFocused ? <WalletIconActive /> : <WalletIcon />)}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
  

const styles = StyleSheet.create({
    navbar: {
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "#EFEFEF",
        paddingHorizontal: 30,
        width: screenWidth,
        backgroundColor: "white",
        height: 93,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
  
    navItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
  
    activeBorder: {
        marginBottom: 30,
        width: 47,
        height: 4,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        backgroundColor: "black"
    },
  
    inactiveBorder: {
        marginBottom: 30,
        width: 47,
        height: 4,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2
    },
  
    scan: {
        backgroundColor: "black",
        padding: 21,
        borderRadius: 50,
        marginTop: 10
    }
  });
  

  function MainTabNavigator() {
    return (
        <>
            <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
                <Tab.Screen name="Home" component={Home} options={({navigation}) => ({
                                            title: '',
                                            headerShown: false
                                        })} />
                <Tab.Screen name="Basket" component={Basket}  options={({navigation}) => ({
                                            title: '',
                                            headerShown: false
                                        })} />
                <Tab.Screen name="Sell" component={Sell}  options={({navigation}) => ({
                                            title: '',
                                            headerShown: false
                                        })}/>
                <Tab.Screen name="Shopping" component={Shopping}  options={({navigation}) => ({
                                            title: '',
                                            headerShown: false
                                        })} />
                <Tab.Screen name="Profit" component={Profit}  options={({navigation}) => ({
                                            title: '',
                                            headerShown: false
                                        })} />

                <Tab.Screen
                        name="ProfitDetail"
                        component={ProfitDetail}
                        initialParams={{ hideScreen: true }}
                        options={({ route, navigation }) => ({
                            tabBarVisible: false,
                            headerShown: false,
                        })}
                />

            </Tab.Navigator>
      </>
    );
  }

  export default function Tabs() {
    return (
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    );
  }