import React, {Component} from "react";
import DropDownPicker from 'react-native-dropdown-picker';
import {Dimensions, StyleSheet, Text, TextInput, View} from "react-native";
import {SelectList} from 'react-native-dropdown-select-list'
import {FontAwesome} from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

class ProductEdit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: "",
			data: [
				{key: "1", value: "%"},
				{key: "2", value: "SUM"},
			],

			open: false,
			value: "2",
			items: [
				{label: "%", value: "1"},
				{label: "SUM", value: "2"},
			],

			dropdownStyle: styles.dropdownStyle
		};

		this.setOpenState = this.setOpenState.bind(this);
		this.setValue = this.setValue.bind(this);
		this.setItems = this.setItems.bind(this);
	}

	setOpenState(open) {
		this.setState({
			open
		});
	}

	setValue(callback) {
		this.setState(state => ({
			value: callback(state.value)
		}));


		console.log(callback(this.state.value))
	}

	setItems(callback) {
		this.setState(state => ({
			items: callback(state.items)
		}));
	}

	render() {
		const {open, value, items} = this.state;

		return (
			<View style={{backgroundColor: "white", paddingTop: 200}}>
				<View style={styles.inputWrapper}>
					<Text style={styles.label}>Sotilish narxi</Text>
					<View style={styles.inputGroup}>
						<TextInput
							cursorColor="#222222"
							keyboardType="numeric"
							style={styles.priceInput}
							placeholder="Sotilish narxi: "
							placeholderTextColor="#AAAAAA"
						/>

						<View style={styles.priceType}>
							<SelectList
								setSelected={(val) => {
									this.setState({selected: val});
								}}
								defaultOption={{key: "2", value: "SUM"}}
								data={this.state.data}
								save="value"
								search={false}
								fontFamily="Gilroy-Medium"
								dropdownTextStyles={{
									color: "white",
									fontFamily: "Gilroy-Medium",
									fontWeight: 500,
									fontSize: 16
								}}
								boxStyles={{
									backgroundColor: "#444444",
									width: 122,
									borderTopRightRadius: 10,
									borderBottomRightRadius: 10,
									borderTopLeftRadius: 0,
									borderBottomLeftRadius: 0,
									height: 52,
									position: "relative",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 20
								}}
								inputStyles={{color: "white"}}
								dropdownStyles={{
									position: "absolute",
									top: 42,
									backgroundColor: "#444444",
									width: 122,
									borderTopLeftRadius: 0,
									zIndex: 10
								}}
								dropdownItemStyles={{paddingVertical: 14}}
								arrowicon={<FontAwesome name="chevron-down" size={14} color={'white'}/>}
							/>
						</View>
					</View>
				</View>
				<View style={styles.inputWrapper}>
					<Text style={styles.label}>Sotilish narxi</Text>
					<View style={styles.inputGroup}>
						<TextInput
							cursorColor="#222222"
							keyboardType="numeric"
							style={styles.priceInput}
							placeholder="Sotilish narxi: "
							placeholderTextColor="#AAAAAA"
						/>

						<View style={styles.priceType}>
							<DropDownPicker
								mode={"SIMPLE"}
								theme="DARK"
								modalAnimationType={"slide"}
								dropDownDirection={"BOTTOM"}
								open={open}
								value={value}
								items={items}
								setOpen={this.setOpenState}
								setValue={this.setValue}
								setItems={this.setItems}

								style={this.state.dropdownStyle}
								containerStyle={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center"
								}}
								// arrowIconContainerStyle={{backgroundColor: "white"}}
								arrowIconStyle={{borderColor: ""}}
								textStyle={{color: "white", fontSize: 16}}
								dropDownContainerStyle={{
									width: 122,
									backgroundColor: "#444444",
								}}
								onPressIn={() => {
										this.setState({dropdownStyle: styles.dropdownActiveStyle})
									}
								}
							/>
						</View>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	inputWrapper: {
		marginBottom: 16
	},

	inputGroup: {
		width: screenWidth - (17 + 17),
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between"
	},

	label: {
		fontFamily: "Gilroy-Medium",
		fontWeight: "500",
		fontSize: 16,
		marginBottom: 4
	},

	priceType: {
		display: "flex",
		flexDirection: "row",
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
		width: 122,

	},

	priceInput: {
		borderWidth: 1,
		borderColor: "#AFAFAF",
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		width: screenWidth - (17 + 17 + 122),
		maxHeight: 52,
		fontSize: 16,
		fontFamily: "Gilroy-Medium",
	},

	dropdownStyle: {
		width: 122,
		backgroundColor: "#444444",
		opacity: 1,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		height: 52,
		position: "relative",
		zIndex: -1,
		borderWidth: 0,
	},

	dropdownActiveStyle: {
		width: 122,
		backgroundColor: "#000",
		opacity: 1,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		height: 52,
		position: "relative",
		zIndex: -1,
		borderWidth: 0,
	}
})


export default ProductEdit;