import React, {Component} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import BackIcon from "../../assets/arrow-left-icon.svg";
import SellHistoryRepository from "../../repository/SellHistoryRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get('window').width;

class ShoppingDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sellGroupId: null,
			sellHistoryDetail: [],
			sellHistoryDetailLastId: 0,
			sellGroupDetail: {},
			lastId: 0,
			lastYPos: 0,
			isLoaded: false
		}

		this.sellHistoryRepository = new SellHistoryRepository();
		this.getDetails();
	}

	async componentDidMount() {
		const {navigation} = this.props;

		navigation.addListener("focus", async () => {
			this.setState({
				sellGroupId: null,
				sellHistoryDetail: [],
				sellHistoryDetailLastId: 0,
				sellGroupDetail: {},
				lastId: 0,
				lastYPos: 0,
				isLoaded: false
			})
			await this.getDetails();
		});
	}

	async getDetails() {
		let sellGroupId = await AsyncStorage.getItem("sell_history_id");

		await this.setState(
			{ sellGroupId: parseInt(sellGroupId) }
		);

		let sellHistoryDetail = await this.sellHistoryRepository.getSellHistoryDetailByGroupIdTop6(this.state.sellGroupId, this.state.lastId);

		await this.setState(
			{
				sellHistoryDetail: sellHistoryDetail
			}
		);

		let last = sellHistoryDetail[sellHistoryDetail.length - 1];
		if (last) {
			this.setState({
				lastId: last.id
			})
		}

		let sellHistoryDetailLastId = 
			await this.sellHistoryRepository.getLastSellHistoryDetailByGroupId(this.state.sellGroupId);
		sellHistoryDetailLastId = sellHistoryDetailLastId[0];
		this.setState({
			sellHistoryDetailLastId: sellHistoryDetailLastId.id
		})

		console.log("last")
		console.log(this.state.sellHistoryDetailLastId)

		// GROUP INFO..
		let groupDetail = 
			await this.sellHistoryRepository.getSellGroupInfoById(
				this.state.sellGroupId
			);
		this.setState({ sellGroupDetail: groupDetail[0] });

		console.log("GROUP DETAIL: ", this.state.sellGroupDetail);
	}

	async getNextDetails() {
		if (this.state.isLoaded) {
			return;
		}

		let nextSellHistoryDetail = 
			await this.sellHistoryRepository.getSellHistoryDetailByGroupIdTop6(
				this.state.sellGroupId, this.state.lastId
			);

		let last = nextSellHistoryDetail[nextSellHistoryDetail.length - 1]
		if (last.id == this.state.sellHistoryDetailLastId) {
			this.setState({
				isLoaded: true
			});;
		}

		let allSellHistoryDetail = this.state.sellHistoryDetail.concat(nextSellHistoryDetail);

		console.log("LAST ID::", last.id)
		await this.setState({
			sellHistoryDetail: allSellHistoryDetail,
			lastId: last.id
		});
	}

	
	getTime(isoString) {
		var parsedDate = new Date(isoString);

		let hours = parsedDate.getHours();
		let minutes = parsedDate.getMinutes();
		let formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
	
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
					console.log("Current Y position:", currentYPos);

					if ((currentYPos - this.state.lastYPos) > 138) {
						console.log("God help!");
						this.setState({lastYPos: currentYPos});;
						await this.getNextDetails();
					}
				}}
				style={styles.body}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity
							onPress={() => navigation.navigate("Shopping")}
							style={styles.backButton}
						>
							<BackIcon/>
						</TouchableOpacity>
						
						<Text style={styles.title}>Mahsulotdan qolgan foyda</Text>
					</View>

					
					<View style={styles.infoBar}>
						<Text style={styles.infoText}>{ this.state.sellGroupDetail.amount } so’m</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{ this.getTime(this.state.sellGroupDetail.created_date) }</Text>
						<Text style={styles.infoDivider}>//</Text>
						<Text style={styles.infoText}>{ this.getDay(this.state.sellGroupDetail.created_date) }</Text>
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
							this.state.sellHistoryDetail.map((item, index) => (
								
								<View style={styles.profitContainer} key={index}>
									<Text style={styles.profitTitle}>{item.productName}</Text>

									<View style={styles.profitRow}>
										<Text style={styles.profitText}>Soni</Text>
										<Text style={styles.profitPrice}>{item.count} {item.count_type}</Text>
									</View>

									<View style={styles.profitRow}>
										<Text style={styles.profitText}>Qolgan foyda</Text>
										<Text style={styles.profitPrice}>{(item.selling_price).toLocaleString()} so’m</Text>
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

const styles = StyleSheet.create(
	{
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
			color: "#9A50AD",
			fontSize: 16,
			fontFamily: "Gilroy-Medium",
			fontWeight: "500",
			lineHeight: 24,
		},
	}
);

export default ShoppingDetail;