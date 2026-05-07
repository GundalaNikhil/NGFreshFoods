import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Leaf,
  ShieldCheck,
  Heart,
  Wheat,
  Bird,
  Egg,
  Globe,
  CheckCircle,
  Feather,
  Sprout,
  Tractor,
  Quote,
  Award,
  Target,
  Sparkles,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Animated Section Wrapper ──
const FadeInSection = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}
    >
      {children}
    </Animated.View>
  );
};

// ── Section Title ──
const SectionTitle = ({ title, light = false }) => (
  <View className="items-center mb-6">
    <Text
      className={`text-2xl font-black tracking-tight ${
        light ? "text-white" : "text-[#184A2C]"
      }`}
    >
      {title}
    </Text>
    <View
      className="mt-2 rounded-full"
      style={{
        width: 50,
        height: 3,
        backgroundColor: light ? "#A7F3D0" : "#2E7D32",
      }}
    />
  </View>
);

// ── Hero Section ──
const HeroSection = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const heroIcons = [
    { icon: Leaf, label: "Eco-Friendly" },
    { icon: Sprout, label: "100% Organic" },
    { icon: Tractor, label: "Farm to Table" },
  ];

  return (
    <View className="overflow-hidden" style={{ height: 420 }}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          transform: [{ scale: scaleAnim }],
        }}
      >
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1734358890/392e6e26-5b47-4620-93c9-690b118246a2_zddnx9.jpg",
          }}
          className="w-full h-full"
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)"]}
            className="flex-1 justify-end p-6 pb-8"
          >
            <FadeInSection>
              <Text className="text-white text-[32px] font-black leading-tight mb-2 tracking-tight">
                Nature's Finest
              </Text>
              <Text className="text-emerald-100 text-[22px] font-bold leading-tight mb-3">
                Organic Farm Harvest
              </Text>
              <Text className="text-emerald-50/90 text-sm font-medium leading-relaxed mb-1">
                Nurturing Life, Naturally Since December 2024
              </Text>
              <Text className="text-emerald-100 text-base font-semibold leading-relaxed mb-6">
                Bringing Freshness and Sustainability to Every Bite
              </Text>
            </FadeInSection>

            <FadeInSection delay={400}>
              <View className="flex-row justify-between">
                {heroIcons.map(({ icon: IconCmp, label }) => (
                  <View
                    key={label}
                    className="items-center bg-white/15 rounded-2xl px-4 py-3"
                    style={{ width: (SCREEN_WIDTH - 64) / 3 }}
                  >
                    <IconCmp size={26} color="#A7F3D0" strokeWidth={2} />
                    <Text className="text-emerald-100 text-[11px] font-bold mt-2 text-center">
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </FadeInSection>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

// ── Mission Section ──
const MissionSection = () => {
  const missionPillars = [
    {
      icon: Target,
      title: "Eliminate Harmful\nPractices",
      desc: "Removing chemical-laden and unethical meat production methods.",
    },
    {
      icon: Heart,
      title: "Promote\nHealth",
      desc: "Providing nutrient-rich, organic food that supports holistic wellness.",
    },
    {
      icon: Globe,
      title: "Sustainable\nFuture",
      desc: "Creating an environmentally responsible food ecosystem.",
    },
  ];

  return (
    <View className="px-5 py-8 bg-white">
      <FadeInSection>
        <SectionTitle title="Our Mission" />
        <Text className="text-[#3C6E47] text-center text-sm leading-relaxed mb-6 px-2">
          We are committed to eliminating harmful meat production, promoting
          sustainable agriculture, and providing nutritious, ethically-produced
          food that nourishes both people and the planet.
        </Text>
      </FadeInSection>

      <FadeInSection delay={200}>
        <View className="flex-row justify-between">
          {missionPillars.map(({ icon: IconCmp, title, desc }, i) => (
            <View
              key={i}
              className="bg-[#F0FFF4] rounded-2xl p-4 items-center"
              style={{
                width: (SCREEN_WIDTH - 56) / 3,
                shadowColor: "#2E7D32",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="w-11 h-11 rounded-full bg-[#E8F5E9] items-center justify-center mb-3">
                <IconCmp size={20} color="#2E7D32" strokeWidth={2} />
              </View>
              <Text className="text-[12px] font-bold text-[#184A2C] text-center mb-1">
                {title}
              </Text>
              <Text className="text-[10px] text-[#4A6C59] text-center leading-4">
                {desc}
              </Text>
            </View>
          ))}
        </View>
      </FadeInSection>
    </View>
  );
};

// ── Journey Roadmap ──
const JourneyRoadmap = () => {
  const steps = [
    {
      icon: Wheat,
      title: "Seeds of Vision",
      desc: "Our journey began with a simple dream: to provide 100% organic, chemical-free food.",
      color: "#2E7D32",
    },
    {
      icon: Bird,
      title: "Nurturing Environment",
      desc: "We created spacious, natural habitats where chickens roam freely and live stress-free.",
      color: "#388E3C",
    },
    {
      icon: Egg,
      title: "Natural Nutrition",
      desc: "Our chickens are fed organic grains, seeds, and are allowed to forage naturally.",
      color: "#1B5E20",
    },
    {
      icon: Feather,
      title: "Compassionate Care",
      desc: "Our dedicated farmers ensure each chicken receives individual attention and care.",
      color: "#2E7D32",
    },
  ];

  return (
    <View className="bg-[#F9FAFB] px-5 py-8">
      <FadeInSection>
        <SectionTitle title="Our Journey Roadmap" />
      </FadeInSection>

      {/* Roadmap Image */}
      <FadeInSection delay={100}>
        <View
          className="rounded-2xl overflow-hidden mb-8"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Image
            source={{
              uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1734299603/DALL_E_2024-12-16_01.39.16_-_A_beautifully_designed_poster_for_Fresh_Farm_Foods__Our_Journey_to_Freshness_showcasing_a_vibrant_roadmap_from_seed_to_table._The_design_includes_an_k21a0w.webp",
            }}
            style={{ width: "100%", height: 200 }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </FadeInSection>

      {/* Timeline */}
      <View className="pl-6 ml-2">
        {steps.map(({ icon: IconCmp, title, desc, color }, index) => (
          <FadeInSection key={title} delay={200 + index * 150}>
            <View className="flex-row mb-8">
              {/* Timeline line + dot */}
              <View className="items-center mr-5" style={{ width: 44 }}>
                <View
                  className="w-11 h-11 rounded-full items-center justify-center border-4 border-white"
                  style={{
                    backgroundColor: "#E8F5E9",
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <IconCmp size={20} color={color} strokeWidth={2} />
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={{
                      width: 2.5,
                      flex: 1,
                      backgroundColor: "#C8E6C9",
                      marginTop: 4,
                      borderRadius: 2,
                    }}
                  />
                )}
              </View>

              {/* Content */}
              <View className="flex-1 pt-1">
                <Text className="text-lg font-bold text-[#184A2C] mb-1">
                  {title}
                </Text>
                <Text className="text-sm text-[#3C6E47] leading-relaxed">
                  {desc}
                </Text>
              </View>
            </View>
          </FadeInSection>
        ))}
      </View>
    </View>
  );
};

// ── Our Promise ──
const OurPromiseSection = () => {
  const promiseItems = [
    {
      icon: Leaf,
      title: "Pure & Organic",
      desc: "100% chemical-free, naturally grown produce that nourishes your body and respects the earth.",
    },
    {
      icon: ShieldCheck,
      title: "Animal Welfare",
      desc: "Ethical, stress-free environments for our chickens, ensuring their well-being.",
    },
    {
      icon: Globe,
      title: "Sustainable Future",
      desc: "Regenerative farming practices that protect and restore our planet's ecosystem.",
    },
    {
      icon: CheckCircle,
      title: "High Quality",
      desc: "Rigorous quality control and transparency in every step of production.",
    },
  ];

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/c_fill,w_1000,h_1260/v1734299729/eggs_fsblgl.jpg",
      }}
      className="overflow-hidden"
      resizeMode="cover"
    >
      <View className="bg-black/60 px-5 py-10">
        <FadeInSection>
          <SectionTitle title="Our Promise to You" light />
          <Text className="text-white/80 text-center text-sm leading-relaxed mb-8 px-2">
            At Fresh Farm Foods, we are more than just a food producer. We are
            guardians of health, champions of sustainable agriculture.
          </Text>
        </FadeInSection>

        <View className="flex-row flex-wrap justify-between">
          {promiseItems.map(({ icon: IconCmp, title, desc }, i) => (
            <FadeInSection key={title} delay={i * 100}>
              <View
                className="bg-white/15 rounded-2xl p-5 mb-4"
                style={{
                  width: (SCREEN_WIDTH - 52) / 2,
                  borderWidth: 1,
                  borderColor: "rgba(167,243,208,0.15)",
                }}
              >
                <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center mb-3">
                  <IconCmp size={24} color="#A7F3D0" strokeWidth={2} />
                </View>
                <Text className="text-base font-bold text-white mb-1">
                  {title}
                </Text>
                <Text className="text-xs text-green-100/80 leading-5">
                  {desc}
                </Text>
              </View>
            </FadeInSection>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

// ── Founders Section ──
const FoundersSection = () => {
  const founders = [
    {
      name: "G.Ch. Lingaiah",
      role: "Founder & Chief Farmer",
      bio: "A visionary agricultural expert with 15 years of sustainable farming experience, transforming traditional agricultural practices through organic innovation.",
      quote:
        "True agriculture is not just about growing food, but nurturing life itself. Every seed we plant is a promise to the earth and to humanity.",
      achievements: [
        "Pioneered organic farming techniques",
        "Implemented sustainable agricultural practices",
        "Advocate for chemical-free food production",
      ],
      image:
        "https://res.cloudinary.com/djv3mrzk2/image/upload/v1704987541/blank-profile-picture-973460_1280_ymnd0n.png",
    },
    {
      name: "G. Janaki",
      role: "Head of Chicken Care & Sustainability",
      bio: "A compassionate agricultural leader dedicated to ethical animal welfare and holistic organic farming approaches.",
      quote:
        "Compassion is the secret ingredient in every organic product. When animals are treated with respect, the entire ecosystem thrives.",
      achievements: [
        "Developed humane chicken raising standards",
        "Expert in organic animal nutrition",
        "Environmental sustainability researcher",
      ],
      image:
        "https://res.cloudinary.com/djv3mrzk2/image/upload/v1704987541/blank-profile-picture-973460_1280_ymnd0n.png",
    },
  ];

  return (
    <View className="px-5 py-8 bg-white">
      <FadeInSection>
        <SectionTitle title="Meet Our Family" />
      </FadeInSection>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        snapToInterval={SCREEN_WIDTH - 60}
        decelerationRate="fast"
      >
        {founders.map((founder, index) => (
          <FadeInSection key={founder.name} delay={index * 200}>
            <View
              className="bg-[#FAFDF7] border border-gray-100 rounded-3xl p-6 mr-4 items-center"
              style={{
                width: SCREEN_WIDTH - 60,
                shadowColor: "#2E7D32",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {/* Avatar */}
              <View
                className="rounded-full mb-4"
                style={{
                  borderWidth: 4,
                  borderColor: "#2E7D32",
                  shadowColor: "#2E7D32",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Image
                  source={{ uri: founder.image }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                  transition={200}
                />
              </View>

              <Text className="text-xl font-black text-[#184A2C] mb-0.5">
                {founder.name}
              </Text>
              <Text className="text-sm font-semibold text-[#3C6E47] mb-3">
                {founder.role}
              </Text>
              <Text className="text-xs text-[#6A8C69] text-center leading-5 mb-4 px-2">
                {founder.bio}
              </Text>

              {/* Quote */}
              <View className="bg-[#E8F5E9] p-4 rounded-xl w-full mb-4">
                <View className="flex-row">
                  <Quote
                    size={16}
                    color="#2E7D32"
                    style={{ opacity: 0.4, marginRight: 6, marginTop: 2 }}
                  />
                  <Text className="flex-1 text-xs italic text-[#2E7D32] leading-5">
                    "{founder.quote}"
                  </Text>
                </View>
              </View>

              {/* Achievements */}
              <View className="w-full">
                <Text className="text-xs font-bold text-[#184A2C] mb-2">
                  Key Contributions
                </Text>
                {founder.achievements.map((item, idx) => (
                  <View key={idx} className="flex-row items-center mb-1.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mr-2" />
                    <Text className="text-[11px] text-[#4A6C59]">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeInSection>
        ))}
      </ScrollView>
    </View>
  );
};

// ── Main About Page ──
const AboutPage = ({ onBack }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Sticky Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white/95 z-10"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.05)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#1C1C1C" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#1C1C1C] ml-4 tracking-tight">
          About Us
        </Text>
        <View className="flex-1" />
        <View className="w-8 h-8 rounded-full bg-[#E8F5E9] items-center justify-center">
          <Sparkles size={16} color="#2E7D32" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <HeroSection />
        <MissionSection />
        <JourneyRoadmap />
        <OurPromiseSection />
        <FoundersSection />

        {/* Footer tagline */}
        <FadeInSection delay={100}>
          <View className="px-6 py-10 items-center bg-[#F0FFF4]">
            <View className="w-14 h-14 rounded-full bg-[#E8F5E9] items-center justify-center mb-4">
              <Award size={28} color="#2E7D32" strokeWidth={2} />
            </View>
            <Text className="text-lg font-black text-[#184A2C] text-center mb-2">
              Fresh Farm Foods
            </Text>
            <Text className="text-xs text-[#3C6E47] text-center leading-5 px-8">
              Nurturing life, naturally. From our family farm to your family
              table — with love, care, and sustainability.
            </Text>
          </View>
        </FadeInSection>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutPage;
