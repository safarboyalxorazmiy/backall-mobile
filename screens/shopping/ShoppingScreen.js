import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated} from "react-native";
import CalendarIcon from "../../assets/calendar-icon.svg";
import CrossIcon from "../../assets/cross-icon-light.svg";

import SellIcon from "../../assets/sell-icon.svg";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AmountDateRepository from "../../repository/AmountDateRepository";
import Modal from "react-native-modal";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Shopping extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			sellingHistory: [],
			groupedHistories: [],
			lastDate: new Date(),
			currentMonthTotal: 0,
			lastGroupId: 0,
			isCollecting: false,
			
			calendarInputContent: "--/--/----",
			fromDate: null,
			toDate: null,
			thisMonthSellAmount: 0.00,
			notAllowed: "",
			animation: new Animated.Value(0),
		};
		
		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		
		this.initSellingHistoryGroup();
	}
	
	async componentDidMount() {
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			// ROLE ERROR
			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed})

			let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_sell_amount"));
			
			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));
			
			if (currentMonth === lastStoredMonth) {
				this.setState({thisMonthSellAmount: thisMonthSellAmount});
			}
			
			await this.initSellingHistoryGroup();
		});
	}
	
	async getDateInfo() {
		this.setState({
			fromDate: await AsyncStorage.getItem("ShoppingFromDate"),
			toDate: await AsyncStorage.getItem("ShoppingToDate")
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
	
	async initSellingHistoryGroup() {
		this.getDateInfo();
		if (this.state.fromDate != null && this.state.toDate != null) {
			let lastSellHistoryGroup =
				await this.sellHistoryRepository.getLastSellHistoryGroupByDate(
					this.state.fromDate,
					this.state.toDate
				);
			
			if (lastSellHistoryGroup != null) {
				return;
			}
			
			let sellingHistory =
				await this.sellHistoryRepository.getTop10SellGroupByDate(
					lastSellHistoryGroup.id,
					this.state.fromDate,
					this.state.toDate
				);
			
			this.setState({lastGroupId: lastSellHistoryGroup.id});
			this.setState({sellingHistory: sellingHistory});
			this.setState({groupedHistories: await this.groupByDate(sellingHistory)});
			
			return;
		}
		
		let lastSellHistoryGroup = await this.sellHistoryRepository.getLastSellHistoryGroupId();
		let sellingHistory = await this.sellHistoryRepository.getAllSellGroup(lastSellHistoryGroup.id);
		
		this.setState({lastGroupId: lastSellHistoryGroup.id});
		this.setState({sellingHistory: sellingHistory});
		this.setState({groupedHistories: await this.groupByDate(sellingHistory)});
	}
	
	async getNextSellHistoryGroup() {
		if (this.state.fromDate != null && this.state.toDate) {
			this.setState({isCollecting: true});
			
			let nextSellHistories = await this.sellHistoryRepository.getTop10SellGroupByDate(
				this.state.lastGroupId - 10,
				this.state.fromDate,
				this.state.toDate
			);
			let allSellHistories = this.state.sellingHistory.concat(nextSellHistories);
			
			this.setState({
				sellingHistory: allSellHistories,
				groupedHistories: await this.groupByDate(allSellHistories),
				lastGroupId: this.state.lastGroupId - 10,
				isCollecting: false
			});
			
			return;
		}
		
		// PROBLEM:
		// 	Bu yerda oxirgi da qolib ketgan 10 dan keyingi 5-4 larini 
		// 	ola olmay qolishi mumkin...
		// 	tekshirib agar muammo bo'lsa hal qilish kerak
		
		this.setState({isCollecting: true});
		
		console.log("####### LAST ID ########");
		console.log(this.state.lastGroupId);
		if ((this.state.lastGroupId - 10) < 0) {
			this.setState({isCollecting: false});
			return;
		}
		
		let nextSellHistories = await this.sellHistoryRepository.getAllSellGroup(this.state.lastGroupId - 10);
		let allSellHistories = this.state.sellingHistory.concat(nextSellHistories);
		
		this.setState({
			sellingHistory: allSellHistories,
			groupedHistories: await this.groupByDate(allSellHistories),
			lastGroupId: this.state.lastGroupId - 10,
			isCollecting: false
		});
	};
	
	getFormattedTime = (created_date) => {
		let date = new Date(created_date);
		let hours = date.getHours();
		let minutes = date.getMinutes();
		
		minutes = minutes + "";
		if (minutes.length !== 2) {
			minutes = "0" + minutes;
		}
		return `${hours}:${minutes}`;
	};
	
	groupByDate = async (histories) => {
		const grouped = {};
		for (const history of histories) {
			const date = history.created_date.split('T')[0];
			const formattedDate = this.formatDate(date);
			if (!grouped[date]) {
				grouped[date] = { date, dateInfo: formattedDate, histories: [], totalAmount: 0 };
			}
			grouped[date].histories.push(history);
			
			let currentDate = new Date(date);
			const year = currentDate.getFullYear();
			const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
			const day = String(currentDate.getDate()).padStart(2, '0');
			
			// Format the date as yyyy-mm-dd
			const currentFormattedDate = `${year}-${month}-${day}`;
			grouped[date].totalAmount = await this.amountDateRepository.getSellAmountInfoByDate(currentFormattedDate);
		}
		
		console.log(grouped);
		return Object.values(grouped);
	};
	
	formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = {day: 'numeric', month: 'long', weekday: 'long'};
		const formattedDate = date.toLocaleDateString('uz', options);
		
		let [weekday, day] = formattedDate.split(', ');
		
		weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		return `${day}, ${weekday}`;
	};
	
	calculateCurrentMonthTotal = () => {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth() + 1;
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
		
		const translateY = this.state.animation.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100] // Adjust the value as needed
		});

		return (
			<View style={[styles.container, Platform.OS === 'web' && {width: "100%"}]}>
				<ScrollView onScrollBeginDrag={async (event) => {
					if (!this.state.isCollecting) {
						console.log("Scrolling ", event.nativeEvent.contentOffset);
						await this.getNextSellHistoryGroup();
					}
				}} style={{width: "100%"}}>
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
									navigation.navigate("Calendar");
								}}
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
							}}>{`${this.state.thisMonthSellAmount} so’m`}</Text>
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
											
											navigation.navigate("ShoppingDetail", {history})
										}}>
										<View style={styles.historyAmountWrapper}>
											<SellIcon/>
											<Text style={styles.historyAmount}>{`${history.amount.toLocaleString()} so’m`}</Text>
										</View>
										
										<Text style={styles.historyTime}>{this.getFormattedTime(history.created_date)}</Text>
									</TouchableOpacity>
								))}
							</View>
						))}
					</View>
				</ScrollView>
				
				<Modal
					visible={this.state.notAllowed === "true"}
					animationIn={"slideInUp"}
					animationOut={"slideOutDown"}
					animationInTiming={200}
					transparent={true}>
						<View style={{
							position: "absolute",
							width: "150%",
							height: screenHeight,
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#00000099",
							left: -50,
							right: -50,
							top: 0
						}}></View>

						<View style={{
							height: screenHeight,
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}>
							<Animated.View style={{
								width: screenWidth - (16 * 2),
								maxWidth: 343,
								marginLeft: "auto",
								marginRight: "auto",
								flex: 1,
								alignItems: "center",
								justifyContent: "flex-end",
								marginBottom: 120,
								transform: [{translateY}]
							}}>
								<View style={{
									width: "100%",
									padding: 20,
									borderRadius: 12,
									backgroundColor: "#fff",
								}}>
									<Text style={{
										fontFamily: "Gilroy-Regular",
										fontSize: 18
									}}>Siz sotuvchi emassiz..</Text>
									<TouchableOpacity
										style={{
											display: "flex",
											alignItems: "center",
											height: 55,
											justifyContent: "center",
											backgroundColor: "#222",
											width: "100%",
											borderRadius: 12,
											marginTop: 22
										}}
										onPress={async () => {
											this.setState({notAllowed: "false"});
											await AsyncStorage.setItem("not_allowed", "false")
										}}>
										<Text
											style={{
												fontFamily: "Gilroy-Bold",
												fontSize: 18,
												color: "#fff",
											}}>Tushunarli</Text>
									</TouchableOpacity>
								</View>
							</Animated.View>
						</View>
				</Modal>

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
	}
});

export default Shopping;