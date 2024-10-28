import React, { useEffect } from 'react';
import { 
  TouchableWithoutFeedback,
  Text, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function AnimatedButton({ content, onPress }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(0.9, { damping: 5 });
    scale.value = withSpring(1, { damping: 5 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 5 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 5 });

    onPress();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.buttonText}>{content}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
		width: screenWidth - (24 + 24),
		height: 66,
		backgroundColor: "#222",
		color: "white",
		paddingVertical: 14,
		borderRadius: 10,
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
  },
  buttonText: {
    color: "white",
		textAlign: "center",
		fontSize: 20,
		textTransform: "capitalize",
		fontWeight: "500",
		fontFamily: "Montserrat-Medium"
  },

});