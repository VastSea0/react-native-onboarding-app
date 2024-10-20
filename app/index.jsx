import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const onboardingData = [
  {
    title: "Translate Me!'e Hoş Geldiniz",
    description: "Yeni bir dil öğrenmenin en eğlenceli ve kolay yolu",
    icon: "language",
    gradient: ['#4C3AFF', '#8E30FF'],
  },
  {
    title: "Anlık Çeviri",
    description: "Metinleri anında çevirin ve telaffuzlarını dinleyin",
    icon: "globe",
    gradient: ['#FF3A8C', '#FF6C3A'],
  },
  {
    title: "Kelime Kartları",
    description: "Öğrendiğiniz kelimeleri kartlarla tekrar edin",
    icon: "create-outline",
    gradient: ['#30D8FF', '#3AFFC6'],
  },
];

const OnboardingPage = ({ data, index, scrollX }) => {
  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
  
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.3, 1, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.onboardingContainer, { opacity, transform: [{ scale }] }]}>
      <LinearGradient
        colors={data.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={data.icon} size={80} color="white" />
        </View>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.description}>{data.description}</Text>
      </LinearGradient>
    </Animated.View>
  );
};


const App = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentPage(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = useCallback(() => {
    if (currentPage < onboardingData.length - 1) {
      slideRef.current?.scrollToIndex({ index: currentPage + 1 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentPage]);

  const handleStart = () => {
    console.log('Başla!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Animated.FlatList
        data={onboardingData}
        renderItem={({ item, index }) => (
          <OnboardingPage data={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.title}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slideRef}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dotContainer}>
          {onboardingData.map((_, i) => {
            const inputRange = [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.5, 1],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  {
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              />
            );
          })}
        </View>

        {currentPage === onboardingData.length - 1 ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Haydi Başlayalım!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={() => {
                slideRef.current?.scrollToIndex({
                  index: onboardingData.length - 1,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={scrollTo}>
              <Text style={styles.nextText}>İleri</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  onboardingContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    padding: 20,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    fontFamily: 'Poppins_700Bold',
    color: '#1A1A1A',
    fontSize: 18,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  skipText: {
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  nextText: {
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    fontSize: 16,
  },
});

export default App;