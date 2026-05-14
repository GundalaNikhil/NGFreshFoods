import { Minus, Plus, Percent } from "lucide-react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import CachedImage from "../ResuableComponents/CachedImage";
import { isVegProduct } from "../../utils/productClassification";
import ChickenCustomizationModal from "./ChickenCustomizationModal";
import ProductImageModal from "./ProductImageModal";
import { getCachedImageSource } from "../../utils/imageCache";

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Larger image: 40% of screen width
const IMAGE_SIZE = SCREEN_WIDTH * 0.40;

const ProductCard = ({ product, cartItem, addToCart, updateQuantity, onAddToCart }) => {
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isVeg = isVegProduct(product);

  // Stock awareness
  const stockQty = product.stockQuantity ?? product.stock_quantity ?? 999;
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  const hasCustomizations =
    (product.variants && product.variants.length > 0) ||
    (product.addons && product.addons.length > 0);

  // Pricing
  const basePrice = product.base_price ?? product.basePrice ?? 0;
  const mrp = product.mrp ?? basePrice;
  const hasDiscount = mrp > basePrice;
  const discountPercent = hasDiscount ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;
  const savedAmount = hasDiscount ? (mrp - basePrice).toFixed(0) : 0;

  // Offer label — compact, embedded into price row
  const offerLabel =
    discountPercent >= 20 ? '🔥 Super Deal' :
    discountPercent >= 10 ? '⭐ Great Deal' :
    discountPercent >= 5  ? '💰 Save ₹' + savedAmount : null;

  // Resolve image from cloudinary_urls.json first, fallback to DB url
  const imageSource = getCachedImageSource(product, PLACEHOLDER_IMAGE);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLowStock) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLowStock, pulseAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(cardScale, { toValue: 0.985, useNativeDriver: true, friction: 8 }).start();
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }, [cardScale]);

  const handleAddToCartClick = () => {
    if (hasCustomizations) {
      setQuantityModalVisible(true);
    } else {
      setIsAdding(true);
      if (addToCart) {
        addToCart(product, null, []);
      } else if (onAddToCart) {
        onAddToCart(product);
      }
      globalThis.setTimeout(() => setIsAdding(false), 150);
    }
  };

  const handleUpdateQuantity = (newQty) => {
    if (!cartItem) return;
    setIsAdding(true);
    updateQuantity(cartItem.cartKey, newQty);
    globalThis.setTimeout(() => setIsAdding(false), 120);
  };

  const handleCustomizedAddToCart = (prod, selectedVariant, selectedAddons) => {
    addToCart(prod, selectedVariant, selectedAddons);
    setQuantityModalVisible(false);
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isOutOfStock && styles.cardDisabled]}
      >
        <View style={styles.contentRow}>
          {/* ── Left Info ── */}
          <View style={styles.infoSection}>

            {/* Status badges (low stock / out of stock) — no veg indicator here anymore */}
            {(isLowStock || isOutOfStock) && (
              <View style={styles.badgeRow}>
                {isLowStock && (
                  <Animated.View style={[styles.urgencyBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <Text style={styles.urgencyText}>🔥 Only {stockQty} left!</Text>
                  </Animated.View>
                )}
                {isOutOfStock && (
                  <View style={styles.oosContainer}>
                    <Text style={styles.oosText}>Sold out</Text>
                  </View>
                )}
              </View>
            )}

            {/* Product Name */}
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>

            {/* ── Pricing row: price + MRP + compact offer pill ── */}
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₹{basePrice}</Text>
              {hasDiscount && (
                <>
                  <Text style={styles.mrpPrice}>₹{mrp}</Text>
                  <View style={styles.discountBadge}>
                    <Percent size={9} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.discountText}>{discountPercent}%</Text>
                  </View>
                </>
              )}
            </View>

            {/* Compact offer pill embedded under price — single line, no banner */}
            {offerLabel && (
              <View style={styles.offerPill}>
                <Text style={styles.offerPillText}>{offerLabel}</Text>
              </View>
            )}

            {/* Unit */}
            <Text style={styles.unitText}>{product.unit}</Text>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>

            {/* ADD / Stepper button — below description */}
            <View style={styles.addButtonContainer}>
              {cartItem && !hasCustomizations ? (
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(cartItem.quantity - 1)}
                    style={styles.stepperBtn}
                    disabled={isAdding}
                  >
                    <Minus size={13} color="#E23744" strokeWidth={3} />
                  </TouchableOpacity>

                  {isAdding ? (
                    <ActivityIndicator size="small" color="#E23744" />
                  ) : (
                    <Text style={styles.stepperQty}>{cartItem.quantity}</Text>
                  )}

                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(cartItem.quantity + 1)}
                    style={styles.stepperBtn}
                    disabled={isAdding}
                  >
                    <Plus size={13} color="#E23744" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={isOutOfStock ? null : handleAddToCartClick}
                  style={styles.addBtn}
                  activeOpacity={0.8}
                  disabled={isAdding || isOutOfStock}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#E23744" />
                  ) : (
                    <View style={styles.addBtnInner}>
                      <Text style={styles.addBtnText}>ADD</Text>
                      <Text style={styles.addBtnPlus}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* "Customizable" — sits directly under the ADD button */}
            {/* {hasCustomizations && (
              <Text style={styles.customizableLabel}>Customizable</Text>
            )} */}
          </View>

          {/* ── Right Image Section ── */}
          <View style={styles.imageSection}>
            {/* Image — tappable, fills a fixed square */}
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.92}
              style={styles.imageWrapper}
            >
              <CachedImage
                source={imageSource}
                fallbackUrl={PLACEHOLDER_IMAGE}
                style={styles.productImage}
                onError={(e) =>
                  console.log("[ImageError][ProductCard]", product?.name, e?.nativeEvent?.error)
                }
              />

              {/* Bottom-left corner: veg/non-veg square indicator on image */}
              <View style={[
                styles.vegSquareOnImage,
                { borderColor: isVeg ? '#22C55E' : '#EF4444' }
              ]}>
                <View style={[styles.vegSquareDot, { backgroundColor: isVeg ? '#22C55E' : '#EF4444' }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Customization Modal */}
      {hasCustomizations && (
        <ChickenCustomizationModal
          visible={quantityModalVisible}
          product={product}
          onClose={() => setQuantityModalVisible(false)}
          onAddToCart={handleCustomizedAddToCart}
        />
      )}

      {/* Image Slide-Up Modal */}
      <ProductImageModal
        visible={imageModalVisible}
        product={product}
        imageSource={imageSource}
        cartItem={cartItem}
        hasCustomizations={hasCustomizations}
        onClose={() => setImageModalVisible(false)}
        onAddToCart={handleAddToCartClick}
        onUpdateQuantity={handleUpdateQuantity}
        isAdding={isAdding}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
  },
  infoSection: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  urgencyBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.2,
  },
  oosContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  oosText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 21,
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  // ── Pricing ──
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.4,
  },
  mrpPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  // Compact single-line offer pill — replaces the big banner
  offerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  offerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 17,
  },
  // ── Image column ──
  imageSection: {
    alignItems: 'center',
    // Fixed width so the column never shifts regardless of content
    width: IMAGE_SIZE,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    position: 'relative',
  },
  productImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  // Veg/Non-veg square indicator pinned to bottom-left of image
  vegSquareOnImage: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegSquareDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // ADD button — below description, aligned left
  addButtonContainer: {
    marginTop: 10,
    width: 100,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E23744',
  },
  addBtn: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E23744',
    letterSpacing: 0.5,
  },
  addBtnPlus: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E23744',
    marginLeft: 2,
    marginBottom: 4,
  },
  // "Customizable" always sits below the button, never overlapping it
  customizableLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
});

export default React.memo(ProductCard);
