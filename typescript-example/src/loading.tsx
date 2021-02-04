import React from 'react';
import { Text, View } from 'react-native';

export const Loading = () => {
  return (
    <View
      style={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: "absolute",
        zIndex: 999,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 24, color: '#333' }}>Loading...</Text>
    </View>
  );
};
