import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  FlatList,
  Image,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../configs/api';
import SearchItem, { SearchItemData } from '../components/SearchItem';
import AppHeader from '../components/AppHeader';

interface SearchProps {
  navigation: any;
}

const HISTORY_KEY = 'SEARCH_HISTORY';

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const goToDetail = (id: string) => {
    navigation.navigate('Details', { id });
  };

  // State
  const [allProducts, setAllProducts] = useState<SearchItemData[]>([]);
  const [results, setResults] = useState<SearchItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setAllProducts(response.data);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem(HISTORY_KEY);
      if (historyData) {
        setSearchHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.log('Lỗi khi load search history:', error);
    }
  };

  const saveSearchHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.log('Lỗi khi lưu search history:', error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    loadSearchHistory();
  }, []);

  // Thêm useEffect để lọc sản phẩm khi search thay đổi
  useEffect(() => {
    if (search.trim() === '') {
      setResults(allProducts);
    } else {
      const filtered = allProducts.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    }
  }, [search, allProducts]);

  const handleSearch = () => {
    Keyboard.dismiss();

    if (search.trim() !== '' && !searchHistory.includes(search)) {
      const newHistory = [search, ...searchHistory];
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
    }
  };

  const removeHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter((term) => term !== item);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  const renderItem = ({ item }: { item: SearchItemData }) => (
    <SearchItem item={item} onPress={goToDetail} />
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity onPress={() => setSearch(item)}>
        <View style={styles.historyItemLeft}>
          <Image
            style={styles.clockIcon}
            source={require('../../assets/images/clockIcon.png')}
          />
          <Text style={styles.historyText}>{item}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeHistoryItem(item)}>
        <Image
          style={styles.closeIcon}
          source={require('../../assets/images/closeIcon.png')}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader navigation={navigation} title="TÌM KIẾM" />

      {/* Search input & button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm"
          onChangeText={setSearch}
          value={search}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image
            style={styles.searchIcon}
            source={require('../../assets/images/searchIcon.png')}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007537"
          style={styles.loading}
        />
      ) : (
        <>
          {/* Nếu search trống, hiển thị lịch sử */}
          {search.trim() === '' ? (
            <>
              <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
              <FlatList
                data={searchHistory}
                keyExtractor={(item) => item}
                renderItem={renderHistoryItem}
              />
            </>
          ) : (
            <FlatList
              style={styles.list}
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1.5,
    padding: 3,
  },
  searchButton: {
    marginLeft: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  list: {
    marginTop: 10,
  },
  loading: {
    marginTop: 20,
  },
  historyTitle: {
    marginTop: 20,
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    marginLeft: 15,
    fontSize: 16,
    color: 'black',
  },
  clockIcon: {
    marginLeft: 5,
    width: 16,
    height: 16,
  },
  closeIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
});
