import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { BottomTabBar } from "../../components/ui/bottom-tab-bar";
import { colors } from "../../theme";

const renderIcon = (name: keyof typeof Ionicons.glyphMap) => {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <Ionicons color={color} name={name} size={size} />
  );

  TabIcon.displayName = `${name}TabIcon`;
  return TabIcon;
};

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        animation: "fade",
        freezeOnBlur: true,
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 220,
          },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: renderIcon("home-outline"),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t("tabs.trips"),
          tabBarIcon: renderIcon("briefcase-outline"),
        }}
      />
      <Tabs.Screen
        name="heia"
        options={{
          title: t("tabs.heia"),
          tabBarIcon: renderIcon("sparkles-outline"),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: t("tabs.offers"),
          tabBarIcon: renderIcon("pricetags-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: renderIcon("person-circle-outline"),
        }}
      />
    </Tabs>
  );
}
