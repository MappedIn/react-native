import React, { useContext, useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';
// import { RootContext } from '..';

export const Search = () => {
//   const rootController = useContext(RootContext);
  const [value, setValue] = React.useState('');

  return (
    <>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          height: 50,
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>Search</Text>
      </View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        onChangeText={(text) => setValue(text)}
        placeholder="Search for a store"
        value={value}
      />
    </>
  );
};
