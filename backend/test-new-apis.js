require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@test.com',
  password: 'test123',
  name: 'Test User',
  role: 'FACULTY'
};

let authToken = '';

async function testAPI() {
  console.log('=== Testing SkillSphere Professional Features ===\n');

  try {
    // 1. Test Login to get token
    console.log('1. Testing Login...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'kumari.2403474201@vcet.edu.in',
      password: '123456'
    });
    authToken = loginRes.data.token;
    console.log('✅ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${authToken}`
    };

    // 2. Test Client Management
    console.log('2. Testing Client Management...');
    
    // Try to create client (may fail if exists)
    try {
      const clientRes = await axios.post(`${API_BASE}/clients`, {
        name: 'Test Company Inc',
        email: 'contact@testcompany.com',
        phone: '+1234567890',
        company: 'Test Company Inc',
        industry: 'Technology',
        website: 'https://testcompany.com',
        contactPerson: {
          name: 'John Doe',
          email: 'john@testcompany.com',
          phone: '+1234567890'
        },
        notes: 'Test client for professional features',
        status: 'ACTIVE'
      }, { headers });
      console.log('✅ Client created:', clientRes.data.client.name);
    } catch (err) {
      console.log('⚠️  Client already exists, using existing data');
    }

    // Get clients
    const clientsRes = await axios.get(`${API_BASE}/clients`, { headers });
    console.log('✅ Fetched clients:', clientsRes.data.clients.length);

    // Get specific client
    const client = clientsRes.data.clients[0];
    const clientDetailRes = await axios.get(`${API_BASE}/clients/${client._id}`, { headers });
    console.log('✅ Client details fetched\n');

    // 3. Test Time Tracking
    console.log('3. Testing Time Tracking...');
    
    // Get projects first
    const projectsRes = await axios.get(`${API_BASE}/projects?scope=my`, { headers });
    if (projectsRes.data.projects.length > 0) {
      const project = projectsRes.data.projects[0];
      
      // Start time entry
      const timeEntryRes = await axios.post(`${API_BASE}/time-entries`, {
        projectId: project._id,
        description: 'Testing time tracking feature',
        isBillable: true
      }, { headers });
      console.log('✅ Time entry started:', timeEntryRes.data.timeEntry._id);

      // Get time entries
      const timeEntriesRes = await axios.get(`${API_BASE}/time-entries`, { headers });
      console.log('✅ Time entries fetched:', timeEntriesRes.data.timeEntries.length);

      // Stop the running entry
      if (timeEntryRes.data.timeEntry.status === 'RUNNING') {
        await axios.post(`${API_BASE}/time-entries/${timeEntryRes.data.timeEntry._id}/stop`, {}, { headers });
        console.log('✅ Time entry stopped\n');
      }
    } else {
      console.log('⚠️  No projects found for time tracking test\n');
    }

    // 4. Test Project Financials
    console.log('4. Testing Project Financials...');
    
    if (projectsRes.data.projects.length > 0) {
      const project = projectsRes.data.projects[0];
      
      // Update project with financial data
      const updateRes = await axios.put(`${API_BASE}/projects/${project._id}`, {
        budget: 50000,
        actualCost: 25000,
        billingRate: 100,
        invoiceStatus: 'PARTIALLY_BILLED',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        estimatedHours: 100,
        actualHours: 50,
        projectType: 'COMMERCIAL',
        milestones: [
          {
            title: 'Phase 1: Planning',
            description: 'Initial planning and requirements gathering',
            dueDate: '2024-03-31',
            status: 'COMPLETED'
          },
          {
            title: 'Phase 2: Development',
            description: 'Core development phase',
            dueDate: '2024-06-30',
            status: 'IN_PROGRESS'
          }
        ]
      }, { headers });
      console.log('✅ Project financials updated\n');
    }

    console.log('=== All API Tests Passed ===');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
