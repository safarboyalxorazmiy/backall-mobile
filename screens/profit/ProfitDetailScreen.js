import React, {Component} from "react";
import {View, Text, TouchableOpacity, Image, StyleSheet, Dimensions} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import BackIcon from "../../assets/arrow-left-icon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";

const screenWidth = Dimensions.get("window").width;

class ProfitDetail extends Component {
	constructor(props) {
		super(props);

		this.profitHistoryRepository = new ProfitHistoryRepository();

		this.state = {
			groupId: null,
			profitHistoryDetail: [],
			profitHistoryDetailLastId: 0,
			groupDetail: [],
			lastId: 0,
			lastYPos: 0,
			isLoaded: false
		}

		this.getDetails();
	}

	async componentDidMount() {
		const {navigation} = this.props;
		
		navigation.addListener("focus", async () => {
			this.setState({
				groupId: null,
				profitHistoryDetail: [],
				profitHistoryDetailLastId: 0,
				groupDetail: [],
				lastId: 0,
				lastYPos: 0,
				isLoaded: false
			})
			await this.getDetails();
		});
	}

	async getDetails() {
		await this.setState(
			{ groupId: parseInt(await AsyncStorage.getItem("profit_history_id")) }
		);

		let profitHistoryDetail = await this.profitHistoryRepository.getProfitHistoryDetailByGroupIdTop6(this.state.groupId, parseInt(this.state.lastId));
		let last = profitHistoryDetail[profitHistoryDetail.length - 1];

		await this.setState(
			{ 
				profitHistoryDetail:  profitHistoryDetail,
				lastId: last.id
			}
		);

		let profitHistoryDetailLastId = await this.profitHistoryRepository.getLastProfitHistoryDetailByGroupId(this.state.groupId);
		profitHistoryDetailLastId = profitHistoryDetailLastId[0];
		this.setState({
			profitHistoryDetailLastId: profitHistoryDetailLastId.id
		})

		// GROUP.. 
		let groupDetail = 
			await this.profitHistoryRepository.getProfitGroupInfoById(this.state.groupId);
		this.setState({ groupDetail: groupDetail[0] });
	}

	async getNextDetails() {
		if (this.state.isLoaded) {
			return;
		}

		let nextProfitHistoryDetail = 
			await this.profitHistoryRepository.getProfitHistoryDetailByGroupIdTop6(
				this.state.groupId, this.state.lastId
			);

		let last = nextProfitHistoryDetail[nextProfitHistoryDetail.length - 1]
		if (last != undefined) {
			if (last.id == this.state.profitHistoryDetailLastId) {
				this.setState({
					isLoaded: true
				});
			}

			let allProfitHistoryDetail = 
				this.state.profitHistoryDetail.concat(nextProfitHistoryDetail);
			await this.setState({
				profitHistoryDetail: allProfitHistoryDetail,
				lastId: last.id
			});
		}
	}

	getTime(isoString) {
		var parsedDate = new Date(isoString);

		let hours = parsedDate.getHours();
		let minutes = parsedDate.getMinutes();
		let formattedTime = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
	
		return formattedTime;
	}

	getDay(isoString) {
		var parsedDate = new Date(isoString);
	
		var monthNames = [
			"yanvar",
			"fevral",
			"mart",
			"aprel",
			"may",
			"iyun",
			"iyul",
			"avqust",
			"sentyabr",
			"oktyabr",
			"noyabr",
			"dekabr"
		];
	
		var day = parsedDate.getDate();
		var monthIndex = parsedDate.getMonth();
		var monthName = monthNames[monthIndex];
	
		var formattedResult = day + "-" + monthName;
	
		return formattedResult;
	}

	render() {
		const {navigation} = this.props;
		
		return (
			<ScrollView
				onScrollBeginDrag={async (event) => {
					const currentYPos = event.nativeEvent.contentOffset.y;

					if ((currentYPos - this.state.lastYPos) > 138) {
						this.setState({lastYPos: currentYPos});;
						await this.getNextDetails();
					}
				}}

				style={styles.body}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity
							onPress={() => {
								navigation.navigate("Profit")
							}}
							style={styles.backButton}>
							<BackIcon/>
						</TouchableOpacity>
						
						<Text style={styles.title}>Mahsulotdan qolgan foyda</Text>
					</View>

					<View style={styles.infoBar}>
						<Text style={styles.infoText}>{ this.state.groupDetail.profit } so’m</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{ this.getTime(this.state.groupDetail.created_date) }</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{ this.getDay(this.state.groupDetail.created_date) }</Text>
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
										<Text style={styles.profitText}>Soni</Text>
										<Text style={styles.profitPrice}>{item.count} {item.count_type}</Text>
									</View>

									<View style={styles.profitRow}>
										<Text style={styles.profitText}>Qolgan foyda</Text>
										<Text style={styles.profitPrice}>+{item.profit.toLocaleString()} so’m</Text>
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