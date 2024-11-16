import React, {Component, memo} from "react";
import {StatusBar} from "expo-status-bar";
import {
	StyleSheet,
	View,
	FlatList, ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProductRepository from "../../repository/ProductRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import ApiService from "../../service/ApiService";

import ProfitGroup from "./ProfitGroup";
import _ from "lodash";
import ProfitHeader from "./ProfitHeader";

class Profit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			profitHistory: [],
			groupedHistories: [],
			currentMonthTotal: 0,
			lastGroupId: 0,
			isCollecting: false,
			calendarInputContent: "--/--/----",
			thisMonthProfitAmount: 0.00,
			notFinished: true,

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
			localFullyLoaded: false
		}

		this.productRepository = new ProductRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();

		this.onEndReached = _.debounce(this.onEndReached.bind(this), 100);
		this.flatListRef = React.createRef();
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
		const formattedDate = date.toLocaleDateString("uz", options);

		let [weekday, day] = formattedDate.split(", ");

		weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		return `${day}, ${weekday}`;
	};

	// Save not downloaded profit data
	// PROFIT
	async getProfitGroupNotDownloaded() {
		console.log("GETTING PROFIT NOT DOWNLOADED GROUPS ⏳⏳⏳");

		let profitGroups = [];
		let size = this.state.lastProfitGroupsSize;
		let page = this.state.lastProfitGroupsPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitGroupsNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching getProfitGroups():", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				console.log(profitGroups);
				break; // Indicate success and exit the loop
			}

			for (const profitGroup of response.content) {
				try {
					await this.profitHistoryRepository.createProfitGroupWithAllValues(
						profitGroup.createdDate,
						profitGroup.profit,
						profitGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getProfitGroups:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			profitGroups.push(response);
		}

		return profitGroups.length != 0;
	}

	async getProfitHistoriesNotDownloaded() {
		console.log("GETTING PROFIT HISTORIES NOT DOWNLOADED ⏳⏳⏳");

		let profitHistories = [];
		let size = this.state.lastProfitHistoriesSize;
		let page = this.state.lastProfitHistoriesPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistoriesNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				console.log(profitHistories);
				break; // Indicate success and exit the loop
			}

			for (const profitHistory of response.content) {
				console.log("PROFIT HISTORY FROM BACKEND::", profitHistory);
				try {
					let localProductsById = await this.productRepository.findProductsByGlobalId(profitHistory.productId);

					console.log("LOCAL PRODUCTS FOUND::", localProductsById);

					await this.profitHistoryRepository.createProfitHistoryWithAllValues(
						localProductsById[0].id,
						profitHistory.id,
						profitHistory.count,
						profitHistory.countType,
						profitHistory.profit,
						profitHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error getProfitHistories:", error);
					continue;
				}
			}

			page++;
			profitHistories.push(response);
		}

		return profitHistories.length != 0;
	}

	async getProfitHistoryGroupNotDownloaded() {
		console.log("GETTING PROFIT HISTORY GROUP ⏳⏳⏳")
		let profitHistoryGroup = [];
		let size = this.state.lastProfitHistoryGroupSize;
		let page = this.state.lastProfitHistoryGroupPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitHistoryGroupNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				console.log(profitHistoryGroup);
				break; // Indicate success and exit the loop
			}

			for (const profitHistoryGroup of response.content) {
				let profitGroupId = await this.profitHistoryRepository.findProfitGroupByGlobalId(profitHistoryGroup.profitGroupId);
				let profitHistoryId = await this.profitHistoryRepository.findProfitHistoryByGlobalId(profitHistoryGroup.profitHistoryId);

				try {
					await this.profitHistoryRepository.createProfitHistoryGroupWithAllValues(
						profitHistoryId[0].id,
						profitGroupId[0].id,
						profitHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getProfitHistoryGroup:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			profitHistoryGroup.push(response);
		}

		return profitHistoryGroup.length != 0;
	}

	async getProfitAmountDateNotDownloaded() {
		console.log("GETTING PROFIT AMOUNT DATE NOT DOWNLOADED ⏳⏳⏳");

		let profitAmountDate = [];
		let size = this.state.lastProfitAmountDateSize;
		let page = this.state.lastProfitAmountDatePage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getProfitAmountDateNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				console.log(profitAmountDate);
				break; // Indicate success and exit the loop
			}

			for (const profitAmountDate of response.content) {
				try {
					await this.amountDateRepository.createProfitAmountWithAllValues(
						profitAmountDate.amount,
						profitAmountDate.date,
						profitAmountDate.id,
						true
					);
				} catch (error) {
					console.error("Error getProfitAmountDate:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			profitAmountDate.push(response);
		}

		return profitAmountDate.length != 0;
	}

	async componentDidMount() {
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
			this.setState({thisMonthProfitAmount: thisMonthProfitAmount});
		}

		let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
		let lastGroupId = lastProfitGroup.id;

		let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

		this.setState({
			firstGroupGlobalId: firstProfitGroup.global_id,
			lastGroupId: lastGroupId
		});

		console.log("Profit mounted");

		this.setState({loading: true});
		await this.loadLocalProfitGroups();

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
				this.setState({thisMonthProfitAmount: thisMonthProfitAmount});
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
				let lastGroupId = lastProfitGroup.id;

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

				this.setState({loading: true});
				await this.loadLocalProfitGroups();

				await AsyncStorage.setItem("profitFullyLoaded", "true");
			}

			// Getting date removing date
			await this.getDateInfo();

			if (this.state.fromDate != null && this.state.toDate != null) {
				console.log("fromDate:", this.state.fromDate);
				console.log("toDate:", this.state.toDate);

				this.setState({
					loading: true
				});

				this.setState({
					groupedHistories: [],
					profitHistory: []
				})

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
					lastGroupId: lastGroupId
				});

				await this.loadLocalProfitGroups();

				this.setState({
					loading: false
				});

				return;
			}
			// reloading after removing date
			else if (this.state.prevFromDate != null) {
				let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
				let lastGroupId = lastProfitGroup.id;

				let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();

				this.setState({
					groupedHistories: [],
					profitHistory: [],
					firstGroupGlobalId: firstProfitGroup.global_id,
					lastGroupId: lastGroupId,
					prevFromDate: null
				});

				console.log("Profit mounted");

				this.setState({loading: true});
				await this.loadLocalProfitGroups();
			}
		});
	}

	async initializeScreen() {
		this.setState({
			profitHistory: [],
			groupedHistories: [],
			currentMonthTotal: 0,
			lastGroupId: 0,
			isCollecting: false,
			calendarInputContent: "--/--/----",
			thisMonthProfitAmount: 0.00,
			notFinished: true,

			lastProfitGroupPage: 0,

			lastProfitGroupsPage: 0,
			lastProfitGroupsSize: 10,
			lastProfitHistoriesPage: 0,
			lastProfitHistoriesSize: 10,
			lastProfitHistoryGroupPage: 0,
			lastProfitHistoryGroupSize: 10,
			lastProfitAmountDatePage: 0,
			lastProfitAmountDateSize: 10,
		})

		this.productRepository = new ProductRepository();
		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.apiService = new ApiService();
	}

	async loadMore() {
		if (this.state.loading) {
			console.log("already loading");
			return;
		}

		if (this.state.localFullyLoaded === false) {
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
				const date = history.createdDate.split("T")[0];
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
					saved: false
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
				firstGroupGlobalId: response.content[0].id,
			}));
		} catch (error) {
			console.error("Error fetching global products:", error);
		} finally {
			this.setState({loading: false});
		}
	}

	async loadLocalProfitGroups() {
		console.log("loading");

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
					lastAmount = await this.amountDateRepository.getProfitAmountInfoByDate(date).catch(() => 0);
					lastDate = date;
				}

				grouped[groupIndex].histories.push({
					id: history.id,
					created_date: history.created_date,
					profit: history.profit,
					saved: true
				});

				grouped[groupIndex].totalAmount = lastAmount;
			}

			// Update the state in one go
			const groupedCopy = grouped.map(group => ({
				...group,
				histories: group.histories.map(history => ({
					...history,
					saved: false
				}))
			}));

			const lastGroup = grouped[grouped.length - 1];
			if (lastGroup) {
				groupedCopy[groupedCopy.length - 1].histories[0].saved = true;
			}

			const startTime = performance.now();

			this.setState(prevState => ({
				profitHistory: [...prevState.profitHistory, ...profitHistories],
				groupedHistories: groupedCopy,
				lastGroupId: prevState.lastGroupId - 11,
				loading: false
			}));

			const endTime = performance.now();
			console.log(`Execution time: ${endTime - startTime} milliseconds`);

			return true;
		} catch (error) {
			this.setState({
				loading: false
			});
			console.error('Error fetching profit histories:', error);
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
			const historyDate = created_date.split("T")[0];

			if (historyDate === grouped[0].date) {
				grouped[0].histories = [{
					id,
					created_date,
					amount,
					saved: true
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
			console.log(`Execution time: ${endTime - startTime} milliseconds`);

			return true;
		} catch (error) {
			console.error('Error fetching profit histories:', error);
			return false;
		}
	}

	async onEndReached() {
		console.log("onEndReached()");
		if (!this.state.loading) {
			await this.loadMore();
		}
	}

	scrollToTop = () => {
		this.flatListRef.current?.scrollToOffset({animated: true, offset: 0});
	};

	render() {
		const {navigation} = this.props;

		return (
			<View style={styles.container}>
				<FlatList
					ref={this.flatListRef}
					data={this.state.groupedHistories}
					keyExtractor={(item) => item.date}
					onEndReachedThreshold={40}
					onEndReached={this.onEndReached}
					initialNumToRender={100}
					style={{width: "100%"}}

					ListHeaderComponent={() => (
						<ProfitHeader
							calendarInputContent={this.state.calendarInputContent}
							navigation={this.props.navigation}
							thisMonthProfitAmount={this.state.thisMonthProfitAmount}
						/>
					)}

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

export default memo(Profit);