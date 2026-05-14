import React, { useRef, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { X, Minus, Plus, Percent, ShoppingBag } from "lucide-react-native";
import CachedImage from "../ResuableComponents/CachedImage";
import { isVegProduct } from "../../utils/productClassification";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const ProductImageModal = ({
  visible,
  product,
  imageSource,      // ← resolved cloudinary source passed from ProductCard
  cartItem,
  hasCustomizations,
  onClose,
  onAddToCart,
  onUpdateQuantity,
  isAdding,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.85)).current;
  const contentTranslate = useRef(new Animated.Value(50)).current;

  const isVeg = product ? isVegProduct(product) : false;
  const basePrice = product?.base_price ?? product?.basePrice ?? 0;
  const mrp = product?.mrp ?? basePrice;
  const hasDiscount = mrp > basePrice;
  const discountPercent = hasDiscount ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
          delay: 100,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          delay: 150,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity, imageScale, contentTranslate]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [slideAnim, backdropOpacity, imageScale, onClose]);

  // Swipe-down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          slideAnim.setValue(g.dy);
          backdropOpacity.setValue(Math.max(0, 1 - g.dy / 400));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          animateClose();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
            Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  if (!product) return null;

  // Use cloudinary-resolved source from prop; fallback to placeholder
  const resolvedSource = imageSource || { uri: PLACEHOLDER_IMAGE };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={animateClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={animateClose} />
        </Animated.View>

        {/* Slide-up panel */}
        <Animated.View
          style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={animateClose} activeOpacity={0.8}>
            <X size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Image — full width */}
            <Animated.View style={[styles.heroImageContainer, { transform: [{ scale: imageScale }] }]}>
              <CachedImage
                source={resolvedSource}
                style={styles.heroImage}
                contentFit="cover"
                onError={(e) => console.log("[ImageError][ProductImageModal]", product?.name, e?.nativeEvent?.error)}
              />
              <View style={styles.heroGradient} />

              {/* Discount badge top-left on image */}
              {hasDiscount && (
                <View style={styles.imageDiscountBadge}>
                  <Percent size={12} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.imageDiscountText}>{discountPercent}% OFF</Text>
                </View>
              )}

              {/* Veg/Non-veg square indicator at bottom-left of hero image */}
              <View style={[
                styles.vegSquareOnImage,
                { borderColor: isVeg ? '#22C55E' : '#EF4444' }
              ]}>
                <View style={[styles.vegSquareDot, { backgroundColor: isVeg ? '#22C55E' : '#EF4444' }]} />
              </View>
            </Animated.View>

            {/* Content */}
            <Animated.View style={[styles.contentSection, { transform: [{ translateY: contentTranslate }] }]}>
              {/* Veg indicator + Name */}
              <View style={styles.nameRow}>
                <View style={[styles.vegIndicator, { borderColor: isVeg ? '#22C55E' : '#EF4444' }]}>
                  <View style={[styles.vegDot, { backgroundColor: isVeg ? '#22C55E' : '#EF4444' }]} />
                </View>
                <Text style={styles.productName}>{product.name}</Text>
              </View>

              {/* Premium Pricing Block */}
              <View style={styles.pricingBlock}>
                <View style={styles.priceRow}>
                  <Text style={styles.heroPrice}>₹{basePrice}</Text>
                  {hasDiscount && (
                    <Text style={styles.heroMrp}>₹{mrp}</Text>
                  )}
                </View>
                {hasDiscount && (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsText}>
                      You save ₹{(mrp - basePrice).toFixed(0)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Dynamic Offer — compact pill instead of heavy card */}
              {hasDiscount && discountPercent >= 5 && (
                <View style={styles.offerPill}>
                  <Text style={styles.offerPillText}>
                    {discountPercent >= 20
                      ? `🔥 Super Deal · Save ₹${(mrp - basePrice).toFixed(0)}`
                      : discountPercent >= 10
                      ? `⭐ Great Deal · Save ₹${(mrp - basePrice).toFixed(0)}`
                      : `💰 Smart Saver · Save ₹${(mrp - basePrice).toFixed(0)}`}
                  </Text>
                </View>
              )}

              {/* Unit */}
              <View style={styles.unitContainer}>
                <Text style={styles.unitLabel}>Net Weight</Text>
                <Text style={styles.unitValue}>{product.unit}</Text>
              </View>

              {/* Description */}
              {product.description ? (
                <View style={styles.descSection}>
                  <Text style={styles.descLabel}>About this item</Text>
                  <Text style={styles.descText}>{product.description}</Text>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomPrice}>₹{basePrice}</Text>
              {hasDiscount && (
                <Text style={styles.bottomMrp}>₹{mrp}</Text>
              )}
            </View>

            {cartItem && !hasCustomizations ? (
              <View style={styles.bottomStepper}>
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(cartItem.quantity - 1)}
                  style={styles.bottomStepperBtn}
                  disabled={isAdding}
                >
                  <Minus size={16} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
                {isAdding ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.bottomStepperQty} />
                ) : (
                  <Text style={styles.bottomStepperQtyText}>{cartItem.quantity}</Text>
                )}
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(cartItem.quantity + 1)}
                  style={styles.bottomStepperBtn}
                  disabled={isAdding}
                >
                  <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onAddToCart}
                style={styles.bottomAddBtn}
                activeOpacity={0.85}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <ShoppingBag size={18} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.bottomAddText}>Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 20, 0.75)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.92,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    // Simulated gradient with opacity layers
  },
  imageDiscountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    // Glass effect
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  imageDiscountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  vegIndicator: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  vegDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  productName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  pricingBlock: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  heroPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -1,
  },
  heroMrp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  savingsPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.2,
  },
  // Compact offer pill (replaces heavy offerCard)
  offerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  offerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  // Veg/Non-veg square indicator on image corner
  vegSquareOnImage: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegSquareDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  descSection: {
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    // Subtle top shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomPriceCol: {
    flexDirection: 'column',
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  bottomMrp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  bottomStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E23744',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomStepperBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bottomStepperQty: {
    width: 36,
  },
  bottomStepperQtyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 28,
  },
  bottomAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E23744',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomAddText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default React.memo(ProductImageModal);
