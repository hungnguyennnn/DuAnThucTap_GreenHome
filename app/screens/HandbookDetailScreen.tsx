import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList
} from 'react-native';
import AppHeader from '../components/AppHeader';

// Lấy chiều rộng màn hình
const { width } = Dimensions.get('window');

// Dữ liệu mẫu cho kiến thức cơ bản
const basicKnowledgeData = [
  {
    id: '1',
    title: 'Bước 1: Chuẩn bị vật dụng, chất trồng',
    content: `- Chậu nhỏ hoặc chậu to nếu sau này không muốn thay chậu nữa) hoặc khay ươm nếu gieo số lượng nhiều. Dù bạn dự tính trồng thẳng trong chậu hoặc sẽ chuyển xuống đất trồng thì cũng nên uơm hạt trong chậu trước vì dễ quản lí đô ẩm, sâu bệnh, dinh dưỡng…
- Thuốc trừ nấm: Thuốc trừ nấm cũng là 1 phần không thể thiếu trong khâu chuẩn bị. Nó giúp hạn chế các loại nấm mốc có hại cho hạt giống ảnh hưởng tới cây trồng của bạn sau này.
- Đất trồng: Theo phản ảnh và kinh nghiệm thực tế của các nhà vườn, gieo hạt bằng hỗn hợp cám dừa + tro trấu (tỷ lệ 7:3. thậm chí 100% cám dừa) có kết quả tốt hơn gieo hạt bằng đất sạch. Tuy nhiên cám dừa cần ngâm xả nhiều lần cho hết chất tanin (màu vàng nâu) mới sử dụng được, tro trấu cũng nên ngâm xả nhiều lần để bớt muối.
- Tủ Trồng
- Điều Hòa Độ Ẩm`
  },
  {
    id: '2',
    title: 'Bước 2: Tiến hành gieo hạt',
    content: `- Chuẩn bị chất trồng: Chất trồng sau khi trộn đều, chúng ta cho vào chậu hoặc khay uơm. Tưới đẫm chất trồng. Phun thuốc trừ nấm lên mặt chất trồng (bước này rất quan trọng). Tốt nhất phun liên tục 2-3 lần để thuốc thấm xuống sâu hơn.
- Ngâm hạt giống: Đối với các loại hạt có vỏ mỏng (như cà, ớt…) có thể ngâm bằng nước ấm khoảng 5-8 tiếng. Đối với các loại hạt có vỏ dày (như các loại đậu, bầu, khổ qua…) thì nên ngâm bằng nước ấm (nguyên tắc pha nước 7 lạnh 3 nóng) ngâm 1 đêm cho vỏ hạt nở ra rồi hãy tiến hành gieo (cho nên bước này phải thực hiện có kế hoạch và làm trước các bước chuẩn bị)
- Ủ hạt giống: Sau khi ngâm hạt giống cây trồng, tiến hành ủ hạt (tùy loại hạt, có loại cần ủ vài tiếng, 1 hoặc nhiều ngày), cũng có loại hạt không cần ngâm ủ.
- Chú ý: Đối với các loại hạt khó nảy mầm như các loại huơng thảo, oải huơng thì khuyến khích sử dụng GA3, Atonik (chất kích thích nẩy mầm) để tăng tỷ lệ nẩy mầm (nhưng phải nắm rõ nồng độ và thời gian xử lý, nếu dùng quá liều có thể làm chết hạt).
- Gieo hạt: Nguyên tắc gieo hạt là chôn hạt với độ sâu bằng 2-3 lần đường kính của hạt. Đối với các loại hạt rất nhỏ, thì chúng ta gieo trực tiếp trên mặt đất ẩm, sau đó phun suơng cho hạt bám vào chất trồng là được. Đối với hạt to hơn thì nên chôn sâu khoảng 1-2cm (chú ý ko nén đất quá chặt sau khi chôn hạt). Sau khi gieo hạt xong nên phun sương lên bề mặt vài lần để đất và hạt tiếp xúc với nhau. Đặc biết đối với các hạt xứ lạnh, sau khi gieo hạt nên xử dụng màng thực phẩm, hay tấm kiếng đậy lại chậu hoặc khay uơm để tăng độ ẩm (đặt chậu nơi ít nắng), giúp hạt nảy mầm nhanh hơn. Các loại hạt xứ nóng không cần thực hiện bước này.`
  },
  {
    id: '3',
    title: 'Bước 3: Chăm sóc sau khi gieo hạt',
    content: `- Nhiệt độ: Tùy loại mà hạt cần nhiệt độ khác nhau để nẩy mầm, tuy nhiên dao động từ khoảng 20-25 độ C thích hợp cho đại đa số hạt.
- Độ ẩm của đất trồng: Chú ý luôn đảm bảo độ ẩm cho đất, không được để đất bị khô. Bao lâu phun 1 lần thì phụ thuộc vào nhiều yếu tố nơi gieo hạt giống cây trồng(nhiệt độ, sức gió…). Vấn đề này đòi hỏi bạn phải có kinh nghiệm và quan sát thường xuyên.
- Đặt chậu hoặc khay ươm ở nơi có ánh sáng khuyếch tán (che lưới lan màu đen loại 50%)
Vì hạt cần ánh sáng để nẩy mầm, nhưng nếu cường độ quá mạnh sẽ đốt cháy hạt và làm khô chất trồng nhanh chóng. Cũng có 1 số ít (rất ít) loại cần gieo hạt ở nơi râm mát.
- Thay chậu hoặc chuyển vào đất trồng: Khi cây con đã lớn đến mức độ nào đó (thân đủ cứng cáp, rễ mạnh…), chúng ta có thể chuyển qua chậu to hơn hoặc chuyển xuống đất trồng trực tiếp. Nếu trước đó đã gieo hạt trong chậu to thì có thể trồng tiếp mà không cần sang chậu. Chú ý bón lót phân hữu cơ vào đất trồng.
- Bón phân: Đối với cây con, hệ rễ vẫn chưa đủ mạnh để hấp thụ phân có nồng độ cao, cho nên việc dùng phân bón lá là thích hợp nhất. Thông thường chỉ nên tưới phân bón lá bằng 1/2 hoặc 2/3 nồng độ trên bao bì hướng dẫn.
- Sâu bệnh: Giai đoạn cây con phải chú ý quan sát thường xuyên vì rất dễ bị sâu ăn lá tấn công. Chúng ta nên phun thuốc trừ nấm, trừ sâu (dạng vi sinh) 1 tuần 1 lần. Ngoài ra cũng chú ý đất trồng không được để úng tránh cây bị thối.`
  }
];

