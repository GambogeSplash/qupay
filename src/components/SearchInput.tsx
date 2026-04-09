import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from './Icon';
import { useTheme, typography, spacing, borderRadius } from '../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.surface }]}>
      <Ionicons name="search" size={18} color={theme.text.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.muted}
        style={[typography.body, styles.input, { color: theme.text.primary }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    gap: spacing(2),
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
