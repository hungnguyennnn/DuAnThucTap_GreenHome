import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React from 'react';

const AppHeader = ({
  navigation,
  title,
  cart,
  deleteCart,
  funcDeleteCart,
  style,
}: any) => {
  // Navigation
  const goBack = () => {
    navigation.goBack();
  };

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const renderRightIcon = () => {
    if (deleteCart) {
      return (
        <TouchableOpacity onPress={funcDeleteCart}>
          <Image
            style={styles.icon}
            source={require('../../assets/images/deleteIcon.png')}
          />
        </TouchableOpacity>
      );
    } else if (cart) {
      return (
        <TouchableOpacity onPress={goToCart}>
          <Image
            style={styles.icon}
            source={require('../../assets/images/cartIcon.png')}
          />
        </TouchableOpacity>
      );
    }
    return <View />;
  };

  return (
    <View style={[styles.headerContainer, style]}>
      <TouchableOpacity onPress={goBack}>
        <Image
          style={styles.backIcon}
          source={require('../../assets/images/backIcon.png')}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {renderRightIcon()}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  headerContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backIcon: {
    marginLeft: -10,
    width: 24,
    height: 24,
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'Poppins',
  },
});
