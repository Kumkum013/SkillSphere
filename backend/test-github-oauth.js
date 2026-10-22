require('dotenv').config();

console.log('=== GitHub OAuth Configuration Check ===\n');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GITHUB_CALLBACK_URL:', process.env.GITHUB_CALLBACK_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

console.log('\n=== Required GitHub OAuth App Settings ===');
console.log('1. Go to: https://github.com/settings/developers');
console.log('2. Select your OAuth App or create a new one');
console.log('3. Application name: SkillSphere');
console.log('4. Homepage URL: http://localhost:5173');
console.log('5. Authorization callback URL: http://localhost:5000/api/auth/github/callback');
console.log('6. Make sure to check "Web application" as the application type');

console.log('\n=== Important Notes ===');
console.log('- Make sure your GitHub profile has a public email');
console.log('- The callback URL must match exactly (no trailing slashes)');
console.log('- Client ID and Secret must be correct');

console.log('\n=== Testing GitHub OAuth Flow ===');
console.log('1. Click "Sign In with GitHub" on the login page');
console.log('2. You should be redirected to GitHub');
console.log('3. Authorize the application');
console.log('4. You should be redirected back to the app');
console.log('5. Check the backend logs for any errors');

console.log('\n=== Common Issues ===');
console.log('1. "redirect_uri_mismatch": Callback URL in GitHub settings doesn\'t match');
console.log('2. "Bad credentials": Client ID or Secret is incorrect');
console.log('3. "Email not provided": GitHub profile email is not public');
console.log('4. "Access denied": User denied authorization');
