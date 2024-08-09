import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
} from "react-native";
import {memo} from 'react';
import ProfitItem from "./ProfitItem";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ProfitGroup = ({item}) => {
	return (
		<View>
			{(<View style={styles.historyTitleWrapper}>
				<Text style={styles.historyTitleText}>{item.dateInfo}</Text>

				<Text style={styles.historyTitleText}>//</Text>

				<Text style={styles.historyTitleText}>{`${item.totalAmount.toLocaleString()} so’m`}</Text>
			</View>)}

			{item.histories.map((history) => (
				<ProfitItem key={history.id} history={history}/>
			))}
		</View>
	);
};


const styles = StyleSheet.create({
	container: {
		width: "100%", flex: 1, backgroundColor: "#fff", alignItems: "center", paddingTop: 50
	},

	navbar: {
		borderTopWidth: 1,
		borderTopColor: "#EFEFEF",
		paddingHorizontal: 30,
		width: "100%",
		backgroundColor: "white",
		height: 93,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start"
	},

	navbarWeb: {
		width: "100%" - 20
	},

	navItem: {
		display: "flex", alignItems: "center", justifyContent: "center"
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
		borderBottomRightRadius: 2, // backgroundColor: "black"
	},

	scan: {
		backgroundColor: "black", padding: 21, borderRadius: 50, marginTop: 10
	},

	productList: {
		marginTop: 0
	},

	product: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: screenWidth - (17 + 17),
		paddingVertical: 15,
		paddingHorizontal: 6,
		borderTopWidth: 1,
		borderColor: "#D9D9D9"
	},

	productTitle: {
		fontSize: 24, fontWeight: "bold", width: 100
	},

	productCount: {
		fontFamily: "Roboto-Bold", fontSize: 24, fontWeight: "semibold"
	},

	hour: {
		color: "#6D7696", fontSize: 12
	},

	buttons: {
		marginTop: 22,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		width: screenWidth - (17 + 17),
		marginBottom: 40
	},

	button: {
		backgroundColor: "black",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		display: "flex",
		flexDirection: "row",
		gap: 12
	},

	buttonText: {
		color: "white", fontSize: 16, textAlign: "center", fontFamily: "Roboto-Bold", textTransform: "uppercase"
	},

	history: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 50,
		marginTop: 4,
		paddingHorizontal: 4,
		paddingVertical: 6
	},

	historyProfitWrapper: {
		display: "flex", flexDirection: "row", alignItems: "center"
	},

	historyProfit: {
		marginLeft: 10, fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, color: "#0EBA2C"
	},

	historyTime: {
		fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 14, marginRight: -4
	},

	historyTitleWrapper: {
		marginTop: 12,
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "#EEEEEE",
		height: 42,
		borderRadius: 4,
		paddingHorizontal: 10,
		paddingVertical: 10,
		marginLeft: 16,
		marginRight: 16
	},

	historyTitleText: {
		fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 14, lineHeight: 22
	},

	calendarWrapper: {
		marginTop: 24,
		width: screenWidth - (16 * 2),
		marginLeft: "auto",
		marginRight: "auto",
	},

	calendarIcon: {
		position: "absolute", right: 16, top: 14
	},

	calendarInput: {
		width: screenWidth - (16 * 2),
		position: "relative",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderColor: "#AFAFAF",
		borderWidth: 1,
		borderRadius: 8
	},

	calendarInputActive: {
		width: screenWidth - (16 * 2),
		position: "relative",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderColor: "#AFAFAF",
		backgroundColor: "#272727",
		borderWidth: 1,
		borderRadius: 8
	},

	calendarInputPlaceholderActive: {
		fontSize: 16, lineHeight: 24, fontFamily: "Gilroy-Medium", fontWeight: "500", color: "#FFFFFF"
	},

	calendarInputPlaceholder: {
		fontSize: 16, lineHeight: 24, fontFamily: "Gilroy-Medium", fontWeight: "500", color: "#AAAAAA"
	},

	calendarLabel: {
		fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, marginBottom: 4
	},
});

export default memo(ProfitGroup, (prevProps, nextProps) => prevProps.item.histories.length === nextProps.item.histories.length);
