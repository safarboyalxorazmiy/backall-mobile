import React, {Component} from 'react';
import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, ScrollView} from 'react-native';

import CalendarIcon from "../../assets/calendar-icon.svg";
import CrossIcon from "../../assets/cross-icon-light.svg";
import ProfitIcon from "../../assets/profit-icon.svg";
import ProfitHistoryRepository from '../../repository/ProfitHistoryRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

class Profit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profitHistories: [],
			groupedHistories: [],
			currentMonthTotal: 0,
			lastGroupId: 0,
			isCollecting: false,
			calendarInputContent: "--/--/----",
		}

		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.initProfitHistoryGroup();
	}

	async getDateInfo() {
		this.setState({
			fromDate: await AsyncStorage.getItem("ProfitFromDate"),
			toDate: await AsyncStorage.getItem("ProfitToDate")
		});

		if (this.state.fromDate != null && this.state.toDate != null) {
			let fromDate = this.state.fromDate.replace(/-/g, "/");
			let toDate = this.state.toDate.replace(/-/g, "/");

			console.log(fromDate + " - " + toDate);
			this.setState({calendarInputContent: fromDate + " - " + toDate});
		} else {
			this.setState({calendarInputContent: "--/--/----"});
		}
	}
	
	async componentDidMount() {
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			await this.initProfitHistoryGroup();

			console.log(this.state.fromDate)
			console.log(this.state.toDate)
			
			console.log(this.state.profitHistories);
		});
	}

	async initProfitHistoryGroup() {
		await this.getDateInfo();

		if (this.state.fromDate != null && this.state.toDate != null) {
			let lastProfitGroup = await this.profitHistoryRepository.getLastProfitHistoryGroupIdByDate(
				this.state.fromDate,
				this.state.toDate
			);

			if (lastProfitGroup == null) {
				return;
			}

			profitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartIdAndDate(
				lastProfitGroup.id,
				this.state.fromDate,
				this.state.toDate
			);

			console.log({
				profitHistories: profitHistories,
				groupedHistories: this.groupByDate(profitHistories),
				lastGroupId: lastProfitGroup.id
			})
			this.setState({
				profitHistories: profitHistories,
				groupedHistories: this.groupByDate(profitHistories),
				lastGroupId: lastProfitGroup.id
			});	

			return;
		}

		let lastProfitGroup = await this.profitHistoryRepository.getLastProfitHistoryGroupId();
		profitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartId(lastProfitGroup.id);

		console.log("WITHOUT DATE")
		console.log(
			{
				profitHistories: profitHistories,
				groupedHistories: this.groupByDate(profitHistories),
				lastGroupId: lastProfitGroup.id
			}
		)
		this.setState({
			profitHistories: profitHistories,
			groupedHistories: this.groupByDate(profitHistories),
			lastGroupId: lastProfitGroup.id
		});
	}

	async getNextProfitHistoryGroup() {
		if (this.state.fromDate != null && this.state.toDate != null) {
			this.setState({isCollecting: true});	
			let nextProfitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartIdAndDate(
				this.state.lastGroupId - 10,
				this.state.fromDate,
				this.state.toDate
			);
			let allProfitHistories = this.state.profitHistories.concat(nextProfitHistories);
	
			console.log(this.state.profitHistories);
			console.log(allProfitHistories);
	
			this.setState({
				profitHistories: allProfitHistories,
				groupedHistories: this.groupByDate(allProfitHistories),
				lastGroupId: this.state.lastGroupId - 10,
				isCollecting: false
			});
	
			return;
		}

		this.setState({isCollecting: true});

		console.log("####### LAST ID ########")
		console.log(this.state.lastGroupId)
		if ((this.state.lastGroupId - 10) < 0) {
			this.setState({isCollecting: false});
			return;
		}

		let nextProfitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartId(this.state.lastGroupId - 10);
		let allProfitHistories = this.state.profitHistories.concat(nextProfitHistories);

		console.log(this.state.profitHistories);
		console.log(allProfitHistories);

		this.setState({
			profitHistories: allProfitHistories,
			groupedHistories: this.groupByDate(allProfitHistories),
			lastGroupId: this.state.lastGroupId - 10,
			isCollecting: false
		});
	};

	groupByDate = (histories) => {
    const grouped = {};
    histories.forEach((history) => {
      const date = history.created_date.split('T')[0];
      const formattedDate = this.formatDate(date);
      if (!grouped[date]) {
        grouped[date] = { date, dateInfo: formattedDate, histories: [], totalProfit: 0 };
      }
      grouped[date].histories.push(history);
      if(history.profit != "NaN") {
				grouped[date].totalProfit += history.profit;
			}
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

    this.state.profitHistories.forEach((history) => {
      const historyDate = new Date(history.created_date);
      const historyMonth = historyDate.getMonth() + 1;

      if (historyMonth === currentMonth) {
        currentMonthTotal += history.amount;
      }
    });

		this.setState({currentMonthTotal: currentMonthTotal});
    return currentMonthTotal;
  };

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

	render() {
		const {navigation} = this.props;
		
		return (
			<>
				<View style={styles.container}>
					<ScrollView
						onScrollBeginDrag={async (event) => {
							if (!this.state.isCollecting) {
								console.log("Scrolling ", event.nativeEvent.contentOffset);
								await this.getNextProfitHistoryGroup();
							}
						}} style={{width: "100%"}}>
						<View style={{
							borderBottomColor: "#AFAFAF",
							borderBottomWidth: 1,
							width: screenWidth - (16 * 2),
							marginLeft: "auto",
							marginRight: "auto",
							height: 44,
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}>
							<Text style={{
								fontFamily: "Gilroy-SemiBold",
								fontWeight: "600",
								fontSize: 18,
								lineHeight: 24
							}}>Foyda tarixi</Text>
						</View>
						
						<View style={{
							marginTop: 24,
							width: screenWidth - (16 * 2),
							marginRight: "auto",
							marginLeft: "auto"
						}}>
							<Text
								style={{fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, marginBottom: 4}}>
								Muddatni tanlang
							</Text>
							
							<View>
								<TouchableOpacity 
									onPress={async() => {
										await AsyncStorage.setItem("calendarFromPage", "Profit");
										navigation.navigate("Calendar")}
									}
									style={[
										this.state.calendarInputContent === "--/--/----" ? styles.calendarInput : styles.calendarInputActive
									]}>
									<Text 
										style={[
											this.state.calendarInputContent === "--/--/----" ? styles.calendarInputPlaceholder : styles.calendarInputPlaceholderActive
										]}>{this.state.calendarInputContent}</Text>
								</TouchableOpacity>	

								{this.state.calendarInputContent === "--/--/----" ? (
									<CalendarIcon
										style={styles.calendarIcon}
										resizeMode="cover"/>
								)
								: (
									<CrossIcon
										style={styles.calendarIcon}
										resizeMode="cover"/>
								)}
							</View>
						</View>
						
						<View style={{
							marginTop: 12,
							width: screenWidth - (16 * 2),
							marginRight: "auto",
							marginLeft: "auto",
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
							}}>Oylik foyda</Text>
							<Text style={{
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								fontSize: 16,
								lineHeight: 24,
								color: "#FFF"
							}}>5.000.000 so’m</Text>
						</View>
						
						<View style={{width: "100%", paddingLeft: 16, paddingRight: 16}}>
							{this.state.groupedHistories.map((group) => (
								<View key={group.date}>
									{(
										<View style={styles.historyTitleWrapper}>
											<Text style={styles.historyTitleText}>{group.dateInfo}</Text>

											<Text style={styles.historyTitleText}>//</Text>

											<Text style={styles.historyTitleText}>{`${group.totalProfit} so’m`}</Text>
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
													await AsyncStorage.setItem("profit_history_id", historyId);
												} catch (error) {
													console.error('Error profit_history_id:', error);
												}

												navigation.navigate("ProfitDetail", { history });
											}}
										>
											<View style={styles.historyProfitWrapper}>
												<ProfitIcon style={{marginLeft: -4}} />
												<Text style={styles.historyProfit}>{`${history.profit.toLocaleString()} so’m`}</Text>
											</View>

											<Text style={styles.historyTime}>{this.getFormattedTime(history.created_date)}</Text>
										</TouchableOpacity>
									))}
								</View>
							))}
						<View>
							</View>
						</View>
					</ScrollView>
					
					<StatusBar style="auto"/>
				</View>
			</>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		paddingTop: 50
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
		alignItems: 'center',
		justifyContent: 'center'
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
		// backgroundColor: "black"
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
		width: 100
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
		marginTop: 22,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		width: screenWidth - (17 + 17),
		marginBottom: 40
	},
	
	button: {
		backgroundColor: 'black',
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		display: "flex",
		flexDirection: "row",
		gap: 12
	},
	
	buttonText: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
		fontFamily: "Roboto-Bold",
		textTransform: "uppercase"
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
		display: "flex", 
		flexDirection: "row", 
		alignItems: "center"
	},

	historyProfit: {
		marginLeft: 10,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: "#0EBA2C"
	},
	
	historyTime: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 14,
		marginRight: -4
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
		paddingVertical: 10
	},

	historyTitleText: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 22
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
});

export default Profit;