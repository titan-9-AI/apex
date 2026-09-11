// แท็บแชต — คุยกับ Titan-9 AI (กฎสำรอง + ลองเชื่อม AI จริงผ่าน Edge Function)
import React, { useState, useRef, useEffect } from 'react';
import {
  View, FlatList, TextInput, Pressable, StyleSheet, Platform,
  ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot } from 'lucide-react-native';
import { Text } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { replyByRules, AI_ENDPOINT } from '../../lib/titan';
import type { ChatMsg } from '../../lib/titan';

async function askAI(messages: ChatMsg[]): Promise<string | null> {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-10) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.reply === 'string' && data.reply ? data.reply : null;
  } catch {
    return null;
  }
}

const SUGGESTIONS = ['ราคาเท่าไหร่', 'มีกี่แพลตฟอร์ม', 'ชำระเงินยังไง', 'แพ็ก 7 วัน'];

export default function ChatScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'สวัสดีค่ะ ยินดีให้บริการ APEX TITAN-9 AI 🙏 อยากสอบถามเรื่องราคา แพลตฟอร์ม หรือวิธีชำระเงิน พิมพ์มาได้เลยนะคะ' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList<ChatMsg>>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [msgs, thinking]);

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || thinking) return;
    const userMsg: ChatMsg = { role: 'user', content: t };
    const next: ChatMsg[] = [...msgs, userMsg];
    setMsgs(next);
    setInput('');
    setThinking(true);
    const ai = await askAI(next);
    setMsgs((m) => [...m, { role: 'assistant', content: ai ?? replyByRules(t) }]);
    setThinking(false);
  };

  return (
    <LinearGradient colors={['#1e0f3d', '#15082b', '#2a1654']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.botIcon}><Bot color="#fff" size={20} /></View>
          <View>
            <Text variant="heading" style={{ color: '#fff' }}>Titan-9 AI</Text>
            <Text variant="footnote" color="#a78bfa">ผู้ช่วยวางแผนโฆษณา</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={[styles.chip, { borderColor: c.accent }]}>
                  <Text variant="caption" color={c.accent}>{s}</Text>
                </Pressable>
              ))}
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrap, item.role === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? { backgroundColor: c.accent, borderBottomRightRadius: 4 }
                    : { backgroundColor: c.surface, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={{ color: item.role === 'user' ? '#fff' : c.text }}>{item.content}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={thinking ? (
            <View style={styles.bubbleWrap}><View style={[styles.bubble, { backgroundColor: c.surface, flexDirection: 'row', gap: 8 }]}><ActivityIndicator color={c.accent} /><Text variant="caption" color={c.textMuted}>กำลังพิมพ์...</Text></View></View>
          ) : null}
        />

        <View style={[styles.inputBar, { borderTopColor: c.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="พิมพ์คำถาม..."
            placeholderTextColor={c.textMuted}
            onSubmitEditing={() => send()}
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            multiline
          />
          <Pressable onPress={() => send()} disabled={!input.trim() || thinking} style={[styles.sendBtn, { backgroundColor: c.accent, opacity: !input.trim() ? 0.4 : 1 }]}>
            <Send color="#fff" size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  botIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  bubbleWrap: { width: '100%' },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, maxHeight: 110, fontSize: 15 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});

