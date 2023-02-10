import dayjs from 'dayjs';
import {useCallback, useMemo} from 'react';
import {LiveSession} from '../../../../../shared/src/types/Session';
import {updateInterestedCount} from '../api/session';
import useLogSessionMetricEvents from '../../sessions/hooks/useLogSessionMetricEvents';
import usePinnedSessions from '../../sessions/hooks/usePinnedSessions';
import useUserState from '../../user/state/state';

const usePinSession = (session: LiveSession) => {
  const pinnedSessions = usePinnedSessions();
  const setPinnedSessions = useUserState(state => state.setPinnedSessions);
  const logSessionMetricEvent = useLogSessionMetricEvents();

  const togglePinned = useCallback(() => {
    const now = dayjs();
    const currentPinnedSessions = pinnedSessions.filter(s =>
      now.isBefore(s.expires),
    );

    if (currentPinnedSessions.find(ps => ps.id === session.id)) {
      setPinnedSessions(
        currentPinnedSessions.filter(ps => ps.id !== session.id),
      );
      updateInterestedCount(session.id, false);
    } else {
      setPinnedSessions([
        ...currentPinnedSessions,
        {
          id: session.id,
          expires: dayjs(session.startTime).add(1, 'month').toDate(),
        },
      ]);
      updateInterestedCount(session.id, true);

      logSessionMetricEvent('Add Sharing Session To Interested', session);
    }
  }, [session, pinnedSessions, setPinnedSessions, logSessionMetricEvent]);

  const isPinned = useMemo(
    () => Boolean(pinnedSessions.find(ps => ps.id === session.id)),
    [session, pinnedSessions],
  );

  return {togglePinned, isPinned};
};

export default usePinSession;
