require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createTestProject() {
  try {
    // Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'kumari.2403474201@vcet.edu.in',
      password: '123456'
    });
    const token = loginRes.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Get client
    const clientsRes = await axios.get(`${API_BASE}/clients`, { headers });
    const client = clientsRes.data.clients[0];

    // Create project
    const projectRes = await axios.post(`${API_BASE}/projects`, {
      title: 'Test Commercial Project',
      description: 'A test project for professional features',
      requiredSkills: [
        { skillName: 'JavaScript', weight: 3 },
        { skillName: 'React', weight: 2 }
      ],
      minMatchScore: 50,
      budget: 100000,
      actualCost: 0,
      billingRate: 150,
      invoiceStatus: 'NOT_BILLED',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      estimatedHours: 200,
      actualHours: 0,
      projectType: 'COMMERCIAL',
      clientId: client._id,
      milestones: [
        {
          title: 'Planning Phase',
          description: 'Requirements gathering and planning',
          dueDate: '2024-03-31',
          status: 'PENDING'
        },
        {
          title: 'Development Phase',
          description: 'Core development work',
          dueDate: '2024-09-30',
          status: 'PENDING'
        },
        {
          title: 'Testing & Deployment',
          description: 'Testing and deployment to production',
          dueDate: '2024-12-15',
          status: 'PENDING'
        }
      ]
    }, { headers });

    console.log('✅ Test project created successfully');
    console.log('Project ID:', projectRes.data.project._id);
    console.log('Project:', projectRes.data.project.title);
  } catch (error) {
    console.error('❌ Failed to create test project:', error.response?.data || error.message);
  }
}

createTestProject();
