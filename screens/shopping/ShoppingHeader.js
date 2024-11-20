import React, { memo, useState } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarIcon from "../../assets/calendar-icon.svg";
import CrossIcon from "../../assets/cross-icon-light.svg";
import i18n from '../../i18n';
import { TouchableRipple } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

const ShoppingHeader = memo(({ navigation, calendarInputContent, incomeTitle, thisMonthSellAmount }) => {
	const handlePress = async () => {
		await AsyncStorage.setItem("window", "Calendar");
		await AsyncStorage.setItem("calendarFromPage", "Shopping");
		navigation.navigate("Calendar");
	};

	return (
		<>
			<View style={styles.pageTitle}>
				<Text style={styles.pageTitleText}>{i18n.t("sellingHistory")}</Text>
			</View>

			<View style={styles.calendarWrapper}>
				<Text style={styles.calendarLabel}>{i18n.t("choosePeriod")}</Text>

				<TouchableRipple
						delayHoverIn={true}
						delayLongPress={false}
						delayHoverOut={false}
						unstable_pressDelay={false}
						rippleColor="#E5E5E5"
						rippleContainerBorderRadius={50}
						borderless={true}
						onPress={handlePress}>
					<View>
					<View
						style={[
							calendarInputContent === "--/--/----" ?
								styles.calendarInput :
								styles.calendarInputActive
						]}
					>
						<Text
							style={[
								calendarInputContent === "--/--/----" ?
									styles.calendarInputPlaceholder :
									styles.calendarInputPlaceholderActive
							]}
						>
							{calendarInputContent}
						</Text>
					</View>

					{calendarInputContent === "--/--/----" ? (
						<CalendarIcon style={styles.calendarIcon} resizeMode="cover" />
					) : (
						<CrossIcon style={styles.calendarIcon} resizeMode="cover" />
					)}
				</View>
				</TouchableRipple>
			</View>

			<View style={styles.summaryContainer}>
				<Text style={styles.summaryText}>{incomeTitle}</Text>
				<Text style={styles.summaryAmount}>{`${thisMonthSellAmount.toLocaleString()} ${i18n.t("sum")}`}</Text>
			</View>
		</>		
	);
});

const styles = StyleSheet.create({
	container: {
		width: "100%",
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingTop: 50
	},

	pageTitle: {
		borderBottomColor: "#AFAFAF",
		borderBottomWidth: 1,
		width: screenWidth - (16 * 2),
		marginLeft: "auto",
		marginRight: "auto",
		height: 44,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},

	pageTitleText: {
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
		fontSize: 18,
		lineHeight: 24
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
		borderBottomRightRadius: 2,
	},

	scan: {
		backgroundColor: "black",
		padding: 21,
		borderRadius: 50,
		marginTop: 10
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
		fontSize: 24,
		fontWeight: "bold",
		width: 150
	},

	productCount: {
		fontFamily: "Roboto-Bold",
		fontSize: 24,
		fontWeight: "semibold"
	},

	hour: {
		color: "#6D7696",
		fontSize: 12
	},

	buttons: {
		width: screenWidth - (17 + 17),
		marginTop: 22,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
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
		color: "white",
		fontSize: 16,
		textAlign: "center",
		fontFamily: "Roboto-Bold",
		textTransform: "uppercase"
	},

	calendarWrapper: {
		marginTop: 24,
		width: screenWidth - (16 * 2),
		marginLeft: "auto",
		marginRight: "auto",
	},

	calendarIcon: {
		position: "absolute",
		right: 16,
		top: 14
	},

	calendarInput: {
		width: screenWidth - (16 * 2),
		position: "relative",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderColor: "#AFAFAF",
		borderWidth: 1,
		borderRadius: 8,
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
		fontSize: 16,
		lineHeight: 24,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		color: "#FFFFFF"
	},

	calendarInputPlaceholder: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		color: "#AAAAAA"
	},

	calendarLabel: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		marginBottom: 4
	},

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
	},
	summaryContainer: {
		marginTop: 12,
		width: screenWidth - 32,
		marginLeft: "auto",
		marginRight: "auto",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
		backgroundColor: "#4F579F",
		borderRadius: 8
	},
	summaryText: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 24,
		color: "#FFF"
	},
	summaryAmount: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 24,
		color: "#FFF"
	}

});

export default ShoppingHeader;