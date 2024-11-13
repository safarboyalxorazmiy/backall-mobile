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
import { TouchableRipple } from 'react-native-paper';

const NavItem = memo(({ index, route, isFocused, onPress, styles }) => {
  return (
    <>    
    {route.name === "Sell" ? (
      <View style={{ height: 93, display: "flex", justifyContent: "center" }}>
        <View style={{width: 61, height: 60, borderRadius: 50, shadowRadius: 10}}>
          <TouchableRipple 
            onPress={onPress} 
            rippleColor="#E5E5E5"
            rippleContainerBorderRadius={50}
            borderless={true}
            style={{ borderRadius: 50, backgroundColor: "black" }}>
            <ScanIcon />
          </TouchableRipple>
        </View>
      </View>
    ) : (
      
      <TouchableRipple 
        key={index} 
        style={styles.navItem}>
      <View style={styles.navItemContent}>
        {isFocused && route.name !== "Sell" && <View style={styles.activeBorder}></View>}
        {!isFocused && route.name !== "Sell" && <View style={styles.inactiveBorder}></View>}

        <TouchableRipple onPress={onPress} rippleColor="#E5E5E5" 
        borderless={true}
        style={{
          width: "100%",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
          borderRadius: 50
        }}>
          <View>
            {route.name === "Home" && (isFocused ? <DashboardIconActive /> : <DashboardIcon />)}
            {route.name === "Basket" && (isFocused ? <BasketIconActive /> : <BasketIcon />)}
            
            {route.name === "Shopping" && (isFocused ? <ShoppingIconActive /> : <ShoppingIcon />)}
            {route.name === "Profit" && (isFocused ? <WalletIconActive /> : <WalletIcon />)}
          </View>
        </TouchableRipple>
      </View>
    </TouchableRipple>
    )}
    </>
  );
}, (prevProps, nextProps) => (
  prevProps.isFocused === nextProps.isFocused &&
  prevProps.onPress === nextProps.onPress &&
  prevProps.route.name === nextProps.route.name
));

export default NavItem;