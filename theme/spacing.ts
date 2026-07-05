export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  hero: 48,
  section: 32,
  screen: 20,
  screenWide: 28,
  tabBar: 16,
} as const;

export const getScreenPadding = (width: number) =>
  width >= 768 ? spacing.screenWide : spacing.screen;

export const getContentMaxWidth = (width: number) => {
  if (width >= 1024) {
    return 760;
  }

  if (width >= 768) {
    return 680;
  }

  return width;
};
