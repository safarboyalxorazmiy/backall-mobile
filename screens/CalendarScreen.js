import React, {Component, useState} from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Modal
} from "react-native";
import BackIcon from "../assets/arrow-left-icon.svg"
import DeleteIcon from "../assets/delete-icon.svg"
import CalendarIcon from "../assets/blue-calendar-icon.svg";
import {TextInput} from "react-native-gesture-handler";
import {Calendar} from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class CalendarPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isModalVisible: false,
			fromDate: this.getCurrentDateString(),
			toDate: this.getCurrentDateString(),
			dateType: "Bugun", // Bugun, Hafta, Oy
			selectingDateType: "", // FROM, TO
			
			fromDayInputValue: this.getCurrentDay(),
			fromMonthInputValue: this.getCurrentMonth(),
			fromYearInputValue: this.getCurrentYear(),

			toDayInputValue: this.getCurrentDay(),
			toMonthInputValue: this.getCurrentMonth(),
			toYearInputValue: this.getCurrentYear(),
		};
	}

	getCurrentDateString() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
	}

	getCurrentMonth() {
    const date = new Date();
    const options = { month: 'long' };
    const formattedDate = date.toLocaleDateString('uz-UZ', options);

		const [month] = formattedDate.split(' ');
    const lowerCaseMonth = month.charAt(0).toLowerCase() + month.slice(1);
    return lowerCaseMonth;
	}

	getCurrentDay() {
    const date = new Date();
    const options = { day: 'numeric' };
    const formattedDate = date.toLocaleDateString('uz-UZ', options);

    const [day] = formattedDate.split(' ');
    const paddedDay = String(day).padStart(2, '0');
    return paddedDay;
	}

	getCurrentYear() {
    const date = new Date();
    const options = { year: 'numeric' };
    const formattedDate = date.toLocaleDateString('uz-UZ', options);

    const [year] = formattedDate.split(' ');
    return year;
	}

	
	onDayPress(date) {
		// date: {"dateString": "2024-02-19", "day": 19, "month": 2, "timestamp": 1708300800000, "year": 2024};
		this.setState({calendarSelectedDate: date.dateString});
		console.log(date);
	};
	
	render() {
		const {navigation} = this.props;
				
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.navigate("Shopping")}
						style={styles.backButton}>
						<BackIcon/>
					</TouchableOpacity>
					
					<Text style={styles.title}>Sotilgan mahsulotlar</Text>
					
					<TouchableOpacity
						onPress={() => navigation.navigate("Shopping")}
						style={styles.deleteIcon}
					>
						<DeleteIcon/>
					</TouchableOpacity>
				</View>
				
				<View style={{
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
						}}
					>
						<Text
							style={{
								color: "white",
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Bugun" ? "#FFF" : "#000"
							}}
						>
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
						}}
					>
						<Text
							style={{
								color: "white",
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Hafta" ? "#FFF" : "#000"
							}}
						>
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
							console.log(this.state.dateType)
						}}
					>
						<Text
							style={{
								color: "white",
								textAlign: "center",
								fontFamily: "Gilroy-Medium",
								fontWeight: "500",
								color: this.state.dateType == "Oy" ? "#FFF" : "#000"
							}}
						>
							Oy
						</Text>
					</TouchableOpacity>
				</View>
				
				<View style={{width: screenWidth - (16 * 2), marginTop: 24}}>
					<Text style={{fontFamily: "Gilroy-SemiBold", fontWeight: "600"}}>Davrni tanlang</Text>
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
								this.setState({fromDayInputValue: value});
							}}/>

						<TextInput 
							placeholder="oy" 
							value={this.state.fromMonthInputValue}
							cursorColor={"black"}
							style={[styles.input, {width: 66}]}
							onChangeText={(value) => {
								this.setState({fromMonthInputValue: value});
							}}/>

						<TextInput 
							placeholder="yil" 
							value={this.state.fromYearInputValue}
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({fromYearInputValue: value});
							}}/>
					</View>
					
					<TouchableOpacity 
						style={{
							width: 60, 
							height: 40, 
							display: "flex",
							justifyContent: "center", 
							alignItems: "center"
						}}
						onPress={() => {
							this.setState((prevState) => ({
								isModalVisible: !prevState.isModalVisible,
								selectingDateType: "FROM"
							}));
						}}>
						<CalendarIcon />
					</TouchableOpacity>
				</View>
				
				<Modal 
					visible={this.state.isModalVisible} 
					animationType="slide" 
					transparent={true}
					animationIn={"slideInUp"}
					animationOut={"slideOutDown"}
					animationInTiming={100}>
					<View style={{
						position: "absolute",
						width: screenWidth,
						height: screenHeight,
						flex: 1,
						backgroundColor: "#00000099"
					}}></View>
					
					<View style={{
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
							justifyContent: "center"
						}}>
							<View style={{
								width: "100%",
								borderRadius: 12,
								backgroundColor: "#fff",
							}}>
								<View style={{borderBottomColor: "#CAC4D0", borderBottomWidth: 1}}>
									<View
										style={{paddingTop: 16, paddingLeft: 24, paddingBottom: 12, paddingRight: 12}}>
										<Text style={{
											fontFamily: "Gilroy-Medium",
											fontSize: 14,
											fontWeight: "500",
											marginBottom: 12
										}}>2023</Text>
										<Text style={{fontFamily: "Gilroy-Medium", fontSize: 24, fontWeight: "500"}}>Juma,
											17-sen</Text>
									</View>
								</View>
								
								<Calendar
									onDayPress={this.onDayPress}
									markedDates={{
										[this.state.calendarSelectedDate]: {selected: true, selectedColor: "blue"},
									}}
								/>
								
								<View style={{
									paddingHorizontal: 12,
									paddingTop: 8,
									paddingBottom: 12,
									display: "flex",
									flexDirection: "row",
									justifyContent: "flex-end",
									gap: 8
								}}>
									<TouchableOpacity onPress={() => {
										this.setState({
											isModalVisible: false
										})
									}}
									 style={{paddingHorizontal: 14, paddingVertical: 10}}>
										<Text style={{color: "#6750A4", fontWeight: "500", fontSize: 14}}>Bekor qilish</Text>
									</TouchableOpacity>
									
									<TouchableOpacity 
										onPress={() => {
											this.setState({
												isModalVisible: false
											})
										}}
										style={{paddingHorizontal: 14, paddingVertical: 10}}>
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
				</Modal>
				
				<View style={{
					marginTop: 26,
					width: screenWidth - (16 * 2),
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between"
				}}>
					<Text style={styles.label}>gacha</Text>
					
					<View style={{display: "flex", flexDirection: "row", gap: 12}}>
						<TextInput 
							placeholder="04" 
							value={this.state.toDayInputValue} 
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({toDayInputValue: value});
							}}/>

						<TextInput 
							placeholder="dekabr" 
							value={this.state.toMonthInputValue} 
							cursorColor={"black"}
							style={[styles.input, {width: 66}]}
							onChangeText={(value) => {
								this.setState({toMonthInputValue: value});
							}}/>
						
						<TextInput 
							placeholder="2022" 
							value={this.state.toYearInputValue} 
							cursorColor={"black"}
							style={styles.input}
							onChangeText={(value) => {
								this.setState({toYearInputValue: value});
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
						}}>
						<CalendarIcon />
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
					onPress={() => {
						AsyncStorage.setItem("dan", "01-01-2024");
						AsyncStorage.setItem("gacha", "01-01-2024");
					}}
				>
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

export default CalendarPage;