// Dữ liệu mẫu cho các giai đoạn
const stagesData = [
  {
    id: '1',
    title: '1. Ngâm Hạt và Ủ Hạt (48 tiếng)',
    content: `Cần ngâm hạt vào nước sạch khoảng 48 tiếng, thay nước mỗi 24 tiếng
Hạt đã hút no nước trong thời gian trên vớt ra và ủ khô trong 24 tiếng.`
  },
  {
    id: '2',
    title: '2. Nảy Mầm (3-5 ngày)',
    content: `-Điều kiện nảy mầm: 25-28 độ C
Độ ẩm: 25 - 35%
Ánh sáng: 8h/ngày
Đất: đất mùn
Phân bón: phân động vật ủ ít nhất 3 tháng
Tỉ lệ phân x đất nền: 3x7
Dinh dưỡng: Elite Nutrition A
- Lưu ý: 
Giai đoạn nhạy cảm khi thêm nước cần nhẹ tay hoặc tưới gốc.
Cần đảm bảo lượng không khí, chủ yếu là oxy cho mầm và rễ phát triển.
Nên sử dụng ly nhựa nhỏ đục lỗ dưới đáy ly để thoát nước và khí cho bộ rễ.
Chiều cao: từ 10-20cm.`
  },
  {
    id: '3',
    title: '3. Bắt Đầu Phát Triển (2-3 tuần)',
    content: `- Điều kiện phát triển:
20-27 độ C
Độ ẩm: 30-40%
Ánh sáng: 10/ ngày
Cần 1 thìa phốt pho để phát triển bộ rễ
Dinh Dưỡng: Elite Nutrition B
- Lưu ý: Giai đoạn cây phát triển thành cây lớn
Tùy từng loại hạt sẽ có từ 2-4 lá mầm ban đầu, rối sẽ phát triển thành 5-7-9 nhánh tùy chất lượng hạt
Sử dụng chậu nhỏ có trộn đất mùn hoặc đất sạch tribat.`
  },
  {
    id: '4',
    title: '4: Trưởng Thành (4-6 tuần)',
    content: `- Điều kiện trưởng thành:
24-27 độ C
Độ ẩm: 30-40%
Ánh sáng: 6h/ngày
Thêm Elite Nutrition C vào nước khi tưới (tỉ lệ 1:9)
- Lưu ý: Giai đoạn phát triển có cấu trúc thân, cành, lá khỏe mạnh để nâng đỡ cụm hoa/quả. Cây lớn nhanh về chiều cao từ 50cm - 70m
Rễ phát triển lớn, nếu chậu không đủ to hãy chuyển sang chậu lớn hơn.`
  },
  {
    id: '5',
    title: '5. Ra Hoa (4-6 tuần)',
    content: `- Điều kiện ra hoa:
24-30 độ C
Độ ẩm: 50-55%
Ánh sáng:12h/ngày
Thêm Elite Nutrition D vào nước khi tưới (tỉ lệ 1:9)
-Lưu ý: Cần tỉa bớt lá to và cấu ngọn để cây có thể ra hoa. 
Ánh sáng cực kì quan trọng tại giai đoạn này.
Cần theo dõi các nhánh để tránh tình trạng bông quá nặng các nhánh không chịu nổi sẽ phải dùng biện nâng đỡ.`
  }
];

// Định nghĩa types cho route param
type HandbookDetailRouteParams = {
  handbook: {
    id: string;
    title: string;
    subtitle: string;
    images: string[];
  };
};


