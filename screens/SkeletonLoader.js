import React from 'react';
import { Dimensions, Appearance } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { View } from 'react-native-animatable';

const screenWidth = Dimensions.get("window").width;

const SkeletonLoader = () => {
  const colorScheme = Appearance.getColorScheme(); // Get current color scheme

  return (
    <View style={{
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      gap: 12,
      marginTop: 14,
      marginBottom: 14,
    }}>
      {[1, 2].map((key) => (
        <Skeleton
          key={key}
          width={screenWidth - 16}
          height={45}
          style={{
            marginTop: 4,
          }}
          colorMode={colorScheme === 'dark' ? 'dark' : 'light'} 
        />
      ))}
    </View>
  );
};

export default SkeletonLoader;