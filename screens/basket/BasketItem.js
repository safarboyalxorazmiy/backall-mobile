import React from "react";
import { 
  View, 
  Text, 
  StyleSheet,
	Dimensions,
	TouchableOpacity, 
  AsyncStorage
 } from "react-native";
import { memo } from 'react';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const BasketItem = ({ product, index }) => {
  return (
    <View key={index} style={index % 2 === 0 ? styles.product : styles.productOdd}>
      <Text style={styles.productTitle}>{product.brand_name} {product.name}</Text>
      <Text style={styles.productCount}>{product.count} {product.count_type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
	container: {
		height: "100%",
		backgroundColor: "#fff",
		paddingTop: 65,
		position: "relative"
	},
	
	inputWrapper: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		width: screenWidth - (17 + 17),
		marginLeft: "auto",
		marginRight: "auto",
		borderColor: "#AFAFAF",
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 8,
	},
	
	input: {
		backgroundColor: "white",
		color: "black",
		paddingLeft: 10,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		borderWidth: 0,
	},
	
	productList: {
		marginTop: 20,
		height: screenHeight - 93
	},
	
	product: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		paddingLeft: 17,
		paddingRight: 17,
		paddingVertical: 13,
		paddingHorizontal: 4
	},
	
	productOdd: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		paddingLeft: 17,
		paddingRight: 17,
		paddingVertical: 13,
		paddingHorizontal: 4,
		backgroundColor: "#F1F1F1"
	},
	
	productTitle: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500"
	},
	
	productCount: {
		fontFamily: "Gilroy-Medium",
		fontSize: 16,
		lineHeight: 24,
		fontWeight: "500"
	},
	
	addButton: {
		width: 60,
		height: 60,
		backgroundColor: "#272727",
		position: "absolute",
		right: 20,
		bottom: 40,
		borderRadius: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}
	
});

export default memo(BasketItem, (prevProps, nextProps) => prevProps.product.id === nextProps.product.id);
