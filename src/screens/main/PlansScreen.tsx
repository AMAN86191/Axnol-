import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Star,
  Award,
} from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { CommonHeader } from '../../components/CommonHeader';
import { CustomButton } from '../../components/CustomButton';
import useHomeStore from '../../zustand/useHomeStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlansScreen'>;

interface Plan {
  id: number;
  plan_name: string;
  price: string;
  duration: string;
  status: number;
}

export default function PlansScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getPlansStore, purchasePlanStore } = useHomeStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await getPlansStore();
      if (response && response.status && response.plans) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.log('Error fetching plans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handlePurchase = async (plan: Plan) => {
    setPurchasingId(plan.id);
    try {
      const payload = {
        plan_id: plan.id,
        amount: parseFloat(plan.price),
        payment_status: "paid",
        transaction_id: "2345746"
      };
console.log('payload', payload)
      
      const response = await purchasePlanStore(payload);
      
      if (response && response.status) {
        navigation.navigate('DonationSuccessScreen', {
          amount: parseFloat(plan.price),
          transactionId: '2345746',
          date: new Date().toLocaleDateString()
        });
      } else {
        Alert.alert('Error', response?.message || 'Failed to purchase plan.');
      }
    } catch (error) {
      console.log('Purchase error:', error);
      Alert.alert('Error', 'An error occurred while purchasing the plan.');
    } finally {
      setPurchasingId(null);
    }
  };

  const renderPlanCard = (plan: Plan, isPremium: boolean) => {
    return (
      <View key={plan.id} style={[styles.planCard, isPremium && styles.premiumCard]}>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Star size={RFValue(10)} color="#FFF" fill="#FFF" />
            <Text style={styles.premiumBadgeText}>RECOMMENDED</Text>
          </View>
        )}
        <View style={styles.planHeader}>
          <View style={styles.planIconBox}>
            <Award size={RFValue(20)} color={isPremium ? Colors.primary : Colors.dark} />
          </View>
          <Text style={styles.planName}>{plan.plan_name}</Text>
        </View>

        <View style={styles.planPriceContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.planPrice}>{parseInt(plan.price).toLocaleString('en-IN')}</Text>
          <Text style={styles.planDuration}>/{plan.duration}</Text>
        </View>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <CheckCircle size={RFValue(14)} color="#4CAF50" />
            <Text style={styles.featureText}>Support Gau Mata Welfare</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={RFValue(14)} color="#4CAF50" />
            <Text style={styles.featureText}>Exclusive Community Access</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={RFValue(14)} color="#4CAF50" />
            <Text style={styles.featureText}>Digital Membership Certificate</Text>
          </View>
        </View>

        <CustomButton 
          title="Select & Pay" 
          onPress={() => handlePurchase(plan)}
          loading={purchasingId === plan.id}
          disabled={purchasingId !== null}
          style={{ marginTop: hp('2%'), width: '100%' }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CommonHeader title="Membership Plans" onBackPress={() => navigation.goBack()} />

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >
          <View style={styles.headerInfo}>
            <ShieldCheck size={RFValue(24)} color={Colors.primary} />
            <Text style={styles.titleText}>Choose Your Plan</Text>
            <Text style={styles.subtitleText}>
              Become an official member of Gaumata Trust and help us provide care and shelter to cows.
            </Text>
          </View>

          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isPremium = plan.duration.toLowerCase() === 'lifetime';
              return renderPlanCard(plan, isPremium);
            })}
          </View>

          {plans.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No plans available at the moment.</Text>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
    paddingTop: hp('2%'),
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
  },
  titleText: {
    fontSize: RFValue(18),
    fontWeight: '800',
    color: '#333',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
  },
  subtitleText: {
    fontSize: RFValue(11),
    color: '#666',
    textAlign: 'center',
    lineHeight: RFValue(16),
  },
  plansContainer: {
    width: '100%',
    gap: hp('2%'),
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: hp('1.5%'),
  },
  premiumCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderBottomLeftRadius: wp('3%'),
  },
  premiumBadgeText: {
    color: '#FFF',
    fontSize: RFValue(8),
    fontWeight: '800',
    marginLeft: wp('1%'),
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  planIconBox: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('3%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  planName: {
    fontSize: RFValue(16),
    fontWeight: '800',
    color: '#333',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: hp('2.5%'),
  },
  currencySymbol: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#333',
    marginRight: wp('1%'),
  },
  planPrice: {
    fontSize: RFValue(32),
    fontWeight: '900',
    color: '#111',
  },
  planDuration: {
    fontSize: RFValue(11),
    color: '#666',
    fontWeight: '600',
    marginLeft: wp('1%'),
    textTransform: 'capitalize',
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: hp('2%'),
    gap: hp('1.2%'),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: RFValue(11),
    color: '#555',
    marginLeft: wp('2.5%'),
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: hp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFValue(12),
    color: '#999',
  },
});
