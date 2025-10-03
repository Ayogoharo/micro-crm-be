# Getting Started with Postman Collection

This is a quick start guide to get you testing the Micro CRM API

## Step 1: Import into Postman

### If you have Postman Desktop App:

1. **Open Postman**
2. Click **"Import"** button (top left corner)
3. **Drag and drop** these two files:
   - `Micro-CRM-Backend.postman_collection.json`
   - `Micro-CRM-Backend.postman_environment.json`

   OR click **"Upload Files"** and select both files

4. You should see:
   - ✅ Collection: "Micro CRM Backend" in the left sidebar
   - ✅ Environment: "Micro CRM Backend - Local" in the environment dropdown (top right)

### If you don't have Postman:

Download it from: https://www.postman.com/downloads/

## Step 2: Select Environment

1. Look at the **top right corner** of Postman
2. Find the environment dropdown (should say "No Environment")
3. Click it and select **"Micro CRM Backend - Local"**
4. You should see a checkmark next to it

## Step 3: Start Your Backend Server

Before testing, make sure your backend is running:

```bash
# In your terminal, from the project root:
cd /path/to/micro-crm-be

# Start the database (if not already running)
docker compose up -d

# Start the development server
npm run start:dev
```

Wait until you see:

```
[NestApplication] Nest application successfully started
```

## Step 4: Test the Authentication Flow

Now you're ready to test! Follow this order:

### 4.1 Register a New User

1. In Postman, expand **"Micro CRM Backend"** collection
2. Expand **"Authentication"** folder
3. Click **"Register New User"**
4. Click the blue **"Send"** button

**Expected Result:**

- Status: `201 Created`
- Response contains user data (id, email, plan)
- Console logs: "✅ User registered successfully"

**If you get 409 Conflict:**

- The test email already exists
- Either use "Login" instead OR
- Change the email in environment variables (see below)

### 4.2 Login

1. Click **"Login"** request
2. Click **"Send"**

**Expected Result:**

- Status: `200 OK`
- Response contains `access_token` and user data
- Console logs: "✅ Login successful" and "Token saved to environment"
- **Magic:** The JWT token is automatically saved for you! 🎉

### 4.3 Test Protected Endpoint

1. Click **"Get Profile (Protected)"** request
2. Notice the **Authorization** tab already has `Bearer {{access_token}}`
3. Click **"Send"**

**Expected Result:**

- Status: `200 OK`
- Response shows your userId and email
- **No manual token copying needed!** 🚀

## Step 5: Understanding Automatic Authentication

The collection is smart! Here's what happens automatically:

1. **After Login/Register:**
   - JWT token → Saved to `access_token` environment variable
   - User ID → Saved to `user_id`
   - Email → Saved to `user_email`
   - Plan → Saved to `user_plan`

2. **Protected Requests:**
   - Automatically use `{{access_token}}` in Authorization header
   - No copying/pasting needed!

3. **Console Logging:**
   - Open Postman Console (View → Show Postman Console)
   - See helpful logs for each request

## Customizing Test Data

Want to test with different users?

1. Click the **environment dropdown** (top right)
2. Click the **eye icon** 👁️ next to "Micro CRM Backend - Local"
3. Edit values:
   - `test_email` → Change to your email
   - `test_password` → Change to your password
4. Save changes
5. Run "Register New User" again

**Example:**

```
test_email: "alice@example.com"
test_password: "alicepass123"
```

## Viewing Saved Variables

To see the saved JWT token and user data:

1. Click **environment dropdown** (top right)
2. Click **eye icon** 👁️
3. You'll see all variables including:
   - `access_token` (your JWT - marked as secret)
   - `user_id` (your user UUID)
   - `user_email` (your email)
   - `user_plan` (FREE or PRO)

## Common Issues & Solutions

### ❌ "Could not send request" / Connection Error

**Problem:** Backend server isn't running

**Solution:**

```bash
# In terminal:
npm run start:dev

# Wait for: "Nest application successfully started"
```

### ❌ 409 Conflict on Register

**Problem:** Email already registered

**Solution:**

- Use "Login" instead, OR
- Change `test_email` in environment variables

### ❌ 401 Unauthorized on Profile

**Problem:** No token or expired token

**Solution:**

1. Run "Login" request again
2. Check console for "Token saved to environment"
3. Verify `access_token` is set in environment variables

### ❌ Tests not showing in Console

**Problem:** Postman Console not open

**Solution:**

- View → Show Postman Console (or Alt+Ctrl+C / Cmd+Alt+C)

## Next Steps

Once you're comfortable with the basic flow:

1. **Try Invalid Credentials:**
   - Change `test_password` to wrong value
   - Run "Login" → Should get 401

2. **Test Validation:**
   - Change `test_email` to "notanemail"
   - Run "Register" → Should get 400 with validation errors

3. **Explore Tests:**
   - Click "Tests" tab in any request
   - See the JavaScript code that auto-saves tokens

4. **Run Collection:**
   - Click "..." next to collection name
   - Select "Run collection"
   - Tests all endpoints in sequence

## Video Tutorial (Recommended)

Never used Postman before? Watch this 3-minute video:
https://www.youtube.com/watch?v=VywxIQ2ZXw4

## Need More Help?

- Read the full guide: [README.md](README.md)
- Check API documentation: [../AUTHENTICATION_SUMMARY.md](../AUTHENTICATION_SUMMARY.md)
- View roadmap: `docs/roadmap.md`

---

**Happy Testing! 🎉**

If you run into issues, check the Postman Console (View → Show Postman Console) for detailed logs.
