import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	FlatList
} from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProductRepository from "../../repository/ProductRepository";
import ApiService from "../../service/ApiService";

import CalendarIcon from "../../assets/calendar-icon.svg";
import CrossIcon from "../../assets/cross-icon-light.svg";
import HistoryGroup from "./HistoryGroup";


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

			loading: false
		};

		this.sellHistoryRepository = new SellHistoryRepository();
		this.amountDateRepository = new AmountDateRepository();
		this.productRepository = new ProductRepository();
		this.apiService = new ApiService();
	}

	async getSellGroupNotDownloaded() {
		console.log("GETTING NOT DOWNLOADED SELL GROUPS ⏳⏳⏳");

		let sellGroups = [];
		let size = this.state.lastSellGroupsSize;
		let page = this.state.lastSellGroupsPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getSellGroupsNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false;
			}

			if (!response || !response.content || response.content.length === 0) {
				break;
			}

			for (const sellGroup of response.content) {
				try {
					await this.sellHistoryRepository.createSellGroupWithAllValues(
						sellGroup.createdDate,
						sellGroup.amount,
						sellGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getSellGroups:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			sellGroups.push(response);
		}

		return sellGroups.length != 0;
	}

	async getSellHistoryNotDownloaded() {
		console.log("GETTING NOT DOWNLOADED SELL HISTORIES ⏳⏳⏳");

		let sellHistories = [];
		let size = this.state.lastSellHistoriesSize;
		let page = this.state.lastSellHistoriesPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistoriesNotDownloaded(page, size, this.props.navigation);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				break;
			}

			if (!response || !response.content || response.content.length === 0) {
				console.log(sellHistories);
				return true; // Indicate success and exit the loop
			}

			for (const sellHistory of response.content) {
				if (sellHistory == undefined) {
					continue;
				}

				let productsByGlobalId =
					await this.productRepository.findProductsByGlobalId(sellHistory.productId);
				try {
					await this.sellHistoryRepository.createSellHistoryWithAllValues(
						productsByGlobalId[0].id,
						sellHistory.id,
						sellHistory.count,
						sellHistory.countType,
						sellHistory.sellingPrice,
						sellHistory.createdDate,
						true
					);
				} catch (error) {
					console.error("Error getSellHistories:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			sellHistories.push(response);
		}

		return sellHistories.length != 0;
	}

	async getSellHistoryGroupNotDownloaded() {
		console.log("GETTING NOT DOWNLOADED SELL HISTORY GROUP ⏳⏳⏳");

		let sellHistoryGroup = [];
		let size = this.state.lastSellHistoryGroupSize;
		let page = this.state.lastSellHistoryGroupPage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getSellHistoriesNotDownloaded(
					page, size, this.props.navigation
				);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				break;
			}

			for (const sellHistoryGroup of response.content) {
				let sellGroupId =
					await this.sellHistoryRepository.findSellGroupByGlobalId(
						sellHistoryGroup.sellGroupId
					);

				let sellHistoryId =
					await this.sellHistoryRepository.findSellHistoryByGlobalId(
						sellHistoryGroup.sellHistoryId
					);

				try {
					await this.sellHistoryRepository.createSellHistoryGroupWithAllValues(
						sellHistoryId[0].id,
						sellGroupId[0].id,
						sellHistoryGroup.id,
						true
					);
				} catch (error) {
					console.error("Error getSellHistoryGroup:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			sellHistoryGroup.push(response);
		}

		return sellHistoryGroup.length != 0;
	}

	async getSellAmountDateNotDownloaded() {
		console.log("GETTING NOT DOWNLOADED SELL AMOUNT DATE ⏳⏳⏳");

		let sellAmountDate = [];
		let size = this.state.lastSellAmountDateSize;
		let page = this.state.lastSellAmountDatePage;

		while (true) {
			let response;
			try {
				response = await this.apiService.getSellAmountDateNotDownloaded(
					page, size, this.props.navigation
				);
			} catch (error) {
				console.error("Error fetching global products:", error);
				this.setState({
					lastSize: size,
					lastPage: page
				});

				return false; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
				break;
			}

			for (const sellAmountDate of response.content) {
				try {
					await this.amountDateRepository.createSellAmountWithAllValues(
						sellAmountDate.amount,
						sellAmountDate.date,
						sellAmountDate.id,
						true
					);
				} catch (error) {
					console.error("Error getSellAmountDate:", error);
					// Continue with next product
					continue;
				}
			}

			page++;
			sellAmountDate.push(response);
		}

		return sellAmountDate.length != 0;
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

	groupByDate = async (histories) => {
		// console.log("STARTED");

		const grouped = {}; // Use a plain object for grouping
		const uniqueDates = new Set();

		// Single loop to gather unique dates and group histories
		for (const history of histories) {
			const date = history.created_date.split("T")[0];
			if (!grouped[date]) {
				uniqueDates.add(date);
				const formattedDate = this.formatDate(date);
				grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
			}
			grouped[date].histories.push(history);
		}

		// Fetch total amounts in batch for all unique dates
		const totalAmounts = await this.amountDateRepository.getSellAmountInfoByDates([...uniqueDates]);

		// Loop through unique dates to set total amounts
		for (const date of uniqueDates) {
			grouped[date].totalAmount = totalAmounts[date] || 0;
		}


		return Object.values(grouped);
	};


	/*groupByDate = async (histories) => {
					console.log("Started")
	const startTime = performance.now(); // Start measuring time

	const grouped = new Map();
	const uniqueDates = new Set();

	// First loop to gather unique dates and group histories by date
	for (const history of histories) {
					const date = history.created_date.split("T")[0];
					if (!grouped.has(date)) {
									const formattedDate = this.formatDate(date);
									grouped.set(date, { date, dateInfo: formattedDate, histories: [], totalAmount: 0 });
					}
					grouped.get(date).histories.push(history);
					uniqueDates.add(date);
	}

	// Batch fetch total amounts asynchronously
	const fetchAmountPromises = Array.from(uniqueDates).map(date =>
					this.amountDateRepository.getSellAmountInfoByDate(date)
									.then(amount => ({ date, amount }))
									.catch(error => {
													console.error(`Error fetching amount for date ${date}:`, error);
													return { date, amount: 0 }; // Handle error gracefully
									})
	);

	// Wait for all fetch operations to complete
	const totalAmountsArray = await Promise.all(fetchAmountPromises);
	const totalAmounts = totalAmountsArray.reduce((acc, { date, amount }) => {
					acc[date] = amount;
					return acc;
	}, {});

	// Set total amounts in the grouped data
	for (const [date, data] of grouped) {
					data.totalAmount = totalAmounts[date] || 0;
	}

	const endTime = performance.now(); // Stop measuring time
	const executionTime = endTime - startTime; // Calculate execution time in milliseconds
	console.log(`Execution time: ${executionTime} milliseconds`);

	return Array.from(grouped.values());
	};*/

	formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = {day: "numeric", month: "long", weekday: "long"};
		const formattedDate = date.toLocaleDateString("uz", options);

		let [weekday, day] = formattedDate.split(", ");

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

	/*async loadMore() {
			if (this.state.loading) {
					return;
			}

			let response;
			try {
					response =
							await this.apiService.getSellGroups(
									this.state.firstGroupGlobalId,
									this.state.lastSellGroupPage,
									11,
									this.props.navigation
							);
			} catch (error) {
					console.error("Error fetching global products:", error);

					return; // Indicate failure
			}

			if (!response || !response.content || response.content.length === 0) {
					return; // Indicate success and exit the loop
			}

			let lastGroupId = this.state.lastGroupId;
			let allSellHistories = this.state.sellingHistory;

			const startTime = performance.now();

			const grouped = [...this.state.groupedHistories];
			const uniqueDates = new Set();

			for (const history of response.content) {

					allSellHistories.push({
							id: lastGroupId,
							created_date: history.createdDate,
							amount: history.amount,
							saved: false
					});

					const date = history.createdDate.split("T")[0];


					if (!grouped[date]) {
							uniqueDates.add(date);
							const formattedDate = this.formatDate(date);
							grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
					}
					grouped[date].histories.push({
							id: lastGroupId,
							created_date: history.createdDate,
							amount: history.amount,
							saved: false
					});


					lastGroupId++;
			}

			const totalAmounts =
					await this.amountDateRepository.getSellAmountInfoByDates([...uniqueDates]);

			console.log(totalAmounts)

			for (const date of uniqueDates) {
					grouped[date].totalAmount = totalAmounts[date] || 0;
			}

			console.log(response.content[0].id);

			this.setState({
					sellingHistory: allSellHistories,
					groupedHistories: Object.values(grouped),
					lastGroupId: lastGroupId,
					firstGroupGlobalId: response.content[0].id
			});

			const endTime = performance.now();
			const executionTime = endTime - startTime;
			console.log(`Execution time: ${executionTime} milliseconds`);
	}*/

	/*async loadMore() {
			if (this.state.loading) {
					return;
			}

			this.setState({
					loading: true
			});

			let response;
			try {
					response = await this.apiService.getSellGroups(
							this.state.firstGroupGlobalId,
							this.state.lastSellGroupPage,
							11,
							this.props.navigation
					);
			}
			catch (error) {
					this.setState({
							loading: false
					});
					console.error("Error fetching global products:", error);
					return; // Exit early on failure
			}

			if (!response || !response.content || response.content.length === 0) {
					this.setState({
							loading: false
					});
					return; // Exit if no data
			}

			let lastGroupId = this.state.lastGroupId;
			let allSellHistories = [...this.state.sellingHistory];
			let grouped = [...this.state.groupedHistories];
			const uniqueDates = new Set();

			const startTime = performance.now();

			response.content.forEach(history => {
					const date = history.createdDate.split("T")[0];

					allSellHistories.push({
							id: lastGroupId,
							created_date: history.createdDate,
							amount: history.amount,
							saved: false
					});

					let group = grouped.find(g => g.date === date);

					if (group) {
							group.histories.push({
									id: lastGroupId,
									created_date: history.createdDate,
									amount: history.amount,
									saved: false
							});
					} else {
							uniqueDates.add(date);
							grouped.push({
									date,
									dateInfo: this.formatDate(date),
									histories: [{
											id: lastGroupId,
											created_date: history.createdDate,
											amount: history.amount,
											saved: false
									}],
									totalAmount: 0
							});
					}


					lastGroupId++;
			});

			const totalAmounts = await this.amountDateRepository.getSellAmountInfoByDates([...uniqueDates]);

			grouped.forEach(group => {
					if (uniqueDates.has(group.date)) {
							group.totalAmount = totalAmounts[group.date] || 0;
					}
			});

			this.setState({
					sellingHistory: allSellHistories,
					groupedHistories: Object.values(grouped),
					lastGroupId: lastGroupId,
					firstGroupGlobalId: response.content[0].id
			});

			console.log("firstGroupGlobalId:: ", response.content[0].id)

			const endTime = performance.now();
			console.log(`Execution time: ${endTime - startTime} milliseconds`);

			this.setState({
					loading: false
			});
	}*/

	/*async loadMore() {
			if (this.state.loading) {
					return;
			}

			this.setState({loading: true});

			let response;
			try {
					response = await this.apiService.getSellGroups(
							this.state.firstGroupGlobalId,
							this.state.lastSellGroupPage,
							11,
							this.props.navigation
					);
			} catch (error) {
					this.setState({loading: false});
					console.error("Error fetching global products:", error);
					return;
			}

			if (!response || !response.content || response.content.length === 0) {
					this.setState({loading: false});
					return;
			}

			let lastGroupId = this.state.lastGroupId;
			let allSellHistories = response.content;
			const grouped = [...this.state.groupedHistories];  // Ensure this is treated as an object
			const uniqueDates = new Set();

			for (const history of allSellHistories) {
					const date = history.createdDate.split("T")[0];

					let added = false;
					for (let i = 0; i < grouped.length; i++) {
							if (grouped[i].date == date) {
									grouped[i].histories.push({
											id: lastGroupId,
											created_date: history.createdDate,
											amount: history.amount,
											saved: false
									});

									added = true;
									break;
							}
					}

					if (added === false) {
							uniqueDates.add(date);
							const formattedDate = this.formatDate(date);
							grouped.push({
									date, dateInfo: formattedDate, histories: [{
											id: lastGroupId,
											created_date: history.createdDate,
											amount: history.amount,
											saved: false
									}
									], totalAmount: 0
							});
					}

					lastGroupId++;
			}

			this.setState(prevState => ({
					sellingHistory: [...prevState.sellingHistory, ...allSellHistories],
					groupedHistories: grouped,  // Maintain it as an object
					lastGroupId: lastGroupId,
					firstGroupGlobalId: response.content[0].id,
					loading: false
			}));
	}*/

	async loadMore() {
		if (this.state.loading) {
			return;
		}

		this.setState({loading: true});

		let response;
		try {
			response = await this.apiService.getSellGroups(
				this.state.firstGroupGlobalId,
				this.state.lastSellGroupPage,
				22,
				this.props.navigation
			);
		} catch (error) {
			this.setState({loading: false});
			console.error("Error fetching global products:", error);
			return;
		}

		if (!response || !response.content || response.content.length === 0) {
			this.setState({loading: false});
			return;
		}

		let lastGroupId = this.state.lastGroupId;
		let allSellHistories = response.content;
		let grouped = [...this.state.groupedHistories];  // Shallow copy of the array

		for (const history of allSellHistories) {
			const date = history.createdDate.split("T")[0];
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

			grouped[groupIndex].histories.push({
				id: lastGroupId,
				created_date: history.createdDate,
				amount: history.amount,
				saved: false
			});

			// Update totalAmount if needed
			grouped[groupIndex].totalAmount += history.amount;  // Assuming totalAmount is a sum of the amounts

			lastGroupId++;
		}

		this.setState(prevState => ({
			sellingHistory: [...prevState.sellingHistory, ...allSellHistories],
			groupedHistories: grouped,  // Update with the modified array
			lastGroupId: lastGroupId,
			firstGroupGlobalId: response.content[0].id,
			loading: false
		}));
	}


	async componentDidMount() {
		let lastSellGroup = await this.sellHistoryRepository.getLastSellGroup();
		let lastGroupId = lastSellGroup.id;

		let firstSellGroup = await this.sellHistoryRepository.getFirstSellGroup();

		console.log(firstSellGroup);

		const allSellHistories = [];

		console.log(lastSellGroup.global_id);
		this.setState({
			firstGroupGlobalId: firstSellGroup.global_id,
			loading: true
		});

		while (true) {
			if (lastGroupId <= 0 || await AsyncStorage.getItem("window") != "Shopping") {
				this.setState({
					loading: false
				});
				break;
			}

			console.log("LAST GROUP ID: ", lastGroupId);

			try {
				let sellHistories = await this.sellHistoryRepository.getAllSellGroup(lastGroupId);

				if (sellHistories.length === 0) {
					this.setState({
						loading: false
					});
					break;
				}

				allSellHistories.push(...sellHistories);

				lastGroupId -= 11;

				await new Promise(resolve => setTimeout(resolve, 100)); // Adding delay to manage UI thread load
			} catch (error) {
				console.error('Error fetching sell histories:', error);
				this.setState({
					loading: false
				});
				break;
			}

			const startTime = performance.now();

			const grouped = {};
			const uniqueDates = new Set();

			for (const history of allSellHistories) {
				const date = history.created_date.split("T")[0];
				if (!grouped[date]) {
					uniqueDates.add(date);
					const formattedDate = this.formatDate(date);
					grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
				}
				grouped[date].histories.push(history);
			}

			const totalAmounts = await this.amountDateRepository.getSellAmountInfoByDates([...uniqueDates]);

			console.log(totalAmounts)

			for (const date of uniqueDates) {
				grouped[date].totalAmount = totalAmounts[date] || 0;
			}

			this.setState({
				sellingHistory: allSellHistories,
				groupedHistories: Object.values(grouped),
				lastGroupId: lastGroupId,

			});

			const endTime = performance.now();
			const executionTime = endTime - startTime;
			console.log(`Execution time: ${executionTime} milliseconds`);
		}

		this.setState({
			loading: false
		});

		this.props.navigation.addListener("focus", async () => {
			await this.getDateInfo();

			// New history created load new items **
			if (await AsyncStorage.getItem("shoppingFullyLoaded") != "true") {
				// When new item created we load one item then we add it to the top selling history right there
				this.setState({
					loading: true
				});

				const startTime = performance.now();

				try {
					// Fetch the top 1 selling history group
					let top1SellingHistory = await this.sellHistoryRepository.getTop1SellGroup();

					// Get the current grouped histories from the state
					let groupedHistories = [...this.state.groupedHistories]; // Clone the state array

					// Extract and format the date from the top-selling history
					const date = top1SellingHistory[0].created_date.split("T")[0];

					// Flag to check if date exists
					let dateFound = false;

					// Iterate through each grouped history to find matching date
					for (let i = 0; i < groupedHistories.length; i++) {
						if (groupedHistories[i].date === date) {
							console.log(date);
							groupedHistories[i] = {
								...groupedHistories[i],
								histories: [...top1SellingHistory, ...groupedHistories[i].histories]
							};
							dateFound = true;
							break; // Exit the loop early since the match is found
						}
					}

					if (!dateFound) {
						// If date is not found, fetch and group by date, then update state
						let top1SellingHistoryGr = await this.groupByDate(top1SellingHistory);
						groupedHistories = [...top1SellingHistoryGr, ...groupedHistories];
					}

					// Update the state with the modified grouped histories
					this.setState({groupedHistories}, async () => {
						// Store the updated state in AsyncStorage
						await AsyncStorage.setItem("window", "Shopping");
						await AsyncStorage.setItem("shoppingFullyLoaded", "true");
					});

					const endTime = performance.now();
					const executionTime = endTime - startTime;
					console.log(`Execution time: ${executionTime} milliseconds`);
					this.setState({
						loading: false
					});

					return;
				} catch (error) {
					this.setState({
						loading: false
					});
					console.error('Error fetching or updating sell history:', error);
				}
			}

			// Load rest of items if exists **
			let lastGroupId = this.state.lastGroupId;
			let allSellHistories = this.state.sellingHistory;

			this.setState({
				loading: true
			});

			while (true) {
				if (lastGroupId <= 0 || await AsyncStorage.getItem("window") != "Shopping") {
					this.setState({
						loading: false
					});
					break;
				}

				console.log("LAST GROUP ID: ", lastGroupId);

				try {
					let sellHistories =
						await this.sellHistoryRepository.getAllSellGroup(lastGroupId);

					if (sellHistories.length === 0) {
						this.setState({
							loading: false
						});
						break;
					}

					allSellHistories.push(...sellHistories);

					lastGroupId -= 11;

					await new Promise(resolve => setTimeout(resolve, 100)); // Adding delay to manage UI thread load
				} catch (error) {
					this.setState({
						loading: false
					});

					console.error('Error fetching sell histories:', error);
					break;
				}

				const startTime = performance.now();

				const grouped = {};
				const uniqueDates = new Set();

				for (const history of allSellHistories) {
					const date = history.created_date.split("T")[0];
					if (!grouped[date]) {
						uniqueDates.add(date);
						const formattedDate = this.formatDate(date);
						grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
					}
					grouped[date].histories.push(history);
				}

				const totalAmounts = await this.amountDateRepository.getSellAmountInfoByDates([...uniqueDates]);

				for (const date of uniqueDates) {
					grouped[date].totalAmount = totalAmounts[date] || 0;
				}

				this.setState({
					sellingHistory: allSellHistories,
					groupedHistories: Object.values(grouped),
					lastGroupId: lastGroupId
				});

				const endTime = performance.now();
				const executionTime = endTime - startTime;
				console.log(`Execution time: ${executionTime} milliseconds`);
			}

			this.setState({
				loading: false
			});

			/* FOR BOSS (MODAL) **
			let notAllowed = await AsyncStorage.getItem("not_allowed");
			this.setState({notAllowed: notAllowed}) */

			/* Month sell amount setting value ** */
			let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_sell_amount"));

			let currentDate = new Date();
			let currentMonth = currentDate.getMonth();
			let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

			if (currentMonth === lastStoredMonth) {
				this.setState({thisMonthSellAmount: thisMonthSellAmount});
			}
		});
	}

	render() {
		const {navigation} = this.props;

		return (
			<View style={[styles.container, Platform.OS === "web" && {width: "100%"}]}>
				<View style={{width: "100%", height: "100%"}}>
					<FlatList
						data={this.state.groupedHistories}
						extraData={this.state.groupedHistories}
						keyExtractor={(item) => item.date}
						estimatedItemSize={200}
						onEndReachedThreshold={2}
						onScroll={async () => {
							console.log("onEndReached()");
							await this.loadMore();
						}}

						ListHeaderComponent={() => (
							<>
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
												this.state.calendarInputContent === "--/--/----" ?
													styles.calendarInput :
													styles.calendarInputActive
											]}>
											<Text
												style={[
													this.state.calendarInputContent === "--/--/----" ?
														styles.calendarInputPlaceholder :
														styles.calendarInputPlaceholderActive
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
							</>
						)}

						renderItem={({item}) => (
							<HistoryGroup key={item.date} item={item}/>
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