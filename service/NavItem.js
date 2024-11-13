import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import DashboardIcon from "../assets/navbar/dashboard-icon.svg";
import DashboardIconActive from "../assets/navbar/dashboard-icon-active.svg";
import BasketIcon from "../assets/navbar/basket-icon.svg";
import BasketIconActive from "../assets/navbar/basket-icon-active.svg";
import ScanIcon from "../assets/navbar/scan-icon.svg";
import ShoppingIcon from "../assets/navbar/shopping-icon.svg";
import ShoppingIconActive from "../assets/navbar/shopping-icon-active.svg";
import WalletIcon from "../assets/navbar/wallet-icon.svg";
import WalletIconActive from "../assets/navbar/wallet-icon-active.svg";

const NavItem = memo(({ index, route, isFocused, onPress, styles }) => {
  return (
    <TouchableOpacity key={index} style={styles.navItem} onPress={onPress}>
      {isFocused && route.name !== "Sell" && <View style={styles.activeBorder}></View>}
      {!isFocused && route.name !== "Sell" && <View style={styles.inactiveBorder}></View>}
      <View>
        {route.name === "Home" && (isFocused ? <DashboardIconActive /> : <DashboardIcon />)}
        {route.name === "Basket" && (isFocused ? <BasketIconActive /> : <BasketIcon />)}
        {route.name === "Sell" && (
          <View style={{ height: 93, display: "flex", justifyContent: "center" }}>
            <ScanIcon />
          </View>
        )}
        {route.name === "Shopping" && (isFocused ? <ShoppingIconActive /> : <ShoppingIcon />)}
        {route.name === "Profit" && (isFocused ? <WalletIconActive /> : <WalletIcon />)}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => (
  prevProps.isFocused === nextProps.isFocused &&
  prevProps.onPress === nextProps.onPress &&
  prevProps.route.name === nextProps.route.name
));

export default NavItem;