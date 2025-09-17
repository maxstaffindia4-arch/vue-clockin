export const useTimeTracking = () => {
  const timeEntries = ref<any[]>([])
  const todayEntries = ref<any[]>([])

  const processEmployeeScan = (employeeId: string) => {
    const now = new Date()
    const today = now.toDateString()
    
    // Check if employee has an active clock-in today
    const activeEntry = timeEntries.value.find(entry => 
      entry.employeeId === employeeId && 
      entry.date === today && 
      entry.status === 'in'
    )

    if (activeEntry) {
      // Clock out
      activeEntry.clockOut = now.toISOString()
      activeEntry.status = 'out'
      activeEntry.hours = (now.getTime() - new Date(activeEntry.clockIn).getTime()) / (1000 * 60 * 60)
      
      if (process.client) {
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries.value))
      }
      
      loadTodayEntries()
      return { action: 'clockOut', employee: employeeId, time: now }
    } else {
      // Clock in
      const entry = {
        id: Date.now(),
        employeeId,
        date: today,
        clockIn: now.toISOString(),
        clockOut: null,
        hours: 0,
        status: 'in'
      }

      timeEntries.value.push(entry)
      
      if (process.client) {
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries.value))
      }
      
      loadTodayEntries()
      return { action: 'clockIn', employee: employeeId, time: now }
    }
  }

  const loadTimeEntries = () => {
    if (!process.client) return

    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]')
    timeEntries.value = entries.sort((a: any, b: any) => 
      new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    )
    
    loadTodayEntries()
  }

  const loadTodayEntries = () => {
    const today = new Date().toDateString()
    todayEntries.value = timeEntries.value
      .filter(entry => entry.date === today)
      .sort((a: any, b: any) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
  }

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getEmployeeStatus = (employeeId: string) => {
    const today = new Date().toDateString()
    const activeEntry = timeEntries.value.find(entry => 
      entry.employeeId === employeeId && 
      entry.date === today && 
      entry.status === 'in'
    )
    return activeEntry ? 'in' : 'out'
  }

  const getTodayHours = (employeeId: string) => {
    const today = new Date().toDateString()
    const todayEntries = timeEntries.value.filter(entry => 
      entry.employeeId === employeeId && 
      entry.date === today &&
      entry.status === 'out'
    )
    
    return todayEntries.reduce((total, entry) => total + entry.hours, 0)
  }

  return {
    timeEntries: readonly(timeEntries),
    todayEntries: readonly(todayEntries),
    processEmployeeScan,
    loadTimeEntries,
    formatTime,
    formatHours,
    getEmployeeStatus,
    getTodayHours
  }
}