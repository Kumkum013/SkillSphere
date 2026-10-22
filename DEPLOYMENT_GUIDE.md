# SkillSphere Deployment Guide / स्किलस्फियर डिप्लॉयमेंट गाइड

---

## 🚀 Deploying to Render / Render पर डिप्लॉय करना

### Prerequisites / पूर्वावश्यकताएं

1. **GitHub Repository** / गिटहब रिपॉजिटरी
   - Push your code to GitHub / अपना कोड गिटहब पर पुश करें
   - Repository: `https://github.com/Kumkum013/SkillSphere`

2. **MongoDB Atlas Account** / मोंगोडीब एटलस खाता
   - Free tier account / मुफ्त टियर खाता
   - Get connection string / कनेक्शन स्ट्रिंग प्राप्त करें

3. **Redis Cloud Account** (Optional) / रेडिस क्लाउड खाता (वैकल्पिक)
   - Free tier / मुफ्त टियर
   - Get connection string / कनेक्शन स्ट्रिंग प्राप्त करें

---

## 📋 Step-by-Step Deployment / चरण-दर-चरण डिप्लॉयमेंट

### Step 1: MongoDB Setup / मोंगोडीबी सेटअप

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up or login / साइन अप या लॉगिन करें
3. Create a free cluster / मुफ्त क्लस्टर बनाएं
4. Database Access:
   - Click "Database Access" / "Database Access" क्लिक करें
   - Add database user / डेटाबेस यूजर जोड़ें
   - Set username and password / यूजरनेम और पासवर्ड सेट करें
5. Network Access:
   - Click "Network Access" / "Network Access" क्लिक करें
   - Add IP: `0.0.0.0/0` (allows all IPs)
6. Get Connection String:
   - Click "Connect" / "Connect" क्लिक करें
   - Choose "Drivers" / "Drivers" चुनें
   - Select Node.js / Node.js चुनें
   - Copy connection string / कनेक्शन स्ट्रिंग कॉपी करें
   - Replace `<password>` with your password / `<password>` को अपने पासवर्ड से बदलें

**Example:** `mongodb+srv://username:password@cluster.mongodb.net/skillsphere`

---

### Step 2: Redis Setup (Optional) / रेडिस सेटअप (वैकल्पिक)

1. Go to: https://redis.com/
2. Sign up for free account / मुफ्त खाता बनाएं
3. Create a database / डेटाबेस बनाएं
4. Get connection string / कनेक्शन स्ट्रिंग प्राप्त करें

**Example:** `rediss://:password@host:port`

---

### Step 3: Deploy Backend on Render / बैकएंड रेंडर पर डिप्लॉय करें

1. Go to: https://render.com/
2. Login with GitHub / गिटहब से लॉगिन करें
3. Click "New +" → "Web Service" / "New +" → "Web Service" क्लिक करें
4. Connect GitHub:
   - Authorize Render to access your repo / रेंडर को रिपो एक्सेस दें
   - Select `Kumkum013/SkillSphere` repository
   - Branch: `main`
5. Service Details:
   - Name: `skillsphere-backend`
   - Region: `Singapore` (or nearest to you)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Environment Variables (Important!):
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
     ```
     NODE_ENV = production
     PORT = 5000
     MONGO_URI = [Your MongoDB connection string]
     REDIS_URL = [Your Redis connection string, if using]
     JWT_SECRET = [Generate a random secret key]
     SMTP_HOST = smtp.gmail.com
     SMTP_PORT = 587
     SMTP_SECURE = false
     SMTP_USER = [Your Gmail email]
     SMTP_PASS = [Your Gmail app password]
     MAIL_FROM = [Your Gmail email]
     FRONTEND_URL = https://skillsphere.onrender.com
     ```
7. Click "Create Web Service" / "Create Web Service" क्लिक करें
8. Wait for deployment / डिप्लॉयमेंट का इंतजार करें (5-10 minutes)
9. Copy the backend URL / बैकएंड URL कॉपी करें

---

### Step 4: Deploy Frontend on Render / फ्रंटएंड रेंडर पर डिप्लॉय करें

1. Click "New +" → "Web Service" / "New +" → "Web Service" क्लिक करें
2. Connect GitHub / गिटहब कनेक्ट करें
3. Select `Kumkum013/SkillSphere` repository
4. Service Details:
   - Name: `skillsphere-frontend`
   - Region: Same as backend
   - Branch: `main`
   - Root Directory: `frontend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm install -g serve && serve -s build -l 3000`
