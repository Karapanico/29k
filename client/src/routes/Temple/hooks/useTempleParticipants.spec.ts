import {DailyParticipant} from '@daily-co/react-native-daily-js';
import {renderHook} from '@testing-library/react-hooks';
import {RecoilRoot} from 'recoil';
import {TempleData} from '../../../../../shared/src/types/Temple';
import {participantsAtom, templeAtom} from '../state/state';
import useTempleExercise from './useTempleExercise';
import useTempleParticipants from './useTempleParticipants';

const mockUseTempleExercise = useTempleExercise as jest.Mock;
jest.mock('./useTempleExercise');

describe('useTempleParticipants', () => {
  it('filter participants if participant is on spotlight', () => {
    mockUseTempleExercise.mockReturnValue({
      slide: {current: {type: 'host'}},
    });

    const {result} = renderHook(() => useTempleParticipants(), {
      wrapper: RecoilRoot,
      initialProps: {
        initializeState: ({set}) => {
          set(templeAtom, {
            exerciseState: {
              dailySpotlightId: 'some-spotlight-user-id',
            },
          } as TempleData);
          set(participantsAtom, {
            'some-spotlight-user-id': {
              user_id: 'some-spotlight-user-id',
            } as DailyParticipant,
            'some-other-user-id': {
              user_id: 'some-other-user-id',
            } as DailyParticipant,
          });
        },
        children: null,
      },
    });

    expect(result.current).toEqual([{user_id: 'some-other-user-id'}]);
  });

  it('returns all participants when no temple spotlight participant', () => {
    mockUseTempleExercise.mockReturnValue({
      slide: {current: {type: 'host'}},
    });

    const {result} = renderHook(() => useTempleParticipants(), {
      wrapper: RecoilRoot,
      initialProps: {
        initializeState: ({set}) => {
          set(participantsAtom, {
            'some-spotlight-user-id': {
              user_id: 'some-spotlight-user-id',
            } as DailyParticipant,
            'some-other-user-id': {
              user_id: 'some-other-user-id',
            } as DailyParticipant,
          });
        },
        children: null,
      },
    });

    expect(result.current).toEqual([
      {user_id: 'some-spotlight-user-id'},
      {user_id: 'some-other-user-id'},
    ]);
  });

  it('returns all participants when content is not ”spotlight type"', () => {
    mockUseTempleExercise.mockReturnValue({
      slide: {current: {type: 'not-host'}},
    });

    const {result} = renderHook(() => useTempleParticipants(), {
      wrapper: RecoilRoot,
      initialProps: {
        initializeState: ({set}) => {
          set(templeAtom, {
            exerciseState: {
              dailySpotlightId: 'some-spotlight-user-id',
            },
          } as TempleData);
          set(participantsAtom, {
            'some-spotlight-user-id': {
              user_id: 'some-spotlight-user-id',
            } as DailyParticipant,
            'some-other-user-id': {
              user_id: 'some-other-user-id',
            } as DailyParticipant,
          });
        },
        children: null,
      },
    });

    expect(result.current).toEqual([
      {user_id: 'some-spotlight-user-id'},
      {user_id: 'some-other-user-id'},
    ]);
  });

  it('filter participants who are in the portal', () => {
    const {result} = renderHook(() => useTempleParticipants(), {
      wrapper: RecoilRoot,
      initialProps: {
        initializeState: ({set}) => {
          set(participantsAtom, {
            'some-in-portal-user-id': {
              user_id: 'some-in-portal-user-id',
              userData: {inPortal: true},
            } as DailyParticipant,
            'some-not-in-portal-user-id': {
              user_id: 'some-not-in-portal-user-id',
              userData: {inPortal: false},
            } as DailyParticipant,
            'some-without-user-data-user-id': {
              user_id: 'some-without-user-data-user-id',
            } as DailyParticipant,
          });
        },
        children: null,
      },
    });

    expect(result.current).toEqual([
      {user_id: 'some-not-in-portal-user-id', userData: {inPortal: false}},
      {user_id: 'some-without-user-data-user-id'},
    ]);
  });
});
