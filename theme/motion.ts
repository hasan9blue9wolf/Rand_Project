import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

const getDelay = (index: number, step: number, max: number) =>
  Math.min(Math.max(index, 0) * step, max);

export const subtleLayoutTransition = LinearTransition.springify()
  .damping(22)
  .stiffness(220)
  .mass(0.82)
  .reduceMotion(ReduceMotion.System);

export const getCardEntering = (index = 0) =>
  FadeInUp.duration(320)
    .delay(getDelay(index, 42, 180))
    .reduceMotion(ReduceMotion.System);

export const getChatMessageEntering = (index = 0) =>
  FadeInDown.duration(240)
    .delay(getDelay(index, 24, 120))
    .reduceMotion(ReduceMotion.System);

export const getRecommendationEntering = (index = 0) =>
  FadeIn.duration(320)
    .delay(getDelay(index, 36, 160))
    .reduceMotion(ReduceMotion.System);
