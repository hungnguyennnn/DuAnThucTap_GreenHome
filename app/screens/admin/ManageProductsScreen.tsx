import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store/store';
import { fetchAllProducts } from '../../redux/actions/productActions';
import { Product } from '../../redux/slices/productSlice';
import api from '@/app/configs/api';
import AppHeader from '@/app/components/AppHeader';

const ManageProductsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { plants, plantpots, accessories, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    // Kết hợp tất cả sản phẩm
    const allProducts = [...plants, ...plantpots, ...accessories];
    
    // Lọc sản phẩm theo tab và tìm kiếm
    let filtered = allProducts;
    
    if (currentTab === 'plants') {
      filtered = plants;
    } else if (currentTab === 'plantpots') {
      filtered = plantpots;
    } else if (currentTab === 'accessories') {
      filtered = accessories;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [plants, plantpots, accessories, currentTab, searchText]);

  const goToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const goToEditProduct = (product: Product) => {
    navigation.navigate('EditProduct', { product });
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',  
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              // Gọi API xóa sản phẩm
              await api.delete(`/products/${productId}`);
              // Cập nhật lại danh sách sản phẩm
              dispatch(fetchAllProducts());
            } catch (error) {
              console.log(error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Image 
        source={{ uri: item.images[0] }} 
        style={styles.productImage}
        defaultSource={require('../../../assets/images/no_image_found.png')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={styles.productType}>
          {item.type === 'plant' 
            ? `Cây trồng ${item.character ? ` | ${item.character}` : ''}` 
            : item.type === 'plantpot' 
              ? 'Chậu cây' 
              : 'Phụ kiện'}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => goToEditProduct(item)}
        >
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && plants.length === 0 && plantpots.length === 0 && accessories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007537" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
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
      <View style={{marginHorizontal: 25, marginTop: 25}}>
      <AppHeader title="QUẢN LÝ SẢN PHẨM" navigation={navigation} addButton={goToAddProduct}/>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'all' && styles.activeTab]}
          onPress={() => setCurrentTab('all')}
        >
          <Text style={[styles.tabText, currentTab === 'all' && styles.activeTabText]}>
            Tất cả ({plants.length + plantpots.length + accessories.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'plants' && styles.activeTab]}
          onPress={() => setCurrentTab('plants')}
        >
          <Text style={[styles.tabText, currentTab === 'plants' && styles.activeTabText]}>
            Cây trồng ({plants.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'plantpots' && styles.activeTab]}
          onPress={() => setCurrentTab('plantpots')}
        >
          <Text style={[styles.tabText, currentTab === 'plantpots' && styles.activeTabText]}>
            Chậu ({plantpots.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'accessories' && styles.activeTab]}
          onPress={() => setCurrentTab('accessories')}
        >
          <Text style={[styles.tabText, currentTab === 'accessories' && styles.activeTabText]}>
            Phụ kiện ({accessories.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          </View>
        }
      />
    </View>
  );
};

export default ManageProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F6F6F6',
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#221F1F',
  },
  addButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Poppins-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007537',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7D7D7D',
  },
  activeTabText: {
    color: '#007537',
    fontFamily: 'Poppins-Bold',
  },
  listContainer: {
    padding: 15,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#221F1F',
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#007537',
    marginVertical: 5,
  },
  productType: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7D7D7D',
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007537',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#7D7D7D',
  },
}); 