import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	ScrollView
} from "react-native";

import CalendarIcon from "../../assets/calendar-icon.svg";
import SellIcon from "../../assets/sell-icon.svg";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

class Shopping extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			sellingHistory: [],
			groupedHistories: [],
			lastDate: new Date(),
			currentMonthTotal: 0
		};

		this.sellHistoryRepository = new SellHistoryRepository()
		this.getSellingHistory()
	}

	async componentDidMount() {
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			this.getSellingHistory();
		});
	}

	async getSellingHistory () {
		sellingHistory = await this.sellHistoryRepository.getAllSellGroup();
		this.setState({sellingHistory: sellingHistory});
		this.setState({groupedHistories: this.groupByDate(sellingHistory)})
	}

	getFormattedTime = (created_date) => {
		let date = new Date(created_date);
		let hours = date.getHours();
		let minutes = date.getMinutes();
		
		minutes = minutes + "";
		if (minutes.length != 2) {
			minutes = "0" + minutes;
		}
		return `${hours}:${minutes}`;
	};

	groupByDate = (histories) => {
    const grouped = {};
    histories.forEach((history) => {
      const date = history.created_date.split('T')[0];
      const formattedDate = this.formatDate(date);
      if (!grouped[date]) {
        grouped[date] = { date, dateInfo: formattedDate, histories: [], totalAmount: 0 };
      }
      grouped[date].histories.push(history);
      grouped[date].totalAmount += history.amount;
    });
    return Object.values(grouped);
  };

  formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = { day: 'numeric', month: 'long', weekday: 'long' };
		const formattedDate = date.toLocaleDateString('uz', options);
	
		let [weekday, day] = formattedDate.split(', ');
	
		weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		return `${day}, ${weekday}`;
	};
	
	calculateCurrentMonthTotal = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based in JavaScript (January is 0)
    let currentMonthTotal = 0;

    this.state.sellingHistory.forEach((history) => {
      const historyDate = new Date(history.created_date);
      const historyMonth = historyDate.getMonth() + 1;

      if (historyMonth === currentMonth) {
        currentMonthTotal += history.amount;
      }
    });

		this.setState({currentMonthTotal: currentMonthTotal});
    return currentMonthTotal;
  };

	render() {
		const {navigation} = this.props;
		
		return (
			<View style={[styles.container, Platform.OS === 'web' && {width: "100%"}]}>
				<ScrollView style={{width: "100%"}}>
					<View style={styles.pageTitle}>
						<Text style={styles.pageTitleText}>Sotuv tarixi</Text>
					</View>

					<View style={styles.calendarWrapper}>
						<Text style={styles.calendarLabel}>
							Muddatni tanlang
						</Text>

						<View>
							<TouchableOpacity 
								onPress={async () => {
									await AsyncStorage.setItem("calendarFromPage", "Shopping");
									navigation.navigate("Calendar")
								}}
								style={styles.calendarInput}>
								<Text style={styles.calendarInputPlaceholder}>--/--/----</Text>
							</TouchableOpacity>

							{Platform.OS === 'android' || Platform.OS === 'ios' ? (
									<CalendarIcon
										style={styles.calendarIcon}
										resizeMode="cover"/>
								)
								: (
									<CalendarIcon
										style={styles.calendarIcon}
									/>
								)}
						</View>
					</View>

					<View style={{
						marginTop: 12,
						width: screenWidth - (16 * 2),
						marginLeft: "auto",
						marginRight: "auto",
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						paddingHorizontal: 16,
						paddingVertical: 14,
						backgroundColor: "#4F579F",
						borderRadius: 8
					}}>
						<Text style={{
							fontFamily: "Gilroy-Medium",
							fontWeight: "500",
							fontSize: 16,
							lineHeight: 24,
							color: "#FFF"
						}}>Oylik aylanma</Text>
						{(
							<Text style={{
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								fontSize: 16,
								lineHeight: 24,
								color: "#FFF"
							}}>{`${this.state.currentMonthTotal} so’m`}</Text>
					)}
						
					</View>

					<View>
						{this.state.groupedHistories.map((group) => (
							<View key={group.date}>
								{/* Amount Calculation */}
								{group.totalAmount && (
									<View style={styles.historyTitleWrapper}>
										<Text style={styles.historyTitleText}>{group.dateInfo}</Text>

										<Text style={styles.historyTitleText}>//</Text>

										<Text style={styles.historyTitleText}>{`${group.totalAmount} so’m`}</Text>
									</View>
								)}

								{group.histories.map((history) => (
									<TouchableOpacity
										key={history.id}
										style={styles.history}
										onPress={async () => {

											let historyId = history.id + "";

											console.log(historyId);
											try {
												await AsyncStorage.setItem("sell_history_id", historyId);
											} catch (error) {}

											navigation.navigate("ShoppingDetail", { history })										
										}}
									>
										<View style={styles.historyAmountWrapper}>
											<SellIcon />
											<Text style={styles.historyAmount}>{`${history.amount.toLocaleString()} so’m`}</Text>
										</View>

										<Text style={styles.historyTime}>{this.getFormattedTime(history.created_date)}</Text>
									</TouchableOpacity>
								))}
							</View>
						))}
					</View>
				</ScrollView>

				<StatusBar style="auto"/>
			</View>
		);
	}
}

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
		borderRadius: 8
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
	}
});

export default Shopping;