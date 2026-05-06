import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from "react-native";
import { ChevronLeft, Leaf, ShieldCheck, Heart, Wheat, Bird, Egg, Globe, CheckCircle } from "lucide-react-native";

const AboutPage = ({ onBack }) => {

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100 bg-white z-10 shadow-sm">
        <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
        >
          <ChevronLeft size={24} color="#1C1C1C" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1C1C1C] ml-4">About Us</Text>
      </View>

      <ScrollView className="flex-1 bg-[#F9FAFB]" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-5 py-8 bg-white mb-4 shadow-sm">
          <Text className="text-3xl font-black text-[#184A2C] mb-4 tracking-tight">
            Fresh From Farm To Your Fork
          </Text>
          <Text className="text-base text-[#3C6E47] leading-relaxed mb-6 font-medium">
            We are committed to eliminating harmful meat production, promoting sustainable agriculture, and providing nutritious, ethically-produced food that nourishes both people and the planet.
          </Text>
          <Image 
            source={{ uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1734358888/b1f21d55-bb10-4a2c-8a9a-8431f533e66e_llbfpz.jpg" }}
            className="w-full h-48 rounded-2xl bg-gray-200"
            resizeMode="cover"
          />
        </View>

        {/* Our Promise */}
        <View className="px-5 py-8 bg-[#184A2C] mb-4">
          <Text className="text-2xl font-bold text-white mb-8 text-center">Our Promise to You</Text>
          
          <View className="grid grid-cols-2 gap-4 flex-row flex-wrap justify-between">
            {/* Promise 1 */}
            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
              <Leaf size={28} color="#A7F3D0" className="mb-3" />
              <Text className="text-base font-bold text-white mb-2">Pure & Organic</Text>
              <Text className="text-xs text-green-100 leading-relaxed">100% chemical-free, naturally grown produce.</Text>
            </View>

            {/* Promise 2 */}
            <View className="w-[48%] bg-white/10 rounded-2xl p-4 mb-4">
              <ShieldCheck size={28} color="#A7F3D0" className="mb-3" />
              <Text className="text-base font-bold text-white mb-2">Animal Welfare</Text>
              <Text className="text-xs text-green-100 leading-relaxed">Ethical, stress-free environments for our poultry.</Text>
            </View>

            {/* Promise 3 */}
            <View className="w-[48%] bg-white/10 rounded-2xl p-4">
              <Globe size={28} color="#A7F3D0" className="mb-3" />
              <Text className="text-base font-bold text-white mb-2">Sustainable</Text>
              <Text className="text-xs text-green-100 leading-relaxed">Regenerative farming practices that protect ecosystems.</Text>
            </View>

            {/* Promise 4 */}
            <View className="w-[48%] bg-white/10 rounded-2xl p-4">
              <CheckCircle size={28} color="#A7F3D0" className="mb-3" />
              <Text className="text-base font-bold text-white mb-2">High Quality</Text>
              <Text className="text-xs text-green-100 leading-relaxed">Rigorous control and transparency in every step.</Text>
            </View>
          </View>
        </View>

        {/* Journey Roadmap */}
        <View className="px-5 py-8 bg-white mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-[#184A2C] mb-8 text-center">Our Journey Roadmap</Text>
          
          {/* Timeline Wrapper */}
          <View className="pl-4 border-l-2 border-[#2E7D32] ml-4">
            {/* Step 1 */}
            <View className="relative mb-8 pl-6">
              <View className="absolute -left-11 top-0 w-12 h-12 bg-[#E8F5E9] rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Wheat size={20} color="#2E7D32" />
              </View>
              <Text className="text-lg font-bold text-[#184A2C] mb-1">Seeds of Vision</Text>
              <Text className="text-sm text-[#3C6E47] leading-relaxed">Our journey began with a simple dream: to provide 100% organic, chemical-free food.</Text>
            </View>

            {/* Step 2 */}
            <View className="relative mb-8 pl-6">
              <View className="absolute -left-11 top-0 w-12 h-12 bg-[#E8F5E9] rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Bird size={20} color="#2E7D32" />
              </View>
              <Text className="text-lg font-bold text-[#184A2C] mb-1">Nurturing Environment</Text>
              <Text className="text-sm text-[#3C6E47] leading-relaxed">We created spacious, natural habitats where chickens roam freely and live stress-free.</Text>
            </View>

            {/* Step 3 */}
            <View className="relative mb-8 pl-6">
              <View className="absolute -left-11 top-0 w-12 h-12 bg-[#E8F5E9] rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Egg size={20} color="#2E7D32" />
              </View>
              <Text className="text-lg font-bold text-[#184A2C] mb-1">Natural Nutrition</Text>
              <Text className="text-sm text-[#3C6E47] leading-relaxed">Our chickens are fed organic grains, seeds, and are allowed to forage naturally.</Text>
            </View>

            {/* Step 4 */}
            <View className="relative pl-6">
              <View className="absolute -left-11 top-0 w-12 h-12 bg-[#E8F5E9] rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Heart size={20} color="#2E7D32" />
              </View>
              <Text className="text-lg font-bold text-[#184A2C] mb-1">Compassionate Care</Text>
              <Text className="text-sm text-[#3C6E47] leading-relaxed">Our dedicated farmers ensure each chicken receives individual attention and care.</Text>
            </View>
          </View>
        </View>

        {/* Founders */}
        <View className="px-5 py-8 bg-white pb-12 shadow-sm">
          <Text className="text-2xl font-bold text-[#184A2C] mb-8 text-center">Meet Our Family</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {/* Founder 1 */}
            <View className="bg-[#F9FAFB] border border-gray-100 rounded-3xl p-6 mr-4 w-72 items-center">
              <Image 
                source={{ uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1704987541/blank-profile-picture-973460_1280_ymnd0n.png" }}
                className="w-24 h-24 rounded-full mb-4 border-4 border-[#2E7D32]"
              />
              <Text className="text-xl font-bold text-[#184A2C]">G.Ch. Lingaiah</Text>
              <Text className="text-sm font-medium text-[#3C6E47] mb-4 text-center">Founder & Chief Farmer</Text>
              <View className="bg-[#E8F5E9] p-3 rounded-xl">
                <Text className="text-center text-xs italic text-[#2E7D32] leading-relaxed">
                  "True agriculture is not just about growing food, but nurturing life itself. Every seed we plant is a promise to the earth and to humanity."
                </Text>
              </View>
            </View>

            {/* Founder 2 */}
            <View className="bg-[#F9FAFB] border border-gray-100 rounded-3xl p-6 mr-4 w-72 items-center">
              <Image 
                source={{ uri: "https://res.cloudinary.com/djv3mrzk2/image/upload/v1704987541/blank-profile-picture-973460_1280_ymnd0n.png" }}
                className="w-24 h-24 rounded-full mb-4 border-4 border-[#2E7D32]"
              />
              <Text className="text-xl font-bold text-[#184A2C]">G. Janaki</Text>
              <Text className="text-sm font-medium text-[#3C6E47] mb-4 text-center">Head of Sustainability</Text>
              <View className="bg-[#E8F5E9] p-3 rounded-xl">
                <Text className="text-center text-xs italic text-[#2E7D32] leading-relaxed">
                  "Compassion is the secret ingredient in every organic product. When animals are treated with respect, the entire ecosystem thrives."
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutPage;