5. Environment Variables:
   - Add:
     ```
     VITE_API_URL = https://skillsphere-backend.onrender.com/api
     ```
6. Click "Create Web Service" / "Create Web Service" क्लिक करें
7. Wait for deployment / डिप्लॉयमेंट का इंतजार करें
8. Copy the frontend URL / फ्रंटएंड URL कॉपी करें

---

## 🔧 Alternative: Using render.yaml (Recommended) / विकल्प: render.yaml का उपयोग (अनुशंसित)

1. Push `render.yaml` to your repository / `render.yaml` को रिपो में पुश करें
2. In Render, click "New +" → "Blueprints" / "New +" → "Blueprints" क्लिक करें
3. Click "Existing Blueprint" / "Existing Blueprint" क्लिक करें
4. Select your repository / अपना रिपोजिटरी चुनें
5. Render will auto-detect `render.yaml` / रेंडर `render.yaml` को स्वत: पहचान करेगा
6. Review and deploy / समीक्षा करें और डिप्लॉय करें

---

## ⚙️ Environment Variables Configuration / पर्यावरण चर वर कॉन्फ़िगरेशन

### Required Variables / आवश्यक चर

**Backend / बैकएंड:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillsphere
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://skillsphere.onrender.com
```

**Optional / वैकल्पिक:**
```env
REDIS_URL=rediss://:password@host:port
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
```

**Frontend / फ्रंटएंड:**
```env
VITE_API_URL=https://skillsphere-backend.onrender.com/api
```

---

## 🧪 Testing After Deployment / डिप्लॉयमेंट के बाद परीक्षण

### 1. Test Backend / बैकएंड परीक्षण

1. Open browser / ब्राउज़र खोलें
2. Go to: `https://skillsphere-backend.onrender.com`
3. You should see: `SkillSphere API running` / "SkillSphere API running" दिखना चाहिए
4. Test API:
   ```bash
   curl https://skillsphere-backend.onrender.com/api
   ```

### 2. Test Frontend / फ्रंटएंड परीक्षण

1. Go to: `https://skillsphere.onrender.com`
2. You should see the login page / लॉगिन पेज दिखना चाहिए
3. Try to register / रजिस्टर करने की कोशिश करें
4. Check browser console for errors / ब्राउज़र कंसोल में त्रुटियां देखें

### 3. Test API Connection / API कनेक्शन परीक्षण

1. Register a user / यूजर रजिस्टर करें
2. Login / लॉगिन करें
3. Create a project / प्रोजेक्ट बनाएं
4. If any errors, check Render logs / त्रुटियां हों तो रेंडर लॉग्स देखें

---

## 🐛 Troubleshooting Render Deployment / रेंडर डिप्लॉयमेंट समस्या समाधान

### Issue 1: Build Failed - "package.json not found" / बिल्ड विफल - "package.json नहीं मिला"

**Solution / समाधान:**
- Make sure Root Directory is set correctly / रूट डायरेक्टरी सही सेट हो
- Frontend: Root Directory = `frontend`
- Backend: Root Directory = `backend`

### Issue 2: MongoDB Connection Failed / मोंगोडीबी कनेक्शन विफल

**Solution / समाधान:**
- Check MongoDB Atlas Network Access / मोंगोडीब एटलस नेटवर्क एक्सेस चेक करें
- Add `0.0.0.0/0` to allow all IPs / सभी IPs की अनुमति के लिए `0.0.0.0/0` जोड़ें
- Verify MONGO_URI is correct / MONGO_URI सही सत्यापित करें
- Check password in connection string / कनेक्शन स्ट्रिंग में पासवर्ड चेक करें

### Issue 3: Frontend Can't Connect to Backend / फ्रंटएंड बैकएंड से कनेक्ट नहीं हो पा रहा

**Solution / समाधान:**
- Check VITE_API_URL / VITE_API_URL चेक करें
- Should be: `https://skillsphere-backend.onrender.com/api`
- Make sure backend is deployed and running / बैकएंड डिप्लॉय है और चल रहा है सत्यापित करें
- Check CORS configuration / CORS कॉन्फ़िगरेशन चेक करें

