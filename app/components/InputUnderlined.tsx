import { StyleSheet, Text, View, TextInput } from 'react-native';
import React from 'react';

const InputUnderlined = (props: any) => {
  const { value, placeholder, editable, color, onChangeText } = props;
  const textStyle =
    color === 'black'
      ? [styles.subTitle, { color: 'black', fontWeight: 'bold' }]
      : styles.subTitle;

  return (
    <View>
      <TextInput
        editable={editable}
        onChangeText={onChangeText}
        style={textStyle}
        placeholder={placeholder}
        value={value}
        {...props}
      />
    </View>
  );
};

export default InputUnderlined;

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 16,
    borderWidth: 0,
    borderBottomColor: 'gray',
    paddingBottom: 5,
    borderBottomWidth: 1,
    marginBottom: 2,
    color: 'gray',
  },
});
