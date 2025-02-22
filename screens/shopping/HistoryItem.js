import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity
} from "react-native";
import {memo} from 'react';
import SellIcon from "../../assets/sell-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from '../../i18n';

const screenWidth = Dimensions.get("window").width;

const HistoryItem = ({history, navigation}) => {
	const getFormattedTime = (created_date) => {
		let date = new Date(created_date);
		let hours = date.getHours();
		let minutes = date.getMinutes();

		minutes = minutes + "";

		if (minutes.length !== 2) {
			minutes = "0" + minutes;
		}
		return `${hours}:${minutes}`;
	};

	return (
		<TouchableOpacity
			key={history.id}
			style={styles.history}
			onPress={async () => {
				await AsyncStorage.setItem("window", "ShoppingDetail");
				let historyId = history.id + "";

				//.log(historyId);
				try {
					await AsyncStorage.setItem("sell_history_id", historyId);
				} catch (error) {
				}

				//.log(navigation)

				navigation.navigate("ShoppingDetail");
			}}>
			<View style={styles.historyAmountWrapper}>
				<SellIcon/>
				<Text style={styles.historyAmount}>{`${history.amount.toLocaleString()} ${i18n.t("sum")}`}</Text>
			</View>

			<Text style={styles.historyTime}>{getFormattedTime(history.created_date)}</Text>

		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	historyTitleWrapper: {
		marginTop: 12,
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		width: screenWidth - (16 * 2),
		marginLeft: "auto",
		marginRight: "auto",
		backgroundColor: "#EEEEEE",
		height: 42,
		borderRadius: 4,
		paddingHorizontal: 10,
		paddingVertical: 10
	},

	historyTitleText: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 22
	},

	history: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 50,
		marginTop: 4,
		width: "100%",
		paddingHorizontal: 16,
		paddingVertical: 6
	},

	historyAmountWrapper: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},

	historyAmount: {
		marginLeft: 10,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16
	},

	historyTime: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 14
	}
});

export default memo(HistoryItem,
	(prevProps, nextProps) =>
		prevProps.history.id === nextProps.history.id
);
