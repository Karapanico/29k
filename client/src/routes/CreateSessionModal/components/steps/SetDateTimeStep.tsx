import React from 'react';
import {useBottomSheet} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import styled from 'styled-components/native';

import Button from '../../../../common/components/Buttons/Button';
import Byline from '../../../../common/components/Bylines/Byline';
import Image from '../../../../common/components/Image/Image';
import Gutters from '../../../../common/components/Gutters/Gutters';
import {
  Spacer16,
  Spacer28,
  Spacer8,
} from '../../../../common/components/Spacers/Spacer';
import {Display24} from '../../../../common/components/Typography/Display/Display';
import useExerciseById from '../../../../lib/content/hooks/useExerciseById';
import {LANGUAGE_TAG} from '../../../../lib/i18n';
import {ModalStackProps} from '../../../../lib/navigation/constants/routes';
import useSessions from '../../../Sessions/hooks/useSessions';
import {StepProps} from '../../CreateSessionModal';
import DateTimePicker from '../../../../common/components/DateTimePicker/DateTimePicker';
import {SPACINGS} from '../../../../common/constants/spacings';
import EditSessionType from '../../../../common/components/EditSessionType/EditSessionType';

const TextWrapper = styled.View({
  flex: 2,
  paddingVertical: SPACINGS.SIXTEEN,
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const Cta = styled(Button)({alignSelf: 'center'});

const CardImageWrapper = styled.View({
  width: 80,
  height: 80,
});

const SetDateTimeStep: React.FC<StepProps> = ({
  selectedExercise,
  selectedType,
  isPublicHost,
  userProfile,
  prevStep,
}) => {
  const {t, i18n} = useTranslation('Modal.CreateSession');
  const {expand, collapse} = useBottomSheet();
  const {goBack, navigate} =
    useNavigation<NativeStackNavigationProp<ModalStackProps, 'SessionModal'>>();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<dayjs.Dayjs | undefined>();
  const [time, setTime] = useState<dayjs.Dayjs | undefined>();
  const {addSession} = useSessions();
  const exercise = useExerciseById(selectedExercise);

  const onChange = useCallback(
    (selectedDate: dayjs.Dayjs, selectedTime: dayjs.Dayjs) => {
      setDate(selectedDate);
      setTime(selectedTime);
    },
    [setDate, setTime],
  );

  const onSubmit = useCallback(async () => {
    if (selectedExercise && selectedType && date && time) {
      const sessionDateTime = date.hour(time.hour()).minute(time.minute());

      setIsLoading(true);
      const session = await addSession({
        contentId: selectedExercise,
        type: selectedType,
        startTime: sessionDateTime,
        language: i18n.resolvedLanguage as LANGUAGE_TAG,
      });
      setIsLoading(false);
      goBack();
      navigate('SessionModal', {session});
    }
  }, [
    selectedExercise,
    selectedType,
    date,
    time,
    addSession,
    goBack,
    navigate,
    i18n.resolvedLanguage,
  ]);

  const cardImg = useMemo(
    () => ({uri: exercise?.card?.image?.source}),
    [exercise],
  );

  const onToggle = useCallback(
    (expanded: boolean) => (expanded ? expand() : collapse()),
    [expand, collapse],
  );

  return (
    <Gutters>
      <Spacer8 />
      <Row>
        <TextWrapper>
          <Display24>{exercise?.name}</Display24>
          <Spacer8 />
          <Byline
            pictureURL={userProfile.photoURL}
            name={userProfile.displayName}
          />
        </TextWrapper>
        <Spacer16 />
        <CardImageWrapper>
          <Image source={cardImg} />
        </CardImageWrapper>
      </Row>
      <Spacer28 />
      {isPublicHost && selectedType && (
        <EditSessionType sessionType={selectedType} onPress={prevStep} />
      )}
      <Spacer16 />
      <DateTimePicker
        minimumDate={dayjs().local()}
        onChange={onChange}
        onToggle={onToggle}
      />
      <Spacer16 />
      <Cta variant="secondary" small onPress={onSubmit} disabled={isLoading}>
        {t('setDateTime.cta')}
      </Cta>
      <Spacer16 />
    </Gutters>
  );
};
export default SetDateTimeStep;
