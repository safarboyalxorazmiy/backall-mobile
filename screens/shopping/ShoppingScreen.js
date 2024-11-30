import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	Dimensions,
	StyleSheet,
	View,
	FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import HistoryGroup from "./HistoryGroup";
import ShoppingHeader from "./ShoppingHeader";
import i18n from '../../i18n';
import SkeletonLoader from "../SkeletonLoader";
import TokenService from "../../service/TokenService";
import DatabaseRepository from "../../repository/DatabaseRepository";

const screenWidth = Dimensions.get("window").width;


class Shopping extends Component {
	constructor(props) {
		super(props);

		this.state = {
			groupedHistories: [],
			loadCount: 0,
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
		};

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();
		this.tokenService = new TokenService();
		this.databaseRepository = new DatabaseRepository();

		this.flatListRef = React.createRef();
		
		this.loaderRef = React.createRef(false);
	}


	async componentDidMount() {
		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			// !IMPORTANT 🔭******************************
			// Bu yerda foydalanuvchi tokeni bor yoki yo'qligini tekshiradi 
			// agar token yo'q bo'lsa unda login oynasiga otadi.
			let isLoggedIn = await this.tokenService.checkTokens();
			if (!isLoggedIn) {
				//.log("LOGGED OUT BY 401 FROM HOME")
				await this.databaseRepository.clear();
				await AsyncStorage.clear();
				navigation.navigate("Login");
				return;
			}
			//************************************

			// !IMPORTANT 🔭******************************
			// Bu yerda agar yangi telefondan login bo'lsa ya'ni apidan 401 kelsa login oynasiga otadi.
			let authError = await AsyncStorage.getItem("authError");
			if (authError != null && authError == "true") {
				//.log("LOGGED OUT BY 401 FROM HOME")
				await this.databaseRepository.clear();
				await AsyncStorage.clear();
				navigation.navigate("Login");
				return;	
			}
			//************************************

			await AsyncStorage.setItem("window", "Shopping");

			// !IMPORTANT 🔭******************************
			// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
			// Shu holatda state bilan muammo bo'lmasligi uchun bu method yozildi.

			if (await AsyncStorage.getItem("loadShopping") === "true") {
				await this.initializeScreen();

				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

				this.setState({
					lastGroupId: lastGroupId + 11,
				}, () => {
					this.setState({
						incomeTitle: i18n.t("oyIncome"),
						groupedHistories: [],
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
					})
				});

				await AsyncStorage.setItem("loadShopping", "false");
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
				if (this.state.prevFromDate != null || this.state.fromDate != null || this.state.toDate != null) {
					let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
					let lastGroupId = lastSellGroup.id;
		
					this.setState({
						prevFromDate: null,
						fromDate : null,
						toDate: null
					}, () => {
						this.setState({
							lastGroupId: lastGroupId + 11,
						}, () => {
							this.setState({
								groupedHistories: [],
								incomeTitle: i18n.t("oyIncome"),
								localFullyLoaded: false,
							}, () => {
								this.onEndReached();
							});	
						});
					});
					
					// Remove date
					await AsyncStorage.removeItem("ShoppingFromDate");
					await AsyncStorage.removeItem("ShoppingToDate");
					await AsyncStorage.setItem("shoppingFullyLoaded", "true");	
					await this.getDateInfo();
					return;
				}
				

				// If there is no history get histories
				if (this.state.groupedHistories.length <= 0) {
					let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
					let lastGroupId = lastSellGroup.id;

					this.setState({
						lastGroupId: lastGroupId + 11,
					}, () => {
						this.setState({
							localFullyLoaded: false, 
							groupedHistories: [],
							incomeTitle: i18n.t("oyIncome"),
							fromDate : null,
							toDate: null,
							prevFromDate:null
						}, () => {
							this.onEndReached();
						});
					});

					// Remove date
					await AsyncStorage.removeItem("ShoppingFromDate");
					await AsyncStorage.removeItem("ShoppingToDate");
					await AsyncStorage.setItem("shoppingFullyLoaded", "true");	
					await this.getDateInfo();
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
				await this.getDateInfo();

				if (await AsyncStorage.getItem("lastWindow") == "ShoppingDetail") {
					await AsyncStorage.removeItem("lastWindow");
					return;
				}

				//.log("fromDate:", this.state.fromDate);
				//.log("toDate:", this.state.toDate);

				let amount = 
					await this.amountDateRepository.getSumSellAmountByDate(this.state.fromDate, this.state.toDate);
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
						thisMonthSellAmount: 0,
						groupedHistories: [],
						lastGroupId: 0,
						localFullyLoaded: false
					}, () => {
						this.onEndReached();
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

				//.log(lastGroup);

				this.setState({
					lastGroupId: lastGroupId + 11,
					firstGroupGlobalId: firstSellGroup.global_id,
					thisMonthSellAmount: amount[0].total_amount,
					localFullyLoaded: false
				}, () => {
					this.setState({
						groupedHistories: []
					}, () => {
						this.onEndReached();
					});
				})
				
				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
				let lastGroupId = lastSellGroup.id;

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
					})
				});
				return;
			}
		});


		//.log("Component mounted mf")
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

		// New history created load new items **
		if (
			await AsyncStorage.getItem("shoppingFullyLoaded") !== null &&
			await AsyncStorage.getItem("shoppingFullyLoaded") !== "true"
		) {
			await AsyncStorage.setItem("shoppingFullyLoaded", "true");	
		}

		let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
		let lastGroupId = lastSellGroup.id;

		this.setState({
			lastGroupId: lastGroupId + 11
		}, () => {
			this.setState({
				loading: false,
				localFullyLoaded: false,
				groupedHistories: []
			}, () => {
				this.onEndReached();
			});
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
			loadCount: 0,
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
			loadCount: 0
		});

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();

		this.apiService = new ApiService();

		await this.sellHistoryRepository.init();
		await this.amountDateRepository.init();
	}

	async loadMore() {
		await this.loadLocalSellGroups();
	}

	async loadLocalSellGroups() {
		try {
			this.setState({
				loading: true
			});

			let sellHistories;
			// 
			if (this.state.fromDate != null && this.state.toDate != null) {
				sellHistories =
					await this.sellHistoryRepository.getTop11SellGroupByDate(this.state.lastGroupId, this.state.fromDate, this.state.toDate);
			} else {
				sellHistories =
					await this.sellHistoryRepository.getTop11SellGroup(this.state.lastGroupId);
			}

			if (sellHistories.length === 0 || sellHistories.length < 11) {
				//.log("sellHistories.length === 0; returned lastGroupId::", this.state.lastGroupId);
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

			for (const history of sellHistories) {
				const currentDate = new Date(history.created_date);
				const date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

				//.log(date);

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

			if (await AsyncStorage.getItem("window") != "Shopping") {
				//.log("Loader turned off in loadLocalSellGroups()");
				this.setState({
					loading: false,
					// lastGroupId: this.state.lastGroupId + 11
				});
				return false;
			}
	
			this.setState({
				groupedHistories: groupedCopy
			});

			if ((this.state.loadCount - 1) === 0) {
				this.setState({
					loading: false,
					loadCount: this.state.loadCount - 1
				});
				return true;
			} else {
				this.setState({
					loadCount: this.state.loadCount - 1,
					lastGroupId: this.state.lastGroupId - 11
				}, async () => {
					await this.loadLocalSellGroups();
				});
			}
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
			
			//.log("created_date::", created_date);
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
				//.log("Length updated::", grouped[0].histories.length);

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

	onEndReached = () => {
		if (this.state.loading == true) {
			this.setState({
				loadCount: this.state.loadCount + 1
			});
			return;
		};

		this.setState(state => ({
			lastGroupId: state.lastGroupId - 11,
			loadCount: state.loadCount + 1,
			loading: true
		}), () => {
			this.loadMore();
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
							<ShoppingHeader
								navigation={this.props.navigation}
								incomeTitle={this.state.incomeTitle}
								calendarInputContent={this.state.calendarInputContent}
								thisMonthSellAmount={this.state.thisMonthSellAmount}
							/>
						}
						ListFooterComponent={
							this.state.localFullyLoaded ? <></> : <SkeletonLoader />
						}

						renderItem={({item}) => (
							<HistoryGroup
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