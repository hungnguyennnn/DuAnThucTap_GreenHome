import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ItemType {
  id: string;
  name: string;
  price: string;
  images: string[];
  size: string;
  quantity: number;
  origin: string;
  character?: string;
  new?: boolean;
}

interface ItemProps {
  item: ItemType;
  goToDetail: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({ item, goToDetail }) => {
  const { id, name, price, images, character } = item;
  const imageLink = images && images.length > 0 ? images[0] : undefined;

  return (
    <TouchableOpacity onPress={() => goToDetail(id)}>
      <View style={styles.container}>
        {/* Ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.imageProduct}
            source={imageLink ? { uri: imageLink } : undefined}
          />
        </View>
        {/* Thông tin sản phẩm */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          {character !== undefined && (
            <Text style={styles.character} numberOfLines={1}>
              {character}
            </Text>
          )}
          {price !== undefined && (
            <Text style={styles.price} numberOfLines={1}>
              {price}đ
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 217,
    margin: 7.5,
    borderRadius: 8,
    flexDirection: 'column',
  },
  imageContainer: {
    width: '100%',
    height: 134,
    borderRadius: 8,
    backgroundColor: '#F6F6F6',
    marginBottom: 8,
  },
  imageProduct: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  infoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    color: '#221F1F',
    fontFamily: 'Poppins-Regular',
  },
  character: {
    fontSize: 14,
    color: '#7D7B7B',
    fontFamily: 'Poppins-Regular',
  },
  price: {
    fontSize: 16,
    color: '#007537',
    fontFamily: 'Poppins-Regular',
  },
});
