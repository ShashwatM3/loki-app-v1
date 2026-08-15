import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Send, X } from 'lucide-react-native';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { LokiMarkdown } from './LokiMarkdown';
import { LokiRecommendations } from './LokiRecommendations';
import { WEB_BASE_URL } from '../services/apiClient';
import { colors, fonts, radius, whiteAlpha } from '../lib/theme';
import type { LokiRecommendationCard } from '../lib/placePresentation';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: LokiRecommendationCard[];
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content:
    "Hey! I'm Loki. Tell me what you're looking for tonight — who you're with, what mood you're in, and I'll help you find the perfect spot.",
};

// Example prompts mirror the kinds of questions in the places test data.
const SUGGESTED_PROMPTS = [
  'Suggest places that are good for a date on a budget',
  'Chill spots to work with coffee',
  'Best beaches for content',
  'What kinds of places do you have?',
];

function TypingDot({ delay }: { delay: number }) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, { toValue: -4, duration: 300, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(400 - delay > 0 ? 400 - delay : 0),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce, delay]);
  return <Animated.View style={[styles.typingDot, { transform: [{ translateY: bounce }] }]} />;
}

type LokiChatSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** 1:1 port of components/loki-chat-sheet.tsx (Ask Loki chat takeover). */
export function LokiChatSheet({ open, onOpenChange }: LokiChatSheetProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Ask for location once the sheet opens so we can show distance + center the map.
  useEffect(() => {
    if (!open || userLocation) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      } catch {
        // ignore
      }
    })();
  }, [open, userLocation]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${WEB_BASE_URL}/api/gpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.id !== 'init')
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await res.json()) as {
        answer?: string;
        error?: string;
        recommendations?: LokiRecommendationCard[];
      };
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer ?? `Error: ${data.error ?? 'No response from server.'}`,
          recommendations:
            data.recommendations && data.recommendations.length > 0
              ? data.recommendations
              : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Oops, something went wrong. Please try again!',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} contentStyle={{ borderLeftWidth: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoCircleText}>L</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Ask Loki</Text>
              <Text style={styles.headerSubtitle}>Your AI city guide</Text>
            </View>
          </View>
          <Button
            variant="ghost"
            size="icon"
            style={{ borderRadius: 999 }}
            onPress={() => onOpenChange(false)}
            accessibilityLabel="Close"
          >
            <X size={16} color={colors.foreground} />
          </Button>
        </View>

        {/* Messages — bottom-up: stick to bottom, grow upward */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messagesContent}
        >
          <View style={{ marginTop: 'auto', gap: 16 }}>
            {messages.map((msg) => {
              const hasRecs = !!msg.recommendations?.length;
              return (
                <View key={msg.id} style={{ gap: 8 }}>
                  <View
                    style={[
                      styles.messageRow,
                      msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
                    ]}
                  >
                    {msg.role === 'assistant' ? (
                      <View style={styles.assistantAvatar}>
                        <Text style={styles.assistantAvatarText}>L</Text>
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.bubble,
                        msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                      ]}
                    >
                      {msg.role === 'assistant' ? (
                        <LokiMarkdown content={msg.content} />
                      ) : (
                        <Text style={styles.bubbleUserText}>{msg.content}</Text>
                      )}
                    </View>
                  </View>
                  {hasRecs ? (
                    <View style={{ paddingLeft: 32 }}>
                      <LokiRecommendations
                        recommendations={msg.recommendations!}
                        userLocation={userLocation}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}

            {/* Typing indicator */}
            {isTyping ? (
              <View style={[styles.messageRow, styles.messageRowAssistant]}>
                <View style={styles.assistantAvatar}>
                  <Text style={styles.assistantAvatarText}>L</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                  <View style={styles.typingRow}>
                    <TypingDot delay={0} />
                    <TypingDot delay={150} />
                    <TypingDot delay={300} />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Suggested prompts — only before the first user message */}
        {messages.length === 1 && !isTyping ? (
          <View style={styles.promptsWrap}>
            <View style={styles.promptsRow}>
              {SUGGESTED_PROMPTS.map((p) => (
                <Pressable key={p} onPress={() => handleSend(p)} style={styles.promptChip}>
                  <Text style={styles.promptChipText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(20, insets.bottom + 8) }]}>
          <View style={styles.inputRow}>
            <Input
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              placeholder="What are you looking for tonight?"
              style={styles.chatInput}
              editable={!isTyping}
              returnKeyType="send"
            />
            <Button
              size="icon"
              onPress={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{ borderRadius: 999 }}
              accessibilityLabel="Send"
            >
              <Send size={16} color={colors.primaryForeground} />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleText: {
    fontSize: 11,
    fontFamily: fonts.sansBold,
    color: colors.primaryForeground,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
    lineHeight: 16,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantAvatarText: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: colors.primaryForeground,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius['2xl'],
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: radius.sm,
    backgroundColor: colors.muted,
  },
  bubbleUserText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.primaryForeground,
    fontFamily: fonts.sans,
  },
  typingBubble: {
    paddingVertical: 14,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mutedForeground,
  },
  promptsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  promptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptChipText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.sans,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    width: undefined,
    borderRadius: 999,
    borderColor: colors.border,
    backgroundColor: 'rgba(16,16,18,0.4)',
    fontSize: 14,
    height: 36,
  },
});
