import { db } from '~/src/database';

export type ClockEvent = {
  id?: number;
  employeeId: string;
  type: 'in' | 'out';
  timestamp: string;
  isSynced: boolean;
};

export const useClockEvents = () => {
  const addEvent = async (employeeId: string, type: 'in' | 'out'): Promise<ClockEvent> => {
    const event: Omit<ClockEvent, 'id'> = {
      employeeId,
      type,
      timestamp: new Date().toISOString(),
      isSynced: false,
    };

    const id = await (db as any).table('clockEvents').add(event);
    return { id, ...event };
  };

  const clockIn = (employeeId: string) => addEvent(employeeId, 'in');
  const clockOut = (employeeId: string) => addEvent(employeeId, 'out');

  const getUnsyncedEvents = () => (db as any)
    .table('clockEvents')
    .where('isSynced')
    .equals(false)
    .toArray();

  const markEventsAsSynced = async (ids: number[]) => {
    const table = (db as any).table('clockEvents');
    await Promise.all(ids.map((id) => table.update(id, { isSynced: true })));
  };

  return {
    clockIn,
    clockOut,
    getUnsyncedEvents,
    markEventsAsSynced,
  };
};
