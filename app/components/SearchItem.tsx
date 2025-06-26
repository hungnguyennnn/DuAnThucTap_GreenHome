import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export interface SearchItemData {
  id: string;
  name: string;
  price: string;
  images: string[];
  size: string;
  quantity: number;
  origin: string;
  character?: string;
  new?: boolean;
  type: 'plant' | 'plantpot' | 'accessory';
}

interface SearchItemProps {
  item: SearchItemData;
  onPress: (id: string) => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ item, onPress }) => {
  const { id, name, price, images, quantity, origin, type } = item;
  const imageLink = images && images.length > 0 ? images[0] : null;

  return (
    <TouchableOpacity onPress={() => onPress(id)}>
      <View style={styles.item}>
        {imageLink ? (
          <Image style={styles.image} source={{ uri: imageLink }} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text>No Image</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.quantity}>Còn {quantity} sp</Text>
          <Text style={styles.origin}>Xuất xứ: {origin}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: '25%',
    height: 80,
    marginRight: 15,
    borderRadius: 5,
  },
  noImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
  },
  price: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '400',
    color: 'black',
    marginTop: 3,
  },
  origin: {
    fontSize: 16,
    color: 'gray',
    marginTop: 3,
  },
});
