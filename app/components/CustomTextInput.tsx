import {
  StyleSheet,
  TextInput,
  Text,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';

const CustomTextInput = (props: any) => {
  const { placeHolder, eyePassword, error, onChangeText, value } = props;
  const [eyeIcon, setEyeIcon] = useState(
    require('../../assets/images/hiddenPasswordIcon.png')
  );
  const [securePassword, setSecurePassword] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setSecurePassword(!securePassword);
    if (securePassword) {
      setEyeIcon(require('../../assets/images/eyeIcon.png'));
    } else {
      setEyeIcon(require('../../assets/images/hiddenPasswordIcon.png'));
    }
  };

  const inputStyle = [
    Styles.textInput,
    isFocused && { borderColor: '#009245', borderWidth: 2 },
  ];

  return (
    <View>
      {!eyePassword ? (
        <>
          <TextInput
            style={inputStyle}
            placeholder={placeHolder}
            onChangeText={onChangeText}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {error && <Text style={Styles.error}>{error}</Text>}
        </>
      ) : (
        <>
          <View style={Styles.inputContainer}>
            <TextInput
              style={inputStyle}
              placeholder={placeHolder}
              secureTextEntry={securePassword}
              onChangeText={onChangeText}
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={Styles.eyeContainer}
            >
              <Image style={Styles.eyePassword} source={eyeIcon} />
            </TouchableOpacity>
          </View>
          {error && <Text style={Styles.error}>{error}</Text>}
        </>
      )}
    </View>
  );
};

export default CustomTextInput;

const Styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeContainer: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  eyePassword: {
    resizeMode: 'contain',
    width: 29,
    height: 24,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8B8B8B',
    marginVertical: 5,
  },
  error: {
    fontFamily: 'Poppins-Bold',
    marginLeft: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
  },
});
