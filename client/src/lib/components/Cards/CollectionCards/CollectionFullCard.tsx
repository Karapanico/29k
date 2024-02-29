import React from 'react';
import styled from 'styled-components/native';

import {COLORS} from '../../../../../../shared/src/constants/colors';

import {Display22} from '../../Typography/Display/Display';
import {SPACINGS} from '../../../constants/spacings';
import TouchableOpacity from '../../TouchableOpacity/TouchableOpacity';
import {Spacer4, Spacer16, Spacer8} from '../../Spacers/Spacer';
import SessionProgress from '../../SessionProgress/SessionProgress';
import {CollectionIcon} from '../../Icons';
import {Body12} from '../../Typography/Body/Body';
import {PlayfairDisplayMedium} from '../../../constants/fonts';
import {Collection} from '../../../../../../shared/src/types/generated/Collection';
import {formatContentName} from '../../../utils/string';
import CardGraphic from '../../CardGraphic/CardGraphic';

export const HEIGHT = 138;

type CollectionFullCardProps = {
  collection: Collection;
  progressItems: Array<boolean>;
  backgroundColor?: string;
  textColor?: string;
  onPress: () => void;
};

const Container = styled(TouchableOpacity)<{backgroundColor?: string}>(
  ({backgroundColor}) => ({
    height: HEIGHT,
    backgroundColor: backgroundColor ?? COLORS.GREYLIGHTEST,
    borderRadius: SPACINGS.SIXTEEN,
    paddingVertical: SPACINGS.FOUR,
    paddingHorizontal: SPACINGS.SIXTEEN,
  }),
);

const Heading = styled(Display22)<{color?: string}>(
  ({color = COLORS.BLACK}) => ({
    fontFamily: PlayfairDisplayMedium,
    lineHeight: 27,
    color,
    flex: 1,
  }),
);

const Description = styled(Body12)<{color?: string}>(
  ({color = COLORS.BLACK}) => ({
    fontFamily: PlayfairDisplayMedium,
    color,
  }),
);

const IconWrapper = styled.View({
  width: 23,
  height: 23,
  alignItems: 'center',
  justifyContent: 'center',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: 1,
});

const LeftColumn = styled.View({
  flex: 1,
  paddingVertical: SPACINGS.EIGHT,
});

const TitleWrapper = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
});

const Graphic = styled(CardGraphic)({
  width: 64,
  height: 64,
  aspectRatio: '1',
  borderRadius: 8,
  overflow: 'hidden',
});

const CollectionFullCard: React.FC<CollectionFullCardProps> = ({
  collection,
  progressItems,
  backgroundColor,
  textColor,
  onPress,
}) => {
  return (
    <Container onPress={onPress} backgroundColor={backgroundColor}>
      <Row>
        <LeftColumn>
          <TitleWrapper>
            <IconWrapper>
              <CollectionIcon fill={textColor} />
            </IconWrapper>
            <Spacer8 />
            <Heading numberOfLines={2} color={textColor}>
              {formatContentName(collection)}
            </Heading>
          </TitleWrapper>
          <Spacer8 />
          <Description numberOfLines={2} color={textColor}>
            {collection.description}
          </Description>
        </LeftColumn>
        <Spacer16 />
        <Graphic graphic={collection.card} />
      </Row>
      <SessionProgress items={progressItems} />
      <Spacer4 />
    </Container>
  );
};

export default React.memo(CollectionFullCard);
