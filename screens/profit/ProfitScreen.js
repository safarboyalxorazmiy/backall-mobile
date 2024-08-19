import React, {Component} from "react";
import {StatusBar} from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    FlatList
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
import ProfitGroup from "./ProfitGroup";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

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
            notAllowed: "",
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
        }

        this.productRepository = new ProductRepository();
        this.profitHistoryRepository = new ProfitHistoryRepository();
        this.amountDateRepository = new AmountDateRepository();
        this.apiService = new ApiService();
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
        /* Month profit amount setting value ** */
        let thisMonthSellAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

        if (currentMonth === lastStoredMonth) {
            this.setState({thisMonthProfitAmount: thisMonthSellAmount});
        }

        let lastProfitGroup =
            await this.profitHistoryRepository.getLastProfitGroup();
        let lastGroupId = lastProfitGroup.id;

        console.log(lastGroupId)

        let firstProfitGroup =
            await this.profitHistoryRepository.getFirstProfitGroup();

        this.setState({
            firstGroupGlobalId: firstProfitGroup.global_id,
            loading: true
        });

        const allProfitHistories = [];

        while (true) {
            if (
                lastGroupId <= 0 ||
                await AsyncStorage.getItem("window") != "Profit"
            ) {
                this.setState({
                    loading: false
                });
                break;
            }

            console.log("LAST GROUP ID: ", lastGroupId);

            try {
                let profitHistories =
                    await this.profitHistoryRepository.getAllProfitGroup(lastGroupId);

                console.log(profitHistories)

                if (profitHistories.length === 0) {
                    this.setState({
                        loading: false
                    });
                    break;
                }

                allProfitHistories.push(...profitHistories);

                lastGroupId -= 11;

                await new Promise(resolve => setTimeout(resolve, 100)); // Adding delay to manage UI thread load
            } catch (error) {
                console.error('Error fetching profit histories:', error);
                this.setState({
                    loading: false
                });
                break;
            }

            const startTime = performance.now();

            const grouped = {};

            let lastDate;
            let lastAmount;
            for (const history of allProfitHistories) {
                const date = history.created_date.split("T")[0];
                if (!grouped[date]) {
                    const formattedDate = this.formatDate(date);
                    grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
                }

                if (lastDate !== date) {
                    lastAmount = await this.amountDateRepository.getProfitAmountInfoByDate(date);
                    lastDate = date;
                }

                grouped[date].totalAmount = lastAmount;
                grouped[date].histories.push(history);
            }

            this.setState({
                profitHistory: allProfitHistories,
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


        const {navigation} = this.props;

        navigation.addListener("focus", async () => {
            /* Month profit amount setting value ** */
            let thisMonthProfitAmount = parseInt(await AsyncStorage.getItem("month_profit_amount"));

            let currentDate = new Date();
            let currentMonth = currentDate.getMonth();
            let lastStoredMonth = parseInt(await AsyncStorage.getItem("month"));

            if (currentMonth === lastStoredMonth) {
                this.setState({thisMonthProfitAmount: thisMonthProfitAmount});
            }

            await this.getDateInfo();

            // New history created load new items **
            if (await AsyncStorage.getItem("profitFullyLoaded") != "true") {

                let lastProfitGroup = await this.profitHistoryRepository.getLastProfitGroup();
                let lastGroupId = lastProfitGroup.id;

                if ((lastGroupId - 1000) > 0) {
                    await this.profitHistoryRepository.deleteByIdLessThan(lastGroupId - 1000);
                }

                // Explanation for firstProfitGroup. We need it for getting rest of rows from global.
                // Right here we update it again cause we deleted rows which ids higher then 1000
                let firstProfitGroup = await this.profitHistoryRepository.getFirstProfitGroup();
                this.setState({
                    firstGroupGlobalId: firstProfitGroup.global_id,
                    globalFullyLoaded: false,
                    loading: true
                });

                const allProfitHistories = [];

                while (true) {
                    if (
                        lastGroupId <= 0 ||
                        await AsyncStorage.getItem("window") !== "Profit"
                    ) {
                        console.log("await AsyncStorage.getItem(\"window\") != \"Profit\"::", await AsyncStorage.getItem("window") !== "Profit");

                        this.setState({
                            loading: false
                        });
                        break;
                    }

                    console.log("LAST GROUP ID: ", lastGroupId);

                    try {
                        let profitHistories =
                            await this.profitHistoryRepository.getAllProfitGroup(lastGroupId);

                        if (profitHistories.length === 0) {
                            this.setState({
                                loading: false
                            });
                            break;
                        }

                        allProfitHistories.push(...profitHistories);

                        lastGroupId -= 11;

                        await new Promise(resolve => setTimeout(resolve, 100)); // Adding delay to manage UI thread load
                    } catch (error) {
                        console.error('Error fetching profit histories:', error);
                        this.setState({
                            loading: false
                        });
                        break;
                    }

                    const startTime = performance.now();

                    const grouped = {};

                    let lastDate;
                    let lastAmount;
                    for (const history of allProfitHistories) {
                        const date = history.created_date.split("T")[0];
                        if (!grouped[date]) {
                            const formattedDate = this.formatDate(date);
                            grouped[date] = {date, dateInfo: formattedDate, histories: [], totalAmount: 0};
                        }

                        if (lastDate !== date) {
                            lastAmount = await this.amountDateRepository.getProfitAmountInfoByDate(date);
                            lastDate = date;
                        }

                        grouped[date].totalAmount = lastAmount;
                        grouped[date].histories.push(history);
                    }

                    this.setState({
                        profitHistory: allProfitHistories,
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

                await AsyncStorage.setItem("profitFullyLoaded", "true");
            }

            // Load rest of items if exists **
            let lastGroupId = this.state.lastGroupId;
            let allProfitHistories = this.state.profitHistory;

            this.setState({
                loading: true
            });

            while (true) {
                if (
                    lastGroupId <= 0 ||
                    await AsyncStorage.getItem("window") != "Shopping"
                ) {
                    this.setState({
                        loading: false
                    });
                    break;
                }

                console.log("LAST GROUP ID: ", lastGroupId);

                try {
                    let profitHistories =
                        await this.profitHistoryRepository.getAllProfitGroup(lastGroupId);

                    if (profitHistories.length === 0) {
                        this.setState({
                            loading: false
                        });
                        break;
                    }

                    lastGroupId -= 11;

                    let grouped = [...this.state.groupedHistories];  // Shallow copy of the array

                    let lastDate;
                    let lastAmount;
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

                        grouped[groupIndex].histories.push({
                            id: history.id,
                            created_date: history.created_date,
                            amount: history.amount,
                            saved: false
                        });

                        if (lastDate !== date) {
                            try {
                                let response = await this.apiService.getProfitAmountByDate(date, this.props.navigation);
                                lastAmount = response.amount;
                            } catch (e) {
                                lastAmount = 0;
                            }

                            lastDate = date;
                        }

                        grouped[groupIndex].totalAmount = lastAmount;
                    }

                    this.setState(prevState => ({
                        profitHistory: [...prevState.profitHistory, ...profitHistories],
                        groupedHistories: grouped,
                        lastGroupId: lastGroupId,
                        loading: false
                    }));

                    await new Promise(resolve => setTimeout(resolve, 100)); // Adding delay to manage UI thread load
                } catch (error) {
                    this.setState({
                        loading: false
                    });

                    console.error('Error fetching profit histories:', error);
                    break;
                }


                /* FOR BOSS (MODAL) **
                let notAllowed = await AsyncStorage.getItem("not_allowed");
                this.setState({notAllowed: notAllowed}) */
            }
        });
    }

    async loadMore() {
        if (this.state.loading || this.state.globalFullyLoaded) {
            return;
        }

        this.setState({loading: true});

        let response;
        try {
            response = await this.apiService.getProfitGroups(
                this.state.firstGroupGlobalId,
                this.state.lastProfitGroupPage,
                22,
                this.props.navigation
            );
        } catch (error) {
            this.setState({loading: false});
            console.error("Error fetching global products:", error);
            return;
        }

        if (!response || !response.content || response.content.length === 0) {

            this.setState({
                loading: false,
                globalFullyLoaded: true
            });
            return;
        }

        let allProfitHistories = response.content;
        let grouped = [...this.state.groupedHistories];  // Shallow copy of the array

        let lastDate;
        let lastAmount;
        for (const history of allProfitHistories) {
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
                id: history.id,
                created_date: history.createdDate,
                amount: history.amount,
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

            grouped[groupIndex].totalAmount = lastAmount;
        }

        this.setState(prevState => ({
            profitHistory: [...prevState.profitHistory, ...allProfitHistories],
            groupedHistories: grouped,  // Update with the modified array
            firstGroupGlobalId: response.content[0].id,
            loading: false
        }));
    }


    render() {
        const {navigation} = this.props;

        return (
            <View style={styles.container}>
                <FlatList style={{width: "100%"}}
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
                              <View style={{width: "100%"}}>
                                  <View style={{
                                      borderBottomColor: "#AFAFAF",
                                      borderBottomWidth: 1,
                                      width: screenWidth - (16 * 2),
                                      marginRight: "auto",
                                      marginLeft: "auto",
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
                                      marginTop: 24,
                                      width: screenWidth - (16 * 2),
                                      marginRight: "auto",
                                      marginLeft: "auto"
                                  }}>
                                      <Text
                                          style={{
                                              fontFamily: "Gilroy-Medium",
                                              fontWeight: "500",
                                              fontSize: 16,
                                              marginBottom: 4
                                          }}>
                                          Muddatni tanlang
                                      </Text>

                                      <View>
                                          <TouchableOpacity
                                              onPress={async () => {
                                                  await AsyncStorage.setItem(
                                                      "calendarFromPage", "Profit"
                                                  );
                                                  navigation.navigate("Calendar")
                                              }}
                                              style={[
                                                  this.state.calendarInputContent === "--/--/----" ?
                                                      styles.calendarInput : styles.calendarInputActive
                                              ]}>
                                              <Text
                                                  style={[
                                                      this.state.calendarInputContent === "--/--/----" ?
                                                          styles.calendarInputPlaceholder : styles.calendarInputPlaceholderActive
                                                  ]}>{this.state.calendarInputContent}</Text>
                                          </TouchableOpacity>

                                          {
                                              this.state.calendarInputContent === "--/--/----" ? (
                                                  <CalendarIcon
                                                      style={styles.calendarIcon}
                                                      resizeMode="cover"/>
                                              ) : (
                                                  <CrossIcon
                                                      style={styles.calendarIcon}
                                                      resizeMode="cover"/>
                                              )
                                          }
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
                                      }}>{this.state.thisMonthProfitAmount.toLocaleString()} so’m</Text>
                                  </View>
                              </View>
                          )}

                          renderItem={({item}) => (
                              <ProfitGroup
                                  key={item.date}
                                  item={item}
                                  navigation={navigation}/>
                          )}
                />

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
                        animation="bounceInUp"
                        delay={0}
                        iterationCount={1}
                        direction="alternate"
                        style={{
                            height: screenHeight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                        <View style={{
                            // width: screenWidth - (16 * 2),
                            width: "100%",
                            paddingRight: 16,
                            paddingLeft: 16,
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

export default Profit;