import React from 'react';
import { Text, View } from 'react-native';

export const Loading = () => {
  return (
    <View
      style={{
        position: "absolute",
        width: '100%',
        height: '100%',
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
