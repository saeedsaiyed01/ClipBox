# Redis Cloud Setup - Complete Step-by-Step Guide

## 🎯 What You'll Accomplish
By the end of this guide, you'll have:
- Redis Cloud free account
- Production-ready Redis database
- Connection details for your Clipbox backend
- Tested connection to ensure it works

---

## 🔐 Step 1: Create Redis Cloud Account (3 minutes)

### 1.1 Navigate to Redis Cloud
1. Open your web browser
2. Go to: **https://redis.com/try-free/**
3. You'll see the Redis Cloud Free Tier signup page

### 1.2 Choose Sign-Up Method
Choose one of these options:

**Option A: GitHub Signup**
1. Click **"Continue with GitHub"** button
2. You'll be redirected to GitHub
3. Click **"Authorize redisinc"** to grant access
4. You'll be redirected back to Redis Cloud

**Option B: Google Signup**
1. Click **"Continue with Google"** button
2. Choose your Google account
3. Grant permissions if prompted

**Option C: Email Signup**
1. Fill in your details:
   - **Email**: Your email address
   - **Password**: Strong password (8+ characters, mixed case, numbers)
   - **Company**: Optional
2. Click **"Create Account"**
3. Check your email for verification link
4. Click the verification link

### 1.3 Complete Account Setup
After signup, you'll be asked to:
1. **Choose your use case**: Select "**Development**"
2. **Team setup**: You can skip or add team members later
3. **Phone verification**: May be required for some regions

---

## 🗄️ Step 2: Create Your Redis Database (5 minutes)

### 2.1 Access Database Creation
1. From the Redis Cloud dashboard, click **"New Database"**
2. You'll see the database configuration screen

### 2.2 Choose Database Configuration

**Select Deployment Type:**
- Choose **"Fixed plans"** (Free tier)
- Select **"30MB"** memory (more than enough for Clipbox)

**Database Settings:**
```
Database Name: clipbox-production
Redis Version: 6.x (latest stable)
Memory: 30MB
Dataset size: 30MB (same as memory)
```

### 2.3 Configure Advanced Options

**Location Settings:**
1. **Cloud Provider**: Choose the closest region to your users
   - **Recommended**: AWS us-east-1 (US East)
   - Alternative: AWS eu-west-1 (Europe)
   - Alternative: AWS ap-southeast-1 (Asia Pacific)

**Database Options:**
- **Persistence**: Keep default (RDB snapshotting is fine)
- **Eviction Policy**: Keep default
- **Replica Count**: Keep default (1 replica for free tier)

### 2.4 Finalize Database Creation
1. Review your configuration
2. Click **"Create Database"** button
3. Wait 1-2 minutes for database to be provisioned

---

## 🔑 Step 3: Configure Database Security (3 minutes)

### 3.1 Access Security Settings
1. Click on your newly created database
2. Navigate to **"Security"** tab in the left sidebar
3. You'll see security configuration options

### 3.2 Set Up Authentication
1. **Enable Authentication**: Toggle ON
2. **Default User**: Keep enabled (recommended)
3. **Create Password**: Click **"Generate"** or enter your own

**Password Requirements:**
- Minimum 8 characters
- Include uppercase, lowercase, numbers, and symbols
- Example: `Clipbox2024!Secure`

### 3.3 Configure Access Control
1. **Allowed IP Ranges**: 
   - For now, keep **"0.0.0.0/0"** (allows all IPs)
   - **Note**: For production, you'll restrict this to your app's IPs

2. **TLS/SSL**: 
   - Keep **"Require TLS"** disabled for now (easier for development)
   - Enable later when going to production

### 3.4 Save Security Settings
1. Click **"Apply"** or **"Save"** button
2. Wait for confirmation that settings are applied

---

## 📋 Step 4: Get Connection Details (2 minutes)

### 4.1 Locate Connection Information
1. Go back to **"Overview"** tab of your database
2. Scroll down to **"Connection"** section
3. You'll see your connection details

### 4.2 Record Your Connection Details

**Copy these values exactly:**

**Public Endpoint:**
```
redis-[numbers].c[region].cloud1.redislabs.com
Example: redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
```

**Port:**
```
[4-5 digit number]
Example: 12345
```

**Redis CLI Command:**
```
redis-cli -h redis-12345.c12345.c0001.us1-1.rl.rlcloud.net -p 12345 -a YOUR_PASSWORD
```

### 4.3 Alternative: Use Direct URLs

**Redis Cloud provides these formats:**

**Connection String:**
```
redis://default:YOUR_PASSWORD@redis-12345.c12345.c0001.us1-1.rl.rlcloud.net:12345
```

**Node.js Connection URL:**
```javascript
const redisUrl = "redis://default:YOUR_PASSWORD@redis-12345.c12345.c0001.us1-1.rl.rlcloud.net:12345";
```

---

## 🧪 Step 5: Test Your Connection (3 minutes)

### 5.1 Test with Redis CLI (Recommended)
Open your terminal/command prompt and run:

