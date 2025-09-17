export const useAuth = () => {
  const currentEmployee = ref<any>(null)

  const login = (employeeId: string, name: string) => {
    const employee = {
      id: employeeId,
      name: name,
      loginTime: new Date().toISOString()
    }
    
    if (process.client) {
      localStorage.setItem('currentEmployee', JSON.stringify(employee))
    }
    currentEmployee.value = employee
  }

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('currentEmployee')
    }
    currentEmployee.value = null
  }

  const checkAuth = () => {
    if (process.client) {
      const stored = localStorage.getItem('currentEmployee')
      if (stored) {
        currentEmployee.value = JSON.parse(stored)
      }
    }
  }

  return {
    currentEmployee: readonly(currentEmployee),
    login,
    logout,
    checkAuth
  }
}