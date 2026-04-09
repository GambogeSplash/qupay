import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '../../components/Icon';
import { CTAButton } from '../../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SendFlowParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<SendFlowParamList, 'Tracking'>;

interface Step {
  label: string;
  desc: string;
  state: 'done' | 'active' | 'waiting';
  time: string;
}

export const TrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    recipientName = 'Emeka Johnson',
    recipientInitials = 'EJ',
    recipientMethod = 'OPay',
    recipientFlag = '\u{1F1F3}\u{1F1EC}',
    amount = 200,
    receiveAmount = 329000,
    dest,
  } = route.params || {};

  const symbol = dest?.symbol || '\u20A6';
  const [progress, setProgress] = useState(0);
  const [etaSecs, setEtaSecs] = useState(118);
  const [steps, setSteps] = useState<Step[]>([
    { label: 'Approved', desc: `${amount} USDT locked on Polygon`, state: 'done', time: 'Just now' },
    { label: 'Node fulfilling', desc: `Releasing to ${recipientMethod}`, state: 'active', time: 'In progress\u2026' },
    { label: 'Credit sent', desc: 'Mobile money alert sent to recipient', state: 'waiting', time: 'Pending' },
    { label: 'Complete', desc: 'Contract settled', state: 'waiting', time: 'Pending' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 1.5, 100);
        return next;
      });
      setEtaSecs((e) => Math.max(e - 1, 0));
    }, 1000);

    // Simulate step progression
    const t1 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === 1) return { ...s, state: 'done', time: '0:42' };
          if (i === 2) return { ...s, state: 'active', time: 'In progress\u2026' };
          return s;
        })
      );
    }, 5000);

    const t2 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === 2) return { ...s, state: 'done', time: '1:18' };
          if (i === 3) return { ...s, state: 'active', time: 'In progress\u2026' };
          return s;
        })
      );
    }, 10000);

    const t3 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === 3) return { ...s, state: 'done', time: '1:52' };
          return s;
        })
      );
      setProgress(100);
      // Navigate to success
      setTimeout(() => {
        navigation.replace('Success', {
          recipientName,
          recipientInitials,
          recipientMethod,
          recipientFlag,
          amount,
          receiveAmount,
          dest,
        });
      }, 1500);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigation, recipientName, recipientInitials, recipientMethod, recipientFlag, amount, receiveAmount, dest]);

  const formatEta = useCallback(() => {
    const m = Math.floor(etaSecs / 60);
    const s = etaSecs % 60;
    return ` ${m}:${s < 10 ? '0' : ''}${s}`;
  }, [etaSecs]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>Transfer in progress</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.trackHero}>
          <View style={styles.thFlags}>
            <Text style={styles.flagLg}>{'\u{1F1F8}\u{1F1EC}'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#38BDF8" />
            <Text style={styles.flagLg}>{recipientFlag}</Text>
          </View>
          <Text style={styles.thAmount}>
            {symbol}
            {receiveAmount.toLocaleString()}
          </Text>
          <Text style={styles.thSub}>
            {'\u2192'} {recipientName} {'\u00B7'} {recipientMethod} {'\u00B7'} Nigeria
          </Text>
          <View style={[styles.thEta, progress >= 100 && styles.thEtaDone]}>
            <View style={styles.ldot} />
            <Text style={[styles.thEtaText, progress >= 100 && styles.thEtaTextDone]}>
              {progress >= 100 ? 'Delivered!' : `Est. delivery in${formatEta()}`}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#38BDF8', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` as any }]}
            />
          </View>
          <Text style={styles.progressPct}>{Math.round(Math.min(progress, 100))}% complete</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <View key={step.label} style={styles.step}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    step.state === 'done' && styles.stepLineDone,
                  ]}
                />
              )}
              {/* Dot */}
              <View
                style={[
                  styles.stepDot,
                  step.state === 'done' && styles.stepDotDone,
                  step.state === 'active' && styles.stepDotActive,
                  step.state === 'waiting' && styles.stepDotWait,
                ]}
              >
                {step.state === 'done' ? (
                  <Text style={styles.stepDotCheckText}>{'\u2713'}</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepDotNum,
                      step.state === 'active' && styles.stepDotNumActive,
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {/* Body */}
              <View style={styles.stepBody}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <CTAButton
            title="Back to Home"
            ghost
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Amount' }] })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0C' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  trackHero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  thFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  flagLg: { fontSize: 28 },
  thAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    letterSpacing: -1,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  thSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
  },
  thEta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  thEtaDone: {
    backgroundColor: '#38BDF8',
  },
  thEtaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#38BDF8',
  },
  thEtaTextDone: {
    color: '#0A0A0C',
  },
  ldot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38BDF8',
  },
  progressWrap: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#26262A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPct: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  stepsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
  },
  stepLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stepLineDone: {
    backgroundColor: '#38BDF8',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepDotDone: {
    backgroundColor: '#38BDF8',
  },
  stepDotActive: {
    backgroundColor: 'rgba(56,189,248,0.15)',
  },
  stepDotWait: {
    backgroundColor: '#26262A',
  },
  stepDotCheckText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#0A0A0C',
  },
  stepDotNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  stepDotNumActive: {
    color: '#38BDF8',
  },
  stepBody: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 20,
  },
  stepLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 17,
  },
  stepTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  ctaWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
