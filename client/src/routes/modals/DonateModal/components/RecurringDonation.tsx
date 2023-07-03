import React, {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import styled from 'styled-components/native';
import * as yup from 'yup';
import TouchableOpacity from '../../../../lib/components/TouchableOpacity/TouchableOpacity';
import {
  DEV_RECURRING_OPTIONS,
  RECURRING_OPTION,
  RECURRING_OPTIONS,
} from '../constants/donationOptions';
import {COLORS} from '../../../../../../shared/src/constants/colors';
import {BottomSheetActionTextInput} from '../../../../lib/components/ActionList/ActionItems/ActionTextInput';
import ActionList from '../../../../lib/components/ActionList/ActionList';
import {
  Body16,
  Body18,
  BodyBold,
} from '../../../../lib/components/Typography/Body/Body';
import {preferedCurrency, formatCurrency} from '../utils/currency';
import {Spacer16} from '../../../../lib/components/Spacers/Spacer';
import Button from '../../../../lib/components/Buttons/Button';
import {EnvelopeIcon} from '../../../../lib/components/Icons';
import apiClient from '../../../../lib/apiClient/apiClient';
import useUser from '../../../../lib/user/hooks/useUser';
import {getRecurringPaymentIntent} from '../api/stripe';
import useStripePayment from '../hooks/useStripePayment';
import {last, head} from 'ramda';
import DonationHeart from './DonationHeart';
import {useTranslation} from 'react-i18next';

const OPTIONS = __DEV__ ? DEV_RECURRING_OPTIONS : RECURRING_OPTIONS;

const Choices = styled.View({});

const Error = styled(Body16)({
  color: COLORS.ERROR,
});

const AmountButton = styled(TouchableOpacity)<{active: boolean}>(
  ({active}) => ({
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: COLORS.PURE_WHITE,
    borderWidth: 5,
    borderColor: active ? COLORS.PRIMARY : COLORS.PURE_WHITE,
    overflow: 'hidden',
  }),
);

const RecurringDonation = () => {
  const {t} = useTranslation('Modal.Donate');
  const startPayment = useStripePayment();

  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState<RECURRING_OPTION>();
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<'invalidEmail' | undefined>();

  const toggleChoice = useCallback(
    (newOption: RECURRING_OPTION) => () => {
      setOption(newOption);
    },
    [],
  );

  const onChangeEmail = useCallback((newEmail: string) => {
    setEmail(newEmail);
    setError(undefined);
  }, []);

  const initializePaymentSheet = useCallback(async () => {
    if (email && option) {
      if (!yup.string().email().isValidSync(email)) {
        setError('invalidEmail');
        return;
      }

      setLoading(true);

      const {id, clientSecret} = await getRecurringPaymentIntent(
        email,
        option.id,
      );

      const result = await startPayment(clientSecret);

      if (result.error) {
        Alert.alert(`Error code: ${result.error.code}`, result.error.message);
      } else {
        Alert.prompt(
          'Thank you for your donation!',
          'Would you like to receive a receipt?',
          [
            {
              text: 'Yes',
              style: 'default',
              onPress: async email => {
                await apiClient(`stripe/paymentIntent/${id}`, {
                  method: 'put',
                  body: JSON.stringify({
                    email,
                  }),
                });
              },
            },
            {
              text: 'No',
              style: 'cancel',
            },
          ],
          'plain-text',
          email ?? undefined,
        );
      }
      setLoading(false);
    }
  }, [option, startPayment, email]);

  const Heart = useCallback(
    () => (
      <DonationHeart
        minAmount={last(OPTIONS[preferedCurrency])?.amount ?? 0}
        maxAmount={head(OPTIONS[preferedCurrency])?.amount ?? 1}
        amount={option?.amount ?? 0}
      />
    ),
    [option?.amount],
  );

  return (
    <>
      <Choices>
        {OPTIONS[preferedCurrency].map(recurringOption => (
          <AmountButton
            key={recurringOption.id}
            onPress={toggleChoice(recurringOption)}
            active={recurringOption === option}>
            <Body18 numberOfLines={1}>
              <BodyBold>
                {formatCurrency(recurringOption.amount)} / month
              </BodyBold>
            </Body18>
          </AmountButton>
        ))}
      </Choices>
      <ActionList>
        <BottomSheetActionTextInput
          placeholder="E-mail address"
          keyboardType="email-address"
          onChangeText={onChangeEmail}
          defaultValue={email}
          Icon={EnvelopeIcon}
          hasError={error === 'invalidEmail'}
        />
      </ActionList>
      <Spacer16 />
      {error && (
        <>
          <Error>{t(`errors.${error}`)}</Error>
          <Spacer16 />
        </>
      )}
      <Button
        variant="secondary"
        loading={loading}
        disabled={loading || !option || !email}
        onPress={initializePaymentSheet}
        LeftIcon={Heart}>
        Donate
      </Button>
    </>
  );
};

export default RecurringDonation;
