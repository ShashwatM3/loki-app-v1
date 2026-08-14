import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Image } from 'react-native';
import { apiClient } from '../../services/apiClient';

interface RecommendationCard {
  id: string;
  name: string;
  category: string;
  image?: string;
  rating?: number;
  budget?: string;
  location?: string;
  blurb: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: RecommendationCard[];
}

export default function AIChatbotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Loki, your personal Dubai guide. Ask me anything about places to visit, restaurants, activities, or get personalized recommendations!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedPrompts = [
    'Suggest places that are good for a date on a budget',
    'What are the best cafes for working remotely?',
    'Show me outdoor activities for this weekend',
    'Recommend family-friendly places in Dubai',
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // The backend (/api/gpt) has its own Loki system prompt and is grounded
      // in the real places database — we only send the conversation history.
      const response = await apiClient.post('/api/gpt', {
        messages: [
          ...messages
            .slice(1) // skip the local welcome message
            .map((m) => ({ role: m.role, content: m.content })),
          { role: userMessage.role, content: userMessage.content },
        ],
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer || 'Sorry, I couldn\'t process that request.',
        recommendations: Array.isArray(response.recommendations)
          ? response.recommendations
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon name="robot" size={28} color="#6366f1" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Ask Loki</Text>
            <Text style={styles.headerSubtitle}>Your personal Dubai guide</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View key={index}>
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
            {message.recommendations && message.recommendations.length > 0 && (
              <View style={styles.recsContainer}>
                {message.recommendations.map((rec) => (
                  <View key={rec.id} style={styles.recCard}>
                    {!!rec.image && (
                      <Image source={{ uri: rec.image }} style={styles.recImage} />
                    )}
                    <View style={styles.recBody}>
                      <Text style={styles.recName} numberOfLines={1}>
                        {rec.name}
                      </Text>
                      <View style={styles.recMeta}>
                        <Text style={styles.recCategory} numberOfLines={1}>
                          {rec.category}
                        </Text>
                        {!!rec.rating && (
                          <View style={styles.recRating}>
                            <Icon name="star" size={12} color="#f59e0b" />
                            <Text style={styles.recRatingText}>{rec.rating}</Text>
                          </View>
                        )}
                        {!!rec.budget && <Text style={styles.recBudget}>{rec.budget}</Text>}
                      </View>
                      <Text style={styles.recBlurb} numberOfLines={2}>
                        {rec.blurb}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>Loki is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {!loading && messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsList}>
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestedPrompt(prompt)}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Loki anything..."
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Icon
              name="send"
              size={20}
              color={input.trim() ? '#ffffff' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#111827',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  suggestionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
  },
  suggestionChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  recsContainer: {
    marginBottom: 12,
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    overflow: 'hidden',
    maxWidth: '92%',
  },
  recImage: {
    width: 84,
    height: 84,
    backgroundColor: '#e5e7eb',
  },
  recBody: {
    flex: 1,
    padding: 10,
  },
  recName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recCategory: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 8,
    flexShrink: 1,
  },
  recRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  recRatingText: {
    fontSize: 11,
    color: '#374151',
    marginLeft: 2,
  },
  recBudget: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  recBlurb: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    lineHeight: 16,
  },
});