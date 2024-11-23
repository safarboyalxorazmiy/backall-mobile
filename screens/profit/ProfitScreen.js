import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	View,
	FlatList, 
	ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProductRepository from "../../repository/ProductRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import ApiService from "../../service/ApiService";

import ProfitGroup from "./ProfitGroup";
import ProfitHeader from "./ProfitHeader";
import _ from "lodash";
import i18n from '../../i18n';

class Profit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profitHistory: [],
			groupedHistories: [],
			currentMonthTotal: 0,
			lastDate: new Date(),
			lastGroupId: 0,
			firstGroupGlobalId: 0,

			calendarInputContent: "--/--/----",
			fromDate: null,
			toDate: null,
			prevFromDate: null,
			thisMonthProfitAmount: 0.00,

			lastProfitGroupPage: 0,

			lastProfitGroupsPage: 0,
			lastProfitGroupsSize: 10,
			lastProfitHistoriesPage: 0,
			lastProfitHistoriesSize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: ""
		}

		this.productRepository = new ProductRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();

		this.onEndReached = _.debounce(this.onEndReached.bind(this), 100);
		this.flatListRef = React.createRef();
	}

	async componentDidMount() {
		await AsyncStorage.setItem("window", "Profit");

		// !IMPORTANT 🔭******************************
		// Bu method bu yerda stateni component mount bo'lganda sahifani hamma ma'lumotlarini tozalash uchun yozildi.
		// yozilmasa double element degan bug chiqayapti
		await this.initializeScreen();


		// !IMPORTANT 🔭******************************
		// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
		// Bu yerda shunchaki tozalab tashlaymiz chunki bizga endi uni keragi yo'q
		if (await AsyncStorage.getItem("loadProfit") === "true") {		
			await AsyncStorage.setItem("loadProfit", "false");
		}

		/* Month profit amount setting value ** */
		let thisMonthProfitAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

		let currentDate = new Date();
		let currentMonth = currentDate.getMonth();
		let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

		if (currentMonth === lastStoredMonth) {
			this.setState({
				thisMonthProfitAmount: thisMonthProfitAmount,
				incomeTitle: i18n.t("oyProfit")
			});
		}

		let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
		let lastGroupId = lastProfitGroup.id || 0;

		let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

		this.setState({
			firstGroupGlobalId: firstProfitGroup.global_id,
			lastGroupId: lastGroupId
		});

		console.log("Profit mounted");

		this.onEndReached();

		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			await AsyncStorage.setItem("window", "Profit");

			if (await AsyncStorage.getItem("loadProfit") === "true") {
				await this.initializeScreen();

				await AsyncStorage.setItem("loadProfit", "false");
			}

			/* Month profit amount setting value ** */
			let thisMonthProfitAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({
					thisMonthProfitAmount: thisMonthProfitAmount,
					incomeTitle: i18n.t("oyProfit")
				});
			}

			// If there is no history get histories
			if (this.state.groupedHistories.length <= 0) {
				this.setState({loading: true, localFullyLoaded: false});
				await this.loadLocalProfitGroups();
			}

			// New history created load new items **
			if (
				await AsyncStorage.getItem("profitFullyLoaded") !== null &&
				await AsyncStorage.getItem("profitFullyLoaded") !== "true"
			) {
				// Remove date
				await AsyncStorage.removeItem("ProfitFromDate");
				await AsyncStorage.removeItem("ProfitToDate");
				await AsyncStorage.setItem("profitFullyLoaded", "false");
				await this.getDateInfo();

				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id || 0;

				if ((lastGroupId - 1000000) > 0) {
					await this.profitHistoryRepository.deleteByGroupIdLessThan(lastGroupId - 1000000);
				}

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

				this.setState({
					firstGroupGlobalId: firstProfitGroup.global_id,
					lastGroupId: lastGroupId,
					groupedHistories: [],
					profitHistory: []
				});

				console.log("Profit mounted");
				await AsyncStorage.setItem("profitFullyLoaded", "true");

				await this.loadLocalProfitGroups();
				this.setState({
					localFullyLoaded: false,
					loading: false
				});
			}

			// Getting date removing date
			await this.getDateInfo();

			if (this.state.fromDate != null && this.state.toDate != null) {
				console.log("fromDate:", this.state.fromDate);
				console.log("toDate:", this.state.toDate);

				this.setState({
					loading: true,
					localFullyLoaded: false,
					groupedHistories: [],
					profitHistory: []
				});
				
				let amount = 
					await this.amountDateRepository.getSumProfitAmountByDate(this.state.fromDate, this.state.toDate);
				let dateType = await AsyncStorage.getItem("dateType");

				if (dateType == "" || dateType == null) {
					this.setState({
						incomeTitle: i18n.t("oyProfit")
					});
				} else {
					this.setState({
						incomeTitle: i18n.t(dateType + "Profit")
					});
				}

				if (amount == null || amount.length < 0 || amount[0].total_amount == null) {
					this.setState({
						loading: false,
						thisMonthSellAmount: 0,
					});

					return;
				}

				this.setState({
					thisMonthSellAmount: amount[0].total_amount
				});

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroupByDate(
					this.state.fromDate,
					this.state.toDate
				);
				let lastGroup =
					await this.profitHistoryRepository.getLastProfitHistoryGroupByDate(
						this.state.fromDate, this.state.toDate
					);
				let lastGroupId = lastGroup.id;

				this.setState({
					firstGroupGlobalId: firstProfitGroup.global_id,
					lastGroupId: lastGroupId,
					loading: false
				});

				this.onEndReached();
				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id || 0;

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

				this.setState({
					groupedHistories: [],
					profitHistory: [],
					firstGroupGlobalId: firstProfitGroup.global_id,
					lastGroupId: lastGroupId,
					prevFromDate: null,
					incomeTitle: i18n.t("oyProfit"),
					loading: false
				});

				this.onEndReached();
				return;
			}

			this.onEndReached();
		});
	}

	async getDateInfo() {
		this.setState({
			fromDate: await AsyncStorage.getItem("ProfitFromDate"), toDate: await AsyncStorage.getItem("ProfitToDate")
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

	formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = {day: "numeric", month: "long", weekday: "long"};
		
		const formattedDate = date.toLocaleDateString("en", options);

		let [weekday, day] = formattedDate.split(", ");

		weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		
		month = i18n.t(day.split(" ")[0].toLocaleLowerCase());
		monthNameWithNumber = month.charAt(0).toUpperCase() + month.slice(1) + " " + day.split(" ")[1];
		day = monthNameWithNumber;
		weekday = i18n.t(weekday.toLocaleLowerCase());

		return `${day}, ${weekday}`;
	};

	async initializeScreen() {
		this.state = {
			profitHistory: [],
			groupedHistories: [],
			currentMonthTotal: 0,
			lastGroupId: 0,
			isCollecting: false,
			calendarInputContent: "--/--/----",
			thisMonthProfitAmount: 0.00,

			lastProfitGroupPage: 0,

			lastProfitGroupsPage: 0,
			lastProfitGroupsSize: 10,
			lastProfitHistoriesPage: 0,
			lastProfitHistoriesSize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: ""
		}

		this.productRepository = new ProductRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();
	}

	async loadMore() {
		if (await AsyncStorage.getItem("window") != "Profit") {
			this.setState({loading: false, localFullyLoaded: false});
			return;
		}

		if (this.state.localFullyLoaded == false) {
			this.setState({loading: true});
			let isLoaded = await this.loadLocalProfitGroups();
			if (isLoaded) {
				return;
			}
		}

		if (this.state.globalFullyLoaded || this.state.loading) return;

		if (!this.state.firstGroupGlobalId) {
			return;
		}

		this.setState({loading: true});

		try {
			let response;
			if (this.state.fromDate && this.state.toDate) {
				response = await this.apiService.getProfitGroupsByDate(
					this.state.firstGroupGlobalId,
					this.state.fromDate,
					this.state.toDate,
					this.state.lastProfitGroupPage,
					22,
					this.props.navigation
				);
			} else {
				response = await this.apiService.getProfitGroups(
					this.state.firstGroupGlobalId,
					this.state.lastProfitGroupPage,
					22,
					this.props.navigation
				);
			}

			if (!response || !response.content || response.content.length === 0) {
				this.setState({loading: false, globalFullyLoaded: true});
				return;
			}

			let grouped = [...this.state.groupedHistories];
			let lastDate, lastAmount;

			for (const history of response.content) {
				const currentDate = new Date(history.created_date);
				const date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
				let group = grouped.find(group => group.date === date);

				if (!group) {
					const formattedDate = this.formatDate(date);
					group = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
					grouped.push(group);
				}

				group.histories.push({
					id: history.id,
					created_date: history.createdDate,
					profit: history.profit,
					calendar: false
				});

				if (lastDate !== date) {
					try {
						let response =
							await this.apiService.getProfitAmountByDate(date, this.props.navigation);
						lastAmount = response.amount;
					} catch (e) {
						lastAmount = 0;
					}
					lastDate = date;
				}

				group.totalAmount = lastAmount;
			}

			this.setState(prevState => ({
				profitHistory: [...prevState.profitHistory, ...response.content],
				groupedHistories: grouped,
				firstGroupGlobalId: response.content[0].id || 0,
			}));
		} catch (error) {
			console.error("Error fetching global products:", error);
		} finally {
			this.setState({loading: false});
		}
	}

	async loadLocalProfitGroups() {
		if (this.state.lastGroupId <= 0) {
			this.setState({
				loading: false,
				localFullyLoaded: true
			});
			return false;
		}

		try {
			let profitHistories;
			if (this.state.fromDate != null && this.state.toDate != null) {
				profitHistories =
					await this.profitHistoryRepository.getTop11ProfitGroupByDate(this.state.lastGroupId, this.state.fromDate, this.state.toDate);
			} else {
				profitHistories =
					await this.profitHistoryRepository.getTop11ProfitGroup(this.state.lastGroupId);
			}

			if (profitHistories.length === 0) {
				this.setState({
					loading: false,
					localFullyLoaded: true
				});
				return false;
			}

			let grouped = [...this.state.groupedHistories];
			let lastDate = null;
			let lastAmount = 0;

			for (const history of profitHistories) {
				const currentDate = new Date(history.created_date);
				const date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
				let groupIndex = grouped.findIndex(group => group.date === date);

				if (groupIndex === -1) {
					const formattedDate = this.formatDate(date);
					grouped.push({
						date,
						dateInfo: formattedDate,
						histories: [],
						totalAmount: 0
					});
					groupIndex = grouped.length - 1;
				}

				if (lastDate !== date) {
					lastAmount = await this.amountDateRepository.getProfitAmountInfoByDate(date).catch(() => 0);
					lastDate = date;
				}

				grouped[groupIndex].histories.push({
					id: history.id,
					created_date: history.created_date,
					profit: history.profit,
					calendar: true
				});

				grouped[groupIndex].totalAmount = lastAmount;
			}

			// Update the state in one go
			const groupedCopy = grouped.map(group => ({
				...group,
				histories: group.histories.map(history => ({
					...history
				}))
			}));

			const lastGroup = grouped[grouped.length - 1];
			if (lastGroup) {
				groupedCopy[groupedCopy.length - 1].histories[0].calendar = true;
			}

			this.setState(prevState => ({
				profitHistory: [...prevState.profitHistory, ...profitHistories],
				groupedHistories: groupedCopy,
				lastGroupId: prevState.lastGroupId - 11,
				loading: false
			}));

			return true;
		} catch (error) {
			this.setState({
				loading: false
			});
			return false;
		}
	}

	async loadTop1LocalProfitGroups() {
		console.log("loading");

		try {
			const profitHistories = await this.profitHistoryRepository.getTop1ProfitGroup();

			if (!profitHistories[0]) {
				return false;
			}

			let grouped = this.state.groupedHistories;

			console.log(grouped[0])
			const {id, created_date, amount} = profitHistories[0];
			const currentDate = new Date(created_date);
			const historyDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;


			if (historyDate === grouped[0].date) {
				grouped[0].histories = [{
					id,
					created_date,
					amount,
					calendar: true
				}, ...grouped[0].histories];
			} else {
				const formattedDate = this.formatDate(historyDate);
				grouped.push({
					date: historyDate, // Make sure this matches your structure; it was 'historyDate' in your code, but 'date' elsewhere
					dateInfo: formattedDate,
					histories: profitHistories,
					totalAmount: 0
				});
			}

			const startTime = performance.now();
			this.setState(prevState => ({
				groupedHistories: grouped,
			}));


			const groupedCopy = [...grouped];
			const lastItem = groupedCopy.pop();

			groupedCopy.forEach(group => {
				if (group.histories[0].calendar) {
					group.histories.forEach(history => {
						history.calendar = false;
					});
				}
			});

			groupedCopy.push(lastItem);

			this.setState({
				groupedHistories: groupedCopy
			});

			const endTime = performance.now();
			console.log(`Execution time: ${endTime - startTime} milliseconds`);

			return true;
		} catch (error) {
			console.error('Error fetching profit histories:', error);
			return false;
		}
	}

	async onEndReached() {
		if (this.state.loading) {
			console.log("Loading true returned")
			return;
		};

		console.log("Loading..")
		this.loadMore();
	}

	scrollToTop = () => {
		this.flatListRef.current?.scrollToOffset({animated: true, offset: 0});
	};

	render() {
		const {navigation} = this.props;

		return (
			<View style={styles.container}>
				<View style={{width: "100%", height: "100%"}}>
					<FlatList
						ref={this.flatListRef}
						data={this.state.groupedHistories}
						keyExtractor={(item) => item.date}
						onEndReachedThreshold={40}
						onEndReached={this.onEndReached}
						initialNumToRender={100}

						ListHeaderComponent={
							<ProfitHeader
								navigation={this.props.navigation}
								incomeTitle={this.state.incomeTitle}
								calendarInputContent={this.state.calendarInputContent}
								thisMonthProfitAmount={this.state.thisMonthProfitAmount}
							/>
						}

						ListFooterComponent={() => {
							if (!this.state.loading) return null;
							return (
								<View style={{padding: 10}}>
									<ActivityIndicator size="large" color={"#9A50AD"}/>
								</View>
							);
						}}

						renderItem={({item}) => (
							<ProfitGroup
								key={item.date}
								item={item}
								navigation={navigation}/>
						)}
					/>
				</View>

				<StatusBar style="auto"/>
			</View>
		);
	}
}

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
		// width: screenWidth - (17 + 17),
		width: "100%",
		paddingRight: 16,
		paddingLeft: 16,
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
		// width: screenWidth - (17 + 17),
		width: "100%",
		paddingRight: 17,
		paddingLeft: 17,
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
		paddingVertical: 10
	},

	historyTitleText: {
		fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 14, lineHeight: 22
	},

	calendarWrapper: {
		marginTop: 24,
		// width: screenWidth - (16 * 2),
		width: "100%",
		paddingRight: 16,
		paddingLeft: 16,
		marginLeft: "auto",
		marginRight: "auto",
	},

	calendarIcon: {
		position: "absolute", right: 16, top: 14
	},

	calendarInput: {
		// width: screenWidth - (16 * 2),
		width: "100%",
		paddingRight: 16,
		paddingLeft: 16,

		position: "relative",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderColor: "#AFAFAF",
		borderWidth: 1,
		borderRadius: 8
	},

	calendarInputActive: {
		// width: screenWidth - (16 * 2),
		width: "100%",
		paddingRight: 16,
		paddingLeft: 16,

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

export default Profit;