import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackButton } from './BackButton';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack, right }) => {
  return (
    <View style={styles.container}>
      {onBack ? <BackButton onPress={onBack} /> : <View style={styles.spacer} />}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right ? right : <View style={styles.spacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20, // local screens use 20pt gutters
    paddingTop: 18,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 22, // T.screenTitle
    color: '#FFFFFF',
  },
  spacer: {
    width: 36,
  },
});
