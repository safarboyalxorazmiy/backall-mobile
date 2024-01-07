import React, { Component } from "react";
import DropDownPicker from 'react-native-dropdown-picker';
import {View} from "react-native";

class ProductEdit extends Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false,
			value: null,
			items: [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			]
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
	}

	setItems(callback) {
		this.setState(state => ({
			items: callback(state.items)
		}));
	}

	render() {
		const { open, value, items } = this.state;

		return (
			<View style={{marginTop: 100, paddingBottom: 200}}>
				<DropDownPicker
					style={{width: 200}}
					dropDownContainerStyle={{width: 200}}
					mode={"SIMPLE"}
					modalAnimationType={"slide"}
					dropDownDirection={"BOTTOM"}
					open={open}
					value={value}
					items={items}
					setOpen={this.setOpenState}
					setValue={this.setValue}
					setItems={this.setItems}
				/>
			</View>
		);
	}
}

export default ProductEdit;