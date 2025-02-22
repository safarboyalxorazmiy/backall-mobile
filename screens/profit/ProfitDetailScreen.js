import React, {Component} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import BackIcon from "../../assets/arrow-left-icon.svg";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../../service/ApiService";
import i18n from "../../i18n";
import { TouchableRipple } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

class ProfitDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			groupId: null,
			profitHistoryDetail: [],
			profitHistoryDetailLastId: 0,
			groupDetail: [],
			lastId: 0,
			lastYPos: 0,
			isLoaded: false
		}

		this.profitHistoryRepository = new ProfitHistoryRepository();
		this.apiService = new ApiService();
	}

	async componentDidMount() {
		const {navigation} = this.props;
		await AsyncStorage.setItem("window", "ProfitDetail");

		await this.getDetails();
		navigation.addListener("focus", async () => {
			await AsyncStorage.setItem("window", "ProfitDetail");
			await AsyncStorage.setItem("lastWindow", "ProfitDetail");

			this.setState({
				groupId: null,
				profitHistoryDetail: [],
				groupDetail: [],
				profitHistoryDetailLastId: 0
			});

			await this.getDetails();
		});
	}

	async getDetails() {
		// GROUP..
		const profitHistoryId = await AsyncStorage.getItem("profit_history_id");

		let groupId;

		if (BigInt(profitHistoryId) <= BigInt(Number.MAX_SAFE_INTEGER)) {
			groupId = Number(profitHistoryId); // Convert to a Number if it's within the safe range
		} else {
			groupId = BigInt(profitHistoryId); // Keep as a BigInt if it's large
		}

		let profitGroup =
			await this.profitHistoryRepository.getProfitGroupInfoById(groupId);
		if (profitGroup[0]) {
			this.setState({groupDetail: profitGroup[0]});
		} else {
			let groupDetail = await this.apiService.getProfitGroupByGlobalId(groupId, this.props.navigation);
			if (groupDetail) {
				this.setState({
					groupDetail: {
						id: groupDetail.id,
						created_date: groupDetail.createdDate,
						profit: groupDetail.profit
					}
				})
			}
		}

		let profitHistoryDetail =
			await this.profitHistoryRepository.getProfitHistoryDetailByGroupId(
				groupId
			);

		if (profitHistoryDetail.length === 0) {
			profitHistoryDetail = await this.apiService.getProfitHistoriesByProfitGroupGlobalId(
				groupId, this.props.navigation
			);
		}

		this.setState({
			profitHistoryDetail: profitHistoryDetail
		});
	}

	getTime(isoString) {
		let parsedDate = new Date(isoString);

		let hours = parsedDate.getHours();
		let minutes = parsedDate.getMinutes();
		let formattedTime = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;

		return formattedTime;
	}

	getDay(isoString) {
		let parsedDate = new Date(isoString);

		let monthNames = [
			i18n.t("january"),
			i18n.t("february"),
			i18n.t("march"),
			i18n.t("april"),
			i18n.t("may"),
			i18n.t("june"),
			i18n.t("july"),
			i18n.t("august"),
			i18n.t("september"),
			i18n.t("october"),
			i18n.t("november"),
			i18n.t("december")			
		];

		let day = parsedDate.getDate();
		let monthIndex = parsedDate.getMonth();
		let monthName = monthNames[monthIndex];

		let formattedResult = day + "-" + monthName;

		return formattedResult;
	}

	render() {
		const {navigation} = this.props;

		return (
			<ScrollView style={styles.body}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableRipple
							delayHoverIn={true}
							delayLongPress={false}
							delayHoverOut={false}
							unstable_pressDelay={false}
							rippleColor={"rgba(0, 0, 0, .32)"}
							borderless={true}
							onPress={() => {
								navigation.navigate("Profit")
							}}
							style={styles.backButton}>
							<BackIcon/>
						</TouchableRipple>

						<Text style={styles.title}>{i18n.t("profitHistory")}</Text>
					</View>

					<View style={styles.infoBar}>
						<Text style={styles.infoText}>{this.state.groupDetail.profit} {i18n.t("sum")}</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{this.getTime(this.state.groupDetail.created_date)}</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{this.getDay(this.state.groupDetail.created_date)}</Text>
					</View>

					{/*
						this.state.profitHistoryDetail = 
						[{
							"count": 1, 
							"count_type": "DONA", 
							"created_date": "2024-01-28 16:13:46", 
							"id": 9, 
							"product_id": 1, 
							"profit": 500
						}] 
					*/}
					<View>
						{/* FOR EACH ROW */}
						{
							this.state.profitHistoryDetail.map((item, index) => (
								<View
									style={styles.profitContainer}
									key={index}>
									<Text style={styles.profitTitle}>{item.productName}</Text>

									<View style={styles.profitRow}>
										<Text style={styles.profitText}>{i18n.t("count")}</Text>
										<Text style={styles.profitPrice}>{item.count} {i18n.t(item.count_type.toLowerCase())}</Text>
									</View>

									<View style={styles.profitRow}>
										<Text style={styles.profitText}>{i18n.t("totalProfit")}</Text>
										<Text style={styles.profitPrice}>+{item.profit.toLocaleString()} {i18n.t("sum")}</Text>
									</View>
								</View>
							))
						}
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	body: {
		backgroundColor: "#FFF"
	},

	container: {
		marginTop: 52,
		width: screenWidth - 32,
		marginLeft: "auto",
		marginRight: "auto",
		flex: 1,
		alignItems: "center"
	},

	header: {
		width: screenWidth - 34,
		flexDirection: "row",
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
		width: 299,
		textAlign: "center",
		fontSize: 18,
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
	},

	infoBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: screenWidth - 32,
		marginLeft: "auto",
		backgroundColor: "#272727",
		padding: 10,
	},

	infoText: {
		color: "#FFF",
	},

	infoDivider: {
		color: "#FFF",
	},

	profitContainer: {
		marginTop: 8,
		width: screenWidth - 32,
		borderWidth: 1,
		backgroundColor: "#fff",
		borderColor: "#F1F1F1",
		borderRadius: 8,
		elevation: 5,
		shadowColor: "rgba(0, 0, 0, 0.07)",
		shadowOffset: {width: 5, height: 5},
		shadowOpacity: 1,
		shadowRadius: 15,
		paddingHorizontal: 12,
		paddingVertical: 16,
	},

	profitTitle: {
		fontFamily: "Gilroy-SemiBold",
		fontWeight: "600",
		fontSize: 16,
		marginBottom: 12,
	},

	profitRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},

	profitText: {
		color: "#777",
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		lineHeight: 24,
	},

	profitPrice: {
		color: "#0EBA2C",
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		lineHeight: 24,
	},
});

export default ProfitDetail;