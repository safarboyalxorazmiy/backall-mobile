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
import i18n from '../../i18n';

import SkeletonLoader from "expo-skeleton-loader";

const screenWidth = Dimensions.get("window").width;



class Shopping extends Component {
	constructor(props) {
		super(props);

		this.state = {
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
			incomeTitle: "",
			loaderCount: 0,
		};

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();

		this.flatListRef = React.createRef();
		
		this.loaderRef = React.createRef(false);
	}


	async componentDidMount() {
		console.log("Component mounted mf")
		await AsyncStorage.setItem("window", "Shopping");

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
			lastGroupId: lastGroupId + 11,
			loading: false,
			localFullyLoaded: false
		});

		//.log("Shopping mounted");

		this.onEndReached();

		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
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
					groupedHistories: [],
					localFullyLoaded: false
				});

				await AsyncStorage.setItem("loadShopping", "false");
				this.onEndReached();
				return;
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
						firstGroupGlobalId: firstSellGroup.global_id,
						lastGroupId: lastGroupId,
						prevFromDate: null,
						incomeTitle: i18n.t("oyIncome"),
						loading: false,
						localFullyLoaded: false
					});
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
					this.setState({
						loading: false,
						localFullyLoaded: false
					})
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
				if (await AsyncStorage.getItem("lastWindow") == "ShoppingDetail") {
					await AsyncStorage.removeItem("lastWindow");
					return;
				}

				console.log("fromDate:", this.state.fromDate);
				console.log("toDate:", this.state.toDate);

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
						thisMonthSellAmount: 0,
						groupedHistories: [],
						localFullyLoaded: false
					});

					return;
				}

				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroupByDate(
					this.state.fromDate,
					this.state.toDate
				);
				let lastGroup =
					await this.sellHistoryRepository.getLastSellHistoryGroupByDate(
						this.state.fromDate, this.state.toDate
					);
				let lastGroupId = lastGroup.id;

				console.log(lastGroup);

				this.setState({
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId + 11,
					groupedHistories: [],
					thisMonthSellAmount: amount[0].total_amount,
					localFullyLoaded: false
				}, () => {
					// this.onEndReached();
				});
				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

				let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

				this.setState({
					groupedHistories: [],
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId + 11,
					prevFromDate: null,
					incomeTitle: i18n.t("oyIncome"),
					localFullyLoaded: false
				}, () => {
					// this.onEndReached();
				});
				return;
			}
		});
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
		this.loaderRef.current = true;
		let isLoaded = await this.loadLocalSellGroups();
		if (isLoaded) {
			this.loaderRef.current = false;
			return;
		}

		this.loaderRef.current = false;
	}

	async loadLocalSellGroups() {
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

			if (sellHistories.length === 0 || sellHistories.length !== 11) {
				console.log("sellHistories.length === 0; returned");
				this.setState({
					localFullyLoaded: true
				});
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
				return false;
			}
	
			this.setState({
				groupedHistories: groupedCopy
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	async loadTop1LocalSellGroups() {
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

	onEndReached = async () => {
		this.setState(state => ({
			lastGroupId: state.lastGroupId - 11
		}),async () => {
			await this.loadMore();
		});
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
						onEndReachedThreshold={0.2}
						onEndReached={this.onEndReached}
						// initialNumToRender={11}
						style={{width: "100%", height: "100%"}}
						ListHeaderComponent={
							<ShoppingHeader
								navigation={this.props.navigation}
								incomeTitle={this.state.incomeTitle}
								calendarInputContent={this.state.calendarInputContent}
								thisMonthSellAmount={this.state.thisMonthSellAmount}
							/>
						}
						onScrollEndDrag={() => {
							this.loaderRef.current = true;
						}}
						ListFooterComponent={
							(this.loaderRef.current == false || this.state.localFullyLoaded == true) ? <></>:
							(
								<SkeletonLoader style={{ marginVertical: 10, }} >
									
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
										/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
										/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6,
										}}
									/>
								</SkeletonLoader>
							)
						}

						renderItem={({item}) => (
							<HistoryGroup
								key={item.date}
								item={item}
								navigation={navigation}/>
						)}
					/>

					{/* {this.loaderRef.current && (
						<SkeletonLoader style={{ marginVertical: 10 }} >
							<SkeletonLoader.Item
								style={styles.skeletonItem}
								/>
						</SkeletonLoader>
					)} */}
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