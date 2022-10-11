import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import Video from 'react-native-video';
import {useRecoilValue} from 'recoil';
import styled from 'styled-components/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import Button from '../../common/components/Buttons/Button';
import Gutters from '../../common/components/Gutters/Gutters';
import {BottomSafeArea, Spacer8} from '../../common/components/Spacers/Spacer';
import {Body14} from '../../common/components/Typography/Body/Body';
import {COLORS} from '../../../../shared/src/constants/colors';
import {HKGroteskBold} from '../../common/constants/fonts';
import {TempleStackProps} from '../../common/constants/routes';
import {SPACINGS} from '../../common/constants/spacings';
import NS from '../../lib/i18n/constants/namespaces';
import Counter from './components/Counter/Counter';
import useTempleExercise from './hooks/useTempleExercise';
import {participantsAtom, templeAtom} from './state/state';
import useLeaveTemple from './hooks/useLeaveTemple';
import VideoBase from './components/VideoBase/VideoBase';
import useIsTempleFacilitator from './hooks/useIsTempleFacilitator';
import AudioFader from './components/AudioFader/AudioFader';
import usePreventGoingBack from '../../lib/navigation/hooks/usePreventGoingBack';
import useUpdateTemple from './hooks/useUpdateTemple';
import {DailyContext} from './DailyProvider';
import {DailyUserData} from '../../../../shared/src/types/Temple';
import Screen from '../../common/components/Screen/Screen';

type TempleNavigationProps = NativeStackNavigationProp<TempleStackProps>;

const VideoStyled = styled(VideoBase)({
  ...StyleSheet.absoluteFillObject,
});

const StatusItem = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const StatusText = styled(Body14)({
  color: COLORS.PURE_WHITE,
  fontFamily: HKGroteskBold,
});

const Badge = styled.View({
  backgroundColor: COLORS.WHITE_TRANSPARENT,
  paddingVertical: SPACINGS.FOUR,
  paddingHorizontal: SPACINGS.EIGHT,
  borderRadius: SPACINGS.EIGHT,
});

const PortalStatus = styled(Gutters)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'space-between',
});
const Content = styled.View({
  flex: 1,
  justifyContent: 'space-between',
});

const TopBar = styled(Gutters)({
  justifyContent: 'flex-end',
  flexDirection: 'row',
});

const IntroPortal: React.FC = () => {
  const {
    params: {templeId},
  } = useRoute<RouteProp<TempleStackProps, 'IntroPortal'>>();
  const endVideoRef = useRef<Video>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [joiningTemple, setJoiningTemple] = useState(false);
  const {t} = useTranslation(NS.SCREEN.PORTAL);
  const exercise = useTempleExercise();
  const temple = useRecoilValue(templeAtom);
  const participants = useRecoilValue(participantsAtom);
  const participantsCount = Object.keys(participants ?? {}).length;
  const isFacilitator = useIsTempleFacilitator();
  const {joinMeeting} = useContext(DailyContext);
  const {navigate} = useNavigation<TempleNavigationProps>();
  const isFocused = useIsFocused();
  const {setStarted} = useUpdateTemple(templeId);
  const {leaveTempleWithConfirm} = useLeaveTemple();

  usePreventGoingBack(leaveTempleWithConfirm);

  useEffect(() => {
    joinMeeting({inPortal: true} as DailyUserData);
  }, [joinMeeting]);

  const introPortal = exercise?.introPortal;

  if (!introPortal) {
    return null;
  }

  const onEndVideoLoad = () => {
    endVideoRef.current?.seek(0);
  };

  const onEndVideoEnd = () => {
    if (joiningTemple) {
      navigate('Temple', {templeId});
    }
  };

  const onLoopVideoLoad = () => {
    setVideoLoaded(true);
  };

  const onLoopVideoEnd = () => {
    if (temple?.started) {
      ReactNativeHapticFeedback.trigger('impactHeavy');
      setJoiningTemple(true);
    }
  };

  return (
    <Screen onPressBack={leaveTempleWithConfirm} hasDarkBackground>
      {isFocused && introPortal.videoLoop?.audio && (
        <AudioFader
          source={introPortal.videoLoop.audio}
          repeat
          paused={!videoLoaded}
          volume={!joiningTemple ? 1 : 0}
          duration={!joiningTemple ? 20000 : 5000}
        />
      )}

      <VideoStyled
        ref={endVideoRef}
        onLoad={onEndVideoLoad}
        onEnd={onEndVideoEnd}
        paused={!joiningTemple}
        source={{uri: introPortal.videoEnd?.source}}
        resizeMode="cover"
        poster={introPortal.videoEnd?.preview}
        posterResizeMode="cover"
        allowsExternalPlayback={false}
      />

      {!joiningTemple && (
        <VideoStyled
          onLoad={onLoopVideoLoad}
          onEnd={onLoopVideoEnd}
          repeat={!temple?.started}
          source={{uri: introPortal.videoLoop?.source}}
          resizeMode="cover"
          poster={introPortal.videoLoop?.preview}
          posterResizeMode="cover"
          allowsExternalPlayback={false}
        />
      )}

      <Wrapper>
        {isFocused && (
          <Content>
            <TopBar>
              {__DEV__ && temple?.started && (
                <Button small onPress={() => navigate('Temple', {templeId})}>
                  {t('skipPortal')}
                </Button>
              )}
              <Spacer8 />
              {isFacilitator && (
                <Button small disabled={temple?.started} onPress={setStarted}>
                  {temple?.started ? t('sessionStarted') : t('startSession')}
                </Button>
              )}
            </TopBar>

            <PortalStatus>
              <StatusItem>
                <StatusText>{t('counterLabel.soon')}</StatusText>

                <Spacer8 />
                <Badge>
                  <StatusText>
                    <Counter
                      startTime={dayjs(temple?.startTime.toDate())}
                      starting={temple?.started}
                    />
                  </StatusText>
                </Badge>
              </StatusItem>

              {participantsCount > 1 && (
                <StatusItem>
                  <StatusText>{t('participants')}</StatusText>
                  <Spacer8 />
                  <Badge>
                    <StatusText>{participantsCount}</StatusText>
                  </Badge>
                </StatusItem>
              )}
            </PortalStatus>
          </Content>
        )}
      </Wrapper>

      <BottomSafeArea minSize={SPACINGS.SIXTEEN} />
    </Screen>
  );
};

export default IntroPortal;
