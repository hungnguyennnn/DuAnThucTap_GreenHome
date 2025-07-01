import { Alert } from 'react-native';
import { API_CONFIG } from '../../../ApiService';

export type Product = {
  id: string;
  name: string;
  image: string; // fallback
  images?: string[]; // ưu tiên dùng images[0]
  price: string;
  quantity: number;
  lightPreference?: string;
  character?: string;
  size?: string;
  origin?: string;
  new?: boolean;
  type: string;
};


export type FormData = {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: string;
  lightPreference: string;
  type: string; // plants, pots, accessories
  character?: string; // chỉ dành cho pots
  size?: string; // chỉ dành cho pots 
  origin?: string; // chỉ dành cho accessories
  new?: boolean; // chỉ dành cho plants
  images?: string[]; // chỉ dành cho plants

};

// Lấy tất cả sản phẩm
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/products`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error);
    return [];
  }
};

// Xóa sản phẩm
export const deleteProduct = async (productId: string) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa sản phẩm');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    return false;
  }
};

// Thêm hoặc cập nhật sản phẩm
export const saveProduct = async (
  formData: FormData,
  isEditMode: boolean,
  currentProductId?: string
) => {
  try {
    const productData: any = {
      name: formData.name,
      price: formData.price,
      image: formData.image,
      quantity: parseInt(formData.quantity),
      type: convertCategoryToType(formData.type),
    };

    if (formData.type === 'plants') {
      productData.lightPreference = formData.lightPreference;
    }

    let url = `${API_CONFIG.baseURL}/products`;
    let method = 'POST';

    if (isEditMode && currentProductId) {
      url = `${url}/${currentProductId}`;
      method = 'PUT';
      productData.id = currentProductId;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Lỗi khi lưu sản phẩm');
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error);
    return false;
  }
};

// Lọc sản phẩm theo từ khóa tìm kiếm
export const filterProducts = (products: Product[], searchQuery: string) => {
  if (!searchQuery) return products;

  return products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// Kiểm tra dữ liệu form trước khi lưu
export const validateProductForm = (formData: FormData) => {
  if (!formData.name || !formData.price || !formData.image || !formData.quantity) {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin sản phẩm.");
    return false;
  }

  if (formData.type === 'plants' && !formData.lightPreference) {
    Alert.alert("Thiếu thông tin", "Vui lòng chọn điều kiện ánh sáng cho cây.");
    return false;
  }

  return true;
};

// Hàm chuyển category => type
const convertCategoryToType = (category: string): string => {
  switch (category) {
    case 'plants':
      return 'plant';
    case 'pots':
      return 'pot';
    case 'accessories':
      return 'accessory';
    default:
      return 'unknown';
  }
};
