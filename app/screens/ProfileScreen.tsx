import { StyleSheet, Text, Image, View, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store/store'
import { logoutUser } from '../redux/actions/authActions'
import AppHeader from '../components/AppHeader'

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            const result = await dispatch(logoutUser());
            if (result.payload && (result.payload as any).success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ]
    );
  };
  


  return (
    <View style={styles.container}>
      <AppHeader title="PROFILE" navigation={navigation}/>

      <View style={styles.headerContainer}>
        {user?.avatar ? (
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{user?.name || 'Chưa đăng nhập'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>
      </View>

      <View style={styles.body1}>
        <Text style={styles.textUnderlined}>Chung</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ChangeInfo')}>
          <Text style={styles.catogeryText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HandbookList')}>
          <Text style={styles.catogeryText}>Cẩm nang cây trồng</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.catogeryText}>Lịch sử giao dịch</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QandA')}>
          <Text style={styles.catogeryText}>Q&A</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body2}>
        <Text style={styles.textUnderlined}>Bảo mật và Điều khoản</Text>
        <TouchableOpacity>
          <Text style={styles.catogeryText}>Điều khoản và điều kiện</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.catogeryText}>Chính sách quyền riêng tư</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} disabled={loading}>
          <Text style={styles.dangXuatText}>
            {loading ? 'Đang xử lý...' : 'Đăng xuất'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  textUnderlined: {
    fontSize: 16,
    color: 'black',
    borderWidth: 0,
    borderBottomColor: 'gray',
    paddingBottom: 5,
    borderBottomWidth: 1,
    marginBottom: 12
  },
  dangXuatText: {
    marginTop: 5,
    fontSize: 16,
    color: 'red',
    fontWeight: '500'
  },
  catogeryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20
  },
  body1: {
    marginTop: 60
  },
  body2: {
    marginTop: 30
  },
  name: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold'
  },
  email: {
    color: 'gray',
    fontSize: 16
  },
  info: {
    justifyContent: 'center'
  },
  avatar: {
    width: 70,
    height: 70,
    marginRight: 30,
    borderRadius: 35
  },
  avatarPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  headerContainer: {
    marginTop: 40,
    flexDirection: 'row'
  },
  title: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: '400',
    fontSize: 23
  },
  container: {
    flex: 1,
    padding: 25
  }
})