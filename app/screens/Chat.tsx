import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const genAI = new GoogleGenerativeAI("AIzaSyAauakKip4CAEdknvzI6R2jZboBKMX_JUg");

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'location' | 'recommendation';
}

const ChatScreen = () => {
  const navigation = useNavigation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Tôi là chatbot của PlantShop, tôi có thể giúp gì cho bạn về cây cối và cây trồng',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    if (loadingMessageId) {
      const interval = setInterval(() => {
        setLoadingDots(prev => (prev === '...' ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setLoadingDots('');
    }
  }, [loadingMessageId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Hiển thị tin nhắn loading
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      text: 'Đang xử lý',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, loadingMsg]);
    setLoadingMessageId(loadingId);

    try {
       console.log("🚀 Bắt đầu gọi API Ollama...");
      const response = await fetch('http://10.0.2.2:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `Bạn là chatbot của hệ thống APP PlantShop. 
Trả lời ngắn gọn, thân thiện, chỉ gợi ý về vấn đề liên quan đến cây cối, cây trồng, chăm sóc cây và đặc biệt phải sử dụng tiếng Việt.
Người dùng hỏi: "${userMsg.text}"`,
          stream: false
        })
      });

     console.log("📥 Đã nhận phản hồi HTTP, đang parse JSON...");
    const data = await response.json();
    console.log("✅ JSON trả về từ Ollama:", data);
      const reply = data.response || 'Xin lỗi, tôi chưa hiểu ý bạn.';
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId ? { ...msg, text: reply, timestamp: new Date() } : msg
      ));
      setLoadingMessageId(null);

    } catch (err) {
      console.error("❌ Lỗi gọi Ollama:", err);
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId ? {
          ...msg,
          text: '🌱 Xin lỗi, hệ thống gặp sự cố.',
          timestamp: new Date()
        } : msg
      ));
      setLoadingMessageId(null);
    }
  };

  const sendQuickMessage = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);

    // Tùy theo text, trả về câu trả lời cứng
    let botReply = '';
    switch (text) {
      case 'Hướng dẫn mua cây':
        botReply = `Để mua cây:  
🌱 Bước 1: Chọn vào màn hình home trên thanh Tabbar (icon đầu tiên)
🌿 Bước 2: Tìm kiếm và chọn loại cây bạn muốn mua
🍃 Bước 3: Thêm cây vào giỏ hàng
🌳 Bước 4: Ở thanh Tabbar chọn mục giỏ hàng (icon thứ 2)
🌲 Bước 5: Ở trang giỏ hàng bạn nhấn thanh toán
🌺 Bước 6: Điền đủ thông tin và hoàn tất thanh toán`;
        break;
      case 'Hướng dẫn thay đổi thông tin tài khoản':
        botReply = `Hướng dẫn thay đổi thông tin tài khoản:
🌱 Bước 1: Chọn vào màn hình Profile trên thanh Tabbar (icon cuối cùng)
🌿 Bước 2: Chọn vào mục "Hồ sơ của bạn"
🍃 Bước 3: Sửa đổi thông tin mà bạn muốn thay đổi`;
        break;
      case 'Hướng dẫn thay đổi địa chỉ giao hàng':
        botReply = `Hướng dẫn thay đổi hoặc thêm địa chỉ giao cây:
🌱 Bước 1: Chọn vào màn hình Profile trên thanh Tabbar (icon cuối cùng)
🌿 Bước 2: Chọn vào mục "Danh sách địa chỉ"
🍃 Bước 3: Sửa địa chỉ hiện tại hoặc thêm địa chỉ mới bằng nút "+" ở góc phải`;
        break;
      case 'Top cây bán chạy':
        botReply = `🌟 Top cây bán chạy nhất:
🥇 1. Cây kim tiền - may mắn tài lộc
🥈 2. Cây trầu bà - dễ chăm sóc
🥉 3. Cây sen đá - xinh xắn, ít nước`;
        break;
      case 'Hướng dẫn theo dõi đơn hàng':
        botReply = `Hướng dẫn theo dõi đơn hàng cây:
🌱 Bước 1: Chọn vào màn hình Profile trên thanh Tabbar (icon cuối cùng)
🌿 Bước 2: Chọn vào mục "Đơn hàng của bạn"
🍃 Bước 3: Theo dõi trạng thái giao cây của bạn`;
        break;
      case 'Hướng dẫn chăm sóc cây':
        botReply = `🌱 Tips chăm sóc cây cơ bản:
💧 Tưới nước: 2-3 lần/tuần, tránh úng nước
☀️ Ánh sáng: Đặt nơi có ánh sáng gián tiếp
🌡️ Nhiệt độ: 18-25°C là lý tưởng
🍃 Bón phân: 1-2 lần/tháng với phân hữu cơ`;
        break;
      default:
        botReply = 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn về cây cối.';
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: botReply,
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, botMsg]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn mua cây')}>
          <Ionicons name="leaf" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Hướng dẫn mua cây</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn chăm sóc cây')}>
          <Ionicons name="water" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Chăm sóc cây</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn thay đổi thông tin tài khoản')}>
          <Ionicons name="person" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Thông tin tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn thay đổi địa chỉ giao hàng')}>
          <Ionicons name="location" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Địa chỉ giao cây</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Hướng dẫn theo dõi đơn hàng')}>
          <Ionicons name="eye" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Theo dõi đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => sendQuickMessage('Top cây bán chạy')}>
          <Ionicons name="star" size={16} color="#2E7D32" />
          <Text style={styles.quickButtonText}>Top cây hot</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {!message.isUser && (
        <View style={styles.botAvatar}>
          <Image
            style={{ width: 36, height: 36, borderRadius: 18 }}
            resizeMode="cover"
            source={require('../../assets/images/logo.png')}
          />
        </View>
      )}
      <View style={[
        styles.messageContent,
        message.isUser ? styles.userMessageContent : styles.botMessageContent
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          {message.id === loadingMessageId ? `${message.text}${loadingDots}` : message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          message.isUser ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).navigate('TabNavigator')}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Image
              style={{ width: 44, height: 44, borderRadius: 22 }}
              resizeMode="cover"  
              source={require('../../assets/images/logo.png')}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>PlantShop Bot</Text>
            <Text style={styles.headerSubtitle}>Trợ lý chăm sóc cây xanh</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <QuickActions />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi tôi về cây cối..."
            placeholderTextColor="#81C784"
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color={inputText.trim() ? "#fff" : "#A5D6A7"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    marginTop: Platform.OS === 'android' ? 24 : 0, // Adjust for Android status bar
  },
  // Header styles với theme xanh lá
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 1,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 8,
  },

  // Message styles với theme tự nhiên
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  botMessage: {
    flexDirection: 'row',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  messageContent: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageContent: {
    backgroundColor: '#4CAF50', // Xanh lá đậm cho tin nhắn user
    borderBottomRightRadius: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  botMessageContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botMessageText: {
    color: '#1B5E20',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#81C784',
  },

  // Quick actions với theme cây xanh
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Input styles với theme xanh tự nhiên
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F8E9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1B5E20',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sendButtonInactive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
});