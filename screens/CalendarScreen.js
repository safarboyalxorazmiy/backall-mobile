import React, { Component, memo, createRef } from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TouchableHighlight
} from "react-native";
import BackIcon from "../assets/arrow-left-icon.svg";
import DeleteIcon from "../assets/delete-icon.svg";
import CalendarIcon from "../assets/blue-calendar-icon.svg";
import { TextInput } from "react-native-gesture-handler";
import ActionSheet from 'react-native-actions-sheet';

import { RangeCalendar } from '@ui-kitten/components';
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const MemoizedRangeCalendar = memo(RangeCalendar);
const MemoizedCalendarIcon = memo(CalendarIcon);

class CalendarPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isModalVisible: false,
			fromDate: this.getCurrentDateString(),
			toDate: this.getCurrentDateString(),
			dateType: "Bugun", // Bugun, Hafta, Oy
			selectingDateType: "", // "FROM", "TO"
			calendarFromPage: "", // "Profit", "Shopping"

			fromDayInputValue: this.getCurrentDay(),
			fromMonthInputValue: this.getCurrentMonth(),
			fromYearInputValue: this.getCurrentYear(),

			toDayInputValue: this.getCurrentDay(),
			toMonthInputValue: this.getCurrentMonth(),
			toYearInputValue: this.getCurrentYear(),
			range: {
				startDate: null,
				endDate: null
			}
		};

		this.modal = new createRef();
	}

	// "calendarFromPage": "Profit",
	// "calendarFromPage": "Shopping"
	async componentDidMount() {
		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			this.setState({calendarFromPage: await AsyncStorage.getItem("calendarFromPage")});
		});
	}

	getCurrentDateString() {
		const currentDate = new Date();
		const localDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000));

		const year = localDate.getFullYear();
		const month = String(localDate.getMonth() + 1).padStart(2, "0");
		const day = String(currentDate.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	getCurrentMonth() {
		const date = new Date();
		const uzbekMonths = [
			"yanvar", "fevral", "mart", "aprel", "may", "iyun",
			"iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
		];
		const monthIndex = date.getMonth(); // Returns 0 for January, 11 for December
		const lowerCaseMonth = uzbekMonths[monthIndex];
		return lowerCaseMonth;
	}

	getCurrentDay() {
		const date = new Date();
		const options = {day: "numeric"};
		const formattedDate = date.toLocaleDateString("uz-UZ", options);

		const [day] = formattedDate.split(" ");
		const paddedDay = String(day).padStart(2, "0");
		return paddedDay;
	}

	getCurrentYear() {
		const date = new Date();
		const options = {year: "numeric"};
		const formattedDate = date.toLocaleDateString("uz-UZ", options);

		const [year] = formattedDate.split(" ");
		return year;
	}

	getMonth(dateString) {
		const dateObj = new Date(dateString);
		const options = {month: "long"};
		const formattedDate = dateObj.toLocaleDateString("uz-UZ", options);

		const [month] = formattedDate.split(" ");
		const lowerCaseMonth = month.charAt(0).toLowerCase() + month.slice(1);

		return lowerCaseMonth;
	}

	getMonthIndexWithName(name) {
		name = name.toLowerCase();
		const monthNamesUzbek = [
			"yanvar", "fevral", "mart", "aprel", "may", "iyun",
			"iyul", "avgust", "sentabr", "oktyabr", "noyabr", "dekabr"
		];

		const monthIndex = monthNamesUzbek.indexOf(name);

		if (monthIndex !== -1) {
			// Add 1 to the index, and use String to ensure it"s a string
			return String(monthIndex + 1).padStart(2, "0");
		} else {
			return "-1"; // or any other indicator for not found
		}
	}

	onDayPress = (date) => {
		// date: {"dateString": "2024-02-19", "day": 19, "month": 2, "timestamp": 1708300800000, "year": 2024};

		if (this.state.selectingDateType === "FROM") {
			this.setState({
				fromMonthInputValue: this.getMonth(date.dateString),
				fromDayInputValue: date.dateString.substring(8),
				fromYearInputValue: date.dateString.substring(0, 4),
				fromDate: date.dateString
			});
		} else {
			this.setState({
				toMonthInputValue: this.getMonth(date.dateString),
				toDayInputValue: date.dateString.substring(8),
				toYearInputValue: date.dateString.substring(0, 4),
				toDate: date.dateString
			});
		}
	};

	setForMonth() {
		let currentDate = new Date();
		const localDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000));
		const thisMonthName = this.getMonth(localDate.toDateString());
		const thisMonthIndex = String(localDate.getMonth() + 1).padStart(2, "0");

		localDate.setMonth(localDate.getMonth() - 1);

		if (localDate.getMonth() === 11) {
			localDate.setFullYear(localDate.getFullYear() - 1);
		}

		const lastMonthName = this.getMonth(localDate.toDateString());
		const lastMonthIndex = String(localDate.getMonth() + 1).padStart(2, "0");

		const thisDay = String(currentDate.getDate()).padStart(2, "0");
		const thisYear = localDate.getFullYear();
		const lastDay = String(currentDate.getDate()).padStart(2, "0");
		const lastYear = localDate.getFullYear();

		let fromDateString = `${localDate.getFullYear()}-${thisMonthIndex}-${String(currentDate.getDate()).padStart(2, "0")}`;
		let toDateString = `${localDate.getFullYear()}-${lastMonthIndex}-${String(currentDate.getDate()).padStart(2, "0")}`;

		this.setState({
			fromDayInputValue: thisDay + "",
			toDayInputValue: lastDay + "",

			fromYearInputValue: thisYear + "",
			toYearInputValue: lastYear + "",
			fromMonthInputValue: thisMonthName,
			toMonthInputValue: lastMonthName,
			fromDate: fromDateString,
			toDate: toDateString
		});

		console.log({
			fromDate: fromDateString,
			toDate: toDateString
		})
	};

	setForWeek() {
		let currentDate = new Date();
		const localDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000));
		const thisMonthName = this.getMonth(localDate.toDateString());
		const thisMonthIndex = String(localDate.getMonth() + 1).padStart(2, "0");
		const thisDay = String(currentDate.getDate()).padStart(2, "0");
		const thisYear = localDate.getFullYear();

		// Move localDate back by 7 days
		localDate.setDate(currentDate.getDate() - 7);

		const lastMonthName = this.getMonth(localDate.toDateString());
		const lastMonthIndex = String(localDate.getMonth() + 1).padStart(2, "0");
		const lastDay = String(localDate.getDate()).padStart(2, "0");  // Corrected this line
		const lastYear = localDate.getFullYear();

		let fromDateString = `${lastYear}-${lastMonthIndex}-${lastDay}`;  // Corrected to use lastYear, lastMonthIndex, lastDay
		let toDateString = `${thisYear}-${thisMonthIndex}-${thisDay}`;

		this.setState({
			fromMonthInputValue: lastMonthName,
			toMonthInputValue: thisMonthName,

			fromDayInputValue: lastDay + "",
			toDayInputValue: thisDay + "",

			fromYearInputValue: lastYear + "",
			toYearInputValue: thisYear + "",

			fromDate: fromDateString,
			toDate: toDateString
		});

		console.log({
			fromDate: fromDateString,
			toDate: toDateString
		});
	};

	render() {
		const {navigation} = this.props;

		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.navigate(this.state.calendarFromPage)}
						style={styles.backButton}>
						<BackIcon/>
					</TouchableOpacity>

					<Text style={styles.title}>Sotilgan mahsulotlar</Text>

					<TouchableOpacity
						onPress={async () => {
							await AsyncStorage.removeItem(this.state.calendarFromPage + "FromDate");
							await AsyncStorage.removeItem(this.state.calendarFromPage + "ToDate");

							await AsyncStorage.setItem("window", this.state.calendarFromPage);
							this.setState({dateType: "Bugun"});
							navigation.navigate(this.state.calendarFromPage);
						}}
						style={styles.deleteIcon}
					>
						<DeleteIcon/>
					</TouchableOpacity>
				</View>

				<View
					style={{
						width: screenWidth - (16 * 2),
						display: "flex",
						justifyContent: "space-between",
						flexDirection: "row",
						marginTop: 24
					}}>
					<TouchableOpacity
						style={{
							width: (screenWidth / 3) - (16 * 2),
							padding: 10,
							borderRadius: 8,
							backgroundColor: this.state.dateType == "Bugun" ? "#272727" : "#EEEEEE",
						}}
						onPress={() => {
							this.setState({dateType: "Bugun"});

							this.setState({
								fromDayInputValue: this.getCurrentDay(),
								fromMonthInputValue: this.getCurrentMonth(),
								fromYearInputValue: this.getCurrentYear(),

								toDayInputValue: this.getCurrentDay(),
								toMonthInputValue: this.getCurrentMonth(),
								toYearInputValue: this.getCurrentYear()
							});


							let fromDateString = `${this.getCurrentYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${this.getCurrentDay()}`;  // Corrected to use lastYear, lastMonthIndex, lastDay
							let toDateString = `${this.getCurrentYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${this.getCurrentDay()}`;

							this.setState({
								fromDate: fromDateString,
								toDate: toDateString
							});

						}}>
						<Text
							style={{
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Bugun" ? "#FFF" : "#000"
							}}>
							Bugun
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={{
							width: (screenWidth / 3) - (16 * 2),
							padding: 10,
							borderRadius: 8,
							backgroundColor: this.state.dateType == "Hafta" ? "#272727" : "#EEEEEE",
						}}
						onPress={() => {
							this.setState({dateType: "Hafta"});
							console.log(this.state.dateType);

							this.setForWeek();
						}}>
						<Text
							style={{
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Hafta" ? "#FFF" : "#000"
							}}>
							Hafta
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={{
							width: (screenWidth / 3) - (16 * 2),
							padding: 10,
							borderRadius: 8,
							backgroundColor: this.state.dateType == "Oy" ? "#272727" : "#EEEEEE",
						}}
						onPress={() => {
							this.setState({dateType: "Oy"});
							this.setForMonth();
						}}>
						<Text
							style={{
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Oy" ? "#FFF" : "#000"
							}}>
							Oy
						</Text>
					</TouchableOpacity>
				</View>

				<View
					style={{
						width: screenWidth - (16 * 2),
						marginTop: 24
					}}>
					<Text
						style={{
							fontFamily: "Gilroy-SemiBold",
							fontWeight: "600"
						}}>Davrni tanlang</Text>
				</View>

				<View style={{
					marginTop: 14,
					width: screenWidth - (16 * 2),
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between"
				}}>
					<Text style={styles.label}>dan</Text>

					<View style={{display: "flex", flexDirection: "row", gap: 12}}>
						<TextInput
							placeholder="kun"
							value={this.state.fromDayInputValue}
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({fromDayInputValue: value}, () => {
									const yearMonth = this.state.toDate.substring(0, 7);
									const newToDate = `${yearMonth}-${value}`;
									this.setState({toDate: newToDate});
								});
							}}/>

						<TextInput
							placeholder="oy"
							value={this.state.fromMonthInputValue}
							cursorColor={"black"}
							style={[styles.input, {width: 66}]}
							onChangeText={(value) => {
								this.setState({fromMonthInputValue: value}, () => {
									let monthIndex = this.getMonthIndexWithName(value);
									if (monthIndex !== -1) {
										const newToDate = `${this.state.fromDate.substring(0, 5)}${monthIndex}${this.state.fromDate.substring(7)}`;
										this.setState({toDate: newToDate});
									}
								});
							}}/>


						<TextInput
							placeholder="yil"
							value={this.state.fromYearInputValue}
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({fromYearInputValue: value}, () => {
									const monthDay = this.state.fromDate.substring(5);
									const newToDate = `${value}-${monthDay}`;
									this.setState({toDate: newToDate});

									console.log(newToDate);
								});
							}}/>
					</View>

					<TouchableHighlight

						style={{
							width: 60,
							height: 40,
							display: "flex",
							justifyContent: "center",
							alignItems: "center"
						}}
						onPress={() => {
							const startTime = performance.now();
							// this.setState({
							// 	isModalVisible: true,
							// 	selectingDateType: "FROM"
							// });
							this.modal.current?.setModalVisible(true);
							const endTime = performance.now();
							console.log(`Set state took ${endTime - startTime} milliseconds`);
						}}>
						<MemoizedCalendarIcon />
					</TouchableHighlight>
				</View>

				<ActionSheet
					ref={this.modal}
					gestureEnabled={true}
					indicatorStyle={{
						width: 100,
					}}
					>
						<View
							style={{
								height: screenHeight,
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
							<View
								style={{
									width: screenWidth - (16 * 2),
									maxWidth: 343,
									marginLeft: "auto",
									marginRight: "auto",
									flex: 1,
									alignItems: "center",
									justifyContent: "center"
								}}>
								<View
									style={{
										width: "100%",
										borderRadius: 12,
										backgroundColor: "#fff",
									}}>
									<View
										style={{
											borderBottomColor: "#CAC4D0",
											borderBottomWidth: 1
										}}>
										<View
											style={{
												paddingTop: 16,
												paddingLeft: 24,
												paddingBottom: 12,
												paddingRight: 12
											}}>
											<Text
												style={{
													fontFamily: "Gilroy-Medium",
													fontSize: 14,
													fontWeight: "500",
													marginBottom: 12
												}}>2023</Text>
											<Text
												style={{
													fontFamily: "Gilroy-Medium",
													fontSize: 24,
													fontWeight: "500"
												}}>Juma, 17-sen</Text>
										</View>
									</View>


										<MemoizedRangeCalendar
											range={this.state.range}
											onSelect={(nextRange) => {
												this.setState({ range: nextRange });
											}}
										/>

									{/* <Calendar
										onDayPress={this.onDayPress}
										markedDates={{
											[this.state.selectingDateType === "FROM" ? this.state.fromDate : this.state.toDate]: {
												selected: true,
												selectedColor: "blue"
											},
										}}
									/> */}

									<View
										style={{
											paddingHorizontal: 12,
											paddingTop: 8,
											paddingBottom: 12,
											display: "flex",
											flexDirection: "row",
											justifyContent: "flex-end",
											gap: 8
										}}>
										<TouchableOpacity
											onPress={() => {
												this.setState({
													isModalVisible: false
												})
											}}
											style={{
												paddingHorizontal: 14,
												paddingVertical: 10
											}}>
											<Text
												style={{
													color: "#6750A4",
													fontWeight: "500",
													fontSize: 14
												}}>Bekor qilish</Text>
										</TouchableOpacity>

										<TouchableOpacity
											onPress={() => {
												this.setState({
													isModalVisible: false
												})
											}}
											style={{
												paddingHorizontal: 14,
												paddingVertical: 10
											}}>
											<Text
												style={{
													color: "#6750A4",
													fontWeight: "500",
													fontSize: 14
												}}
											>Tasdiqlash</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
				</ActionSheet>
				{/* <Modal
					  visible={this.state.isModalVisible}
						animationType="slide"
						transparent={true}
						onRequestClose={() => this.setState({ isModalVisible: false })}>
					<View style={{
						position: "absolute",
						width: screenWidth,
						height: screenHeight,
						flex: 1,
						backgroundColor: "#00000099"
					}}></View>

					
				</Modal> */}

				<View style={{
					marginTop: 26,
					width: screenWidth - (16 * 2),
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between"
				}}>
					<Text style={styles.label}>gacha</Text>

					<View style={{
						display: "flex",
						flexDirection: "row",
						gap: 12
					}}>
						<TextInput
							placeholder="kun"
							value={this.state.toDayInputValue}
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({toDayInputValue: value}, () => {
									const yearMonth = this.state.toDate.substring(0, 7);
									const newToDate = `${yearMonth}-${value}`;
									this.setState({toDate: newToDate});
								});
							}}
						/>

						<TextInput
							placeholder="oy"
							value={this.state.toMonthInputValue}
							cursorColor={"black"}
							style={[
								styles.input,
								{width: 66}
							]}
							onChangeText={(value) => {
								this.setState({toMonthInputValue: value}, () => {
									let monthIndex = this.getMonthIndexWithName(value);
									if (monthIndex != -1) {
										const newToDate = `${this.state.toDate.substring(0, 5)}${monthIndex}${this.state.toDate.substring(7)}`;
										this.setState({toDate: newToDate});
									}
								});
							}}/>

						<TextInput
							placeholder="yil"
							value={this.state.toYearInputValue}
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({toYearInputValue: value}, () => {
									const monthDay = this.state.fromDate.substring(5);
									const newToDate = `${value}-${monthDay}`;
									this.setState({toDate: newToDate});
								});
							}}/>
					</View>

					<TouchableOpacity
						style={{
							width: 60,
							height: 40,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
						onPress={() => {
							this.setState((prevState) => ({
								isModalVisible: !prevState.isModalVisible,
								selectingDateType: "TO"
							}));

							this.modal.current?.setModalVisible(true);
						}}>
						<MemoizedCalendarIcon />
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={{
						width: screenWidth - (16 * 2),
						backgroundColor: "#222222",
						marginTop: "auto",
						marginBottom: 44,
						paddingVertical: 14,
						borderRadius: 8
					}}
					onPress={async () => {
						await AsyncStorage.setItem(this.state.calendarFromPage + "FromDate", this.state.fromDate);
						await AsyncStorage.setItem(this.state.calendarFromPage + "ToDate", this.state.toDate);

						console.log(
							this.state.calendarFromPage + "FromDate", this.state.fromDate
						);

						console.log(
							this.state.calendarFromPage + "ToDate", this.state.toDate
						)

						await AsyncStorage.setItem("window", this.state.calendarFromPage);
						navigation.navigate(this.state.calendarFromPage);
					}}>
					<Text style={{
						color: "#fff",
						textAlign: "center",
						fontFamily: "Gilroy-Medium",
						fontWeight: "500",
						lineHeight: 24
					}}>Tasdiqlash</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: screenWidth,
		height: screenHeight + 30,
		paddingTop: 52,
		display: "flex",
		alignItems: "center",
		backgroundColor: "#fff"
	},

	header: {
		display: "flex",
		width: screenWidth - (16 * 2),
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},

	backButton: {
		backgroundColor: "#F5F5F7",
		paddingVertical: 16,
		paddingHorizontal: 19,
		borderRadius: 8,
	},

	title: {
		textAlign: "center",
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
	},

	deleteIcon: {
		backgroundColor: "#F5F5F7",
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderRadius: 8,
	},

	label: {
		width: 70,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		lineHeight: 24
	},

	input: {
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		borderBottomWidth: 1,
		paddingHorizontal: 4,
		paddingVertical: 2,
		lineHeight: 24
	}
});

export default memo(CalendarPage);