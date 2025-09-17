<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">Employee Clock Terminal</h1>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-gray-900" id="current-time">{{ currentTime }}</p>
            <p class="text-sm text-gray-600">{{ currentDate }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Scanner Interface -->
      <div class="card mb-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Scan Employee Barcode</h2>
          <p class="text-gray-600">Scan barcode or manually enter Employee ID</p>
        </div>
        
        <div class="max-w-md mx-auto">
          <div class="relative">
            <input
              ref="scannerInput"
              v-model="scannedId"
              @keyup.enter="handleScan"
              type="text"
              class="input-field text-center text-lg font-mono"
              placeholder="Scan barcode or type Employee ID"
              autofocus
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m6-4h.01M12 8h.01M12 8h4.01M12 8H7.99M12 8V4m0 0h.01M12 4H7.99M12 4h4.01"></path>
              </svg>
            </div>
          </div>
          
          <button @click="handleScan" class="btn-primary w-full mt-4">
            Process Clock In/Out
          </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="lastAction" class="mt-6 max-w-md mx-auto">
          <div :class="lastAction.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'" 
               class="border rounded-lg p-4">
            <div class="flex items-center">
              <svg v-if="lastAction.success" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">{{ lastAction.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Activity -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Currently Clocked In -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Currently Clocked In</h2>
          <div class="space-y-3">
            <div v-for="entry in currentlyClockedIn" :key="entry.id" 
                 class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p class="font-semibold text-gray-900">{{ entry.employeeId }}</p>
                <p class="text-sm text-gray-600">Since {{ formatTime(entry.clockIn) }}</p>
              </div>
              <div class="flex items-center text-green-600">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium">Active</span>
              </div>
            </div>
            <div v-if="currentlyClockedIn.length === 0" class="text-center py-8 text-gray-500">
              No employees currently clocked in
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div class="space-y-3 max-h-80 overflow-y-auto">
            <div v-for="entry in recentActivity" :key="entry.id" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-900">{{ entry.employeeId }}</p>
                <p class="text-sm text-gray-600">
                  {{ entry.status === 'in' ? 'Clocked In' : 'Clocked Out' }} at {{ formatTime(entry.status === 'in' ? entry.clockIn : entry.clockOut) }}
                </p>
                <p v-if="entry.status === 'out' && entry.hours > 0" class="text-xs text-gray-500">
                  Worked {{ formatHours(entry.hours) }}
                </p>
              </div>
              <div class="flex items-center">
                <span :class="entry.status === 'in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ entry.status === 'in' ? 'In' : 'Out' }}
                </span>
              </div>
            </div>
            <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
              No activity today
            </div>
          </div>
        </div>
      </div>

      <!-- All Time Entries Table -->
      <div class="card mt-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">All Time Entries</h2>
          <div class="text-sm text-gray-600">
            Total entries: {{ timeEntries.length }}
          </div>
        </div>

        <div class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="entry in displayedEntries" :key="entry.id" class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ entry.employeeId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(entry.clockIn).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatTime(entry.clockIn) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ entry.clockOut ? formatTime(entry.clockOut) : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ entry.hours > 0 ? formatHours(entry.hours) : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="entry.status === 'in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ entry.status === 'in' ? 'Active' : 'Completed' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="timeEntries.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No time entries found. Start scanning employee barcodes!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="timeEntries.length > 10" class="mt-4 text-center">
          <button @click="showAllEntries = !showAllEntries" class="btn-secondary">
            {{ showAllEntries ? 'Show Less' : `Show All (${timeEntries.length})` }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { 
  timeEntries,
  todayEntries,
  processEmployeeScan,
  loadTimeEntries,
  formatTime,
  formatHours
} = useTimeTracking()

const scannedId = ref('')
const scannerInput = ref()
const currentTime = ref('')
const currentDate = ref('')
const lastAction = ref<any>(null)
const showAllEntries = ref(false)

const currentlyClockedIn = computed(() => {
  return todayEntries.value.filter(entry => entry.status === 'in')
})

const recentActivity = computed(() => {
  return todayEntries.value.slice(0, 10)
})

const displayedEntries = computed(() => {
  return showAllEntries.value ? timeEntries.value : timeEntries.value.slice(0, 10)
})

const handleScan = () => {
  const employeeId = scannedId.value.trim()
  
  if (!employeeId) {
    lastAction.value = {
      success: false,
      message: 'Please scan a barcode or enter an Employee ID'
    }
    return
  }

  try {
    const result = processEmployeeScan(employeeId)
    
    lastAction.value = {
      success: true,
      message: `Employee ${result.employee} successfully ${result.action === 'clockIn' ? 'clocked in' : 'clocked out'} at ${formatTime(result.time)}`
    }
    
    // Clear the input and refocus
    scannedId.value = ''
    nextTick(() => {
      scannerInput.value?.focus()
    })
    
    // Clear message after 5 seconds
    setTimeout(() => {
      lastAction.value = null
    }, 5000)
    
  } catch (error) {
    lastAction.value = {
      success: false,
      message: 'Error processing scan. Please try again.'
    }
  }
}

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Keep scanner input focused
const maintainFocus = () => {
  if (scannerInput.value && document.activeElement !== scannerInput.value) {
    scannerInput.value.focus()
  }
}

onMounted(() => {
  loadTimeEntries()
  updateCurrentTime()
  setInterval(updateCurrentTime, 1000)
  
  // Maintain focus on scanner input
  setInterval(maintainFocus, 1000)
  
  // Global keydown listener for barcode scanners
  document.addEventListener('keydown', (e) => {
    if (e.target !== scannerInput.value) {
      scannerInput.value?.focus()
    }
  })
})
</script>