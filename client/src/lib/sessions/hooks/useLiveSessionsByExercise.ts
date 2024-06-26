import {useState, useEffect} from 'react';
import {LiveSessionType} from '../../../../../shared/src/schemas/Session';
import {fetchSessions} from '../api/sessions';
import {ExerciseWithLanguage} from '../../content/types';

const useLiveSessionsByExercise = (
  exercise?: ExerciseWithLanguage,
  limit: number = 5,
) => {
  const [sessions, setSessions] = useState<Array<LiveSessionType>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exercise && exercise.live) {
      setLoading(true);
      fetchSessions(exercise.id, undefined, limit).then(fetchedSessions => {
        setSessions(fetchedSessions);
        setLoading(false);
      });
    }
  }, [setSessions, exercise, setLoading, limit]);

  return {sessions, loading};
};

export default useLiveSessionsByExercise;
