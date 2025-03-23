import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { THEME_COLORS } from '../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const GEMINI_API_KEY = 'AIzaSyABYrISdWYC-ldtGoasoEtumMWVsKB_l_c';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default function GeminiChat() {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI của Shine Hair Salon. Tôi có thể giúp gì cho bạn?',
      isBot: true,
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        setChatLoading(true);
        const userMessage = message.trim();
        
        // Thêm tin nhắn của người dùng
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: userMessage,
            isBot: false,
          },
        ]);

        // Gọi Gemini API
        const prompt = `Bạn là trợ lý AI của một salon tóc tên là Shine Hair Salon. 
        Hãy trả lời câu hỏi sau một cách thân thiện và chuyên nghiệp: ${userMessage}`;
        
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const botMessage = data.candidates[0].content.parts[0].text;

        // Thêm tin nhắn của bot
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 2,
            text: botMessage,
            isBot: true,
          },
        ]);

        setMessage('');
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
            isBot: true,
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    }
  };

  // Nếu đang loading hoặc chưa đăng nhập, không hiển thị gì cả
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setIsVisible(true)}
      >
        <FontAwesome5 name="robot" size={24} color={THEME_COLORS.white} />
        <Text style={styles.chatButtonText}>Chat với AI</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat với AI Shine</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <FontAwesome5 name="times" size={20} color={THEME_COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.messagesContainer}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.isBot ? styles.botMessage : styles.userMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.isBot ? styles.botMessageText : styles.userMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor={THEME_COLORS.gray}
                multiline
                disabled={chatLoading}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!message.trim() || chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator color={THEME_COLORS.primary} />
                ) : (
                  <FontAwesome5
                    name="paper-plane"
                    size={20}
                    color={message.trim() ? THEME_COLORS.primary : THEME_COLORS.gray}
                  />
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 70,
    right: 10,
    backgroundColor: THEME_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: THEME_COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatButtonText: {
    color: THEME_COLORS.white,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: THEME_COLORS.white,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.dark,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  botMessage: {
    backgroundColor: THEME_COLORS.light,
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: THEME_COLORS.primary,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessageText: {
    color: THEME_COLORS.dark,
  },
  userMessageText: {
    color: THEME_COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
}); 