import React, { Component } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView, 
} from "react-native";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";

import ProductRepository from "../../repository/ProductRepository";
import AmountDateRepository from "../../repository/AmountDateRepository";
import ProfitHistoryRepository from "../../repository/ProfitHistoryRepository";
import ApiService from "../../service/ApiService";

import CalendarIcon from "../../assets/calendar-icon.svg";
import CrossIcon from "../../assets/cross-icon-light.svg";
import ProfitIcon from "../../assets/profit-icon.svg";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

class Profit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profitHistories: [],
      groupedHistories: [],
      currentMonthTotal: 0,
      lastGroupId: 0,
      isCollecting: false,
      calendarInputContent: "--/--/----",
      thisMonthProfitAmount: 0.00,
      notAllowed: "",
      notFinished: true,

      lastProfitGroupsPage: 0,
      lastProfitGroupsSize: 10,
      lastProfitHistoriesPage: 0,
      lastProfitHistoriesSize: 10,
      lastProfitHistoryGroupPage: 0,
      lastProfitHistoryGroupSize: 10,	
      lastProfitAmountDatePage: 0,
      lastProfitAmountDateSize: 10,	
    }

    this.productRepository = new ProductRepository();
    this.profitHistoryRepository = new ProfitHistoryRepository();
    this.amountDateRepository = new AmountDateRepository();
    this.apiService = new ApiService();

    this.initProfitHistoryGroup();
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
  
  async initProfitHistoryGroup() {
    await this.getDateInfo();

    if (!this.state.notFinished) {
        return;
    }

    await this.profitHistoryRepository.init();
    await this.amountDateRepository.init();

      if (this.state.fromDate != null && this.state.toDate != null) {
          let lastProfitGroup = 
            await this.profitHistoryRepository.getLastProfitHistoryGroupIdByDate(this.state.fromDate, this.state.toDate);

          if (lastProfitGroup == null) {
            return;
          }

        //   fromDate: "2024-02-19" (example)
        //   2024-06-16T18:51:17.990Z (example)
          profitHistories = 
            await this.profitHistoryRepository.getTop10ProfitGroupByStartIdAndDate(
              lastProfitGroup.id, this.state.fromDate, this.state.toDate
            );

          console.log({
            profitHistories: profitHistories,
            groupedHistories: await this.groupByDate(profitHistories),
            lastGroupId: lastProfitGroup.id
          })
          
          this.setState({
            profitHistories: profitHistories,
            groupedHistories: await this.groupByDate(profitHistories),
            lastGroupId: lastProfitGroup.id
          });

          return;
      }

      let lastProfitGroup = await this.profitHistoryRepository.getLastProfitHistoryGroupId();
      let profitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartId(lastProfitGroup.id);

      console.log("WITHOUT DATE")
      console.log({
        profitHistories: profitHistories,
        groupedHistories: await this.groupByDate(profitHistories),
        lastGroupId: lastProfitGroup.id
      });

      this.setState({
        profitHistories: profitHistories,
        groupedHistories: await this.groupByDate(profitHistories),
        lastGroupId: lastProfitGroup.id
      });
  }

  async getNextProfitHistoryGroup() {
      if (this.state.fromDate != null && this.state.toDate != null) {
        this.setState({isCollecting: true});
        let nextProfitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartIdAndDate(this.state.lastGroupId - 10, this.state.fromDate, this.state.toDate);
        let allProfitHistories = this.state.profitHistories.concat(nextProfitHistories);

        console.log(this.state.profitHistories);
        console.log(allProfitHistories);

        this.setState({
            profitHistories: allProfitHistories,
            groupedHistories: await this.groupByDate(allProfitHistories),
            lastGroupId: this.state.lastGroupId - 10,
            isCollecting: false
        });

        return;
      }

      this.setState({isCollecting: true});

      console.log("####### LAST ID ########")
      console.log(this.state.lastGroupId)
      if ((this.state.lastGroupId - 10) < 0) {
        this.setState({isCollecting: false});
        return;
      }

      let nextProfitHistories = await this.profitHistoryRepository.getTop10ProfitGroupByStartId(this.state.lastGroupId - 10);
      let allProfitHistories = this.state.profitHistories.concat(nextProfitHistories);

      console.log(this.state.profitHistories);
      console.log(allProfitHistories);

      this.setState({
        profitHistories: allProfitHistories,
        groupedHistories: await this.groupByDate(allProfitHistories),
        lastGroupId: this.state.lastGroupId - 10,
        isCollecting: false
      });
  };

  groupByDate = async (histories) => {
    const grouped = {};
    for (const history of histories) {
        if (history.profit == 0) {
            continue;
        }

        const date = history.created_date.split("T")[0];
        const formattedDate = this.formatDate(date);

        if (!grouped[date]) {
            grouped[date] = {date, dateInfo: formattedDate, histories: [], totalProfit: 0};
        } 

        grouped[date].histories.push(history);

        let currentDate = new Date(date);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
        const day = String(currentDate.getDate()).padStart(2, "0");

        // Format the date as yyyy-mm-dd
        const currentFormattedDate = `${year}-${month}-${day}`;
        grouped[date].totalProfit = await this.amountDateRepository.getProfitAmountInfoByDate(currentFormattedDate);
    }

    console.log(grouped);
    return Object.values(grouped);
  };

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
      const currentMonth = currentDate.getMonth() + 1; // Months are zero-based in JavaScript (January is 0)
      let currentMonthTotal = 0;

      this.state.profitHistories.forEach((history) => {
          const historyDate = new Date(history.created_date);
          const historyMonth = historyDate.getMonth() + 1;

          if (historyMonth === currentMonth) {
              currentMonthTotal += history.amount;
          }
      });

      this.setState({currentMonthTotal: currentMonthTotal});
      return currentMonthTotal;
  };

  getFormattedTime = (created_date) => {
      let date = new Date(created_date);
      let hours = date.getHours();
      let minutes = date.getMinutes();

      minutes = minutes + "";
      if (minutes.length != 2) {
          minutes = "0" + minutes;
      }
      return `${hours}:${minutes}`;
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
					await this.profitHistoryRepository.createProfitHistoryGroup(
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
    const {navigation} = this.props;

    await this.profitHistoryRepository.init();
    await this.amountDateRepository.init();

		await AsyncStorage.setItem("profitLoadingIntervalProccessIsFinished", "true");

    navigation.addListener("focus", async () => {
      if (await AsyncStorage.getItem("profitFullyLoaded") == "false") {  
        this.setState({
          notFinished: true
        });

        await AsyncStorage.setItem("profitFullyLoaded", "true");
      }

      await this.getDateInfo();
      
      if (await AsyncStorage.getItem("role") === "BOSS") {
				let profitLoadingIntervalId = setInterval(async () => {
					if (await AsyncStorage.getItem("profitLoadingIntervalProccessIsFinished") != "true") {
						return;
					}

					console.log("INTERNAL STARTED SUCCESSFULLY! \n We are on: ");
					console.log(await AsyncStorage.getItem("window"));
					if (await AsyncStorage.getItem("window") != "Profit") {
            if (profitLoadingIntervalId !== undefined) {
							clearInterval(profitLoadingIntervalId);
							console.log("CLEARED " + profitLoadingIntervalId);
							return;
            }
					}

					await AsyncStorage.setItem("profitLoadingIntervalProccessIsFinished", "false")
					
					let isProfitGroupEmpty = 
						await this.getProfitGroupNotDownloaded();

					let isProfitHistoryEmpty = 
						await this.getProfitHistoriesNotDownloaded();

					let isProfitHistoryGroupEmpty = 
						await this.getProfitHistoryGroupNotDownloaded();

					let isProfitAmountDateEmpty = 
						await this.getProfitAmountDateNotDownloaded();

					await AsyncStorage.setItem(
						"profitLoadingIntervalProccessIsFinished", 
						"true"
					);

					if (
            isProfitGroupEmpty || 
            isProfitHistoryEmpty || 
            isProfitHistoryGroupEmpty || 
            isProfitAmountDateEmpty
          ) {
						this.setState({
							notFinished: true
						});

						while (this.state.notFinished) {
              if (await AsyncStorage.getItem("window") != "Shopping") {
                  break;
              }
              
							this.setState({
								notFinished: await this.getNextProfitHistoryGroup()
							});
						}
					}
				}, 2000)
			}

      let isNotSaved = await AsyncStorage.getItem("isNotSaved");
      if (isNotSaved == "true") {
          this.setState({
            notFinished: true,
            profitHistories: [],
            groupedHistories: []
          });
          
          await this.initProfitHistoryGroup();

          while (this.state.notFinished) {
            if (await AsyncStorage.getItem("window") != "Shopping") {
                break;
            }

            console.log("Loading..")
            this.setState({
              notFinished: await this.getNextProfitHistoryGroup()
            });
          }
      }
      
      await this.profitHistoryRepository.init();
      await this.amountDateRepository.init();
      
      // ROLE ERROR
      let notAllowed = await AsyncStorage.getItem("not_allowed");
      this.setState({notAllowed: notAllowed})

      await this.initProfitHistoryGroup();

      console.log(this.state.fromDate)
      console.log(this.state.toDate)

      console.log(this.state.profitHistories);

      let thisMonthProfitAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

      let currentDate = new Date();
      let currentMonth = currentDate.getMonth();
      let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

      if (currentMonth === lastStoredMonth) {
          this.setState({thisMonthProfitAmount: thisMonthProfitAmount});
      }

      
      while (this.state.notFinished) {
        if (await AsyncStorage.getItem("window") != "Shopping") {
					break;
				}
				
        this.setState({
          notFinished: await this.getNextProfitHistoryGroup()
        });
      }
    });
  }

  render() {
      const {navigation} = this.props;

      return (
      <>
        <View style={styles.container}>
            <ScrollView
                onScrollBeginDrag={async (event) => {
                    if (!this.state.isCollecting) {
                        console.log("Scrolling ", event.nativeEvent.contentOffset);
                        this.setState({
                            notFinished: await this.getNextProfitHistoryGroup()
                        });
                    }
                }} style={{width: "100%"}}>
                <View style={{
                    borderBottomColor: "#AFAFAF",
                    borderBottomWidth: 1,
                    width: screenWidth - (16 * 2),
                    marginLeft: "auto",
                    marginRight: "auto",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Text style={{
                        fontFamily: "Gilroy-SemiBold", fontWeight: "600", fontSize: 18, lineHeight: 24
                    }}>Foyda tarixi</Text>
                </View>

                <View style={{
                    marginTop: 24, width: screenWidth - (16 * 2), marginRight: "auto", marginLeft: "auto"
                }}>
                    <Text
                        style={{fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, marginBottom: 4}}>
                        Muddatni tanlang
                    </Text>

                    <View>
                        <TouchableOpacity
                            onPress={async () => {
                                await AsyncStorage.setItem("calendarFromPage", "Profit");
                                navigation.navigate("Calendar")
                            }}
                            style={[this.state.calendarInputContent === "--/--/----" ? styles.calendarInput : styles.calendarInputActive]}>
                            <Text
                                style={[this.state.calendarInputContent === "--/--/----" ? styles.calendarInputPlaceholder : styles.calendarInputPlaceholderActive]}>{this.state.calendarInputContent}</Text>
                        </TouchableOpacity>

                        {this.state.calendarInputContent === "--/--/----" ? (<CalendarIcon
                            style={styles.calendarIcon}
                            resizeMode="cover"/>) : (<CrossIcon
                            style={styles.calendarIcon}
                            resizeMode="cover"/>)}
                    </View>
                </View>

                <View style={{
                    marginTop: 12,
                    width: screenWidth - (16 * 2),
                    marginRight: "auto",
                    marginLeft: "auto",
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
                    }}>Oylik foyda</Text>
                    <Text style={{
                        fontFamily: "Gilroy-Medium",
                        fontWeight: "500",
                        fontSize: 16,
                        lineHeight: 24,
                        color: "#FFF"
                    }}>{this.state.thisMonthProfitAmount} so’m</Text>
                </View>

                <View style={{
                    width: "100%", paddingLeft: 16, paddingRight: 16
                }}>
                    {this.state.groupedHistories.map((group) => (<View key={group.date}>
                        {(<View style={styles.historyTitleWrapper}>
                            <Text style={styles.historyTitleText}>{group.dateInfo}</Text>

                            <Text style={styles.historyTitleText}>//</Text>

                            <Text style={styles.historyTitleText}>{`${group.totalProfit} so’m`}</Text>
                        </View>)}

                        {group.histories.map((history) => (<TouchableOpacity
                            key={history.id}
                            style={styles.history}
                            onPress={async () => {
                                let historyId = history.id + "";

                                console.log(historyId);
                                try {
                                    await AsyncStorage.setItem("profit_history_id", historyId);
                                } catch (error) {
                                    console.error("Error profit_history_id:", error);
                                }

                                navigation.navigate("ProfitDetail", {history});
                            }}
                        >
                            <View style={styles.historyProfitWrapper}>
                                <ProfitIcon style={{marginLeft: -4}}/>
                                <Text
                                    style={styles.historyProfit}>{`${history.profit.toLocaleString()} so’m`}</Text>
                            </View>

                            <Text
                                style={styles.historyTime}>{this.getFormattedTime(history.created_date)}</Text>
                        </TouchableOpacity>))}
                    </View>))}
                </View>
            </ScrollView>

            <StatusBar style="auto"/>
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
      </>);
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
        width: screenWidth - (17 + 17),
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
        width: screenWidth - (17 + 17),
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
        marginTop: 24, width: screenWidth - (16 * 2), marginLeft: "auto", marginRight: "auto",
    },

    calendarIcon: {
        position: "absolute", right: 16, top: 14
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
        fontSize: 16, lineHeight: 24, fontFamily: "Gilroy-Medium", fontWeight: "500", color: "#FFFFFF"
    },

    calendarInputPlaceholder: {
        fontSize: 16, lineHeight: 24, fontFamily: "Gilroy-Medium", fontWeight: "500", color: "#AAAAAA"
    },

    calendarLabel: {
        fontFamily: "Gilroy-Medium", fontWeight: "500", fontSize: 16, marginBottom: 4
    },
});

export default Profit;