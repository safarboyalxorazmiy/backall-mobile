import React, { Component, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, Dimensions, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import SwipeableFlatList from 'react-native-swipeable-list';

import BackIcon from "../../assets/arrow-left-icon.svg";
import { ScreenHeight } from 'react-native-elements/dist/helpers';
import CrossIcon from "../../assets/cross-icon.svg";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const data = [
  { id: 1, text: 'Coca Cola'},
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' },
  { id: 4, text: 'Item 3' },
  { id: 5, text: 'Item 3' },
  { id: 6, text: 'Item 3' },
  { id: 7, text: 'Item 3' },
  { id: 8, text: 'Item 3' },
  { id: 9, text: 'Item 3' },
  { id: 10, text: 'Item 3' },
  { id: 11, text: 'Item 3' },
  { id: 12, text: 'Item 3' },
  { id: 13, text: 'Item 3' },
  { id: 14, text: 'Item 3' },
  { id: 15, text: 'Item 3' },
  { id: 16, text: 'Item 3' },
  { id: 17, text: 'Item 3' },
  { id: 18, text: 'Item 3' },
  { id: 19, text: 'Item 3' },
  { id: 20, text: 'Item 3' },
  { id: 21, text: 'Item 3' },
  { id: 22, text: 'Item 3' },
  { id: 23, text: 'Item 3' },
  { id: 24, text: 'Item 3' },
  { id: 25, text: 'Item 3' },
  { id: 26, text: 'Item 3' },
  { id: 27, text: 'Item 3' },
  { id: 28, text: 'Item 3' },
  { id: 29, text: 'Item 3' },
  { id: 30, text: 'Item 3' }
];
  
const renderItem = ({ item }) => {
  return item.id % 2 === 1 ? (
    <View style={styles.productOdd}>
      <Text style={styles.productTitle}>{item.text}</Text>
      <Text style={styles.productCount}>10 blok</Text>
    </View>
  ) : (
    <View style={styles.product}>
      <Text style={styles.productTitle}>{item.text}</Text>
      <Text style={styles.productCount}>10 blok</Text>
    </View>
  );
};

// QUICK ACTIONS
const renderQuickActions = () => (
  <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'flex-end' }}>
      <Text style={{ color: 'white', padding: 10 }}>Delete</Text>
  </View>
);

const keyExtractor = (item) => item.id;

class Sell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
    };
  }

  toggleModal = () => {
    this.setState((prevState) => ({
      isModalVisible: !prevState.isModalVisible,
    }));
  };

  render() {
    const { navigation } = this.props;
    const { isModalVisible } = this.state;

    return (
      <>
        <View style={styles.container}>
          <View
            style={styles.pageTitle}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Basket')}
              style={styles.backIconWrapper}
            >
              <BackIcon />
            </TouchableOpacity>

            <Text style={styles.pageTitleText} >
              Sotiladigan mahsulotlar
            </Text>
          </View>
            
          <SwipeableFlatList
              data={data}
              renderItem={renderItem}
              renderQuickActions={renderQuickActions}
              keyExtractor={keyExtractor} 
          />

            <TouchableOpacity
              style={styles.productAddButton}
              onPress={this.toggleModal}
            >
              <Text style={styles.productAddButtonText}>Mahsulotni qo’lda kiritish</Text>
            </TouchableOpacity>

          <View style={styles.footer}>
            <View
              style={styles.footerTitle}
            >
              <Text style={styles.priceTitle}>Buyurtma narxi</Text>
              <Text style={styles.price}>105,000 so’m</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Shopping')}>
              <Text style={styles.buttonText}>Sotuvni amalga oshirish</Text>
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />

          <Modal visible={isModalVisible} animationType="slide" style={{
            
          }} transparent={true}>
            <View style={{
              position: "absolute", 
              width: screenWidth, 
              height: screenHeight, 
              flex: 1, 
              backgroundColor: "#00000099",

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
                  padding: 20, 
                  borderWidth: 1, 
                  borderRadius: 12, 
                  backgroundColor: "#fff",
                }}>
                  <View style={styles.crossIconWrapper}>
                    <TouchableOpacity onPress={this.toggleModal}>
                      <CrossIcon />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text style={styles.modalLabel}>Mahsulot nomi</Text>
                    <TextInput style={styles.modalInput} placeholder="Nomini kiriting" placeholderTextColor="#AAAAAA" />
                  </View>

                  <View style={styles.inputBlock}>
                    <Text style={styles.modalLabel}>Qiymati</Text>
                    <TextInput style={styles.modalInput} placeholder="Sonini kiriting" placeholderTextColor="#AAAAAA" />
                  </View>

                  <View style={styles.inputBlock}>
                    <Text style={styles.modalLabel}>Sotuvdagi narxi (1 kg/dona)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="1 kg/dona narxini kiriting"
                      placeholderTextColor="#AAAAAA"
                    />
                  </View>

                  <TouchableOpacity style={styles.modalButton} onPress={this.toggleModal}>
                    <Text style={styles.modalButtonText}>Savatga qo’shish</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </>
    );
  }
}


