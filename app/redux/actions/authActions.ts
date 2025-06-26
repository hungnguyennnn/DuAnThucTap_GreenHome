import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../configs/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, logout, setError, setLoading, setUser } from '../slices/authSlice';

// Định nghĩa interface cho User
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  address: string;
}

// Interface cho dữ liệu đăng ký
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password, saveAccount }: { email: string; password: string; saveAccount: boolean },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      
      // Kiểm tra dữ liệu đầu vào
      if (email.trim() === '' || password.trim() === '') {
        dispatch(setError('Vui lòng không để trống email và mật khẩu!'));
        return null;
      }

      // Gọi API đăng nhập từ json-server
      const response = await api.get(`/users?email=${email}&password=${password}`);
      
      if (response.data && response.data.length > 0) {
        const userData: User = response.data[0];
        
        // Lưu thông tin đăng nhập nếu người dùng chọn
        if (saveAccount) {
          await AsyncStorage.setItem(
            'account',
            JSON.stringify({ email, password })
          );
        } else {
          await AsyncStorage.removeItem('account');
        }
        
        // Lưu userId
        await AsyncStorage.setItem('userId', userData.id);
        
        // Dispatch action login thành công
        dispatch(login(userData));
        
        return userData;
      } else {
        dispatch(setError('Tài khoản hoặc mật khẩu không chính xác!'));
        return null;
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      dispatch(setError('Đã có lỗi xảy ra. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const { name, email, password, confirmPassword } = userData;
      
      // Kiểm tra dữ liệu đầu vào
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{6,}$/;
      
      if (name.trim() === '') {
        dispatch(setError('Họ tên không để trống!'));
        return null;
      }
      
      if (!emailRegex.test(email)) {
        dispatch(setError('Email không đúng định dạng!'));
        return null;
      }
      
      if (!passwordRegex.test(password)) {
        dispatch(setError('Mật khẩu không hợp lệ!'));
        return null;
      }
      
      if (password !== confirmPassword) {
        dispatch(setError('Mật khẩu không khớp!'));
        return null;
      }
      
      // Kiểm tra email đã tồn tại chưa
      const checkResponse = await api.get(`/users?email=${email}`);
      if (checkResponse.data && checkResponse.data.length > 0) {
        dispatch(setError('Email đã tồn tại!'));
        return null;
      }
      
      // Tạo id ngẫu nhiên
      const rand = Math.floor(Math.random() * 1000);
      
      // Tạo đối tượng người dùng mới
      const newUser = {
        id: 'US' + rand,
        name,
        email,
        password,
        phone: '',
        avatar: '',
        address: '',
      };
      
      // Gọi API đăng ký
      const response = await api.post('/users', newUser);
      
      if (response.status === 201 || response.status === 200) {
        return { success: true, message: 'Đăng ký thành công!' };
      } else {
        dispatch(setError('Đăng ký thất bại!'));
        return null;
      }
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      dispatch(setError('Đã có lỗi xảy ra. Vui lòng thử lại!'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      // Xóa thông tin người dùng khỏi AsyncStorage
      await AsyncStorage.removeItem('userId');
      
      // Dispatch action logout
      dispatch(logout());
      
      return { success: true };
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: {name: string, phone: string, address: string, avatar: string, email?: string, password?: string}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      
      // Lấy userId từ AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        dispatch(setError('Không tìm thấy thông tin người dùng'));
        return rejectWithValue('Không tìm thấy thông tin người dùng');
      }
      
      
      // Lấy thông tin user hiện tại
      const userResponse = await api.get(`/users/${userId}`);
      
      if (userResponse.isError || !userResponse.data) {
        dispatch(setError('Không thể lấy thông tin người dùng'));
        return rejectWithValue('Không thể lấy thông tin người dùng');
      }
      
      // Lấy dữ liệu người dùng từ response
      const currentUser = userResponse.data;
      
      // Chuẩn bị dữ liệu cập nhật với chỉ những trường cần thiết
      const updateData: User = {
        id: currentUser.id,
        name: profileData.name,
        email: currentUser.email,
        password: currentUser.password,
        phone: profileData.phone || '',
        address: profileData.address || '',
        avatar: profileData.avatar || ''
      };
      
      
      // Gọi API cập nhật thông tin người dùng
      const response = await api.put(`/users/${userId}`, updateData);
      
      if (response.isError) {
        dispatch(setError('Không thể cập nhật thông tin: ' + response.message));
        return rejectWithValue(response.message);
      }
      
      // Lấy dữ liệu người dùng đã cập nhật
      const updatedUser: User = response.data;
      
      // Cập nhật thông tin user trong Redux store
      dispatch(setUser(updatedUser));
      
      return { success: true, data: updatedUser };
    } catch (error: any) {
      console.error('Exception in updateUserProfile:', error);
      const message = error.message || 'Có lỗi xảy ra';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
); 