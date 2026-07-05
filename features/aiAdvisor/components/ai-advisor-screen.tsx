import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useAiAdvisorScreen } from "../hooks/use-ai-advisor-screen";

export const AiAdvisorScreen = () => {
  const {
    draft,
    isLoading,
    messages,
    resetConversation,
    screenData,
    sendText,
    sendSuggestion,
    setDraft,
  } = useAiAdvisorScreen();
  const firstMessage = messages[0];
  const suggestionIds =
    firstMessage && firstMessage.kind === "assistant_text"
      ? firstMessage.suggestionIds ?? []
      : [];

  return (
    <ScreenContainer subtitle={screenData.subtitle} title={screenData.title}>
      <AppCard elevated>
        <AppText variant="title">{`${messages.length} chat items orchestrated.`}</AppText>
        <AppText>{`Assistant avatar: ${screenData.assistantAvatarUri.slice(0, 32)}...`}</AppText>
        <AppText variant="bodySmall">{`Composer loading: ${String(isLoading)}`}</AppText>
      </AppCard>

      <AppCard>
        <AppText variant="title">Suggestion chips</AppText>
        <AppText>{suggestionIds.join(", ") || "No quick prompts available."}</AppText>
        <AppText variant="bodySmall">{`Draft length: ${draft.length}`}</AppText>
      </AppCard>

      <PrimaryButton
        label="Send sample prompt"
        onPress={() => {
          const samplePrompt = "Plan a design-forward summer escape";

          setDraft(samplePrompt);
          sendText(samplePrompt);
        }}
      />
      <SecondaryButton
        label="Send family prompt"
        onPress={() => sendSuggestion("family")}
        tone="primary"
      />
      <SecondaryButton label="Reset conversation" onPress={resetConversation} tone="navy" />
    </ScreenContainer>
  );
};