```bash
redis-cli -h redis-12345.c12345.c0001.us1-1.rl.rlcloud.net -p 12345 -a YOUR_PASSWORD

# Once connected, test with:
ping
# Should return: PONG

# Test setting/getting a key:
set test "Clipbox works!"
get test
# Should return: "Clipbox works!"

exit
```

### 5.2 Test with Online Redis CLI
1. Go back to Redis Cloud dashboard
2. Click **"Redis CLI"** button
3. Enter your password when prompted
4. Run the same test commands as above

### 5.3 Test Node.js Connection
Create a quick test file `test-redis.js`:

```javascript
const { createClient } = require('redis');

const client = createClient({
  url: 'redis://default:YOUR_PASSWORD@redis-12345.c12345.c0001.us1-1.rl.rlcloud.net:12345'
});

client.connect();

client.set('test', 'Redis Cloud connection works!')
  .then(() => client.get('test'))
  .then((result) => {
    console.log('Redis result:', result);
    client.quit();
  })
  .catch(console.error);
```

Run with:
```bash
npm install redis
node test-redis.js
```

---

## 📝 Step 6: Prepare for Deployment

### 6.1 Save Your Environment Variables

Create this `.env` file for your Clipbox backend:

```bash
# Redis Cloud Connection Details
REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password_here

# Test Connection
REDIS_URL=redis://default:your_secure_password_here@redis-12345.c12345.c0001.us1-1.rl.rlcloud.net:12345
```

### 6.2 Test with Your Clipbox Code

Update your local Clipbox backend `.env` file:

```bash
# Test with your actual Clipbox backend
REDIS_HOST=redis-12345.c12345.c0001.us1-1.rl.rlcloud.net
REDIS_PORT=12345
REDIS_PASSWORD=your_secure_password_here
PORT=4000
NODE_ENV=development
```

Run your backend locally to test:

```bash
cd clipbox-backend
npm run dev

# In another terminal, check if Redis connection works:
redis-cli -h redis-12345.c12345.c0001.us1-1.rl.rlcloud.net -p 12345 -a your_password ping
# Should return: PONG
```

---

## 🛠️ Troubleshooting Common Issues

### Issue: "Connection refused"
**Solutions:**
1. Check that your database is **active** (not paused)
2. Verify the host and port are correct
3. Ensure your IP is allowed (0.0.0.0/0 allows all)

### Issue: "Authentication failed"
**Solutions:**
1. Double-check your password is correct
2. Make sure authentication is enabled
3. Try generating a new password

### Issue: "Database not found"
**Solutions:**
1. Refresh your Redis Cloud dashboard
2. Check that database creation completed successfully
3. Verify you're looking at the correct database

### Issue: "Timeout connecting"
**Solutions:**
1. Check your internet connection
2. Try a different cloud region
3. Wait 5-10 minutes (sometimes provisioning takes time)

---

## 📊 What Your Free Tier Includes

**Free Tier Limits:**
- **Memory**: 30MB
- **Connections**: 30 concurrent connections
- **Data Persistence**: Daily snapshots
- **Uptime**: 99.5% SLA
- **Regions**: 6 AWS regions available

**Perfect for Clipbox because:**
- Your app processes videos one at a time
- 30MB is more than enough for job queues
- 30 connections handle multiple concurrent users
- Free tier is perfect for development and small-scale production

---

## 🔒 Security Best Practices

### For Development (Current Setup):
1. ✅ Use default user
2. ✅ Strong password
3. ✅ Allow all IPs (0.0.0.0/0)

### For Production (Later):
1. 🔄 Create dedicated database user with limited permissions
2. 🔄 Restrict IP ranges to your Railway app's IPs only
3. 🔄 Enable TLS/SSL encryption
4. 🔄 Set up connection rate limiting
5. 🔄 Enable audit logging

---

## ✅ Completion Checklist

- [ ] Redis Cloud account created
- [ ] Database created with 30MB memory
- [ ] Authentication enabled with strong password
- [ ] Connection details recorded (host, port, password)
- [ ] Connection tested successfully (PONG response)
- [ ] Environment variables prepared for deployment
- [ ] Local Clipbox backend tested with Redis Cloud

---

## 🎉 You're Ready for Deployment!

**Your Redis Cloud Setup is Complete!**

You now have:
- ✅ Production-ready Redis database
- ✅ Secure connection with authentication
- ✅ Connection details for Railway deployment
- ✅ Tested and working connection

**Next Step**: Move to Railway deployment (Phase 3 in STEP_BY_STEP_DEPLOYMENT.md)

---

## 📞 Support Resources

**Redis Cloud Documentation:**
- General docs: https://redis.io/docs/latest/
- Connection guides: https://redis.io/docs/latest/operate/rc/api/api-reference/

**Getting Help:**
- Redis Cloud Support: Available through dashboard
- Community Discord: https://discord.gg/redis
- Stack Overflow: Tag your questions with "redis-cloud"

**Common Commands Reference:**
```bash
# Test connection
redis-cli -h redis-xxx -p xxx -a YOUR_PASSWORD ping

# Check database info
redis-cli -h redis-xxx -p xxx -a YOUR_PASSWORD info

# Monitor in real-time
redis-cli -h redis-xxx -p xxx -a YOUR_PASSWORD monitor