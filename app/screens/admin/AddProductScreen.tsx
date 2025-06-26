import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store/store';
import { fetchAllProducts } from '../../redux/actions/productActions';
import api from '@/app/configs/api';
import AppHeader from '@/app/components/AppHeader';

const AddProductScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('Nhỏ');
  const [quantity, setQuantity] = useState('');
  const [origin, setOrigin] = useState('Châu Á');
  const [character, setCharacter] = useState('Ưa bóng');
  const [productType, setProductType] = useState('plant');
  const [isNew, setIsNew] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // Thêm đường dẫn ảnh
  const addImageUrl = () => {
    if (!currentImageUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đường dẫn hình ảnh');
      return;
    }


    if (!currentImageUrl.startsWith('http://') && !currentImageUrl.startsWith('https://')) {
      Alert.alert(
        'Lỗi',
        'Đường dẫn hình ảnh không hợp lệ. URL phải bắt đầu bằng http:// hoặc https://'
      );
      return;
    }

    try {
      new URL(currentImageUrl);
      const newImages = [...images, currentImageUrl];
      setImages(newImages);
      setCurrentImageUrl('');
    } catch (error) {
      Alert.alert('Lỗi', 'Đường dẫn hình ảnh không hợp lệ');
    }
  };

  // Xóa ảnh
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Rút gọn URL dài
  const truncateUrl = (url: string, maxLength: number = 30) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  // Lưu sản phẩm
  const handleSaveProduct = async () => {
    // Validate tên sản phẩm
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    // Validate giá
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá sản phẩm hợp lệ (số lớn hơn 0)');
      return;
    }

    // Validate số lượng
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng sản phẩm hợp lệ (số không âm)');
      return;
    }

    if (!size || !origin || !productType) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một hình ảnh');
      return;
    }

    setLoading(true);

    try {
      // Tạo đối tượng sản phẩm mới
      const newProduct = {
        name,
        price,
        size,
        quantity: parseInt(quantity),
        origin,
        character: productType === 'plant' ? character : '',
        new: isNew,
        type: productType,
        images,
      };

      // Gọi API để lưu sản phẩm
      await api.post('/products', newProduct);

      // Refresh danh sách sản phẩm
      dispatch(fetchAllProducts());

      Alert.alert('Thành công', 'Thêm sản phẩm mới thành công', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm. Vui lòng thử lại sau');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="THÊM SẢN PHẨM MỚI" navigation={navigation} />
      <View style={{ height: 20 }}></View>
      <ScrollView showsVerticalScrollIndicator={false} >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Tên sản phẩm:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên sản phẩm"
          />

          <Text style={styles.label}>Giá:</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Nhập giá sản phẩm"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Kích thước:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={size}
              onValueChange={(itemValue: string) => setSize(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Nhỏ" value="Nhỏ" />
              <Picker.Item label="Vừa" value="Vừa" />
              <Picker.Item label="Lớn" value="Lớn" />
            </Picker>
          </View>

          <Text style={styles.label}>Số lượng:</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Nhập số lượng sản phẩm"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Xuất xứ:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={origin}
              onValueChange={(itemValue: string) => setOrigin(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Châu Á" value="Châu Á" />
              <Picker.Item label="Châu Phi" value="Châu Phi" />
              <Picker.Item label="Châu Âu" value="Châu Âu" />
              <Picker.Item label="Châu Mỹ" value="Châu Mỹ" />
              <Picker.Item label="Châu Úc" value="Châu Úc" />
              <Picker.Item label="Châu Nam Cực" value="Châu Nam Cực" />
            </Picker>
          </View>

          <Text style={styles.label}>Loại sản phẩm:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productType}
              onValueChange={(itemValue: string) => setProductType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Cây trồng" value="plant" />
              <Picker.Item label="Chậu cây" value="plantpot" />
              <Picker.Item label="Phụ kiện" value="accessory" />
            </Picker>
          </View>

          {productType === 'plant' && (
            <>
              <Text style={styles.label}>Đặc tính:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={character}
                  onValueChange={(itemValue: string) => setCharacter(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Ưa bóng" value="Ưa bóng" />
                  <Picker.Item label="Ưa sáng" value="Ưa sáng" />
                </Picker>
              </View>
            </>
          )}

          <View style={styles.checkboxContainer}>
            <Text style={styles.label}>Sản phẩm mới:</Text>
            <TouchableOpacity
              style={[styles.checkbox, isNew && styles.checkboxChecked]}
              onPress={() => setIsNew(!isNew)}
            >
              {isNew && <Text style={styles.checkboxText}>✓</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Đường dẫn hình ảnh:</Text>
          <View style={styles.imageUrlContainer}>
            <TextInput
              style={styles.imageUrlInput}
              value={currentImageUrl}
              onChangeText={setCurrentImageUrl}
              placeholder="Nhập URL hình ảnh"
              multiline={true}
            />
            <TouchableOpacity style={styles.addUrlButton} onPress={addImageUrl}>
              <Text style={styles.addUrlButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageUrl} numberOfLines={5} ellipsizeMode="tail">
                    {truncateUrl(image)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <LinearGradient
            colors={['#007537', '#4CAF50']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.saveButton}
          >
            <TouchableOpacity
              onPress={handleSaveProduct}
              disabled={loading}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 25
  },
  header: {
    padding: 20,
    backgroundColor: '#F6F6F6',
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#221F1F',
  },
  formContainer: {
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#221F1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  pickerContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007537',
    borderRadius: 4,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007537',
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
  },
  imageUrlContainer: {
    flexShrink: 1,
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageUrlInput: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    flexShrink: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
  },
  addUrlButton: {
    backgroundColor: '#007537',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 25,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageUrl: {
    width: 100,
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontSize: 12,
  },
  saveButton: {
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007537',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007537',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
}); 