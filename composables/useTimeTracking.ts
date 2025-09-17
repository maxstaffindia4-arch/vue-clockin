export const useTimeTracking = () => {
  const currentStatus = ref<'out' | 'in'>('out')
  const clockInTime = ref<Date | null>(null)
  const clockOutTime = ref<Date | null>(null)
  const todayHours = ref(0)
  const timeEntries = ref<any[]>([])

  const clockIn = (employeeId: string) => {
    const now = new Date()
    clockInTime.value = now
    clockOutTime.value = null
    currentStatus.value = 'in'

    const entry = {
      id: Date.now(),
      employeeId,
      date: now.toDateString(),
      clockIn: now.toISOString(),
      clockOut: null,
      hours: 0,
      status: 'in'
    }

    if (process.client) {
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]')
      entries.push(entry)
      localStorage.setItem('timeEntries', JSON.stringify(entries))
      localStorage.setItem('currentStatus', JSON.stringify({
        status: 'in',
        clockInTime: now.toISOString(),
        employeeId
      }))
    }

    loadTimeEntries(employeeId)
  }

  const clockOut = (employeeId: string) => {
    if (!clockInTime.value) return

    const now = new Date()
    clockOutTime.value = now
    currentStatus.value = 'out'

    const hours = (now.getTime() - clockInTime.value.getTime()) / (1000 * 60 * 60)

    if (process.client) {
      const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]')
      const todayEntry = entries.find((entry: any) => 
        entry.employeeId === employeeId && 
        entry.date === now.toDateString() && 
        entry.status === 'in'
      )

      if (todayEntry) {
        todayEntry.clockOut = now.toISOString()
        todayEntry.hours = hours
        todayEntry.status = 'out'
        localStorage.setItem('timeEntries', JSON.stringify(entries))
      }

      localStorage.removeItem('currentStatus')
    }

    clockInTime.value = null
    loadTimeEntries(employeeId)
  }

  const loadTimeEntries = (employeeId: string) => {
    if (!process.client) return

    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]')
    timeEntries.value = entries
      .filter((entry: any) => entry.employeeId === employeeId)
      .sort((a: any, b: any) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())

    // Calculate today's hours
    const today = new Date().toDateString()
    const todayEntries = entries.filter((entry: any) => 
      entry.employeeId === employeeId && 
      entry.date === today &&
      entry.status === 'out'
    )
    
    todayHours.value = todayEntries.reduce((total: number, entry: any) => total + entry.hours, 0)
  }

  const checkCurrentStatus = (employeeId: string) => {
    if (!process.client) return

    const status = localStorage.getItem('currentStatus')
    if (status) {
      const parsed = JSON.parse(status)
      if (parsed.employeeId === employeeId && parsed.status === 'in') {
        currentStatus.value = 'in'
        clockInTime.value = new Date(parsed.clockInTime)
      }
    }
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

  return {
    currentStatus: readonly(currentStatus),
    clockInTime: readonly(clockInTime),
    clockOutTime: readonly(clockOutTime),
    todayHours: readonly(todayHours),
    timeEntries: readonly(timeEntries),
    clockIn,
    clockOut,
    loadTimeEntries,
    checkCurrentStatus,
    formatTime,
    formatHours
  }
}