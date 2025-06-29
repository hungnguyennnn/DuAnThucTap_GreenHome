import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { router } from 'expo-router';
import { API_CONFIG } from '../../ApiService';

const API_URL = `${API_CONFIG.baseURL}`;

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity?: number;
  lightPreference?: string; // for plants
  subtitle?: string; // for combos
};

type ProductListProps = {
  productType: 'plants' | 'pots' | 'accessories' | 'combos';
  title: string;
};

const ProductList = ({ productType, title }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: '',
    image: '',
    quantity: 0,
    lightPreference: '',
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/${productType}`);
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [productType]);

  // Add or update product
  const handleSaveProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.image) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      if (isEditMode && selectedProduct) {
        // Update existing product
        await axios.put(`${API_URL}/${productType}/${selectedProduct.id}`, {
          ...selectedProduct,
          ...formData
        });
      } else {
        // Add new product
        const newProduct = {
          ...formData,
          id: Date.now().toString(),
        };
        await axios.post(`${API_URL}/${productType}`, newProduct);
      }
      
      setModalVisible(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      Alert.alert('Error', 'Failed to save product');
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    try {
      if (selectedProduct) {
        await axios.delete(`${API_URL}/${productType}/${selectedProduct.id}`);
        setDeleteModalVisible(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete product');
      console.error(err);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      quantity: 0,
      lightPreference: '',
    });
    setIsEditMode(false);
    setSelectedProduct(null);
  };

  // Open add product modal
  const handleAddProduct = () => {
    resetForm();
    setModalVisible(true);
  };

  // Open edit product modal
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity,
      lightPreference: product.lightPreference,
    });
    setIsEditMode(true);
    setModalVisible(true);
  };

  // Open delete confirmation modal
  const handleDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalVisible(true);
  };

  // Render product item
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
        defaultSource={require('@/assets/images/no_image.png')}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => handleEditProduct(item)}
        >
          <Icon name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDeleteConfirm(item)}
        >
          <Icon name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render add button at the bottom
  const renderFooter = () => (
    <TouchableOpacity 
      style={styles.addButton} 
      onPress={handleAddProduct}
    >
      <Icon name="plus" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderFormField = (label: string, value: string | number | undefined, onChange: (text: string) => void, placeholder: string) => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={styles.formInput}
        value={String(value || '')}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );

  // Product form based on product type
  const renderProductForm = () => {
    return (
      <View style={styles.form}>
        {renderFormField('Tên sản phẩm', formData.name, (text) => setFormData({...formData, name: text}), 'Nhập tên sản phẩm')}
        {renderFormField('Giá', formData.price, (text) => setFormData({...formData, price: text}), 'Nhập giá (VNĐ)')}
        {renderFormField('URL hình ảnh', formData.image, (text) => setFormData({...formData, image: text}), 'Nhập URL hình ảnh')}
        {renderFormField('Số lượng', formData.quantity, (text) => setFormData({...formData, quantity: parseInt(text) || 0}), 'Nhập số lượng')}
        
        {productType === 'plants' && 
          renderFormField('Ánh sáng', formData.lightPreference, (text) => setFormData({...formData, lightPreference: text}), 'Ưa sáng/Ưa bóng')
        }
        
        {productType === 'combos' && 
          renderFormField('Mô tả', formData.subtitle, (text) => setFormData({...formData, subtitle: text}), 'Nhập mô tả')
        }
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b894" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {router.push('../admin1/main')}}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
        />
        <TouchableOpacity style={styles.searchIconButton}>
          <Icon name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {renderFooter()}

      {/* Add/Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {renderProductForm()}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.deleteModalContent]}>
            <Text style={styles.deleteModalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteModalText}>
              Bạn có chắc chắn muốn xóa sản phẩm "{selectedProduct?.name}"?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmButton} onPress={handleDeleteProduct}>
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 30
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40, // To balance the header
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchIconButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for the add button
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    padding: 8,
    justifyContent: 'space-around',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4cd964',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#00b894',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  deleteConfirmButton: {
    backgroundColor: '#ff5252',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteModalContent: {
    width: '80%',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ProductList;