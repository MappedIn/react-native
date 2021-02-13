import React, { useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

type TLocationCardProps = {
  desiredHeight: number;
  isOpen: boolean;
  children: React.ReactNode;
};

export const Card = ({
  desiredHeight,
  isOpen,
  children,
}: TLocationCardProps) => {
  const height = Dimensions.get('window').height;

  const transformAnimation = React.useRef(new Animated.Value(height));

  const slideOut = () => {
    Animated.timing(transformAnimation.current, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const slideTo = (h: number) => {
    Animated.timing(transformAnimation.current, {
      toValue: h,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    console.log(isOpen, desiredHeight);
    if (isOpen === true) {
      slideTo(0);
    } else {
      slideOut();
    }
  }, [desiredHeight, isOpen]);

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          height: desiredHeight,
          position: 'absolute',
          backgroundColor: '#CCC',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 10,
          zIndex: 999,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 8,
        },
        {
          transform: [{ translateY: transformAnimation.current }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
