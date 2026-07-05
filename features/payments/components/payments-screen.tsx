import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { LoadingState } from "../../../components/ui/loading-state";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { usePaymentsScreen } from "../hooks/use-payments-screen";

export const PaymentsScreen = () => {
  const { formatCurrency } = useLocalization();
  const { paymentsQuery, screenData } = usePaymentsScreen();

  return (
    <ScreenContainer subtitle={screenData.subtitle} title={screenData.title}>
      {paymentsQuery.isLoading ? <LoadingState label={screenData.title} /> : null}

      {screenData.summaries.map((summary) => (
        <AppCard key={summary.bookingId}>
          <AppText variant="title">{summary.route}</AppText>
          <AppText>{summary.method.label}</AppText>
          <AppText color="#235DFF" variant="label">
            {formatCurrency(summary.amountDue)}
          </AppText>
        </AppCard>
      ))}
    </ScreenContainer>
  );
};
