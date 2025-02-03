import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Linking, Text, View, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { purchaseErrorListener, getSubscriptions, requestSubscription, getProducts, requestPurchase, clearTransactionIOS, useIAP } from "react-native-iap";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Gateway from '../services/Gateway';
import { PricingLoader } from "./Loading";

const Pricing = ({ navigation }) => {
	const {
		connected,
		currentPurchase,
	} = useIAP();
	
	const [processing, setProcessing] = useState({});
	const [loadingDetails, setLoadingDetails] = useState(true);
	const [plansFetched, setPlansFetched] = useState(false);
	const [subscriptionSkus, setSubscriptionSkus] = useState([]);
	const [subscriptionPlans, setSubscriptionPlans] = useState([]);
	const [productSkus, setProductSkus] = useState([]);
	const [productPlans, setProductPlans] = useState([]);
	const [freePlans, setFreePlans] = useState([]);
	const [allPaidPlans, setAllPaidPlans] = useState([]);
	const [processingTransaction, setProcessingTransaction] = useState(false);
	
	const [purchasedPlan, setPurchasedPlan] = useState({
		productId: 'unknown',
		amount: 0,
		currency: 'USD',
		category: 'unknown'
	});

	useEffect(() => {
		if (Platform.OS == 'ios') {
			void clearTransactionIOS();
		}

	}, [])

	useEffect(() => {
		if (currentPurchase && purchasedPlan.productId !== 'unknown') {
			checkCurrentPurchase(currentPurchase, purchasedPlan);
		}

	}, [currentPurchase, purchasedPlan]);

	useEffect(() => {
		const subscription = purchaseErrorListener((error) => {

			productId = error.productId ?? false;
			Gateway.PurchaseIntent(productId,error);
		});
	 
		return () => {
			subscription.remove();
		};

	}, []);
	
	useEffect(() => {
		FetchPlans();
		Gateway.PurchaseIntent();

	}, []);

	useEffect(() => {
		const HandlePaidPlans = async () => {
			setLoadingDetails(true);
	
			try {
				const subscriptionDetails = {};
				const productDetails = {};
	
				if (subscriptionSkus.length > 0) {
					const subscriptions = await getSubscriptions({ skus: subscriptionSkus });

					subscriptions.forEach(subscription => {
						let price;
						let currency;
						let priceAmount;
	
						if (Platform.OS == "ios") {
							price = subscription.localizedPrice || '$';
							currency = subscription.currency;
							priceAmount = subscription.price;
						} 
						
						else if (Platform.OS == "android") {
							const pricingPhases = subscription.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList;
							price = pricingPhases?.[0]?.formattedPrice || '$';
							currency = pricingPhases?.[0]?.priceCurrencyCode;
							priceAmount = (pricingPhases?.[0]?.priceAmountMicros / 1_000_000).toFixed(2);
						}
	
						subscriptionDetails[subscription.productId] = {
							...subscription,
							price,
							currency,
							priceAmount,
						};
					});
				}
	
				if (productSkus.length > 0) {
					const products = await getProducts({ skus: productSkus });

					products.forEach(product => {
						let price;
						let currency;
						let priceAmount;
	
						if (Platform.OS == "ios") {
							price = product.localizedPrice || '$';
							currency = product.currency;
							priceAmount = product.price;
						} 
						
						else if (Platform.OS == "android") {
							const offerDetails = product.oneTimePurchaseOfferDetails;
							price = offerDetails?.formattedPrice || '$';
							currency = offerDetails?.priceCurrencyCode;
							priceAmount = (offerDetails?.priceAmountMicros / 1_000_000).toFixed(2);
						}
	
						productDetails[product.productId] = {
							...product,
							price,
							currency,
							priceAmount,
						};
					});
				}
	
				const combinedPlans = [
					...mergeInto(subscriptionDetails, subscriptionPlans),
					...mergeInto(productDetails, productPlans)
				];
				
				setAllPaidPlans(combinedPlans);
			} 
			
			catch (e) {
				Gateway.Exception('Pricing::HandlePaidPlans', e.message, 'ERROR - Could not wrap paid plans');
			}

			finally {
				setLoadingDetails(false);
			}
		};
	
		if (connected && (subscriptionSkus.length > 0 || productSkus.length > 0)) {
			HandlePaidPlans();
		}

	}, [connected, plansFetched]);

	const FetchPlans = async () => {
			
		try {
			const plans = await Gateway.GetPlans();

			if (plans) {
				const subscriptionPlans = plans.filter(plan => plan.Category == "recurring");
				const productPlans = plans.filter(plan => plan.Category == "onetime");
				const freePlans = plans.filter(plan => plan.Category == "free");

				setSubscriptionPlans(subscriptionPlans);
				setProductPlans(productPlans);
				setFreePlans(freePlans)

				const subscriptionSkus = subscriptionPlans.map(plan => plan.ProductId);
				const productSkus = productPlans.map(plan => plan.ProductId);

				setSubscriptionSkus(subscriptionSkus);
				setProductSkus(productSkus);
				setPlansFetched(true);
			}
		} 
		
		catch (e) {
			Gateway.Exception('Pricing::FetchPlans', e.message, 'ERROR - Could not fetch plans');
		}
	};

	const mergeInto = (details, plans) => {

		if (!details || !plans || plans.length === 0) {
			return [];
		}
	
		const merged = plans
			.filter(plan => plan.ProductId.toLowerCase() !== 'free')
			.map(plan => {
				const detail = details[plan.ProductId] || {};
				return {
					...plan,
					...detail
				};
			});

		return merged;
	};
	
	const handleBuyPurchase = async (productId, currency, amount, category, offerToken = null) => {

		setProcessing((prev) => ({ ...prev, [productId]: true }));
		setProcessingTransaction(true);

		try {
			const userId = await AsyncStorage.getItem('UserId');
			const request = {
				sku: productId,
				obfuscatedAccountIdAndroid: userId,
				appAccountToken: userId
			};

			if (Platform.OS == 'android' && offerToken) {
				request.subscriptionOffers = [{ 
					sku: productId, 
					offerToken 
				}];
			}

			if (category == 'recurring') {
				await requestSubscription(request);
			}

			if (Platform.OS == 'ios' && category == 'onetime') {
				await requestPurchase(request);
			}

			if (Platform.OS == 'android' && category == 'onetime') {
				await requestPurchase({ 
					skus: [productId], 
					obfuscatedAccountIdAndroid: userId
				});
			}

			setPurchasedPlan({
				productId,
				amount,
				currency,
				category
			});
		}
		
		catch (e) {
			if (Platform.OS == 'ios') {
				void clearTransactionIOS();
			}

			setProcessingTransaction(false);
		}

		finally {
			if (Platform.OS == 'ios') {
				void clearTransactionIOS();
			}

			setProcessing((prev) => ({ ...prev, [productId]: false }));
			Gateway.PurchaseIntent(productId);
		}
	};

	const checkCurrentPurchase = async (purchase, currentPurchasedPlan) => {
			
		if (!purchase || !purchase.transactionReceipt || !purchase.transactionId) {
			return false;
		}

		if (await AsyncStorage.getItem(`processed_${purchase.transactionId}`)) {
			return false;
		}
		
		try {

			let parsedreceipt;
			let token;

			if (Platform.OS == 'android') {

				try {
					parsedreceipt = JSON.parse(purchase.transactionReceipt);
					token = parsedreceipt?.['purchaseToken'] ?? false;
				}
				
				catch (e) {
					Gateway.Exception('Pricing::checkCurrentPurchase', e.message, 'ERROR - Failed to parse google receipt');

					return false;
				}
			}

			if (Platform.OS == 'ios') {
				token = purchase.transactionId ?? false;
			}

			if (!token) {
				Gateway.Exception('Pricing::checkCurrentPurchase', 'ERROR - Failed to extract token from receipt');

				return false;
			}

			const result = await Gateway.ProcessPurchase(
				token, 
				purchase.productId,
				currentPurchasedPlan.amount,
				currentPurchasedPlan.currency,
				currentPurchasedPlan.category
			);
			
			if (result) {
				await AsyncStorage.setItem(`processed_${purchase.transactionId}`, 'true');

				setProcessingTransaction(false);
				
				return true;
			}

			return false;
		} 
		
		catch (e) {
			Gateway.Exception('Pricing::checkCurrentPurchase', e.message, 'ERROR - Failed to submit receipt');
		}

		finally {
			setProcessingTransaction(false);
		}
	};
	
	return (
		<SafeAreaView style={styles.pricingContainer}>

		{processingTransaction && (
			<View style={styles.processingTransactionOverlay}>
				<ActivityIndicator size="large" color="#ffffff" />
				<Text style={styles.processingTransactionTextMain}>Please wait while we process your transaction.</Text>
				<Text style={styles.processingTransactionTextSub}>Do not close the app.</Text>
			</View>
		)}

		<ScrollView 
			contentContainerStyle={styles.scrollContainer} 
			bounces={false} 
			scrollEventThrottle={0}
			decelerationRate="normal"
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.pricingWrap}>
			<Text style={styles.pricingTitleParagraph}>Batman</Text>

			{loadingDetails ? (
				<PricingLoader />
			) : (
            <>
				{freePlans.map(plan => (
					<View key={plan.ProductId} style={styles.cardBox}>
						<Text style={styles.pricingH3}>{plan.Heading}</Text>
						<Text style={styles.pricingH4}>
							{plan.Subheading}
						</Text>

						<View style={styles.featuresList}>
							{plan.Description.map((feature, index) => (
								<Text key={index} style={styles.pricingLi}>
									<Icon
										name={feature.Type === 'include' ? 'check-circle' : 'times-circle'}
										style={[
											styles.icon,
											feature.Type === 'include' ? styles.green : styles.red,
										]}
										solid
									/>{' '}
									{feature.Text}
								</Text>
							))}
						</View>
					</View>
				))}

				{allPaidPlans.map(plan => (
					<View key={plan.ProductId} style={[
						styles.cardBox, 
						plan.Highlight === true && styles.specialCard
					]}
					>
						<Text style={styles.pricingH3}>{plan.Heading}</Text>
						{plan.Highlight && (
							<Icon
								name="crown"
								style={styles.bestValueBadge}
							/>
						)}
						<Text style={styles.pricingH4}>
							{loadingDetails ? '$' : plan.Subheading.replace('[%PRICE%]', plan.price || '$')}
						</Text>

						<View style={styles.featuresList}>
							{plan.Description.map((feature, index) => (
								<Text key={index} style={styles.pricingLi}>
									<Icon
										name={feature.Type === 'include' ? 'check-circle' : 'times-circle'}
										style={[styles.icon,feature.Type === 'include' ? styles.green : styles.red,]}
										solid
									/>
									{' '}
									{feature.Text}
								</Text>
							))}
						</View>

						{plan.FinePrint && (
							<View style={styles.finePrintContainer}>
								<Text style={styles.finePrintText}>
								{plan.FinePrint}
								</Text>
							</View>
						)}

						{plan.Category === 'recurring' && (
							<View style={styles.linkContainer}>
								<Text style={styles.linkText}>
									By subscribing, you agree to our <Text onPress={() => Linking.openURL('https://batman.com/terms-and-conditions')} style={styles.link}>Terms of Use</Text> and <Text onPress={() => Linking.openURL('https://batman.com/privacy-policy')} style={styles.link}>Privacy Policy</Text>. 
									This is a monthly subscription, and you can cancel anytime through the {Platform.OS == 'ios' ? 'App Store' : 'Google Play Store'}.
								</Text>
							</View>
						)}

						{plan.Category === 'onetime' && (
							<View style={styles.linkContainer}>
								<Text style={styles.linkText}>
									By proceeding, you agree to our <Text onPress={() => Linking.openURL('https://batman.com/terms-and-conditions')} style={styles.link}>Terms of Use</Text> and <Text onPress={() => Linking.openURL('https://batman.com/privacy-policy')} style={styles.link}>Privacy Policy</Text>. 
									This is a one-time payment.
								</Text>
							</View>
						)}

						<TouchableOpacity
							style={plan.Disabled ? styles.subscribedButton : styles.greenButton}
							disabled={processing[plan.ProductId] || plan.Disabled}
							onPress={() =>
								handleBuyPurchase(
									plan.ProductId,
									plan.currency,
									plan.priceAmount,
									plan.Category,
									plan.subscriptionOfferDetails?.[0]?.offerToken
								)
							}
						>
							{processing[plan.ProductId] ? (
								<Text style={styles.buttonText}>Processing</Text>
							) : (
								<Text style={styles.buttonText}>
									{plan.CallToAction}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				))}

			</>
            )}

			</View>
		</ScrollView>
		</SafeAreaView>
		);
	};

const styles = StyleSheet.create({
  pricingContainer: {
	flex: 1,
	backgroundColor: '#ffffff',
  },
  scrollContainer: {
	flexGrow: 1,
  },
  pricingWrap: {
	alignItems: 'center',
	paddingHorizontal: 20,
  },
  pricingTitleParagraph: {
	fontSize: 22,
	fontWeight: 'bold',
	marginTop: 30,
	marginBottom: 20,
	textAlign: 'center',
  },
  badgeContainer: {
	flexDirection: 'row',
	justifyContent: 'center',
  },
  badge: {
	borderRadius: 20,
	margin: 5,
  },
  badgeText: {
	fontSize: 14,
	fontWeight: 'bold',
  },
  green: {
	color: '#3a7247',
  },
  red: {
	color: '#e74c3c',
  },
  gray: {
	color: '#a3a3a3',
  },
  salesPitch: {
	fontSize: 15,
	textAlign: 'center',
	marginVertical: 15,
	paddingHorizontal: 10,
  },
  cardBox: {
	backgroundColor: '#fff',
	borderRadius: 10,
	borderWidth: 0,
	padding: 30,
	marginVertical: 10,
	flex: 1,
	justifyContent: 'center',
	width: '100%',
	shadowColor: 'rgba(68, 88, 144, 1)',
	shadowOffset: {
		width: 0,
		height: 10,
	},
	shadowOpacity: 0.4,
	shadowRadius: 20,
	elevation: 10,
  },
  specialCard: {
	borderWidth: 2,
	borderColor: '#3a7247',
  },
  bestValueBadge: {
	position: 'absolute',
	top: 10,
	right: 10,
	padding: 5,
	borderRadius: 5,
	fontSize: 12,
	fontWeight: 'bold',
	color: '#3a7247',
  },
  pricingH3: {
	fontSize: 25,
	fontWeight: 'bold',
	textAlign: 'center',
	color: '#3a7247',
  },
  pricingH4: {
	fontSize: 24,
	fontWeight: 'bold',
	textAlign: 'center',
	color: '#3a7247',
	marginTop: 20,
	marginBottom: 5
  },
  duration: {
	fontSize: 20,
	fontWeight: 'bold',
	color: '#444444'
  },
  planDuration: { 
	marginTop: 20,
	fontSize: 16, 
	fontWeight: 'bold', 
	color: '#444444', 
	textAlign: 'center' 
},
  featuresList: {
	padding: 15,
	flex: 1,
	textAlign: 'left', 
	justifyContent: 'center',
	alignItems: 'left',
  },
  pricingLi: {
	fontSize: 16,
	marginVertical: 10,
	flexDirection: 'row',
	alignItems: 'center'
  },
  icon: {
	fontSize: 14,
	color: '#3a7247',
	fontWeight: 'bold',
  },
  greenButton: {
	backgroundColor: '#3a7247',
	marginTop: 20,
	borderRadius: 5,
	paddingVertical: 15,
	alignItems: 'center',
	justifyContent: 'center',
  },
  subscribedButton: {
	marginTop: 20,
	backgroundColor: '#aaa',
	borderRadius: 5,
	paddingVertical: 15,
	alignItems: 'center',
  },
  buttonText: {
	color: '#fff',
	fontSize: 16,
	fontWeight: 'bold',
  },
  faqTitle: {
	fontSize: 20,
	fontWeight: 'bold',
	marginVertical: 20,
	textAlign: 'center',
  },
  faqItem: {
	marginBottom: 0,
	padding: 10,
	alignSelf: 'stretch',
  },
  question: {
	fontSize: 16,
	fontWeight: 'bold',
	marginBottom: 5,
	textAlign: 'left',
  },
  answer: {
	fontSize: 16,
	color: '#333',
	textAlign: 'left',
  },
  linkContainer: { 
	marginTop: 5,
	marginBottom: 10
},
  linkText: { 
	textAlign: 'center', 
	fontSize: 11, 
	color: '#000000' 
},
  link: { 
	color: '#3a7247',
	textDecorationLine: 'underline'
},
  underline: {
	textDecorationLine: 'underline',
	fontWeight: 'bold',
  },
  mb40: {
	marginBottom: 40,
  },
  processingTransactionOverlay: {
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: 'rgba(0, 0, 0, 0.7)',
	justifyContent: 'center',
	alignItems: 'center',
	zIndex: 1000,
  },
  processingTransactionTextMain: {
	color: '#ffffff',
	fontSize: 16,
	textAlign: 'center',
	marginTop: 10,
	marginBottom: 5,
  },
  processingTransactionTextSub: {
	color: '#ffffff',
	fontSize: 16,
	textAlign: 'center',
  },
  finePrintContainer: { 
	marginTop: 5,
	marginBottom: 10
},
  finePrintText: { 
	textAlign: 'center', 
	fontSize: 11, 
	color: '#000000' 
},
loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
},
loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3a7247',
    textAlign: 'center',
},
});

export default Pricing;