### Issue 4: Email Not Working / ईमेल काम नहीं कर रहा

**Solution / समाधान:**
- Verify SMTP credentials / SMTP क्रेडेंशियल्स सत्यापित करें
- Use Gmail App Password / गमेल ऐप पासवर्ड का उपयोग करें
- Enable 2FA on Gmail / गमेल पर 2FA सक्षम करें
- Check Render logs for errors / त्रुटियों के लिए रेंडर लॉग्स देखें

### Issue 5: Page Not Loading / पेज लोड नहीं हो रहा

**Solution / समाधान:**
- Check Render logs / रेंडर लॉग्स देखें
- Check browser console / ब्राउज़र कंसोल देखें
- Verify build succeeded / बिल्ड सफल हुई सत्यापित करें
- Clear browser cache / ब्राउज़र कैश साफ़ करें

---

## 📊 Monitoring / निगरानी

### View Logs / लॉग्स देखें

1. Go to Render dashboard / रेंडर डैशबोर्ड पर जाएं
2. Click on your service / अपनी सर्विस पर क्लिक करें
3. Click "Logs" / "Logs" क्लिक करें
4. View real-time logs / रियल-टाइम लॉग्स देखें

### Check Metrics / मेट्रिक्स देखें

1. Click "Metrics" / "Metrics" क्लिक करें
2. View CPU, Memory, Response Time / CPU, मेमोरी, रिस्पांस टाइम देखें
3. Set up alerts if needed / जरूरत हो तो अलर्ट सेट करें

---

## 💰 Cost Optimization / लागत अनुकूलन

### Free Tier Limits / मुफ्त टियर सीमा

**Render Free Web Services:**
- 750 hours/month per service / प्रति सर्विस 750 घंटे/माह
- Enough for hobby projects / हॉबी प्रोजेक्ट्स के लिए पर्याप्त
- Sleeps after 15 min inactivity / 15 मिनट निष्क्रियता के बाद सो जाता है

**MongoDB Atlas Free:**
- 512 MB storage / 512 MB स्टोरेज
- Enough for development / विकास के लिए पर्याप्त

**To Reduce Costs / लागत कम करने के लिए:**
- Use only when needed / जब जरूरत हो तो ही उपयोग करें
- Sleep services when not in use / उपयोग में न होने पर सर्विस सो करें
- Optimize database queries / डेटाबेस क्वेरीज़ अनुकूलित करें

---

## 🔄 CI/CD Setup (Optional) / सीआई/सीडी सेटअप (वैकल्पिक)

To automate deployments, set up GitHub Actions:

1. Create `.github/workflows/deploy.yml` / `.github/workflows/deploy.yml` बनाएं
2. Add deploy pipeline / डिप्लॉय पाइपलाइन जोड़ें
3. Auto-deploy on push to main / मेन पर पुश पर स्वत: डिप्लॉय

---

## 🎉 Deployment Checklist / डिप्लॉयमेंट चेकलिस्ट

Before deploying, ensure / डिप्लॉय करने से पहले सुनिश्चित करें:

- [ ] Code pushed to GitHub / कोड गिटहब पर पुश किया
- [ ] MongoDB Atlas configured / मोंगोडीब एटलस कॉन्फ़िगर किया
- [ ] Redis configured (optional) / रेडिस कॉन्फ़िगर किया (वैकल्पिक)
- [ ] Environment variables ready / पर्यावरण चर तैयार
- [ ] render.yaml in repo / render.yaml रिपो में है
- [ ] No hardcoded secrets / हार्डकोडेड सीक्रेट्स नहीं
- [ ] Frontend API URL correct / फ्रंटएंड API URL सही है
- [ ] Backend PORT set to 5000 / बैकएंड PORT 5000 पर सेट है

---

## 📞 Getting Help / सहायता

### Render Documentation / रेंडर दस्तावेज़
- https://render.com/docs
- https://render.com/docs/deploy-nodejs

### Common Issues / सामान्य समस्याएं
- https://render.com/docs/troubleshooting-deploys

---

## 🚀 Quick Deploy Commands / त्वरित डिप्लॉय कमांड्स

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# Deploy manually via Render UI
# Follow steps above
```

---

**Good luck with deployment! / डिप्लॉयमेंट के लिए शुभकामनाएं!** 🎉
