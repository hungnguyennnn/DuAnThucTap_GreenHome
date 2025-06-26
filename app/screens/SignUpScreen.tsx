import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/actions/authActions';
import { RootState, AppDispatch } from '../redux/store/store';

interface RegisterResponse {
  success: boolean;
  message: string;
}

const SignUpScreen = (props: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorName, setErrorName] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errConfirmPassword, setErrorConfirmPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const { navigation } = props;
  const goToLogIn = () => {
    navigation.navigate('Login');
  };

  const handlerRegister = async () => {
    // Xóa các thông báo lỗi cũ
    setErrorName('');
    setErrorEmail('');
    setErrorPassword('');
    setErrorConfirmPassword('');
    
    // Gọi action đăng ký từ Redux
    const result = await dispatch(registerUser({ 
      name, 
      email, 
      password, 
      confirmPassword 
    }));
    
    // Xử lý kết quả đăng ký
    if (result.payload && (result.payload as RegisterResponse).success) {
      Alert.alert('Thông báo', 'Đăng ký thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else if (error) {
      // Hiển thị lỗi phù hợp dựa vào thông báo lỗi
      if (error.includes('Họ tên')) {
        setErrorName(error);
      } else if (error.includes('Email')) {
        setErrorEmail(error);
      } else if (error.includes('Mật khẩu không khớp')) {
        setErrorConfirmPassword(error);
      } else if (error.includes('Mật khẩu')) {
        setErrorPassword(error);
      } else {
        Alert.alert('Lỗi', error);
      }
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Image
        style={styles.imageHeader}
        resizeMode="cover"
        source={require('../../assets/images/imageHeader.png')}
      />
      <View style={styles.body}>
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtTitle}>Tạo tài khoản</Text>
        <CustomTextInput
          placeHolder="Họ tên"
          onChangeText={setName}
          value={name}
          error={errorName}
        />
        <CustomTextInput
          placeHolder="E-mail"
          onChangeText={setEmail}
          value={email}
          error={errorEmail}
        />
        <CustomTextInput
          eyePassword={true}
          placeHolder="Mật khẩu"
          onChangeText={setPassword}
          value={password}
          error={errorPassword}
        />
        <CustomTextInput
          eyePassword={true}
          placeHolder="Xác nhận mật khẩu"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          error={errConfirmPassword}
        />

        <View style={styles.moreInfoContainer}>
          <Text style={styles.info}>
            Để đăng ký tài khoản, bạn đồng ý{' '}
            <Text style={styles.colorUnderline}>Terms &</Text>
          </Text>
          <View style={styles.secondRow}>
            <Text style={styles.colorUnderline}>Conditions</Text>
            <Text style={styles.info}> and</Text>
            <Text style={styles.colorUnderline}> Privacy Policy</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#007537', '#4CAF50']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.linearGradient}
        >
          <TouchableOpacity
            style={{
              width: '100%',
              height: 40,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handlerRegister}
            disabled={loading}
          >
            <Text style={styles.dangNhapText}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.orContainer}>
          <View style={styles.slash}></View>
          <Text style={styles.orText}>Hoặc</Text>
          <View style={styles.slash}></View>
        </View>

        <View style={styles.ggfbContainer}>
          <Image
            source={require('../../assets/images/logoGoogle.png')}
            style={styles.google}
          />
          <Image
            source={require('../../assets/images/logoFacebook.png')}
            style={styles.facebook}
          />
        </View>

        <Text style={styles.askText}>
          Tôi đã có tải khoản
          <Text style={styles.loginText} onPress={goToLogIn}>
            {'  '}Đăng nhập
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  noUnderline: {
    textDecorationLine: 'none',
  },
  colorUnderline: {
    textDecorationLine: 'underline',
    fontSize: 14,
    color: 'green',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
  },
  info: {
    fontSize: 14,
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moreInfoContainer: {
    marginVertical: 15,
  },
  loginText: {
    color: 'green',
    fontFamily: 'Poppins-Regular',
  },
  askText: {
    color: 'black',
    fontSize: 14,
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
  },
  google: {
    marginRight: 30,
  },
  ggfbContainer: {
    marginVertical: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slash: {
    borderBottomWidth: 1,
    borderColor: 'green',
    width: 150,
  },
  orText: {
    marginHorizontal: 5,
    fontFamily: 'Poppins-Regular',
  },
  orContainer: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangNhapText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  linearGradient: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: 'green',
    width: '100%',
    height: 55,
  },

  body: {
    padding: 20,
  },
  subtTitle: {
    fontSize: 22,
    alignSelf: 'center',
    marginVertical: 10,
    fontFamily: 'Poppins-Regular',
  },
  title: {
    marginTop: -50,
    fontFamily: 'Poppins-Bold',
    fontSize: 35,
    alignSelf: 'center',
  },
  imageHeader: {
    marginTop: -200,
    width: 412,
    height: 400,
  },
  facebook: {
    marginLeft: 30,
    width: 33,
  },
});
