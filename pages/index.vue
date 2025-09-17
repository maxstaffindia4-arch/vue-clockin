<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">TimeTracker Pro</h1>
          </div>
          <div v-if="currentEmployee" class="flex items-center gap-4">
            <span class="text-gray-600">Welcome, {{ currentEmployee.name }}</span>
            <button @click="logout" class="btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Login Form -->
      <div v-if="!currentEmployee" class="max-w-md mx-auto">
        <div class="card">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Employee Login</h2>
            <p class="text-gray-600">Enter your employee ID and name to continue</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="employeeId" class="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                id="employeeId"
                v-model="loginForm.employeeId"
                type="text"
                required
                class="input-field"
                placeholder="Enter your employee ID"
              />
            </div>
            
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                v-model="loginForm.name"
                type="text"
                required
                class="input-field"
                placeholder="Enter your full name"
              />
            </div>
            
            <button type="submit" class="btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <!-- Status Card -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Clock Status</h2>
              <p class="text-gray-600 mt-1">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            </div>
            
            <div class="text-right">
              <div class="flex items-center gap-2 mb-1">
                <div :class="currentStatus === 'in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                     class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <div :class="currentStatus === 'in' ? 'bg-green-400' : 'bg-gray-400'" 
                       class="w-2 h-2 rounded-full mr-2"></div>
                  {{ currentStatus === 'in' ? 'Clocked In' : 'Clocked Out' }}
                </div>
              </div>
              <p v-if="currentStatus === 'in' && clockInTime" class="text-sm text-gray-600">
                Since {{ formatTime(clockInTime) }}
              </p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Clock In/Out Actions -->
            <div class="space-y-4">
              <button
                v-if="currentStatus === 'out'"
                @click="handleClockIn"
                class="btn-success w-full flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Clock In
              </button>
              
              <button
                v-else
                @click="handleClockOut"
                class="btn-warning w-full flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Clock Out
              </button>

              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900" id="current-time">{{ currentTime }}</p>
                <p class="text-sm text-gray-600">Current Time</p>
              </div>
            </div>

            <!-- Today's Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-3">Today's Summary</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Hours Worked:</span>
                  <span class="font-semibold">{{ formatHours(todayHours) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status:</span>
                  <span :class="currentStatus === 'in' ? 'text-green-600' : 'text-gray-600'" class="font-semibold">
                    {{ currentStatus === 'in' ? 'Working' : 'Off Duty' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Time Entries -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Recent Time Entries</h2>
            <button @click="showAllEntries = !showAllEntries" class="btn-secondary">
              {{ showAllEntries ? 'Show Less' : 'Show All' }}
            </button>
          </div>

          <div class="overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="entry in displayedEntries" :key="entry.id" class="hover:bg-gray-50 transition-colors duration-150">
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
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                      No time entries found. Clock in to get started!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { currentEmployee, login, logout, checkAuth } = useAuth()
const { 
  currentStatus, 
  clockInTime, 
  todayHours, 
  timeEntries,
  clockIn, 
  clockOut, 
  loadTimeEntries, 
  checkCurrentStatus,
  formatTime,
  formatHours
} = useTimeTracking()

const loginForm = reactive({
  employeeId: '',
  name: ''
})

const currentTime = ref('')
const showAllEntries = ref(false)

const displayedEntries = computed(() => {
  return showAllEntries.value ? timeEntries.value : timeEntries.value.slice(0, 5)
})

const handleLogin = () => {
  if (loginForm.employeeId && loginForm.name) {
    login(loginForm.employeeId, loginForm.name)
    loadTimeEntries(loginForm.employeeId)
    checkCurrentStatus(loginForm.employeeId)
  }
}

const handleClockIn = () => {
  if (currentEmployee.value) {
    clockIn(currentEmployee.value.id)
  }
}

const handleClockOut = () => {
  if (currentEmployee.value) {
    clockOut(currentEmployee.value.id)
  }
}

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  checkAuth()
  if (currentEmployee.value) {
    loadTimeEntries(currentEmployee.value.id)
    checkCurrentStatus(currentEmployee.value.id)
  }
  
  updateCurrentTime()
  setInterval(updateCurrentTime, 1000)
})

watch(currentEmployee, (newEmployee) => {
  if (newEmployee) {
    loadTimeEntries(newEmployee.id)
    checkCurrentStatus(newEmployee.id)
  }
})
</script>