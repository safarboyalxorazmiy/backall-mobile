import React, { useState } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, View, Dimensions, TouchableOpacity, Keyboard} from 'react-native';

import Home from '../screens/HomeScreen';
import Basket from '../screens/basket/BasketScreen';
import Sell from '../screens/selling/SellScreen';
import Shopping from '../screens/shopping/ShoppingScreen';
import Profit from '../screens/profit/ProfitScreen';
import Login from '../screens/LoginScreen';
import ProductAdd from "../screens/basket/ProductAddScreen";
import ProfitDetail from '../screens/profit/ProfitDetailScreen';
import CalendarPage from '../screens/CalendarScreen';
import ShoppingDetail from '../screens/shopping/ShoppingDetailScreen';

import DashboardIcon from '../assets/navbar/dashboard-icon.svg';
import DashboardIconActive from '../assets/navbar/dashboard-icon-active.svg';
import BasketIcon from '../assets/navbar/basket-icon.svg';
import BasketIconActive from '../assets/navbar/basket-icon-active.svg';
import ScanIcon from '../assets/navbar/scan-icon.svg';
import ShoppingIcon from '../assets/navbar/shopping-icon.svg';
import ShoppingIconActive from '../assets/navbar/shopping-icon-active.svg';
import WalletIcon from "../assets/navbar/wallet-icon.svg";
import WalletIconActive from "../assets/navbar/wallet-icon-active.svg";

const Tab = createBottomTabNavigator();
const routesWithoutNavbar = ['ProfitDetail', 'Login', 'ProductAdd', 'ShoppingDetail', 'ProfitDetail', 'Calendar'];

const styles = StyleSheet.create({
	navbar: {
		width: "100%",
		borderTopWidth: 1,
		borderTopColor: "#EFEFEF",
		paddingHorizontal: 30,
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

const CustomTabBar = ({state, descriptors, navigation}) => {
	const [navbarStyle, setNavbarStyle] = useState(styles.navbar);
	
	Keyboard.addListener('keyboardWillShow', (e) => {
		console.log(e)
		setNavbarStyle([styles.navbar, {opacity: 0}]);
	});
	
	Keyboard.addListener('keyboardWillHide', (e) => {
		console.log(e)
		setNavbarStyle(styles.navbar);
	});
	
	const focusedRouteName = state.routes[state.index].name;
	
	if (focusedRouteName === 'Sell' || routesWithoutNavbar.includes(focusedRouteName)) {
		return null;
	}
	
	return (
		<>
			<View style={navbarStyle}>
				{state.routes.map((route, index) => {
					
					if (routesWithoutNavbar.includes(route.name)) {
						return;
					}
					
					const {options} = descriptors[route.key];
					const isFocused = state.index === index;
					
					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});
						
						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};
					
					return (
						<TouchableOpacity key={index} style={styles.navItem} onPress={onPress}>
							{isFocused && route.name !== 'Sell' && <View style={styles.activeBorder}></View>}
							{!isFocused && route.name !== 'Sell' && <View style={styles.inactiveBorder}></View>}
							{route.name === 'Home' && (isFocused ? <DashboardIconActive/> : <DashboardIcon/>)}
							{route.name === 'Basket' && (isFocused ? <BasketIconActive/> : <BasketIcon/>)}
							{route.name === 'Sell' &&
								<View style={{height: 93, display: "flex", justifyContent: "center"}}><ScanIcon/></View>}
							{route.name === 'Shopping' && (isFocused ? <ShoppingIconActive/> : <ShoppingIcon/>)}
							{route.name === 'Profit' && (isFocused ? <WalletIconActive/> : <WalletIcon/>)}
						</TouchableOpacity>
					);
				})}
			</View>
		</>
	);
}

function MainTabNavigator() {
	return (
		<>
			<Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
				<Tab.Screen name="Home" component={Home} options={({navigation}) => ({
					title: '',
					headerShown: false
				})}/>
				<Tab.Screen name="Basket" component={Basket} options={({navigation}) => ({
					title: '',
					headerShown: false
				})}/>
				<Tab.Screen name="Sell" component={Sell} options={({navigation}) => ({
					title: '',
					headerShown: false
				})}/>
				<Tab.Screen name="Shopping" component={Shopping} options={({navigation}) => ({
					title: '',
					headerShown: false
				})}/>
				<Tab.Screen name="Profit" component={Profit} options={({navigation}) => ({
					title: '',
					headerShown: false
				})}/>
				
				<Tab.Screen
					name="ProfitDetail"
					component={ProfitDetail}
					initialParams={{hideScreen: true}}
					options={({route, navigation}) => ({
						tabBarVisible: false,
						headerShown: false,
					})}
				/>
				
				<Tab.Screen
					name="Login"
					component={Login}
					options={({navigation}) => ({
						title: '',
						headerShown: false
					})}
				/>
				
				<Tab.Screen
					name="ProductAdd" component={ProductAdd}
					options={({navigation}) => ({
						title: '',
						headerShown: false
					})}
				/>
				
				<Tab.Screen
					name="ShoppingDetail" component={ShoppingDetail}
					options={({navigation}) => ({
						title: '',
						headerShown: false
					})}
				/>
				
				<Tab.Screen
					name="Calendar" component={CalendarPage}
					options={({navigation}) => ({
						title: '',
						headerShown: false
					})}
				/>
			
			</Tab.Navigator>
		</>
	);
}

export default function NavigationService() {
	return (
		<NavigationContainer>
			<MainTabNavigator/>
		</NavigationContainer>
	);
}