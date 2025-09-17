import Dexie from 'dexie';

export const db = new Dexie('ClockinAppDB');
db.version(1).stores({
  clockEvents: '++id, employeeId, type, timestamp, isSynced',
});
