require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testMilestoneAPI() {
  try {
    // Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'kumari.2403474201@vcet.edu.in',
      password: '123456'
    });
    const token = loginRes.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Get projects
    const projectsRes = await axios.get(`${API_BASE}/projects?scope=my`, { headers });
    const project = projectsRes.data.projects[0];

    console.log('Testing Milestone API...\n');

    // Add milestone
    const addRes = await axios.post(`${API_BASE}/projects/${project._id}/milestones`, {
      title: 'Test Milestone',
      description: 'Testing milestone functionality',
      dueDate: '2024-12-31'
    }, { headers });
    console.log('✅ Milestone added');
    console.log('Milestones count:', addRes.data.project.milestones.length);

    // Update milestone
    const milestoneIndex = addRes.data.project.milestones.length - 1;
    const updateRes = await axios.put(`${API_BASE}/projects/${project._id}/milestones/${milestoneIndex}`, {
      status: 'COMPLETED'
    }, { headers });
    console.log('✅ Milestone updated to COMPLETED');

    // Delete milestone
    const deleteRes = await axios.delete(`${API_BASE}/projects/${project._id}/milestones/${milestoneIndex}`, { headers });
    console.log('✅ Milestone deleted');
    console.log('Milestones count after delete:', deleteRes.data.project.milestones.length);

    console.log('\n=== All Milestone API Tests Passed ===');
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

testMilestoneAPI();
