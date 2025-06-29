import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import ProductList from '../admin1/productList';

const CombosScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ProductList productType="combos" title="Bộ sản phẩm" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CombosScreen;