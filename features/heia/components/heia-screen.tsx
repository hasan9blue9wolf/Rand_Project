import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  type ListRenderItemInfo,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AmbientBackground } from "../../../components/ui/ambient-background";
import { AppText } from "../../../components/ui/app-text";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes, type PackageId } from "../../../navigation/routes";
import { isHayaApiConfigured } from "../../../services/runtime/haya-api-config";
import { useHayaConversationStore } from "../../../store/haya-conversation-store";
import { colors, getContentMaxWidth, getScreenPadding, spacing } from "../../../theme";
import { useAiAdvisorChat } from "../../aiAdvisor/hooks/use-ai-advisor-chat";
import type { AiAdvisorChatMessage } from "../../aiAdvisor/types";
import { AssistantStatusMessage } from "./assistant-status-message";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { HeiaTopBar } from "./heia-top-bar";
import { StructuredAssistantMessage } from "./structured-assistant-message";

const CHAT_BACKGROUND = "#F8F6F6";

export const HeiaScreen = () => {
  const params = useLocalSearchParams<{
    packageContext?: string;
    packageId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const {
    assistantAvatarUri,
    draft,
    isLoading,
    messages,
    resetConversation,
    retryLastTurn,
    sendDraft,
    sendText,
    sendQuickReply,
    sendSuggestion,
    setDraft,
  } = useAiAdvisorChat();
  const scrollRef = useRef<FlatList<AiAdvisorChatMessage>>(null);
  const hasMountedRef = useRef(false);
  const packageContextAppliedRef = useRef<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const { isRTL, t } = useLocalization();
  const screenPadding = getScreenPadding(width);
  const contentMaxWidth = getContentMaxWidth(width);
  const apiStatus = useHayaConversationStore((state) => state.apiStatus);
  const fallbackActive = !isHayaApiConfigured() || apiStatus === "error" || apiStatus === "demo";

  const scrollToBottom = useEffectEvent((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  });

  useEffect(() => {
    if (hasMountedRef.current) {
      scrollToBottom(true);
      return;
    }

    hasMountedRef.current = true;
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (
      !params.packageContext ||
      packageContextAppliedRef.current === params.packageContext
    ) {
      return;
    }

    packageContextAppliedRef.current = params.packageContext;
    sendText(
      params.packageId
        ? `${params.packageContext}\nPackage ID: ${params.packageId}`
        : params.packageContext,
    );
  }, [params.packageContext, params.packageId, sendText]);

  useEffect(() => {
    const eventName =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const subscription = Keyboard.addListener(eventName, () =>
      scrollToBottom(true),
    );

    return () => subscription.remove();
  }, [scrollToBottom]);

  const handlePackagePress = useCallback(
    (packageId: PackageId) => router.push(appRoutes.packageDetails(packageId)),
    [],
  );
  const handleFlightPress = useCallback(
    (flightId: string) => router.push(appRoutes.flightDetails(flightId)),
    [],
  );
  const handleFlightBookPress = useCallback(
    (flightId: string) => router.push(appRoutes.demoBooking(flightId)),
    [],
  );
  const handleMicPress = useCallback(() => {
    if (isLoading) {
      return;
    }

    sendText(
      isRTL
        ? "أريد اقتراح رحلة فاخرة لمدة 6 أيام مع إقامة راقية وشعور هادئ."
        : "I want a refined 6-day luxury trip with a polished hotel and a calm premium feel.",
    );
  }, [isLoading, isRTL, sendText]);
  const renderMessage = useCallback(
    ({ index, item }: ListRenderItemInfo<AiAdvisorChatMessage>) => {
      if (item.kind === "assistant_text" || item.kind === "user_text") {
        return (
          <ChatBubble
            assistantAvatarUri={assistantAvatarUri}
            key={item.id}
            message={item}
            messageIndex={index}
            onSuggestionPress={sendSuggestion}
          />
        );
      }

      if (item.kind === "assistant_response") {
        return (
          <StructuredAssistantMessage
            key={item.id}
            message={item}
            messageIndex={index}
            onFlightBookPress={handleFlightBookPress}
            onFlightPress={handleFlightPress}
            onPackagePress={handlePackagePress}
            onQuickReplyPress={sendQuickReply}
          />
        );
      }

      return (
        <AssistantStatusMessage
          key={item.id}
          message={item}
          messageIndex={index}
          onRetry={item.retryable ? retryLastTurn : undefined}
        />
      );
    },
    [
      assistantAvatarUri,
      handlePackagePress,
      handleFlightBookPress,
      handleFlightPress,
      retryLastTurn,
      sendQuickReply,
      sendSuggestion,
    ],
  );
  const keyExtractor = useCallback(
    (message: AiAdvisorChatMessage) => message.id,
    [],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ backgroundColor: CHAT_BACKGROUND, flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        style={{ backgroundColor: CHAT_BACKGROUND, flex: 1 }}
      >
        <AmbientBackground baseColor={CHAT_BACKGROUND} variant="chat">
          <View
            style={{
              alignSelf: "center",
              maxWidth: contentMaxWidth,
              paddingHorizontal: screenPadding,
              width: "100%",
            }}
          >
            <HeiaTopBar
              avatarUri={assistantAvatarUri}
              onBackPress={() => navigateBackOr(appRoutes.home)}
              onResetPress={resetConversation}
            />
          </View>

          <FlatList
            contentContainerStyle={{
              alignSelf: "center",
              gap: spacing.lg,
              maxWidth: contentMaxWidth,
              paddingBottom: spacing.lg,
              paddingHorizontal: screenPadding,
              paddingTop: spacing.lg,
              width: "100%",
            }}
            data={messages}
            initialNumToRender={10}
            keyboardShouldPersistTaps="handled"
            keyExtractor={keyExtractor}
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "none"
            }
            maxToRenderPerBatch={6}
            onContentSizeChange={() => scrollToBottom(hasMountedRef.current)}
            onLayout={() => scrollToBottom(false)}
            ref={scrollRef}
            removeClippedSubviews={Platform.OS === "android"}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: "transparent", flex: 1 }}
            testID="heia-message-list"
            updateCellsBatchingPeriod={16}
            windowSize={10}
          />
        </AmbientBackground>

        <View
          style={{
            alignSelf: "center",
            maxWidth: contentMaxWidth,
            width: "100%",
          }}
        >
          {fallbackActive ? (
            <AppText align="center" color={colors.text.muted} style={{ fontSize: 11, paddingTop: spacing.xs }}>
              {t("heiaChat.demoStatus")}
            </AppText>
          ) : null}
          <ChatInput
            bottomInset={insets.bottom}
            disabled={draft.trim().length === 0}
            loading={isLoading}
            onChangeText={setDraft}
            onFocus={() => scrollToBottom(true)}
            onMicPress={handleMicPress}
            onSend={sendDraft}
            value={draft}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
