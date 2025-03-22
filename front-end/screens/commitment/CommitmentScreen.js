import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { THEME_COLORS } from '../../constants/Config';
import { FontAwesome5 } from '@expo/vector-icons';

export default function CommitmentScreen({ navigation }) {
  const commitments = [
    {
      title: '7 ngày chỉnh sửa tóc miễn phí',
      description: 'Nếu anh chưa hài lòng về kiểu tóc sau khi về nhà vì bất kỳ lý do gì, Shine sẽ hỗ trợ anh sửa lại mái tóc đó hoàn toàn miễn phí trong vòng 7 ngày. Anh đặt lịch bình thường và báo sửa tóc với lễ tân.',
    },
    {
      title: '30 ngày đổi/trả hàng miễn phí',
      description: 'Tất cả các sản phẩm mua tại Shine anh có thể đổi hoặc trả lại hoàn toàn MIỄN PHÍ (hoàn lại 100% số tiền) trong vòng 30 ngày kể từ thời điểm mua hàng, ngay cả khi sản phẩm đó đã qua sử dụng.',
      note: 'Cam kết: Hoàn lại 100% tiền.',
    },
    {
      title: '7 ngày bảo hành Uốn/Nhuộm',
      description: 'Mái tóc sau khi uốn nhuộm có thể không đúng ý anh sau khi về nhà. Shine sẽ hỗ trợ anh chỉnh sửa hoàn toàn miễn phí trong vòng 7 ngày. Anh đặt lịch bình thường hoặc bảo lễ tân.',
    },

  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME_COLORS.white} />

      <ScrollView style={styles.content}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>SHINE CARE</Text>
          <Image 
            source={require('../../assets/images/commitment-banner.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Commitments */}
        {commitments.map((commitment, index) => (
          <View key={index} style={styles.commitmentItem}>
            <Text style={styles.commitmentTitle}>{commitment.title}</Text>
            <Text style={styles.commitmentDescription}>{commitment.description}</Text>
            {commitment.note && (
              <Text style={styles.commitmentNote}>{commitment.note}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 30,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    alignItems: 'center',
    padding: 15,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    textAlign: 'center',
    lineHeight: 20,
  },
  commitmentItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commitmentDescription: {
    fontSize: 14,
    color: THEME_COLORS.dark,
    lineHeight: 20,
  },
  commitmentNote: {
    fontSize: 14,
    color: THEME_COLORS.primary,
    fontStyle: 'italic',
  }
}); 