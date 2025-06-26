import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Item from '../components/Item';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { fetchAllProducts } from '../redux/actions/productActions';
import { Product } from '../redux/slices/productSlice';

const HomeScreen = (props: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { plants, plantpots, accessories, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Gọi action để lấy tất cả sản phẩm
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const { navigation } = props;

  // Điều hướng
  const goToDetail = (id: string) => {
    navigation.navigate('Details', { id });
  };

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  // Sang màn hình danh sách sản phẩm
  const goToList = (product: Product[]) => {
    navigation.navigate('ListProduct', { products: product });
  };
  
  // Hàm điều hướng cho admin
  const goToAddProduct = () => {
    navigation.navigate('AddProduct');
  };
  
  const goToEditProduct = (product: Product) => {
    navigation.navigate('EditProduct', { product });
  };
  
  const goToManageProducts = () => {
    navigation.navigate('ManageProducts');
  };

  // Render item Plant
  const renderItem = ({ item }: { item: Product }) => {
    return <Item item={item} goToDetail={goToDetail} />;
  };
  

  // Hiển thị loading
  if (loading && plants.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007537" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Hiển thị lỗi
  if (error && plants.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => dispatch(fetchAllProducts())}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor={'transparent'}
        />
        {/* Header */}
        <View style={styles.headerContainer}>
          <ImageBackground
            style={styles.bgHomeStyle}
            source={require('../../assets/images/backgroundHome.png')}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {user ? `Xin chào, ${user.name}` : 'Planta - Tỏa sáng không gian nhà bạn'}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.subTitle}>Xem hàng mới về</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToCart}>
              <Image
                style={styles.iconCart}
                source={require('../../assets/images/icon_cart.jpg')}
              />
            </TouchableOpacity>
          </ImageBackground>
        </View>
        
        {/* Admin Panel */}
        {isAdmin && (
          <View style={styles.adminPanel}>
            <Text style={styles.adminPanelTitle}>Quản lý sản phẩm</Text>
            <View style={styles.adminPanelButtons}>
              <TouchableOpacity 
                style={styles.adminPanelButton} 
                onPress={goToAddProduct}
              >
                <Text style={styles.adminPanelButtonText}>Thêm sản phẩm</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adminPanelButton} 
                onPress={goToManageProducts}
              >
                <Text style={styles.adminPanelButtonText}>Quản lý</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Danh sách sản phẩm */}

        {/* Danh sách Cây trồng */}
        <View style={styles.wrapper}>
          <Text style={styles.category}>Cây trồng</Text>
          {plants.length > 0 ? (
            <FlatList
              data={plants}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal={false}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          ) : (
            <Text style={styles.emptyText}>Không có sản phẩm</Text>
          )}
          <TouchableOpacity style={styles.moreWrapper}>
            <View style={styles.moreLine}>
              <Text
                style={styles.moreText}
                onPress={() => {
                  goToList(plants);
                }}
              >
                Xem thêm Cây trồng
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Danh sách Chậu cây trồng */}
        <View style={styles.wrapper}>
          <Text style={styles.category}>Chậu cây trồng</Text>
          {plantpots.length > 0 ? (
            <FlatList
              data={plantpots}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal={false}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          ) : (
            <Text style={styles.emptyText}>Không có sản phẩm</Text>
          )}
          <TouchableOpacity style={styles.moreWrapper}>
            <View style={styles.moreLine}>
              <Text
                style={styles.moreText}
                onPress={() => {
                  goToList(plantpots);
                }}
              >
                Xem thêm Chậu
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Danh sách Phụ kiện trồng cây */}
        <View style={styles.wrapper}>
          <Text style={styles.category}>Phụ kiện trồng cây</Text>
          {accessories.length > 0 ? (
            <FlatList
              data={accessories}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal={false}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          ) : (
            <Text style={styles.emptyText}>Không có sản phẩm</Text>
          )}
          <TouchableOpacity style={styles.moreWrapper}>
            <View style={styles.moreLine}>
              <Text
                style={styles.moreText}
                onPress={() => {
                  goToList(accessories);
                }}
              >
                Xem thêm Phụ kiện
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Combo chăm sóc */}
        <View style={styles.comboContainer}>
          <Text style={styles.category}>Combo chăm sóc (mới)</Text>
          <View style={styles.cardContainer}>
            <Text style={styles.comboTitle}>
              Lemon Balm Grow Kit {`\n`}
              <Text style={styles.comboContent}>
                Gồm: hạt giống Lemon Balm,{'\n'}gói đất hữu cơ, chậu Planta,
                {'\n'}
                marker đánh dấu...
              </Text>
            </Text>
            <Image
              style={styles.comboImage}
              source={require('../../assets/images/combo-image.png')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: '#F6F6F6',
    width: '100%',
  },
  bgHomeStyle: {
    width: '100%',
    height: 205,
    marginTop: 113,
  },
  titleContainer: {
    width: 223,
    top: -20,
    left: 25,
    position: 'absolute',
  },
  title: {
    fontSize: 22,
    color: '#221F1F',
    fontFamily: 'Poppins-Regular',
  },
  subTitle: {
    fontSize: 16,
    color: '#007537',
    position: 'absolute',
    top: 75,
    left: 25,
    fontFamily: 'Poppins-Regular',
  },
  iconCart: {
    width: 48,
    height: 46,
    borderRadius: 50,
    position: 'absolute',
    top: -50,
    right: 30,
  },
  wrapper: {
    padding: 24,
  },
  category: {
    fontSize: 22,
    color: '#221F1F',
    marginBottom: 10,
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
  moreWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  moreLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#221F1F',
    marginTop: 20,
  },
  moreText: {
    fontSize: 18,
    color: '#221F1F',
  },
  comboContainer: {
    width: '85%',
    margin: 25,
    justifyContent: 'center',
    alignContent: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#F6F6F6',
    marginBottom: 100,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    width: '100%',
  },
  comboImage: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    width: 108,
    height: 134,
  },
  comboTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    padding: 20,
    alignContent: 'center',
  },
  comboContent: {
    fontSize: 14,
    color: '#7D7D7D',
  },
  
  // Style mới
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
    marginVertical: 20,
  },
  adminPanel: {
    padding: 20,
    backgroundColor: '#F6F6F6',
  },
  adminPanelTitle: {
    fontSize: 22,
    color: '#221F1F',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  adminPanelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminPanelButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  adminPanelButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  adminButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  adminButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
});
