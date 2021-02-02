import React, {useContext, useEffect} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {MiMiniMap} from '@mappedin/react-native-sdk';
import {RootContext} from './app';

enum MINIMAP_STATE {
  HIDDEN,
  VISIBLE,
  LOADING,
}

export const MiniMap = () => {
  const {selectedLocation, options} = React.useContext(RootContext);
  const [miniMapState, setMiniMapState] = React.useState<MINIMAP_STATE>(
    MINIMAP_STATE.HIDDEN,
  );

  useEffect(() => {
    setMiniMapState(MINIMAP_STATE.HIDDEN);
  }, [selectedLocation]);

  if (selectedLocation == null) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (miniMapState === MINIMAP_STATE.HIDDEN) {
            setMiniMapState(MINIMAP_STATE.LOADING);
          }
        }}
        style={{
          backgroundColor: '#AAA',
          borderColor: '#DDD',
          borderWidth: 1,
          width: '100%',
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        {miniMapState !== MINIMAP_STATE.HIDDEN && (
          <MiMiniMap
            onLoad={() => {
              setMiniMapState(MINIMAP_STATE.VISIBLE);
            }}
            style={{
              width: '100%',
              height: '100%',
              opacity: miniMapState !== MINIMAP_STATE.VISIBLE ? 0 : 1,
            }}
            options={options.current}
            polygonHighlightColor="blue"
            location={selectedLocation}
          />
        )}
        {miniMapState !== MINIMAP_STATE.VISIBLE && (
          <Text style={{fontSize: 20, color: '#333', position: 'absolute'}}>
            {miniMapState === MINIMAP_STATE.LOADING
              ? 'Minimap loading...'
              : 'Show MiniMap'}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
};
