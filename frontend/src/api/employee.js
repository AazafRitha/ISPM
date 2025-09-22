// Author: Aazaf Ritha
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const employeeApi = {
  async list() {
    const res = await fetch(`${BASE}/employees`, {
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to load employees");
    const data = await res.json();
    return data;
  },

  async getOne(id) {
    const res = await fetch(`${BASE}/employees/${id}`, { 
      headers: { ...authHeader() } 
    });
    if (!res.ok) throw new Error("Failed to load employee");
    const data = await res.json();
    return data;
  },

  async getCurrentEmployee() {
    // Get current employee from localStorage or API
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      return JSON.parse(employeeData);
    }
    
    // If no employee in localStorage, try to get from API
    // This would need to be implemented based on your auth system
    throw new Error("No employee data found");
  },

  async getEmployeeProgress(employeeId) {
    // This would fetch employee progress data from the backend
    // For now, return mock data
    return {
      overall: 75,
      modulesCompleted: 8,
      totalModules: 12,
      securityScore: 85
    };
  },

  async getEmployeeAchievements(employeeId) {
    // This would fetch employee achievements from the backend
    // For now, return mock data
    return [
      {
        id: 1,
        title: 'Security Champion',
        description: 'Complete 10 security training modules',
        earned: true,
        earnedDate: '2024-01-10',
        icon: '🛡️'
      },
      {
        id: 2,
        title: 'Quiz Master',
        description: 'Score 90% or higher on 5 assessments',
        earned: true,
        earnedDate: '2024-01-05',
        icon: '🏆'
      },
      {
        id: 3,
        title: 'Policy Expert',
        description: 'Read all company security policies',
        earned: false,
        earnedDate: null,
        icon: '📋'
      }
    ];
  },
  
  async update(id, { employeeID, name, email, nic, address, password, department, photo }) {
    const form = new FormData();
    if (employeeID !== undefined) form.append('employeeID', employeeID);
    if (name !== undefined) form.append('name', name);
    if (email !== undefined) form.append('email', email);
    if (nic !== undefined) form.append('nic', nic);
    if (address !== undefined) form.append('address', address);
    if (password !== undefined) form.append('password', password);
    if (department !== undefined) form.append('department', department);
    if (photo instanceof File) form.append('photo', photo);

    const res = await fetch(`${BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { ...authHeader() },
      body: form
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
