import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { THEME_COLORS } from '../constants/Config';

const { width } = Dimensions.get('window');

const BannerSlider = () => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Dữ liệu mẫu cho banner
  const banners = [
    {
      id: '1',
      image: require('../assets/images/banner/banner1.jpg')
    },
    {
      id: '2',
      image: require('../assets/images/banner/banner2.jpg')
    },
    {
      id: '3',
      image: require('../assets/images/banner/banner3.jpg')
    }
  ];

  const goToNextBanner = () => {
    if (!flatListRef.current) return;

    const nextIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;
    flatListRef.current.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    const intervalId = setInterval(goToNextBanner, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      },
    }
  );

  const renderBanner = ({ item }) => {
    return (
      <View style={styles.bannerContainer}>
        <Image
          source={item.image}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotContainer}>
        {banners.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const getItemLayout = (_, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        viewabilityConfig={{
          viewAreaCoveragePercentThreshold: 50,
          minimumViewTime: 300,
        }}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: THEME_COLORS.white,
    marginVertical: 10,
  },
  bannerContainer: {
    width: width,
    height: 180,
    paddingHorizontal: 15,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME_COLORS.primary,
    marginHorizontal: 3,
  },
});

export default BannerSlider; 