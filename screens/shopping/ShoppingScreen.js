import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	Dimensions,
	StyleSheet,
	View,
	FlatList,
	ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import HistoryGroup from "./HistoryGroup";
import ShoppingHeader from "./ShoppingHeader";
import _ from 'lodash';
import i18n from '../../i18n';

const screenWidth = Dimensions.get("window").width;

class Shopping extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sellingHistory: [],
			groupedHistories: [],
			lastDate: new Date(),
			currentMonthTotal: 0,
			lastGroupId: 0,
			firstGroupGlobalId: 0,

			calendarInputContent: "--/--/----",
			fromDate: null,
			toDate: null,
			prevFromDate: null, // for reloading after denpxleting
			thisMonthSellAmount: 0.00,

			// SELL
			lastSellGroupPage: 0,

			lastSellHistoryPage: 0,
			lastSellHistorySize: 10,
			lastSellHistoryGroupPage: 0,
			lastSellHistoryGroupSize: 10,
			lastSellAmountDatePage: 0,
			lastSellAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: ""
		};

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();

		this.onEndReached = _.debounce(this.onEndReached.bind(this), 400);
		this.flatListRef = React.createRef();
	}


	async componentDidMount() {
		console.log("Component mounted mf")
		await AsyncStorage.setItem("window", "Shopping");
		await AsyncStorage.setItem("stopLoader", "false");

		// !IMPORTANT 🔭******************************
		// Bu method bu yerda stateni component mount bo'lganda sahifani hamma ma'lumotlarini tozalash uchun yozildi.
		// yozilmasa double element degan bug chiqayapti
		await this.initializeScreen();

		
		// !IMPORTANT 🔭******************************
		// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
		// Bu yerda shunchaki tozalab tashlaymiz chunki bizga endi uni keragi yo'q
		if (await AsyncStorage.getItem("loadShopping") === "true") {
			await AsyncStorage.setItem("loadShopping", "false");
		}

		/* Month sell amount setting value ** */
		let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_sell_amount"));
		thisMonthSellAmount = isNaN(thisMonthSellAmount) ? 0 : thisMonthSellAmount;

		let currentDate = new Date();
		let currentMonth = currentDate.getMonth();
		let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

		if (currentMonth === lastStoredMonth) {
			this.setState({
				thisMonthSellAmount: thisMonthSellAmount,
				incomeTitle: i18n.t("oyIncome")
			});
		}

		let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
		let lastGroupId = lastSellGroup.id;

		let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

		this.setState({
			firstGroupGlobalId: firstSellGroup.global_id,
			lastGroupId: lastGroupId,
			loading: false,
			localFullyLoaded: false
		});

		//.log("Shopping mounted");


		this.onEndReached();

		const {navigation} = this.props;

		navigation.addListener("focus", async () => {	
			this.stopLoader();
			
			if (this.state.loading) {
				return;
			}		

			await AsyncStorage.setItem("window", "Shopping");

			// !IMPORTANT 🔭******************************
			// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
			// Shu holatda state bilan muammo bo'lmasligi uchun bu method yozildi.

			if (await AsyncStorage.getItem("loadShopping") === "true") {
				await this.initializeScreen();

				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

				this.setState({
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId,
					incomeTitle: i18n.t("oyIncome"),
					loading: false,
					localFullyLoaded: false
				});

				this.onEndReached();

				await AsyncStorage.setItem("loadShopping", "false");
			}

			/* Month sell amount setting value ** */
			let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_sell_amount"));

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({
					thisMonthSellAmount: thisMonthSellAmount,
					incomeTitle: i18n.t("oyIncome")
				});
			}

			// New history created load new items **
			if (
				await AsyncStorage.getItem("shoppingFullyLoaded") !== null &&
				await AsyncStorage.getItem("shoppingFullyLoaded") !== "true"
			) {
				if (this.state.prevFromDate != null) {
					let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
					let lastGroupId = lastSellGroup.id;
	
					let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();
	
					this.setState({
						groupedHistories: [],
						sellingHistory: [],
						firstGroupGlobalId: firstSellGroup.global_id,
						lastGroupId: lastGroupId,
						prevFromDate: null,
						incomeTitle: i18n.t("oyIncome"),
						loading: false,
						localFullyLoaded: false
					});
	
					this.onEndReached();
					return;
				}
				
				// Remove date
				await AsyncStorage.removeItem("ShoppingFromDate");
				await AsyncStorage.removeItem("ShoppingToDate");
				await AsyncStorage.setItem("shoppingFullyLoaded", "false");
				await this.getDateInfo();

				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

				if ((lastGroupId - 1000000) > 0) {
					await this.sellHistoryRepository.deleteByGroupIdLessThan(lastGroupId - 1000000);
				}

				// Explanation for firstSellGroup. We need it for getting rest of rows from global.
				// Right here we update it again cause we deleted rows which ids higher then 1000000
				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();
				this.setState({
					firstGroupGlobalId: firstSellGroup.global_id,
					globalFullyLoaded: false
				});

				// If there is no history get histories
				if (this.state.groupedHistories.length <= 0) {
					this.setState({loading: false, localFullyLoaded: false});
					this.onEndReached();
					this.scrollToTop();
					return;
				}

				// If there is history load top 1
				await this.loadTop1LocalSellGroups();
				this.scrollToTop();
				await AsyncStorage.setItem("shoppingFullyLoaded", "true");	
				return;
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
					sellingHistory: []
				});

				let amount = 
					await this.amountDateRepository.getSumSellAmountByDate(this.state.fromDate, this.state.toDate);
				let dateType = await AsyncStorage.getItem("dateType");

				if (dateType == "" || dateType == null) {
					this.setState({
						incomeTitle: i18n.t("oyIncome")
					});
				} else {
					this.setState({
						incomeTitle: i18n.t(dateType + "Income")
					});
				}

				if (amount == null || amount.length < 0 || amount[0] == null || amount[0].total_amount == null) {
					this.setState({
						loading: false,
						thisMonthSellAmount: 0,
					});

					return;
				}

				this.setState({
					thisMonthSellAmount: amount[0].total_amount
				});

				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroupByDate(
					this.state.fromDate,
					this.state.toDate
				);
				let lastGroup =
					await this.sellHistoryRepository.getLastSellHistoryGroupByDate(
						this.state.fromDate, this.state.toDate
					);
				let lastGroupId = lastGroup.id;

				this.setState({
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId,
					loading: false
				});

				await AsyncStorage.setItem("newCalendarShopping", "false");
				this.onEndReached();
				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

				this.setState({
					groupedHistories: [],
					sellingHistory: [],
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId,
					prevFromDate: null,
					incomeTitle: i18n.t("oyIncome"),
					loading: false,
					localFullyLoaded: false
				});

				this.onEndReached();
				return;
			}

			this.onEndReached();
		});
	}

	componentWillUnmount() {
    if (this.onEndReached) {
			this.onEndReached.cancel();
    }
	}

	async getDateInfo() {
		this.setState({
			fromDate: await AsyncStorage.getItem("ShoppingFromDate"),
			toDate: await AsyncStorage.getItem("ShoppingToDate")
		});

		if (this.state.fromDate != null) {
			this.setState({
				prevFromDate: this.state.fromDate
			});
		}

		if (this.state.fromDate !== null && this.state.toDate !== null) {
			let fromDate = this.state.fromDate.replace(/-/g, "/");
			let toDate = this.state.toDate.replace(/-/g, "/");

			//.log(fromDate + " - " + toDate);
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


	// Bu method bizga screenni stateini holatini boshlang'ich holatga tushurib berish uchun yozildi.
	async initializeScreen() {
		this.setState({
			sellingHistory: [],
			groupedHistories: [],
			lastDate: new Date(),
			currentMonthTotal: 0,
			lastGroupId: 0,
			firstGroupGlobalId: 0,

			calendarInputContent: "--/--/----",
			fromDate: null,
			toDate: null,
			prevFromDate: null, // for reloading after denpxleting
			thisMonthSellAmount: 0.00,

			// SELL
			lastSellGroupPage: 0,

			lastSellHistoryPage: 0,
			lastSellHistorySize: 10,
			lastSellHistoryGroupPage: 0,
			lastSellHistoryGroupSize: 10,
			lastSellAmountDatePage: 0,
			lastSellAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: ""
		});

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();

		this.apiService = new ApiService();

		await this.sellHistoryRepository.init();
		await this.amountDateRepository.init();
	}

	async loadMore() {
		if (await AsyncStorage.getItem("window") != "Shopping") {
			console.log("Loader turned off in loadMore")
			this.setState({loading: false});
			return;
		}

		if (this.state.localFullyLoaded === false) {
			this.setState({loading: true});
			let isLoaded = await this.loadLocalSellGroups();
			if (isLoaded) {
				return;
			}
		}

		console.log("localFullyLoaded === true; returned");

		if (this.state.globalFullyLoaded || this.state.loading) return;

		if (!this.state.firstGroupGlobalId) {
			return;
		}

		this.setState({loading: true});

		try {
			let response;
			if (this.state.fromDate != null && this.state.toDate != null) {
				response = await this.apiService.getSellGroupsByDate(
					this.state.firstGroupGlobalId,
					this.state.fromDate,
					this.state.toDate,
					this.state.lastSellGroupPage,
					22,
					this.props.navigation
				);
				//.log(response);
			} else {
				response = await this.apiService.getSellGroups(
					this.state.firstGroupGlobalId,
					this.state.lastSellGroupPage,
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
				if (history == null) {
					continue;
				}

				const currentDate = new Date(history.created_date);
				const date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
				let group = grouped.find(group => group.date === date);

				if (!group) {
					const formattedDate = this.formatDate(date);
					group = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
					grouped.push(group);
				}

				group.histories.push({
					id: (history.id) + 10000000,
					created_date: history.createdDate,
					amount: history.amount
				});

				if (lastDate !== date) {
					try {
						let response =
							await this.apiService.getSellAmountByDate(date, this.props.navigation);
						lastAmount = response.amount;
					} catch (e) {
						lastAmount = 0;
					}
					lastDate = date;
				}

				group.totalAmount = lastAmount;
			}

			this.setState(prevState => ({
				sellingHistory: [...prevState.sellingHistory, ...response.content],
				groupedHistories: grouped,
				firstGroupGlobalId: response.content[0].id,
			}));
			// //.log(grouped)
		} catch (error) {
			//.error("Error fetching global products:", error);
		} finally {
			this.setState({loading: false});
		}
	}

	async loadLocalSellGroups() {
		//.log("loading");

		if (this.state.lastGroupId <= 0) {
			console.log("this.state.lastGroupId <= 0; returned");
			this.setState({
				loading: false,
				localFullyLoaded: true
			});
			return false;
		}

		try {
			let sellHistories;
			// 
			if (this.state.fromDate != null && this.state.toDate != null) {
				sellHistories =
					await this.sellHistoryRepository.getTop11SellGroupByDate(this.state.lastGroupId, this.state.fromDate, this.state.toDate);
			} else {
				sellHistories =
					await this.sellHistoryRepository.getTop11SellGroup(this.state.lastGroupId);
			}

			if (sellHistories.length === 0) {
				console.log("sellHistories.length === 0; returned");
				this.setState({
					loading: false,
					localFullyLoaded: true
				});
				return false;
			}

			let grouped = [...this.state.groupedHistories];
			let lastDate = null;
			let lastAmount = 0;

			for (const history of sellHistories) {
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
					console.log(date)
					lastAmount = await this.amountDateRepository.getSellAmountInfoByDate(date).catch(() => 0);
					lastDate = date;
				}

				grouped[groupIndex].histories.push({
					id: history.id,
					created_date: history.created_date,
					amount: history.amount,
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

			if (await AsyncStorage.getItem("window") != "Shopping") {
				console.log("Loader turned off in loadLocalSellGroups()")
				this.setState({loading: false});
				return;
			}
	
			this.setState(prevState => ({
				sellingHistory: [...prevState.sellingHistory, ...sellHistories],
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

	async loadTop1LocalSellGroups() {
		//.log("loading");

		try {
			const sellHistories = await this.sellHistoryRepository.getTop1SellGroup();

			if (sellHistories[0] == null) {
				return false;
			}

			let grouped = [...this.state.groupedHistories];

			//.log(grouped[0])
			const {id, created_date, amount} = sellHistories[0];
			
			console.log("created_date::", created_date);
			const currentDate = new Date(created_date);
			const historyDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

			if (historyDate === grouped[0].date) { 
				if ((grouped[0].histories[0].id) === id) {
					return;
				}
				
				grouped[0].histories.unshift({
					id,
					created_date,
					amount
				});
				console.log("Length updated::", grouped[0].histories.length);

				grouped[0].totalAmount = await this.amountDateRepository.getSellAmountInfoByDate(historyDate).catch(() => 0);
			} else {
				const formattedDate = this.formatDate(historyDate);

				grouped.unshift({
					date: historyDate, 
					dateInfo: formattedDate,
					histories: [...sellHistories],
					totalAmount: await this.amountDateRepository.getSellAmountInfoByDate(historyDate).catch(() => 0)
				});
			}

			const startTime = performance.now();
			this.setState({groupedHistories: grouped});


			const groupedCopy = [...grouped];
			const lastItem = groupedCopy.pop();

			groupedCopy.forEach(group => {
				if (group.histories[0].saved) {
					group.histories.forEach(history => {
						history.saved = false;
					});
				}
			});

			groupedCopy.push(lastItem);

			this.setState({
				groupedHistories: groupedCopy
			});

			return true;
		} catch (error) {
			//.error('Error fetching sell histories:', error);
			return false;
		}
	}

	stopLoader() {
		this.setState({
			loading: false
		});

		this.onEndReached.cancel();
	}

	async onEndReached() {
		if (await AsyncStorage.getItem("window") != "Shopping") {
			console.log("Loader turned off in onEndReached");
			this.setState({loading: false});
			return;
		}

		if (this.state.loading) {
			console.log("Loading true ; stopped");
			return;
		};

		this.loadMore();
	}

	scrollToTop = () => {
		this.flatListRef.current?.scrollToOffset({animated: true, offset: 0});
	};

	render() {
		const {navigation} = this.props;

		return (
			<View style={[styles.container, Platform.OS === "web" && {width: "100%"}]}>
				<View style={{width: "100%", height: "100%"}}>
					<FlatList
						ref={this.flatListRef}
						data={this.state.groupedHistories}
						keyExtractor={(item) => item.date}
						onEndReachedThreshold={40}
						onEndReached={this.onEndReached}
						initialNumToRender={100}

						ListHeaderComponent={
							<ShoppingHeader
								navigation={this.props.navigation}
								incomeTitle={this.state.incomeTitle}
								calendarInputContent={this.state.calendarInputContent}
								thisMonthSellAmount={this.state.thisMonthSellAmount}
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
							<HistoryGroup
								key={item.date}
								item={item}
								stopLoader={() => {
									this.stopLoader();
								}}
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
		// backgroundColor: "#272727",
		backgroundColor: "#FFF",
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