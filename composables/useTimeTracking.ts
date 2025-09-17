import { readonly, ref } from 'vue';
import { useDb, type TimeEntry } from './useDb';

export const useTimeTracking = () => {
  const { db } = useDb();
  const timeEntries = ref<TimeEntry[]>([]);
  const todayEntries = ref<TimeEntry[]>([]);

  const processEmployeeScan = async (employeeId: string) => {
    const now = new Date();
    const today = now.toDateString();

    const activeEntry = await db.timeEntries
      .where('employeeId').equals(employeeId)
      .and(entry => entry.date === today && entry.status === 'in')
      .first();

    if (activeEntry && activeEntry.id) {
      // Clock out
      const clockInTime = new Date(activeEntry.clockIn).getTime();
      const hours = (now.getTime() - clockInTime) / (1000 * 60 * 60);
      await db.timeEntries.update(activeEntry.id, {
        clockOut: now.toISOString(),
        status: 'out',
        hours,
      });

      await loadTodayEntries();
      return { action: 'clockOut', employee: employeeId, time: now };
    } else {
      // Clock in
      const entry: TimeEntry = {
        employeeId,
        date: today,
        clockIn: now.toISOString(),
        hours: 0,
        status: 'in',
      };

      await db.timeEntries.add(entry);

      await loadTodayEntries();
      return { action: 'clockIn', employee: employeeId, time: now };
    }
  };

  const loadTimeEntries = async () => {
    const entries = await db.timeEntries.orderBy('clockIn').reverse().toArray();
    timeEntries.value = entries;
    await loadTodayEntries();
  };

  const loadTodayEntries = async () => {
    const today = new Date().toDateString();
    todayEntries.value = await db.timeEntries
      .where('date').equals(today)
      .reverse()
      .sortBy('clockIn');
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getEmployeeStatus = async (employeeId: string) => {
    const today = new Date().toDateString();
    const activeEntry = await db.timeEntries
      .where('employeeId').equals(employeeId)
      .and(entry => entry.date === today && entry.status === 'in')
      .first();
    return activeEntry ? 'in' : 'out';
  };

  const getTodayHours = async (employeeId: string) => {
    const today = new Date().toDateString();
    const entries = await db.timeEntries
      .where('employeeId').equals(employeeId)
      .and(entry => entry.date === today && entry.status === 'out')
      .toArray();

    return entries.reduce((total, entry) => total + entry.hours, 0);
  };

  return {
    timeEntries: readonly(timeEntries),
    todayEntries: readonly(todayEntries),
    processEmployeeScan,
    loadTimeEntries,
    formatTime,
    formatHours,
    getEmployeeStatus,
    getTodayHours,
  };
};