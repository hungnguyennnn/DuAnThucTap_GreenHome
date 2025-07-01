import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/TongQuanAdmin.styles';
import { FormData } from '../services/sanpham';

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  isEditMode: boolean;
  handleSaveProduct: () => void;
}

const ProductModal: React.FC<Props> = ({
  formData,
  setFormData,
  modalVisible,
  setModalVisible,
  isEditMode,
  handleSaveProduct
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Loại sản phẩm</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                style={styles.picker}
                onValueChange={(itemValue: any) =>
                  setFormData({ ...formData, type: itemValue })
                }
              >
                <Picker.Item label="Cây" value="plant" />
                <Picker.Item label="Chậu" value="plantpot" />
                <Picker.Item label="Phụ kiện" value="accessory" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tên sản phẩm</Text>
            <TextInput
              style={styles.formInput}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="Nhập tên sản phẩm"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Giá</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price}
              onChangeText={text => setFormData({ ...formData, price: text })}
              placeholder="Ví dụ: 250.000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>URL Hình ảnh</Text>
            <TextInput
              style={styles.formInput}
              value={formData.image}
              onChangeText={text => setFormData({ ...formData, image: text })}
              placeholder="Nhập URL hình ảnh"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Số lượng tồn kho</Text>
            <TextInput
              style={styles.formInput}
              value={formData.quantity}
              onChangeText={text => setFormData({ ...formData, quantity: text })}
              placeholder="Nhập số lượng"
              keyboardType="numeric"
            />
          </View>

          {formData.type === 'plant' && (
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ánh sáng phù hợp</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.lightPreference}
                  style={styles.picker}
                  onValueChange={(itemValue: any) =>
                    setFormData({ ...formData, lightPreference: itemValue })
                  }
                >
                  <Picker.Item label="Ưa sáng" value="Ưa sáng" />
                  <Picker.Item label="Ưa bóng" value="Ưa bóng" />
                </Picker>
              </View>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProduct}
            >
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;