const HandbookDetailScreen: React.FC = ({navigation, route}: any) => {
  const { handbook } = route.params;
  
  // States để quản lý trạng thái mở/đóng của các phần
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBasicKnowledgeExpanded, setIsBasicKnowledgeExpanded] = useState(true);
  const [expandedBasicItems, setExpandedBasicItems] = useState<string[]>([]);
  const [isStagesExpanded, setIsStagesExpanded] = useState(false);
  const [expandedStageItems, setExpandedStageItems] = useState<string[]>([]);

  // Xử lý mở/đóng phần mục cơ bản
  const toggleBasicKnowledge = () => {
    setIsBasicKnowledgeExpanded(!isBasicKnowledgeExpanded);
  };

  // Xử lý mở/đóng phần mục giai đoạn
  const toggleStages = () => {
    setIsStagesExpanded(!isStagesExpanded);
  };

  // Xử lý mở/đóng chi tiết mục con
  const toggleBasicItem = (id: string) => {
    if (expandedBasicItems.includes(id)) {
      setExpandedBasicItems(expandedBasicItems.filter(itemId => itemId !== id));
    } else {
      setExpandedBasicItems([...expandedBasicItems, id]);
    }
  };

  // Xử lý mở/đóng chi tiết giai đoạn
  const toggleStageItem = (id: string) => {
    if (expandedStageItems.includes(id)) {
      setExpandedStageItems(expandedStageItems.filter(itemId => itemId !== id));
    } else {
      setExpandedStageItems([...expandedStageItems, id]);
    }
  };

  // Xử lý chuyển ảnh tiếp theo
  const goToNextImage = () => {
    if (currentImageIndex < handbook.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Xử lý chuyển ảnh trước đó
  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={{padding: 25}}>
      <AppHeader title={handbook.title} navigation={navigation} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.imageSliderContainer}>
          <TouchableOpacity 
            style={[styles.arrowButton, styles.leftArrow]} 
            onPress={goToPrevImage}
            disabled={currentImageIndex === 0}
          >
            <Image source={require('../../assets/images/previousIcon.png')} />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: handbook.images[currentImageIndex] }} 
            style={styles.plantImage} 
            resizeMode="cover"
          />
          
          <TouchableOpacity 
            style={[styles.arrowButton, styles.rightArrow]} 
            onPress={goToNextImage}
            disabled={currentImageIndex === handbook.images.length - 1}
          >
            <Image
            style={styles.nextIcon}
            source={require('../../assets/images/nextIcon.png')}
          />
          </TouchableOpacity>
        </View>

        {/* Page Indicator */}
        <View style={styles.pageIndicator}>
          {handbook.images.map((_: any, index: any) => (
            <View 
              key={index} 
              style={[
                styles.indicatorDot, 
                index === currentImageIndex ? styles.activeDot : {}
              ]} 
            />
          ))}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Cây trồng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton]}>
            <Text style={styles.actionButtonText}>Ưa bóng</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Kiến thức cơ bản */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={toggleBasicKnowledge}
          >
            <Text style={styles.sectionTitle}>Kiến thức cơ bản</Text>
            <Text style={styles.expandIcon}>{isBasicKnowledgeExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>

          {isBasicKnowledgeExpanded && (
            <View style={styles.sectionContent}>
              {basicKnowledgeData.map((item) => (
                <View key={item.id} style={styles.sectionItem}>
                  <TouchableOpacity 
                    style={styles.itemHeader} 
                    onPress={() => toggleBasicItem(item.id)}
                  >
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.expandIcon}>{expandedBasicItems.includes(item.id) ? <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_hiddenInfo.png')} /> : <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_moreInfo.png')} />}</Text>
                  </TouchableOpacity>
                  
                  {expandedBasicItems.includes(item.id) && (
                    <Text style={styles.itemContent}>{item.content}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section: Các giai đoạn */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={toggleStages}
          >
            <Text style={styles.sectionTitle}>Các giai đoạn</Text>
            <Text style={styles.expandIcon}>{isStagesExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>

          {isStagesExpanded && (
            <View style={styles.sectionContent}>
              {stagesData.map((stage) => (
                <View key={stage.id} style={styles.sectionItem}>
                  <TouchableOpacity 
                    style={styles.itemHeader} 
                    onPress={() => toggleStageItem(stage.id)}
                  >
                    <Text style={styles.itemTitle}>{stage.title}</Text>
                    <Text style={styles.expandIcon}>{expandedStageItems.includes(stage.id) ? <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_hiddenInfo.png')} /> : <Image
                                    style={styles.iconStyle}
                                    source={require('../../assets/images/icon_moreInfo.png')} />}</Text>
                  </TouchableOpacity>
                  
                  {expandedStageItems.includes(stage.id) && (
                    <Text style={styles.itemContent}>{stage.content}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  imageSliderContainer: {
    position: 'relative',
    height: width * 0.8,
    backgroundColor: '#f5f5f5',
  },
  plantImage: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#007537',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    marginTop: 5,
  },
  sectionItem: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemContent: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextIcon: {
    width: 24,
    height: 24,
  },
  iconStyle: {
        width: 24,
        height: 24,
    }
});

export default HandbookDetailScreen;
