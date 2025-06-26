import React, { useState, memo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { FilterType, Product } from '../redux/slices/productSlice';
import { setProductsToList, fetchAllProducts } from '../redux/actions/productActions';
import { setSelectedFilter } from '../redux/slices/productSlice';
import AppHeader from '../components/AppHeader';
import Item from '../components/Item';

const ListProduct = (props: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    filteredProducts, 
    selectedFilter, 
    loading, 
    error,
    plants,
    plantpots,
    accessories
  } = useSelector((state: RootState) => state.products);
  
  const { navigation } = props;

  // Lấy products từ params
  const screenParams = props?.route?.params || {};
  
  // Xác định loại sản phẩm khi component mount
  useEffect(() => {
    const loadData = async () => {
      // Nếu không có sản phẩm trong state, tải dữ liệu từ API
      if (plants.length === 0 && plantpots.length === 0 && accessories.length === 0) {
        await dispatch(fetchAllProducts());
      }

      // Nếu có tham số products trong route
      if (screenParams?.products && screenParams.products.length > 0) {
        dispatch(
          setProductsToList({
            productType: screenParams.productType || screenParams.products[0].type,
            products: screenParams.products,
          })
        );
      } 
      // Nếu chỉ có productType
      else if (screenParams?.productType) {
        dispatch(setProductsToList(screenParams.productType));
      } 
      // Mặc định hiển thị tất cả các cây nếu không có tham số
      else if (plants.length > 0) {
        dispatch(setProductsToList('plant'));
      }
    };

    loadData();
  }, [dispatch, screenParams, plants.length, plantpots.length, accessories.length]);

  const goToDetail = (id: string) => {
    navigation.navigate('Details', { id });
  };

  const handleFilterChange = (filter: FilterType) => {
    dispatch(setSelectedFilter(filter));
  };

  const categoryData = [
    { id: FilterType.ALL, name: 'Tất cả' },
    { id: FilterType.NEW, name: 'Hàng mới về' },
    { id: FilterType.SHADE, name: 'Ưa bóng' },
    { id: FilterType.LIGHT, name: 'Ưa sáng' },
  ];

  // Bọc Item trong React.memo để tránh re-render không cần thiết
  const MemoizedItem = memo(({ item }: { item: Product }) => {
    return <Item item={item} goToDetail={goToDetail} />;
  });

  const renderItem = ({ item }: { item: Product }) => {
    return <MemoizedItem item={item} />;
  };

  // Hiển thị loading
  if (loading && filteredProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007537" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  // Hiển thị error
  if (error && filteredProducts.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            dispatch(fetchAllProducts());
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        title={filteredProducts[0]?.type 
          ? filteredProducts[0].type.toUpperCase() === 'PLANT' 
            ? 'CÂY CẢNH'
            : filteredProducts[0].type.toUpperCase() === 'PLANTPOT'
              ? 'CHẬU CÂY' 
              : 'PHỤ KIỆN'
          : 'SẢN PHẨM'}
        cart={true}
      />

      {/* Danh mục lọc - chỉ hiển thị cho plant */}
      {filteredProducts.length > 0 && filteredProducts[0]?.type === 'plant' && (
        <View style={styles.listCategory}>
          <FlatList
            data={categoryData}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id.toString()}
                onPress={() => handleFilterChange(item.id)}
                style={[
                  styles.categoryButton,
                  selectedFilter === item.id && { backgroundColor: 'green' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedFilter === item.id && { color: '#fff' },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Tab loại sản phẩm */}
      

      {/* Danh sách sản phẩm */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.productListContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sản phẩm nào phù hợp với bộ lọc</Text>
        </View>
      )}
    </View>
  );
};

export default ListProduct;

const styles = StyleSheet.create({
  listCategory: {
    paddingLeft: 17,
    marginBottom: 15,
    marginTop: 5,
  },
  container: {
    paddingTop: 20,
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  productListContainer: {
    flexGrow: 1,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },
  categoryButton: {
    marginHorizontal: 10,
    height: 28,
    padding: 5,
    marginBottom: 15,
    borderRadius: 4,
  },
  categoryText: {
    color: '#7D7B7B',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007537',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  productTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productTypeTab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeProductTypeTab: {
    borderBottomColor: '#007537',
  },
  productTypeText: {
    fontSize: 14,
    color: '#7D7B7B',
    fontFamily: 'Poppins-Regular',
  },
  activeProductTypeText: {
    color: '#007537',
    fontWeight: 'bold',
  },
});
