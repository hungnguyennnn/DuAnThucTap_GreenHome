import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AppHeader from '../components/AppHeader';

// Định nghĩa types cho navigation
type RootStackParamList = {
  HandbookList: undefined;
  HandbookDetail: { handbook: Handbook };
};


// Dữ liệu mẫu cho cẩm nang
const handbookData = [
  {
    id: '1',
    title: 'Panse Đen',
    subtitle: 'Hybrid',
    description:'Độ khó 3/5',
    thumbnail: 'https://s3-alpha-sig.figma.com/img/8dc1/c3fd/4c79faa42e885c9a92c6e6b29666fdf3?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=FFz6vrg3heJzGqD5T~qU131PwnKSvB4lqg2RYekeI1PInWeoy727oEsEa4j0iYIFeUekAAeUd-Jr~BUR26WnQOjem0DTJ5hnbIGffF1ivFQUfainR7~WHUdafGp7x4DxSPul44D4inhAr8MGCu2REi~yOTB~LBfB2oQqDHuoojfUJZLaOuMzCw57Bwmk5D8vMqC5svJG3oe1ckk0kIJVZTFPn8ZrhrHvRW-qUXKn7SNraVmExHQix147zlNQRLDdBa8EhVvX4mLNvy1WqdpxWsvNJk1vkg4vRPTVkx7eEflHldiKc1NZY7KhOo0jOCTCjHd5kR3EqwajoyblTuGX6A__',
    images: [
      'https://s3-alpha-sig.figma.com/img/8dc1/c3fd/4c79faa42e885c9a92c6e6b29666fdf3?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=FFz6vrg3heJzGqD5T~qU131PwnKSvB4lqg2RYekeI1PInWeoy727oEsEa4j0iYIFeUekAAeUd-Jr~BUR26WnQOjem0DTJ5hnbIGffF1ivFQUfainR7~WHUdafGp7x4DxSPul44D4inhAr8MGCu2REi~yOTB~LBfB2oQqDHuoojfUJZLaOuMzCw57Bwmk5D8vMqC5svJG3oe1ckk0kIJVZTFPn8ZrhrHvRW-qUXKn7SNraVmExHQix147zlNQRLDdBa8EhVvX4mLNvy1WqdpxWsvNJk1vkg4vRPTVkx7eEflHldiKc1NZY7KhOo0jOCTCjHd5kR3EqwajoyblTuGX6A__',
      'https://s3-alpha-sig.figma.com/img/28d9/bffb/22f7b1d90b3a956129c0034bc73180a5?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ZTxgBwXTEgxSoa50Re3wBjYTBpONjJX7scxG2~679NKz90pZAi85oE0OxqbFdBwXrfyd-Uq6d8yh8r1PtM7d8HXXe9JIXVf2mxqG9IcIT2P9gJ-Aegi9Xk24JZj9yqfyfweaFA8Fipyzsx-d1MdGEXPmrQcrtn~v~wwmt~RW~GkCkL0CWmRkS~jlX4YwK800efJ88eb7UH620AYQlUvF7zbv1cvmxBqdKcVsdfONVzPbfx39n4LbMx7152V346jB7ZbWqgouy22Du3hF14gnoewiTtD-cUqWJT9wC-XqmPPQVXEeIh41nDiRUsA1UpavZr-VKqa~lbJ6JUZKMJI9rw__',
      'https://s3-alpha-sig.figma.com/img/79db/7216/eefbefecedce13e3099111346323ae5a?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=P1Ym6ydrWUk~2-DJQpvAq5pmnhH830dEnKkBgae4l~F3Zx3bAPf66sDMpn2SIw4hg4sR-Rsp85QMlvpfjLt2g-A3Jwy92rf9B35ksT0gGaCFMfZGZe-b33FFLflDWXNFz0SwrVsFYt7h4RBjRrMosqSvs9Kp4sQxL6zh9C5i2y3KizRxRSlTB~y0-U9b7KWmXxvIlbuemcDclt5SLCbdpQMjhgIboEee5py44qMYxAhGPM7Nau9OLoO2Y-js3k8gt0KPxNFUZiS1WQsY1RzM7k1xkEQomXgNVyVy1l0MOtpKb94fMesbJgyE6UcavKRcl1TouZRuZqgqNV4ppPFrXg__'
    ]
  },
  {
    id: '2',
    title: 'Song of India',
    subtitle: 'Cây Nội Thất',
    description:'Độ khó 4/5',
    thumbnail: 'https://s3-alpha-sig.figma.com/img/28d9/bffb/22f7b1d90b3a956129c0034bc73180a5?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ZTxgBwXTEgxSoa50Re3wBjYTBpONjJX7scxG2~679NKz90pZAi85oE0OxqbFdBwXrfyd-Uq6d8yh8r1PtM7d8HXXe9JIXVf2mxqG9IcIT2P9gJ-Aegi9Xk24JZj9yqfyfweaFA8Fipyzsx-d1MdGEXPmrQcrtn~v~wwmt~RW~GkCkL0CWmRkS~jlX4YwK800efJ88eb7UH620AYQlUvF7zbv1cvmxBqdKcVsdfONVzPbfx39n4LbMx7152V346jB7ZbWqgouy22Du3hF14gnoewiTtD-cUqWJT9wC-XqmPPQVXEeIh41nDiRUsA1UpavZr-VKqa~lbJ6JUZKMJI9rw__',
    images: [
      'https://s3-alpha-sig.figma.com/img/28d9/bffb/22f7b1d90b3a956129c0034bc73180a5?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ZTxgBwXTEgxSoa50Re3wBjYTBpONjJX7scxG2~679NKz90pZAi85oE0OxqbFdBwXrfyd-Uq6d8yh8r1PtM7d8HXXe9JIXVf2mxqG9IcIT2P9gJ-Aegi9Xk24JZj9yqfyfweaFA8Fipyzsx-d1MdGEXPmrQcrtn~v~wwmt~RW~GkCkL0CWmRkS~jlX4YwK800efJ88eb7UH620AYQlUvF7zbv1cvmxBqdKcVsdfONVzPbfx39n4LbMx7152V346jB7ZbWqgouy22Du3hF14gnoewiTtD-cUqWJT9wC-XqmPPQVXEeIh41nDiRUsA1UpavZr-VKqa~lbJ6JUZKMJI9rw__',
      'https://s3-alpha-sig.figma.com/img/79db/7216/eefbefecedce13e3099111346323ae5a?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=P1Ym6ydrWUk~2-DJQpvAq5pmnhH830dEnKkBgae4l~F3Zx3bAPf66sDMpn2SIw4hg4sR-Rsp85QMlvpfjLt2g-A3Jwy92rf9B35ksT0gGaCFMfZGZe-b33FFLflDWXNFz0SwrVsFYt7h4RBjRrMosqSvs9Kp4sQxL6zh9C5i2y3KizRxRSlTB~y0-U9b7KWmXxvIlbuemcDclt5SLCbdpQMjhgIboEee5py44qMYxAhGPM7Nau9OLoO2Y-js3k8gt0KPxNFUZiS1WQsY1RzM7k1xkEQomXgNVyVy1l0MOtpKb94fMesbJgyE6UcavKRcl1TouZRuZqgqNV4ppPFrXg__',
      'https://s3-alpha-sig.figma.com/img/c09f/33fd/b43f93e237e85807ef2954921d8acda1?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=bQ9quunHQCDNfbOdQ6U3PS2r-2JUF9vzC94bpPDg8fEe7mO3MTexQwZO9uDx~4OOkMySQWxwRcOel8iaG4h253C6Dn7NG3ncDMpQGBsX2SfV57NkLArGgki8~5xi3SUst1wY49JUrS-0X9~RieUhlYxuNj0F9J56NgvUVT5T3J0yzBaxW5s9X046VXA7yb2Iw3K1y892Cl4TwwmLmCKg1Hc5uTI~OIyQbGm~EN6DjpIczbBd6U5xJivzjMPHWJLkiTbqujRo1fbVu-qDvdEoFKZq1dZ18sxFSoF21wxJG7csgRp~yTkE-apUxjkhar-7vVBvHp-4s~9mT7Z7UQIlyQ__'
    ]
  },
  {
    id: '3',
    title: 'Pink Anthurium',
    subtitle: 'Cây Phong Thủy',
    description:'Độ khó 5/5',
    thumbnail: 'https://s3-alpha-sig.figma.com/img/79db/7216/eefbefecedce13e3099111346323ae5a?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=P1Ym6ydrWUk~2-DJQpvAq5pmnhH830dEnKkBgae4l~F3Zx3bAPf66sDMpn2SIw4hg4sR-Rsp85QMlvpfjLt2g-A3Jwy92rf9B35ksT0gGaCFMfZGZe-b33FFLflDWXNFz0SwrVsFYt7h4RBjRrMosqSvs9Kp4sQxL6zh9C5i2y3KizRxRSlTB~y0-U9b7KWmXxvIlbuemcDclt5SLCbdpQMjhgIboEee5py44qMYxAhGPM7Nau9OLoO2Y-js3k8gt0KPxNFUZiS1WQsY1RzM7k1xkEQomXgNVyVy1l0MOtpKb94fMesbJgyE6UcavKRcl1TouZRuZqgqNV4ppPFrXg__',
    images: [
      'https://s3-alpha-sig.figma.com/img/79db/7216/eefbefecedce13e3099111346323ae5a?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=P1Ym6ydrWUk~2-DJQpvAq5pmnhH830dEnKkBgae4l~F3Zx3bAPf66sDMpn2SIw4hg4sR-Rsp85QMlvpfjLt2g-A3Jwy92rf9B35ksT0gGaCFMfZGZe-b33FFLflDWXNFz0SwrVsFYt7h4RBjRrMosqSvs9Kp4sQxL6zh9C5i2y3KizRxRSlTB~y0-U9b7KWmXxvIlbuemcDclt5SLCbdpQMjhgIboEee5py44qMYxAhGPM7Nau9OLoO2Y-js3k8gt0KPxNFUZiS1WQsY1RzM7k1xkEQomXgNVyVy1l0MOtpKb94fMesbJgyE6UcavKRcl1TouZRuZqgqNV4ppPFrXg__',
      'https://s3-alpha-sig.figma.com/img/c09f/33fd/b43f93e237e85807ef2954921d8acda1?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=bQ9quunHQCDNfbOdQ6U3PS2r-2JUF9vzC94bpPDg8fEe7mO3MTexQwZO9uDx~4OOkMySQWxwRcOel8iaG4h253C6Dn7NG3ncDMpQGBsX2SfV57NkLArGgki8~5xi3SUst1wY49JUrS-0X9~RieUhlYxuNj0F9J56NgvUVT5T3J0yzBaxW5s9X046VXA7yb2Iw3K1y892Cl4TwwmLmCKg1Hc5uTI~OIyQbGm~EN6DjpIczbBd6U5xJivzjMPHWJLkiTbqujRo1fbVu-qDvdEoFKZq1dZ18sxFSoF21wxJG7csgRp~yTkE-apUxjkhar-7vVBvHp-4s~9mT7Z7UQIlyQ__',
      'https://s3-alpha-sig.figma.com/img/8047/4753/f6b77c65cf58c788b93c40679bded54f?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qJS9wP5nQuPsmzElmg4b4A-GTbTVBolajyfhKbIYdELU3Fabe-xvsPaX7~-K6sQwVZhgZ2TbThTRE3mwmynYG0xJJ4FiPJjO5V2uOEZtbkd2kGHujp9-3SoBXeRbags4MuWBx7lykhWgZnG6QBqFVMn5t1KtuvZugIxQjWaVmra2XgRLikMZD3A-UbywdOZnW9lBEHzJpar5oE38~SZEAxqH4YjIkY7by0t1n~tq3eVDArEUne50gZl9SesJmAO01lmUscV5aYuIeUWEBhR6lwqkk7gK8zyfvWY9dfJqQogLPQISkXb9pyVZpb-vlUQkp9JWTVy2n8cBBBjfcP7G1Q__'
    ]
  }
];

// Định nghĩa types
interface Handbook {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  images: string[];
  description: string;
}

const HandbookListScreen: React.FC = ({navigation}: any) => {

  const handleHandbookPress = (handbook: Handbook) => {
    // Chuyển hướng đến màn hình HandbookDetailScreen
    navigation.navigate('HandbookDetail', { handbook });
  };

  // Component render cho mỗi item trong danh sách
  const renderHandbookItem = ({ item }: { item: Handbook }) => (
    <TouchableOpacity 
      style={styles.handbookItem}
      onPress={() => handleHandbookPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title} | {item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <AppHeader title="CẨM NANG TRỒNG CÂY" navigation={navigation} />
      
      
      <FlatList
        data={handbookData}
        renderItem={renderHandbookItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 25
  },
  listContainer: {
  },
  handbookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default HandbookListScreen;
