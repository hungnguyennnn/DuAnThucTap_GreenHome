import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import styles from '../styles/TongQuanAdmin.styles';
import { Product } from '../services/sanpham';

interface Props {
  plants: Product[];
  plantpots: Product[];
  accessories: Product[];
  productType: 'plant' | 'plantpot' | 'accessory';
  setProductType: (type: 'plant' | 'plantpot' | 'accessory') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  renderProductItem: ({ item }: { item: Product }) => JSX.Element;
  handleAddProduct: () => void;
  loading: boolean;
  getCurrentProducts: () => Product[];
}

const SanPhamTab: React.FC<Props> = ({
  plants,
  plantpots,
  accessories,
  productType,
  setProductType,
  searchQuery,
  setSearchQuery,
  renderProductItem,
  handleAddProduct,
  loading,
  getCurrentProducts
}) => {
  const currentProducts = getCurrentProducts();
  const productTypeTitle =
    productType === 'plant' ? 'Loại Cây'
    : productType === 'plantpot' ? 'Loại Chậu'
    : 'Phụ Kiện';

  return (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Quản Lý Sản Phẩm</Text>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statCard, productType === 'plant' && styles.activeStatCard]}
          onPress={() => setProductType('plant')}
        >
          <Text style={styles.statNumber}>{plants.length}</Text>
          <Text style={styles.statLabel}>Loại cây</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, productType === 'plantpot' && styles.activeStatCard]}
          onPress={() => setProductType('plantpot')}
        >
          <Text style={styles.statNumber}>{plantpots.length}</Text>
          <Text style={styles.statLabel}>Loại chậu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, productType === 'accessory' && styles.activeStatCard]}
          onPress={() => setProductType('accessory')}
        >
          <Text style={styles.statNumber}>{accessories.length}</Text>
          <Text style={styles.statLabel}>Phụ kiện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.productSectionTitle}>{productTypeTitle}</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
          </View>
        </View>

        <Text style={styles.totalCount}>Tổng số: {currentProducts.length} sản phẩm</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007537" style={styles.loader} />
        ) : (
          <FlatList
            data={currentProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            }
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SanPhamTab;
