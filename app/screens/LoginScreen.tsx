import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import CustomTextInput from '../components/CustomTextInput';
import { loginUser } from '../redux/actions/authActions';
import { RootState, AppDispatch } from '../redux/store/store';
import { useNavigation } from 'expo-router';

const LoginScreen = (props: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { navigation } = props;
  const [saveAccount, setSaveAccount] = useState(false);
  const [saveAccountImage, setSaveAccountImage] = useState(
    require('../../assets/images/tickIcon.png')
  );

  const nav = useNavigation();

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountData = await AsyncStorage.getItem('account');
        if (accountData) {
          const { email: savedEmail, password: savedPassword } =
            JSON.parse(accountData);
          setEmail(savedEmail);
          setPassword(savedPassword);
          setSaveAccount(true);
          setSaveAccountImage(require('../../assets/images/checked.png'));
        }
      } catch (err) {
        console.log('Lỗi khi load account:', err);
      }
    };
    loadAccount();
  }, []);

  // Toggle lưu tài khoản
  const saveAccountState = () => {
    const newState = !saveAccount;
    setSaveAccount(newState);
    setSaveAccountImage(
      newState
        ? require('../../assets/images/checked.png')
        : require('../../assets/images/tickIcon.png')
    );
  };

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  // Hàm đăng nhập
  interface LoginPayload {
    role?: string;
    [key: string]: any;
  }

  const loginButton = async () => {
    const result = await dispatch(loginUser({ email, password, saveAccount }));
    const payload = result.payload as LoginPayload | undefined;
    if (payload && payload.role === 'admin') {
      navigation.navigate('Admin');
      return;
    }
    if (payload) {
      navigation.navigate('Tab', { screen: 'Home' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor="transparent"
        />
        <Image
          style={styles.imageHeader}
          resizeMode="cover"
          source={require('../../assets/images/imageHeader.png')}
        />
        <View style={styles.body}>
          <Text style={styles.title}>Chào mừng bạn</Text>
          <Text style={styles.subtTitle}>Đăng nhập tài khoản</Text>
          <CustomTextInput
            placeHolder="Nhập email hoặc số điện thoại"
            onChangeText={setEmail}
            value={email}
          />
          <CustomTextInput
            placeHolder="Mật khẩu"
            eyePassword={true}
            onChangeText={setPassword}
            value={password}
            error={error}
          />

          <View style={styles.rememberForgot}>
            <View style={styles.rememberAccount}>
              <TouchableOpacity onPress={saveAccountState}>
                <Image source={saveAccountImage} />
              </TouchableOpacity>
              <Text style={styles.rememberAccountText}>Nhớ tài khoản</Text>
            </View>
            <View style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
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
              onPress={loginButton}
            >
              <Text style={styles.dangNhapText}>Đăng nhập</Text>
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
            Bạn không có tài khoản
            <Text style={styles.createAccount} onPress={goToSignUp}>
              {'  '}Tạo tài khoản
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  createAccount: {
    fontFamily: 'Poppins-Regular',
    color: 'green',
  },
  askText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    alignSelf: 'center',
  },
  google: {
    width: 32,
    height: 32,
    marginRight: 30,
  },
  facebook: {
    width: 32,
    height: 32,
    marginLeft: 30,
  },
  ggfbContainer: {
    marginVertical: 40,
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
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    width: '100%',
    height: 50,
  },
  forgotPassword: {
    flexDirection: 'row',
  },
  forgotPasswordText: {
    fontFamily: 'Poppins-Bold',
    color: '#009245',
  },
  rememberAccountText: {
    fontFamily: 'Poppins-Bold',
    marginLeft: 10,
    color: '#949090',
  },
  rememberAccount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberForgot: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    padding: 20,
  },
  subtTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginVertical: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    color: 'black',
    fontSize: 35,
    alignSelf: 'center',
  },
  imageHeader: {
    marginTop: -150,
    width: 412,
    height: 400,
  },
});
