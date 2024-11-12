import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	Dimensions,
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator
} from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import HistoryGroup from "./HistoryGroup";
import {TouchableOpacity} from 'react-native-gesture-handler';
import ShoppingHeader from "./ShoppingHeader";
import _ from 'lodash';

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
			firstGroupGlobalId: 0,

			calendarInputContent: "--/--/----",
			fromDate: null,
			toDate: null,
			prevFromDate: null, // for reloading after denpxleting
			thisMonthSellAmount: 0.00,
			notAllowed: "",

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
			localFullyLoaded: false
		};

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();

		this.apiService = new ApiService();

		this.onEndReached = _.debounce(this.onEndReached.bind(this), 100);
		this.flatListRef = React.createRef();
	}


	async componentDidMount() {
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

		let currentDate = new Date();
		let currentMonth = currentDate.getMonth();
		let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

		if (currentMonth === lastStoredMonth) {
			this.setState({thisMonthSellAmount: thisMonthSellAmount});
		}

		let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
		let lastGroupId = lastSellGroup.id;

		let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

		this.setState({
			firstGroupGlobalId: firstSellGroup.global_id,
			lastGroupId: lastGroupId
		});

		//.log("Shopping mounted");

		this.setState({loading: true});
		await this.loadLocalSellGroups();

		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			// !IMPORTANT 🔭******************************
			// Bu if bizga faqat eski user akkauntdan chiqib ketib yangi user bu telefonga login yoki register qilayotganda kerak.
			// Shu holatda state bilan muammo bo'lmasligi uchun bu method yozildi.

			if (await AsyncStorage.getItem("loadShopping") === "true") {
				await this.initializeScreen();

				await AsyncStorage.setItem("loadShopping", "false");
			}

			/* Month sell amount setting value ** */
			let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_sell_amount"));

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({thisMonthSellAmount: thisMonthSellAmount});
			}

			// If there is no history get histories
			if (this.state.groupedHistories.length <= 0) {
				this.setState({loading: true, localFullyLoaded: false});
				await this.loadLocalSellGroups();
			}

			// New history created load new items **
			if (
				await AsyncStorage.getItem("shoppingFullyLoaded") !== null &&
				await AsyncStorage.getItem("shoppingFullyLoaded") !== "true"
			) {
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

				await this.loadTop1LocalSellGroups();
				this.scrollToTop();
				await AsyncStorage.setItem("shoppingFullyLoaded", "true");
			}

			// Getting date removing date
			await this.getDateInfo();

			if (this.state.fromDate != null && this.state.toDate != null) {
				//.log("fromDate:", this.state.fromDate);
				//.log("toDate:", this.state.toDate);

				this.setState({
					loading: true
				});

				this.setState({
					groupedHistories: [],
					sellingHistory: []
				})

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
					lastGroupId: lastGroupId
				});

				await this.loadLocalSellGroups();

				this.setState({
					loading: false
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
					sellingHistory: [],
					firstGroupGlobalId: firstSellGroup.global_id,
					lastGroupId: lastGroupId,
					prevFromDate: null
				});

				//.log("Shopping mounted");

				this.setState({loading: true});
				await this.loadLocalSellGroups();
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
		const formattedDate = date.toLocaleDateString("uz", options);

		let [weekday, day] = formattedDate.split(", ");

		weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
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
			notAllowed: "",

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
			localFullyLoaded: false
		});

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();

		this.apiService = new ApiService();

		this.onEndReached = _.debounce(this.onEndReached.bind(this), 100);
		this.flatListRef = React.createRef();

		await this.sellHistoryRepository.init();
		await this.amountDateRepository.init();
	}

	async loadMore() {	
		if (this.state.localFullyLoaded === false) {
			this.setState({loading: true});
			let isLoaded = await this.loadLocalSellGroups();
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
				const date = history.createdDate.split("T")[0];
				let group = grouped.find(group => group.date === date);

				if (!group) {
					const formattedDate = this.formatDate(date);
					group = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
					grouped.push(group);
				}

				group.histories.push({
					id: history.id + 10000000,
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
				const date = history.created_date.split("T")[0];
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

			const startTime = performance.now();

			this.setState(prevState => ({
				sellingHistory: [...prevState.sellingHistory, ...sellHistories],
				groupedHistories: groupedCopy,
				lastGroupId: prevState.lastGroupId - 11,
				loading: false
			}));

			const endTime = performance.now();
			//.log(`Execution time: ${endTime - startTime} milliseconds`);

			return true;
		} catch (error) {
			this.setState({
				loading: false
			});
			//.error('Error fetching sell histories:', error);
			return false;
		}
	}

	async loadTop1LocalSellGroups() {
		//.log("loading");

		try {
			const sellHistories = await this.sellHistoryRepository.getTop1SellGroup();

			if (!sellHistories[0]) {
				return false;
			}

			let grouped = [...this.state.groupedHistories];

			//.log(grouped[0])
			const {id, created_date, amount} = sellHistories[0];
			const historyDate = created_date.split("T")[0];

			if (historyDate === grouped[0].date) {
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

			const endTime = performance.now();
			//.log(`Execution time: ${endTime - startTime} milliseconds`);

			return true;
		} catch (error) {
			//.error('Error fetching sell histories:', error);
			return false;
		}
	}

	async onEndReached() {
		//.log("onEndReached()");
		if (this.state.loading) return;

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
								navigation={navigation}/>
						)}
					/>
				</View>


				{/* Role error */}
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

					<Animatable.View
						animation="bounceInUp" delay={0} iterationCount={1} direction="alternate"
						style={{
							height: screenHeight,
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}>
						<View style={{
							width: screenWidth - (16 * 2),
							maxWidth: 343,
							marginLeft: "auto",
							marginRight: "auto",
							flex: 1,
							alignItems: "center",
							justifyContent: "flex-end",
							marginBottom: 120
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
						</View>
					</Animatable.View>
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