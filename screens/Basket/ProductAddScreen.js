import React, {Component} from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Image
} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import ToggleSwitch from 'toggle-switch-react-native';

import BackIcon from "../../assets/arrow-left-icon.svg"
import DatabaseService from "../../services/DatabaseService";

const amountData = [
    {label: "DONA", value: "1"},
    {label: "KG", value: "2"},
    {label: "GR", value: "3"},
    {label: "LITR", value: "4"}
];

const priceData = [
    {label: "%", value: "1"},
    {label: "SUM", value: "2"},
    {label: "$", value: "3"},
    {label: "EURO", value: "4"}
];


const screenWidth = Dimensions.get("window").width;

const databaseService = new DatabaseService();

class ProductAdd extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedItem: null,

            seriyaInputValue: "",
            brandInputValue: "",
            productInputValue: "",
            amountInputValue: "",
            priceInputValue: "",
            sellingPriceInputValue: "",
            percentageInputValue: "",
            products: [],
            nds: false,

            serialInputStyle: styles.serialInput,
            serialInputContentStyle: {display: "none"}
        };
    }

    handleButtonClick = () => {
        const {
            seriyaInputValue,
            brandInputValue,
            productInputValue,
            amountInputValue,
            priceInputValue,
            sellingPriceInputValue,
            percentageInputValue,
        } = this.state;

        console.log("Seriya Value:", seriyaInputValue);
        console.log("Brand Value:", brandInputValue);
        console.log("Product Value:", productInputValue);
        console.log("Amount Value:", amountInputValue);
        console.log("Price Value:", priceInputValue);
        console.log("Selling Price Value:", sellingPriceInputValue);
        console.log("Percentage Value:", percentageInputValue);
    };

    handleDropdownSelect = (value) => {
        this.setState({value});
    };

    getSelectedItem = () => {
        const selectedItem = data.find((item) => item.value === this.state.value);
        return selectedItem ? selectedItem.label : "Dona";
    };

    defineInputContentStyle = (hide) => {
        if (hide) {
            this.setState({serialInputContentStyle: {display: "none"}});
            this.setState({serialInputStyle: styles.input})

            return;
        }

        if (this.state.products.length === 0) {
            this.setState({serialInputContentStyle: {display: "none"}});
            this.setState({serialInputStyle: styles.input})
        } else {
            this.setState({serialInputStyle: styles.serialInputClicked})
            this.setState({serialInputContentStyle: styles.serialContent});
        }
    }

    getProductsBySeria = async (seria) => {
        this.setState({seriyaInputValue: seria});
        console.log(seria);
        this.setState({products: await databaseService.findProductsBySerialNumber(seria)});

        this.defineInputContentStyle(false);
    }

    setSerialInputActive = () => {
        this.setState({serialInputStyle: styles.serialInputClicked})

        this.defineInputContentStyle(false);
    }

    setSerialInputNotActive = () => {
        this.setState({serialInputStyle: styles.serialInput})
    }

    bodyTouched = () => {
        this.setSerialInputNotActive();

        this.defineInputContentStyle(true);
    }


    selectProduct = (product) => {
        console.log("SELECTED PRODUCT: ", product);

        this.setState({seriyaInputValue: product.serial_number})
        this.setState({brandInputValue: product.brand_name})
        this.setState({productInputValue: product.name})
        this.defineInputContentStyle(true);
    }

    render() {
        const {navigation} = this.props;

        return (
            //  onTouchStart={this.bodyTouched}
            <View>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.pageTitle}>
                        <TouchableOpacity onPress={() => navigation.navigate("Basket")} style={styles.backIcon}>
                            <BackIcon/>
                        </TouchableOpacity>

                        <Text style={styles.pageTitleText}>
                            Mahsulot qo’shish
                        </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot seriyasi</Text>
                        <TextInput
                            style={this.state.serialInputStyle}
                            placeholder="Seriyasini kiriting"
                            placeholderTextColor="#AAAAAA"
                            value={this.state.seriyaInputValue}
                            onChangeText={this.getProductsBySeria}
                            onFocus={this.setSerialInputActive}
                        />

                        <View style={this.state.serialInputContentStyle}>
                            {this.state.products.map((item, index) => (
                                <TouchableOpacity onPress={() => {
                                    this.selectProduct(item)
                                }} style={styles.serialInputSuggestion} key={index}>
                                    <Text>{item.brand_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Brand nomi</Text>
                        <TextInput
                            onTouchStart={this.bodyTouched}
                            style={styles.input}
                            value={this.state.brandInputValue}
                            placeholder="Brand nomini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({brandInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot nomi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nomini kiriting"
                            placeholderTextColor="#AAAAAA"
                            value={this.state.productInputValue}
                            onChangeText={(text) => this.setState({productInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Mahsulot miqdori</Text>
                        <View style={styles.amountGroup}>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="Miqdorini kiriting"
                                placeholderTextColor="#AAAAAA"
                                onChangeText={(text) => this.setState({amountInputValue: text})}
                            />

                            <View style={styles.amountType}>
                                <Dropdown
                                    data={amountData}
                                    labelField="label"
                                    valueField="value"
                                    value="1"
                                    onChange={this.handleDropdownSelect}

                                    style={[styles.dropdown, {borderRadius: 8}]}

                                    baseColor="white"

                                    selectedTextProps={{
                                        style: {
                                            fontSize: 16,
                                            color: "white",
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                        },
                                    }}

                                    activeColor="black"
                                    selectedTextStyle={{
                                        fontSize: 16,
                                        color: "white"
                                    }}

                                    fontFamily="Gilroy-Medium"


                                    containerStyle={{
                                        backgroundColor: "#444444",
                                        borderTopRightRadius: 8,
                                        borderBottomRightRadius: 8,
                                        overflow: "hidden"
                                    }}
                                    itemContainerStyle={{backgroundColor: "#444444"}}

                                    itemTextStyle={{color: "white"}}

                                    iconStyle={{tintColor: "white", width: 24, height: 24}}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tan narxi (so’mda)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Narxini kiriting"
                            placeholderTextColor="#AAAAAA"
                            onChangeText={(text) => this.setState({priceInputValue: text})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Sotilish narxi</Text>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Sotilish narxi: "
                                placeholderTextColor="#AAAAAA"
                                onChangeText={(text) => this.setState({sellingPriceInputValue: text})}
                            />

                            <View style={styles.priceType}>
                                <Dropdown
                                    data={priceData}
                                    labelField="label"
                                    valueField="value"
                                    value="1"
                                    onChange={this.handleDropdownSelect}

                                    style={[styles.dropdown, {borderRadius: 8}]}

                                    baseColor="white"

                                    selectedTextProps={{
                                        style: {
                                            fontSize: 16,
                                            color: "white",
                                            fontFamily: "Gilroy-Medium",
                                            fontWeight: "500",
                                        },
                                    }}

                                    activeColor="black"
                                    selectedTextStyle={{
                                        fontSize: 16,
                                        color: "white"
                                    }}

                                    fontFamily="Gilroy-Medium"


                                    containerStyle={{
                                        backgroundColor: "#444444",
                                        borderTopRightRadius: 8,
                                        borderBottomRightRadius: 8,
                                        overflow: "hidden"
                                    }}
                                    itemContainerStyle={{backgroundColor: "#444444"}}

                                    itemTextStyle={{color: "white"}}

                                    iconStyle={{tintColor: "white", width: 24, height: 24}}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: screenWidth - (17 + 17)
                    }}>
                        <Text style={{fontSize: 18, fontFamily: "Gilroy-Medium"}}>NDS soliq</Text>

                        <ToggleSwitch
                            isOn={this.state.nds}
                            onColor="#65C466"
                            offColor="gray"
                            labelStyle={{color: "black", fontWeight: "900"}}
                            size="large"
                            onToggle={isOn => this.setState({nds: isOn})}
                        />

                    </View>

                    <TouchableOpacity style={styles.buttonDark} onPress={this.handleButtonClick}>
                        <Text style={styles.buttonDarkText}>Mahsulotni qo’shish</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonLight} onPress={() => navigation.navigate("Basket")}>
                        <Text style={styles.buttonLightText}>Bekor qilish</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: 52,
        paddingBottom: 12,
        gap: 10
    },

    label: {
        fontFamily: "Gilroy-Medium",
        fontWeight: "500",
        fontSize: 16,
        marginBottom: 4
    },

    inputWrapper: {
        marginBottom: 16
    },

    input: {
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "Gilroy-Medium"
    },

    serialInput: {
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "Gilroy-Medium"
    },

    serialInputClicked: {
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        backgroundColor: "#FFF",
        borderColor: "#AFAFAF",
        borderRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        borderBottomWidth: 0
    },

    serialInputValued: {
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: "Gilroy-Medium"
    },

    serialContent: {
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopWidth: 0
    },

    serialContentEmpty: {
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopWidth: 0
    },

    serialInputSuggestion: {
        paddingVertical: 14,
        paddingHorizontal: 16,

    },

    inputGroup: {
        width: screenWidth - (17 + 17),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    priceInput: {
        borderWidth: 1,
        borderColor: "#AFAFAF",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        width: screenWidth - (17 + 17 + 122),
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
    },

    priceType: {
        display: "flex",
        flexDirection: "row",
        gap: 25,
        alignItems: "center",
        justifyContent: "center",
        width: 122,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: "#444444"
    },

    amountGroup: {
        display: "flex",
        flexDirection: "row"
    },

    amountInput: {
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderColor: "#AFAFAF",
        width: screenWidth - (17 + 17 + 122),
        fontSize: 16,
        fontFamily: "Gilroy-Medium",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10
    },

    amountType: {
        display: "flex",
        flexDirection: "row",
        gap: 25,
        alignItems: "center",
        justifyContent: "center",
        width: 122,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: "#444444",
        color: "white"
    },

    dropdown: {
        width: 122,
        paddingHorizontal: 16,
        backgroundColor: "#444444",
    },

    buttons: {
        width: screenWidth - (17 + 17),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    buttonDark: {
        backgroundColor: "#222222",
        paddingVertical: 14,
        paddingHorizontal: 47,
        borderRadius: 8,
        width: screenWidth - (17 + 17)
    },

    buttonLight: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 47,
        borderRadius: 8,
        width: screenWidth - (17 + 17),
        borderWidth: 1,
        borderColor: "#222222",
        marginBottom: 12
    },

    buttonLightText: {
        color: "black",
        fontFamily: "Gilroy-Medium",
        fontSize: 16,
        textAlign: "center",
    },

    buttonDarkText: {
        color: "white",
        fontFamily: "Gilroy-Medium",
        fontSize: 16,
        textAlign: "center"
    },

    pageTitle: {
        width: screenWidth - (17 + 17),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16
    },

    pageTitleText: {
        width: 299,
        textAlign: "center",
        fontSize: 28,
        fontFamily: "Gilroy-SemiBold",
        fontWeight: "600"
    },

    backIcon: {
        backgroundColor: "#F5F5F7",
        paddingVertical: 16,
        paddingHorizontal: 19,
        borderRadius: 8
    },


});

export default ProductAdd;