import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  View,
  Alert,
  Linking
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState, AppDispatch } from '../redux/store/store';
import { updateUserProfile } from '../redux/actions/authActions';
import AppHeader from '../components/AppHeader';

interface ChangeInfoProps {
  navigation: any;
}

const ChangeInfoScreen: React.FC<ChangeInfoProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Log để debug
  }, [avatar]);

  useEffect(() => {
    // Yêu cầu quyền truy cập khi component được mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaLibraryStatus } = 
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert(
            'Cần cấp quyền',
            'Bạn cần cấp quyền truy cập thư viện ảnh để sử dụng tính năng này.'
          );
        }
        
        const { status: cameraStatus } = 
          await ImagePicker.requestCameraPermissionsAsync();
        
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Cần cấp quyền',
            'Bạn cần cấp quyền truy cập camera để sử dụng tính năng này.'
          );
        }
      }
    })();
  }, []);

  // Xử lý chọn ảnh từ thư viện
  const handleChoosePhoto = async () => {
    try {
      // Kiểm tra quyền truy cập
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Bạn cần cấp quyền truy cập ảnh trong cài đặt để sử dụng tính năng này',
          [
            { text: 'Hủy' },
            { 
              text: 'Mở cài đặt', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }
      
      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setAvatar(selectedImage.uri);
        Alert.alert('Thành công', 'Đã chọn ảnh mới');
      } else {
      }
    } catch (error) {
      console.error('Error in handleChoosePhoto:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
    }
  };

  // Xử lý chụp ảnh
  const handleTakePhoto = async () => {
    try {
      
      // Kiểm tra quyền truy cập
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Bạn cần cấp quyền truy cập camera trong cài đặt để sử dụng tính năng này',
          [
            { text: 'Hủy' },
            { 
              text: 'Mở cài đặt', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }
      
      // Mở camera

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0];
        setAvatar(capturedImage.uri);
        Alert.alert('Thành công', 'Đã chụp ảnh mới');
      } else {
    
      }
    } catch (error) {
      console.error('Error in handleTakePhoto:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chụp ảnh');
    }
  };

  // Xác thực dữ liệu
  const validateForm = () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (phone && !phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ (cần 10 chữ số)');
      return false;
    }

    return true;
  };

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      
      // Sử dụng trực tiếp URI của ảnh đã chọn
      const avatarUrl = avatar;

      // Cập nhật thông tin người dùng - chỉ gửi dữ liệu cần thiết
      const profileData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar: avatarUrl
      };

      const result = await dispatch(updateUserProfile(profileData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật');
        navigation.goBack();
      } else if (result.payload) {
        setError(typeof result.payload === 'string' ? result.payload : 'Cập nhật thông tin thất bại');
      } else {
        setError('Cập nhật thông tin thất bại');
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      setError('Đã xảy ra lỗi, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <AppHeader title="CHỈNH SỬA THÔNG TIN" navigation={navigation} />

        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleChoosePhoto} 
            style={styles.editIcon}
            activeOpacity={0.6}
          >
            <Image source={require('../../assets/images/editIcon.png')} />
          </TouchableOpacity>
        </View>

        <Text style={styles.guide}>
          Thông tin sẽ được lưu cho lần mua hàng tiếp theo.
          Vui lòng cập nhật đầy đủ thông tin cá nhân.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ tên</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ tên"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabled]}
            value={user?.email}
            editable={false}
          />
          <Text style={styles.noteText}>Email không thể thay đổi</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập địa chỉ"
            multiline
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleUpdateProfile}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangeInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editIconText: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  guide: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  noteText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});