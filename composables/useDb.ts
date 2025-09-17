
import Dexie, { type Table } from 'dexie';

export interface TimeEntry {
  id?: number;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  hours: number;
  status: 'in' | 'out';
}

export class MySubClassedDexie extends Dexie {
  timeEntries!: Table<TimeEntry>; 

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      timeEntries: '++id, employeeId, date, status' // Primary key and indexed props
    });
  }
}

const db = new MySubClassedDexie();

export const useDb = () => {
  return { db };
};
