import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Easing } from "react-native";
import { PackageOpen, Egg, Bird } from "lucide-react-native";

const Loader = () => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const birdPosition = useRef(new Animated.Value(-100)).current;
  const birdOpacity = useRef(new Animated.Value(0)).current;
  const eggScale = useRef(new Animated.Value(0)).current;
  const eggDrop = useRef(new Animated.Value(-100)).current;
  const hatchScale = useRef(new Animated.Value(0)).current;
  const chickBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fade in backdrop
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 2. Hen (Bird) enters
    Animated.timing(birdPosition, {
      toValue: 0,
      duration: 1500,
      delay: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(birdOpacity, {
      toValue: 1,
      duration: 1500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // 3. Egg drops
    Animated.parallel([
      Animated.timing(eggScale, {
        toValue: 1,
        duration: 200,
        delay: 1500,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
      Animated.timing(eggDrop, {
        toValue: 0,
        duration: 300,
        delay: 1500,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Egg hatching
    Animated.timing(hatchScale, {
      toValue: 1.2,
      duration: 800,
      delay: 3500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 5. Chick bouncing loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(chickBounce, {
            toValue: -15,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(chickBounce, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 4500);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: containerOpacity }]}>
      <View style={styles.animationContainer}>
        {/* Hen entering */}
        <Animated.View
          style={[
            styles.absoluteItem,
            { bottom: 40, left: 20 },
            {
              opacity: birdOpacity,
              transform: [{ translateX: birdPosition }],
            },
          ]}
        >
          <Bird size={64} color="#D97706" />
        </Animated.View>

        {/* Egg dropping */}
        <Animated.View
          style={[
            styles.absoluteItem,
            { top: 80, alignSelf: "center" },
            {
              transform: [{ scale: eggScale }, { translateY: eggDrop }],
            },
          ]}
        >
          <Egg size={48} color="#FFFFFF" />
        </Animated.View>

        {/* Chick Hatching */}
        <Animated.View
          style={[
            styles.absoluteItem,
            { top: 120, alignSelf: "center" },
            { transform: [{ scale: hatchScale }] },
          ]}
        >
          <PackageOpen size={40} color="#EAB308" />
        </Animated.View>

        {/* Chick Bouncing */}
        <Animated.View
          style={[
            styles.absoluteItem,
            { top: 160, alignSelf: "center" },
            { transform: [{ translateY: chickBounce }] },
          ]}
        >
          <Bird size={48} color="#EAB308" />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 237, 213, 0.8)", // yellow-50 tint
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  animationContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteItem: {
    position: "absolute",
  },
});

export default Loader;
