import React, {Component, memo} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import {StyleSheet, View, TouchableOpacity, Keyboard} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Home from "../screens/HomeScreen";
import Basket from "../screens/basket/BasketScreen";
import Sell from "../screens/selling/SellScreen";
import Shopping from "../screens/shopping/ShoppingScreen";
import Profit from "../screens/profit/ProfitScreen";
import Login from "../screens/auth/LoginScreen";
import ProductAdd from "../screens/basket/ProductAddScreen";
import ProfitDetail from "../screens/profit/ProfitDetailScreen";
import CalendarPage from "../screens/CalendarScreen";
import ShoppingDetail from "../screens/shopping/ShoppingDetailScreen";
import ProductEdit from "../screens/basket/ProductEditScreen";
import VerificationScreen from "../screens/auth/VerificationScreen";

import DashboardIcon from "../assets/navbar/dashboard-icon.svg";
import DashboardIconActive from "../assets/navbar/dashboard-icon-active.svg";
import BasketIcon from "../assets/navbar/basket-icon.svg";
import BasketIconActive from "../assets/navbar/basket-icon-active.svg";
import ScanIcon from "../assets/navbar/scan-icon.svg";
import ShoppingIcon from "../assets/navbar/shopping-icon.svg";
import ShoppingIconActive from "../assets/navbar/shopping-icon-active.svg";
import WalletIcon from "../assets/navbar/wallet-icon.svg";
import WalletIconActive from "../assets/navbar/wallet-icon-active.svg";

import StoreProductRepository from "../repository/StoreProductRepository";
import ProductRepository from "../repository/ProductRepository";

import ApiService from "./ApiService";
import AuthScreen from "../screens/auth/AuthScreen";


const Tab = createBottomTabNavigator();
const routesWithoutNavbar = [
	"ProfitDetail",
	"Login",
	"Verification",
	"ProductAdd",
	"ShoppingDetail",
	"ProfitDetail",
	"Calendar",
	"ProductEdit",
];

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
		alignItems: "flex-start",
	},
	navItem: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-start",
		height: 93,
		width: "20%"
	},
	activeBorder: {
		marginBottom: 30,
		width: 47,
		height: 4,
		borderBottomLeftRadius: 2,
		borderBottomRightRadius: 2,
		backgroundColor: "black",
	},
	inactiveBorder: {
		marginBottom: 30,
		width: 47,
		height: 4,
		borderBottomLeftRadius: 2,
		borderBottomRightRadius: 2,
	},
	scan: {
		backgroundColor: "black",
		padding: 21,
		borderRadius: 50,
		marginTop: 10,
	},
});

class NavigationService extends Component {
	constructor(props) {
		super(props);
		this.state = {
			navbarStyle: styles.navbar,
		};

		this.storeProductRepository = new StoreProductRepository();
		this.apiService = new ApiService();
		this.productRepository = new ProductRepository();
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			this._keyboardDidShow
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			this._keyboardDidHide
		);
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	_keyboardDidShow = () => {
		this.setState({navbarStyle: {display: "none"}});
	};

	_keyboardDidHide = () => {
		this.setState({navbarStyle: styles.navbar});
	};

	render() {
		return (
			<NavigationContainer>
				<Tab.Navigator tabBar={(props) => this._renderCustomTabBar(props)}>
					<Tab.Screen
						name="Home"
						component={Home}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Basket"
						component={Basket}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Sell"
						component={Sell}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Shopping"
						component={Shopping}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Profit"
						component={Profit}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
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
						name="Auth"
						component={AuthScreen}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Login"
						component={Login}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Verification"
						component={VerificationScreen}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="ProductAdd"
						component={ProductAdd}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="ProductEdit"
						component={ProductEdit}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="ShoppingDetail"
						component={ShoppingDetail}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
					<Tab.Screen
						name="Calendar"
						component={CalendarPage}
						options={({navigation}) => ({
							title: "",
							headerShown: false,
						})}
					/>
				</Tab.Navigator>
			</NavigationContainer>
		);
	}

	_renderCustomTabBar({state, descriptors, navigation}) {
		const focusedRouteName = state.routes[state.index].name;

		if (focusedRouteName === "Sell" || routesWithoutNavbar.includes(focusedRouteName)) {
			return null;
		}

		return (
			<View style={this.state.navbarStyle}>
				{state.routes.map((route, index) => {
					if (routesWithoutNavbar.includes(route.name)) {
						return null;
					}

					const {options} = descriptors[route.key];
					const isFocused = state.index === index;

					const onPress = async () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true
						});

						if (!isFocused && !event.defaultPrevented) {
							if (route.name === "Sell") {
								const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
								await AsyncStorage.setItem("from", currentRouteName);
							}

							await AsyncStorage.setItem("window", route.name);
							navigation.navigate(route.name);
						}
					};

					return (
						<TouchableOpacity key={index} style={styles.navItem} onPress={onPress}>
							{isFocused && route.name !== "Sell" && <View style={styles.activeBorder}></View>}
							{!isFocused && route.name !== "Sell" && <View style={styles.inactiveBorder}></View>}
							<View>
								{route.name === "Home" && (isFocused ? <DashboardIconActive/> : <DashboardIcon/>)}
								{route.name === "Basket" && (isFocused ? <BasketIconActive/> : <BasketIcon/>)}
								{route.name === "Sell" && (
									<View style={{height: 93, display: "flex", justifyContent: "center"}}>
										<ScanIcon/>
									</View>
								)}
								{route.name === "Shopping" && (isFocused ? <ShoppingIconActive/> : <ShoppingIcon/>)}
								{route.name === "Profit" && (isFocused ? <WalletIconActive/> : <WalletIcon/>)}
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	}
}

export default memo(NavigationService);