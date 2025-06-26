import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';

// Định nghĩa kiểu dữ liệu cho props
interface QandAScreenProps {
    navigation: any;
}

// Định nghĩa kiểu dữ liệu cho mỗi item câu hỏi
interface QandAItem {
    text: string;
    subtext: string;
}

const QandAScreen: React.FC<QandAScreenProps> = ({ navigation }) => {
    // Sử dụng Record<number, boolean> để chỉ rõ kiểu dữ liệu của state subtextVisible
    const [subtextVisible, setSubtextVisible] = useState<Record<number, boolean>>({});
    
    const goBack = () => {
        navigation.goBack();
    }
    
    const toggleSubtext = (index: number) => {
        setSubtextVisible({ ...subtextVisible, [index]: !subtextVisible[index] });
    };

    return (
        <View style={styles.container}>
        <AppHeader title="Q&A" navigation={navigation} style={{ width: '100%'}}/>
        <ScrollView>
                {texts.map((item: QandAItem, index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => toggleSubtext(index)}>
                        <View style={styles.containText}>
                            <Text style={styles.textStyle}>{item.text}</Text>
                            {subtextVisible[index] ?
                                <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_hiddenInfo.png')} />
                                :
                                <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_moreInfo.png')} />
                            }
                        </View>
                        {subtextVisible[index] &&
                            <View style={styles.containText}>
                                <Text style={styles.subtextStyle}>{item.subtext}</Text>
                            </View>
                        }
                    </TouchableOpacity>
                ))}
        </ScrollView>
        </View>
    );
};

export default QandAScreen;

const styles = StyleSheet.create({
    subtextStyle: {
        color: '#7D7B7B',
        fontSize: 16,
        textAlign: 'justify',
        paddingRight: 20,
    },
    iconStyle: {
        width: 24,
        height: 24,
    },
    textStyle: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
        width: 300,
        textAlign: 'justify'
    },
    containText: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    nameOfPlantStyle: {
        fontSize: 20,
        color: '#000',
        fontWeight: '500'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    }
});

// Dữ liệu câu hỏi và trả lời
const texts: QandAItem[] = [
    {
        text: 'Tôi trộn các chất dinh dưỡng theo thứ tự nào?',
        subtext: 'A, B, C, D,F rồi line E Root Igniter. Nên pha vào xô và cho máy sục oxy vào thì khơi pha dd sẽ tan đều.'
    },
    {
        text: 'Tôi có thể giữ dung dịch dinh dưỡng hỗn hợp trong bao lâu?',
        subtext: 'Dinh dưỡng cao cấp nên ko có hạn sử dụng, chỉ cần bảo quản tốt dưới nhiệt độ mát, tránh ánh sáng trực tiếp là sẽ để được rất lâu, Để duy trì mức dinh dưỡng tối ưu, chúng tôi khuyên bạn nên thay đổi hồ chứa thuỷ canh của bạn sau mỗi 7 ngày, còn với thổ canh thì pha lần nào tưới lần đó, thừa thì bỏ lần sau pha mới. Đặc biệt có vi sinh Mycorrhizae có hạn sử dụng sau 2 năm kể từ ngày mua.'
    },
    {
        text: 'Khi nào tôi thêm bộ điều chỉnh pH?',
        subtext: 'Sau khi bạn thêm A-F nhưng trước khi bạn thêm line E Root Igniter vào thì phải căn chỉnh pH trước rồi. PH tối ưu là giữa 5,8-6,3, nấm rễ phát triển tốt hơn khi pH chuẩn, dinh dưỡng đủ. Bạn cần thêm 1 số công cụ bút đo nữa nhé.'
    },
    {
        text: 'Các chất điều chỉnh tăng trưởng có được sử dụng trong các sản phẩm Planta không?',
        subtext: 'Không. Chúng tôi không sử dụng bất kỳ chất điều chỉnh tăng trưởng nào trong dòng Nutrient của mình. Điều này bao gồm Paclobutrazol và Daminozide, được chứng minh là có ảnh hưởng tiêu cực đến sức khỏe khi con người ăn phải, đặc biệt là Ung Thư.'
    },
    {
        text: 'Các sản phẩm Planta có phải là hữu cơ không?',
        subtext: 'Các sản phẩm dinh dưỡng của chúng tôi là sự pha trộn của tất cả các thành phần hữu cơ và vô cơ tự nhiên, không chứa hormone, nước hoa, thuốc nhuộm hoặc chất điều hòa tăng trưởng. Chúng đã được thiết kế đặc biệt để tối đa hóa khả dụng sinh học của các chất dinh dưỡng để hấp thụ và hiệu quả tối ưu. Chúng tôi hiểu được sự hấp thụ của một khu vườn hữu cơ. Quan trọng hơn, độ chính xác như vậy mang lại kết quả vượt trội với một giải pháp hoàn toàn hữu cơ. Chúng tôi tiếp tục phát triển các sản phẩm hữu cơ để thử nghiệm và sẽ cung cấp cho các thị trường dựa trên những kết quả chúng tôi thu thập được.'
    },
];