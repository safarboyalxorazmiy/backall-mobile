import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	Dimensions,
	StyleSheet,
	View,
	FlatList,
	Appearance
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import ProfitGroup from "./ProfitGroup";
import ProfitHeader from "./ProfitHeader";
import i18n from '../../i18n';

import SkeletonLoader from "expo-skeleton-loader";

const screenWidth = Dimensions.get("window").width;


class Profit extends Component {
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
			thisMonthProfitAmount: 0.00,

			// SELL
			lastProfitGroupPage: 0,

			lastProfitHistoryPage: 0,
			lastProfitHistorySize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: "",
			loaderCount: 0,
			colorScheme: Appearance.getColorScheme()
		};

		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();

		this.flatListRef = React.createRef();
		
		this.loaderRef = React.createRef(false);
	}


	async componentDidMount() {
		console.log("Component mounted mf")
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
		thisMonthProfitAmount = isNaN(thisMonthProfitAmount) ? 0 : thisMonthProfitAmount;

		let currentDate = new Date();
		let currentMonth = currentDate.getMonth();
		let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

		if (currentMonth === lastStoredMonth) {
			this.setState({
				thisMonthProfitAmount: thisMonthProfitAmount,
				incomeTitle: i18n.t("oyIncome")
			});
		}

		let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
		let lastGroupId = lastProfitGroup.id;

		let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();


		this.setState({
			lastGroupId: lastGroupId + 11,
		}, () => {
			this.setState({
				groupedHistories: [],
				firstGroupGlobalId: firstProfitGroup.global_id,
				loading: false,
				localFullyLoaded: false
			}, () => {
				this.onEndReached();
			});
		})

		//.log("Profit mounted");

		// this.onEndReached();

		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			await AsyncStorage.setItem("window", "Profit");

			// !IMPORTANT 🔭******************************
			// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
			// Shu holatda state bilan muammo bo'lmasligi uchun bu method yozildi.

			if (await AsyncStorage.getItem("loadProfit") === "true") {
				await this.initializeScreen();

				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id;

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

				this.setState({
					lastGroupId: lastGroupId + 11,
				}, () => {
					this.setState({
						firstGroupGlobalId: firstProfitGroup.global_id,
						incomeTitle: i18n.t("oyIncome"),
						groupedHistories: [],
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
					});
				})

				await AsyncStorage.setItem("loadProfit", "false");
				// this.onEndReached();
				return;
			}

			/* Month profit amount setting value ** */
			let thisMonthProfitAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({
					thisMonthProfitAmount: thisMonthProfitAmount,
					incomeTitle: i18n.t("oyIncome")
				});
			}

			// New history created load new items **
			if (
				await AsyncStorage.getItem("profitFullyLoaded") !== null &&
				await AsyncStorage.getItem("profitFullyLoaded") !== "true"
			) {
				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id;

				this.setState({
					lastGroupId: lastGroupId + 11
				}, () => {
					this.setState({
						groupedHistories: [],
						prevFromDate: null,
						incomeTitle: i18n.t("oyIncome"),
						loading: false,
						localFullyLoaded: false
					}, () => {
						this.onEndReached()
					});
				});
				
				// Remove date
				await AsyncStorage.removeItem("ProfitFromDate");
				await AsyncStorage.removeItem("ProfitToDate");
				await AsyncStorage.setItem("profitFullyLoaded", "false");
				await this.getDateInfo();

				await AsyncStorage.setItem("profitFullyLoaded", "true");	
				return;
			}

			// Getting date removing date
			await this.getDateInfo();

			if (this.state.fromDate != null && this.state.toDate != null) {
				if (await AsyncStorage.getItem("lastWindow") == "ProfitDetail") {
					await AsyncStorage.removeItem("lastWindow");
					return;
				}

				console.log("fromDate:", this.state.fromDate);
				console.log("toDate:", this.state.toDate);

				let amount = 
					await this.amountDateRepository.getSumProfitAmountByDate(this.state.fromDate, this.state.toDate);
				let dateType = await AsyncStorage.getItem("dateType");

				if (dateType == "" || dateType == null) {
					this.setState({
						incomeTitle: this.state.calendarInputContent
					});
				} else {
					this.setState({
						incomeTitle: i18n.t(dateType + "Income")
					});
				}

				if (amount == null || amount.length < 0 || amount[0] == null || amount[0].total_amount == null) {
					this.setState({
						thisMonthProfitAmount: 0,
						groupedHistories: [],
						lastGroupId: 0,
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
					});

					return;
				}

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroupByDate(
					this.state.fromDate,
					this.state.toDate
				);
				let lastGroup =
					await this.profitHistoryRepository.getLastProfitHistoryGroupByDate(
						this.state.fromDate, this.state.toDate
					);
				let lastGroupId = lastGroup.id;

				console.log(lastGroup);

				this.setState({
					lastGroupId: lastGroupId + 11,
				}, () => {
					this.setState({
						firstGroupGlobalId: firstProfitGroup.global_id,
						groupedHistories: [],
						thisMonthProfitAmount: amount[0].total_amount,
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
					});
				});
				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id;

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

				this.setState({
					lastGroupId: lastGroupId + 11,
				}, () => {
					this.setState({
						groupedHistories: [],
						prevFromDate: null,
						incomeTitle: i18n.t("oyIncome"),
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
					});
				})
				return;
			}
		});
	}

	async getDateInfo() {
		this.setState({
			fromDate: await AsyncStorage.getItem("ProfitFromDate"),
			toDate: await AsyncStorage.getItem("ProfitToDate")
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
			this.setState({
				calendarInputContent: fromDate.substring(0, 10) + " - " + toDate.substring(0, 10),
			});
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
			thisMonthProfitAmount: 0.00,

			// SELL
			lastProfitGroupPage: 0,

			lastProfitHistoryPage: 0,
			lastProfitHistorySize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,

			loading: false,
			globalFullyLoaded: false,
			localFullyLoaded: false,
			incomeTitle: ""
		});

		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();

		this.apiService = new ApiService();

		await this.profitHistoryRepository.init();
		await this.amountDateRepository.init();
	}

	async loadMore() {
		this.loaderRef.current = true;
		let isLoaded = await this.loadLocalProfitGroups();
		if (isLoaded) {
			this.loaderRef.current = false;
			return;
		}

		this.loaderRef.current = false;
	}

	async loadLocalProfitGroups() {
		try {
			let profitHistories;
			// 
			if (this.state.fromDate != null && this.state.toDate != null) {
				profitHistories =
					await this.profitHistoryRepository.getTop11ProfitGroupByDate(this.state.lastGroupId, this.state.fromDate, this.state.toDate);
			} else {
				profitHistories =
					await this.profitHistoryRepository.getTop11ProfitGroup(this.state.lastGroupId);
			}

			if (profitHistories.length === 0 || profitHistories.length < 11) {
				console.log("profitHistories.length === 0; returned");
				this.setState({
					localFullyLoaded: true
				});
			} else {
				this.setState({
					localFullyLoaded: false
				});
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
					calendar: false
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
				groupedCopy[groupedCopy.length - 1].histories[0].calendar = false;
			}

			if (await AsyncStorage.getItem("window") != "Profit") {
				console.log("Loader turned off in loadLocalProfitGroups()")
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

	async loadTop1LocalProfitGroups() {
		try {
			const profitHistories = await this.profitHistoryRepository.getTop1ProfitGroup();

			if (profitHistories[0] == null) {
				return false;
			}

			let grouped = [...this.state.groupedHistories];

			//.log(grouped[0])
			const {id, created_date, amount} = profitHistories[0];
			
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

				grouped[0].totalAmount = await this.amountDateRepository.getProfitAmountInfoByDate(historyDate).catch(() => 0);
			} else {
				const formattedDate = this.formatDate(historyDate);

				grouped.unshift({
					date: historyDate, 
					dateInfo: formattedDate,
					histories: [...profitHistories],
					totalAmount: await this.amountDateRepository.getProfitAmountInfoByDate(historyDate).catch(() => 0)
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
			//.error('Error fetching profit histories:', error);
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
						onEndReachedThreshold={1}
						onEndReached={this.onEndReached}
						// initialNumToRender={11}
						style={{width: "100%", height: "100%"}}
						ListHeaderComponent={
							<ProfitHeader
								navigation={this.props.navigation}
								incomeTitle={this.state.incomeTitle}
								calendarInputContent={this.state.calendarInputContent}
								thisMonthProfitAmount={this.state.thisMonthProfitAmount}
							/>
						}
						onScrollEndDrag={() => {
							this.loaderRef.current = true;
						}}
						ListFooterComponent={
							(this.state.localFullyLoaded == true) ? <></>:
							(
								<SkeletonLoader 
									style={{ marginVertical: 15, marginHorizontal: 10 }} 
									boneColor={this.state.colorScheme === "dark" ? "#121212" : "#F1F1F1"}
									highlightColor={this.state.colorScheme === "dark" ? "#333333" : "#F1F1F1"} >
									
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6
										}}
										/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6
										}}
									/>
									<SkeletonLoader.Item
										style={{ 
											height: 50,
											marginTop: 4,
											width: "100%",
											paddingHorizontal: 16,
											paddingVertical: 6
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
							<ProfitGroup
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

export default Profit;