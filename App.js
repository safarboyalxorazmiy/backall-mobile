import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';

import Login from './LoginScreen';
import Home from './HomeScreen';
import * as Font from 'expo-font';

const Stack = createStackNavigator();

class App extends Component {
  componentDidMount() {
    this.loadCustomFonts();
  }

  async loadCustomFonts() {
    await Font.loadAsync({
      'roboto-regular': require('./assets/fonts/Roboto-Regular.ttf'),
      'roboto-black': require('./assets/fonts/Roboto-Black.ttf'),
      'roboto-bold': require('./assets/fonts/Roboto-Bold.ttf')
    });
  }

  render() {

    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={({ navigation }) => ({
              title: '',
              headerShown: false 
            })}
          />

          <Stack.Screen name="Home" component={Home} 
            options={({ navigation }) => ({
              title: '', 
              headerShown: false 
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
