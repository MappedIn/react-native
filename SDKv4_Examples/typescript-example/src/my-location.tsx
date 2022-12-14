import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { RootContext } from './app';

export const MyLocation = () => {
  const { nearestLocation, currentLevel } = useContext(RootContext);
  
  if (nearestLocation == null) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        backgroundColor: '#DDD',
        top: 0,
        zIndex: 9999,
        justifyContent: 'center',
        width: '100%',
        height: 100,
        paddingLeft: 40,
        paddingRight: 40,
      }}
    >
      <Text
        textBreakStrategy="simple"
        style={{
          color: '#111',
          fontSize: 20,
          fontWeight: '600',
          // fontFamily: '',
          alignSelf: 'flex-start',
        }}
      >
        Blue Dot location:
      </Text>
      <Text style={{ fontSize: 18, color: '#444' }}>
        {nearestLocation?.name}
      </Text>
      {currentLevel && (
        <Text
          style={{
            color: '#444',
            fontSize: 18,
            fontWeight: '600',
            alignSelf: 'flex-start',
          }}
        >
          {currentLevel}
        </Text>
      )}
    </View>
  );
};
