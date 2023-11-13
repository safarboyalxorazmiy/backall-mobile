import React, { Component } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  TouchableOpacity,
  Modal
} from 'react-native';
import BackIcon from '../assets/arrow-left-icon.svg'
import DeleteIcon from '../assets/delete-icon.svg'
import CalendarIcon from '../assets/blue-calendar-icon.svg';
import { TextInput } from 'react-native-gesture-handler';
import { Calendar } from 'react-native-calendars';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class CalendarPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isModalVisible: false,
          selectedDate: ''
        };
      }

      toggleModal = () => {
        this.setState((prevState) => ({
          isModalVisible: !prevState.isModalVisible,
        }));
      };

      onDayPress = (day) => {
        this.setState({ selectedDate: day.dateString });

        console.log(day)
      };
  
  render() {
      const { navigation } = this.props;
      const { isModalVisible, selectedDate } = this.state;

      return (
          <View style={styles.container}>
              <View style={styles.header}>
                      <TouchableOpacity
                          onPress={() => navigation.navigate('Shopping')}
                          style={styles.backButton}
                      >
                          <BackIcon />
                      </TouchableOpacity>

                      <Text style={styles.title}>Sotilgan mahsulotlar</Text>

                      <TouchableOpacity
                          onPress={() => navigation.navigate('Shopping')}
                          style={styles.deleteIcon}
                      >
                          <DeleteIcon />
                      </TouchableOpacity>
              </View>
              
              <View style={{
                  width: screenWidth - (16 * 2),
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  marginTop: 24
              }}>
                  <TouchableOpacity style={{width: (screenWidth / 3) - (16 * 2), backgroundColor: "#272727", padding: 10, borderRadius: 8}}>
                      <Text style={{color: "white", textAlign: "center", fontFamily: "Gilroy-Medium", fontWeight: "500"}}>Bugun</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{width: (screenWidth / 3) - (16 * 2), backgroundColor: "#EEEEEE", padding: 10, borderRadius: 8}}>
                      <Text style={{color: "black", textAlign: "center", fontFamily: "Gilroy-Medium", fontWeight: "500"}}>Hafta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{width: (screenWidth / 3) - (16 * 2), backgroundColor: "#EEEEEE", padding: 10, borderRadius: 8}}>
                      <Text style={{color: "black", textAlign: "center", fontFamily: "Gilroy-Medium", fontWeight: "500"}}>Oy</Text>
                  </TouchableOpacity>
              </View>

              <View style={{width: screenWidth - (16 * 2), marginTop: 24}}>
                  <Text style={{fontFamily: "Gilroy-SemiBold", fontWeight: "600"}}>Davrni tanlang</Text>
              </View>

              <View style={{marginTop: 14, width: screenWidth - (16 * 2), display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                  <Text style={styles.label}>dan</Text>

                  <View style={{display: "flex", flexDirection: "row", gap: 12}}>
                      <TextInput placeholder='04' style={styles.input} />
                      <TextInput placeholder='dekabr' style={[styles.input, {width: 66}]}  />
                      <TextInput placeholder='2022'  style={styles.input} />
                  </View>

                  <CalendarIcon onPress={this.toggleModal} />
              </View>

              <Modal visible={isModalVisible} animationType="slide" transparent={true}>
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
                            borderRadius: 12, 
                            backgroundColor: "#fff",
                        }}>
                            <View style={{borderBottomColor: "#CAC4D0", borderBottomWidth: 1}}>
                                <View style={{paddingTop: 16, paddingLeft: 24, paddingBottom: 12, paddingRight: 12}}>
                                    <Text style={{fontFamily: "Gilroy-Medium", fontSize: 14, fontWeight: "500", marginBottom: 12}}>2023</Text>
                                    <Text style={{fontFamily: "Gilroy-Medium", fontSize: 24, fontWeight: "500"}}>Juma, 17-sen</Text>
                                </View>
                            </View>
                            
                            <Calendar
                                onDayPress={this.onDayPress}
                                markedDates={{
                                    [selectedDate]: { selected: true, selectedColor: 'blue' },
                                }}
                            />

                            <View style={{paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 8}}>
                                <TouchableOpacity style={{paddingHorizontal: 14, paddingVertical: 10}}>
                                    <Text style={{color: "#6750A4", fontWeight: "500", fontSize: 14}}>Bekor qilish</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{paddingHorizontal: 14, paddingVertical: 10}}>
                                    <Text style={{color: "#6750A4", fontWeight: "500", fontSize: 14}}>Tasdiqlash</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                </Modal>

              <View style={{marginTop: 26, width: screenWidth - (16 * 2), display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                  <Text style={styles.label}>gacha</Text>

                  <View style={{display: "flex", flexDirection: "row", gap: 12}}>
                      <TextInput placeholder='04' style={styles.input} />
                      <TextInput placeholder='dekabr' style={[styles.input, {width: 66}]}  />
                      <TextInput placeholder='2022'  style={styles.input} />
                  </View>

                  <CalendarIcon />
              </View>

              <TouchableOpacity style={{width: screenWidth - (16 * 2), backgroundColor: "#222222",marginTop: "auto", marginBottom: 44, paddingVertical: 14, borderRadius: 8}}>
                  <Text style={{color: "#fff", textAlign: "center", fontFamily: "Gilroy-Medium", fontWeight: "500", lineHeight: 24}}>Tasdiqlash</Text>
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
      flexDirection: 'row',
      justifyContent: "space-between",
      alignItems: 'center',
      marginBottom: 16,
  },

  backButton: {
      backgroundColor: '#F5F5F7',
      paddingVertical: 16,
      paddingHorizontal: 19,
      borderRadius: 8,
  },

  title: {
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'Gilroy-SemiBold',
      fontWeight: '600',
  },

  deleteIcon: {
      backgroundColor: '#F5F5F7',
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