const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 52
  },

  pageTitle: {
    width: screenWidth - (16 + 16),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  pageTitleText: {
    width: 299,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: "600",
  },
  
  backIconWrapper: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 16,
    paddingHorizontal: 19,
    borderRadius: 8,
  },

  productList: {},

  product: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: screenWidth - (17 + 17),
      paddingVertical: 13,
      paddingHorizontal: 4,
      backgroundColor: "white"
  },

  productOdd: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: screenWidth - (17 + 17),
      paddingVertical: 13,
      paddingHorizontal: 4,
      backgroundColor: "#F1F1F1"
  },

  productTitle: {
      fontSize: 16,
      fontFamily: "Gilroy-Medium",
      fontWeight: "500"
  },

  productCount: {
      fontFamily: "Gilroy-Medium",
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500"
  },

  scan: {
      width: 71,
      height: 71,
      backgroundColor: "#000",
      position: "absolute",
      borderRadius: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      right: 20,
      bottom: 172
  },

  priceTitle: {
      fontFamily: "Gilroy-Regular",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24
  },

  price: {
      fontSize: 18,
      fontWeight: "600",
      fontFamily: "Gilroy-SemiBold",
  },

  button: {
      paddingVertical: 14,
      backgroundColor: "#222",
      width: screenWidth - (17 + 17),
      marginLeft: "auto",
      marginRight: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      marginBottom: 12
  },

  buttonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Gilroy-Medium",
      lineHeight: 24
  },

  productAddButton: {
    width: screenWidth - (17 + 17),
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 8,
    marginTop: 16
  },

  productAddButtonText: { 
    textAlign: 'center'
  }, 

  crossIconWrapper: {
    height: 24, 
    width: "100%",
    display: "flex", 
    alignItems: "flex-end", 
    justifyContent: "flex-end", 
    marginBottom: 24,
    marginTop: 10
  },

  crossIcon: {
    backgroundColor: "blue", 
    width: 24, 
    height: 24
  },

  footer: {
    backgroundColor: '#fff',
    width: "100%",
  },

  footerTitle: {
    paddingBottom: 22,
    paddingTop: 16,
    paddingHorizontal: 17,
    width: "100%",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row',

    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },

  modalInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#AFAFAF",
    borderRadius: 8,

    fontFamily: "Gilroy-Medium",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4
  },

  modalLabel: {
    fontFamily: "Gilroy-Medium",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24
  },

  inputBlock: { 
    marginTop: 16 
  },

  modalButton: {
    marginTop: 24,
    backgroundColor: "#222222",
    paddingVertical: 14,
    borderRadius: 8
  },

  modalButtonText: {
    color: "#fff",
    fontFamily: "Gilroy-Medium",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center"
  }

});

export default Sell;