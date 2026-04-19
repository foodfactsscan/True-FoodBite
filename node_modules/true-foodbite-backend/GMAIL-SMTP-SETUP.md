# 📧 Professional Email Setup Guide (Gmail SMTP)

To enable **real emails** for your True FoodBite application (Signup OTP, Password Resets, etc.), follow these professional steps:

### ⚡ STEP 1: Secure Your Google Account
1. Go to your **[Google Account Settings](https://myaccount.google.com/)**.
2. Navigate to **Security** (left sidebar).
3. Ensure **2-Step Verification** is turned **ON**. (Google requires this for apps).

### ⚡ STEP 2: Create an "App Password"
*Note: Your regular Gmail password will NOT work for security reasons.*

1. In the search bar at the top of your Google Account, type **"App Passwords"**.
2. Select **App Passwords**.
3. For **App Name**, type: `True FoodBite Product`.
4. Click **Create**.
5. **CRITICAL:** Copy the 16-character code (e.g., `xxxx xxxx xxxx xxxx`) that appears in the yellow box. This is your professional SMTP key.

### ⚡ STEP 3: Update Your Backend Configuration
1. Open the file `backend/.env`.
2. Find the SMTP lines and fill them in:

```env
# Use your full Gmail address
SMTP_USER=your-email@gmail.com

# PASTE the 16-character code here (no spaces needed)
SMTP_PASS=xxxxxxxxxxxxxxxx
```

---
> [!TIP]
> **Production Tip:** For high-volume professional apps (10,000+ emails/day), we recommend using **SendGrid** or **Amazon SES**, but for your current growth phase, **Gmail SMTP** is the top-tier free choice!
