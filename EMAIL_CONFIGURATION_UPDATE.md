# 📧 Email Configuration Updated - GoDaddy SMTP

## ✅ What Was Changed

The contact form email system has been updated to use your professional **GoDaddy email server** instead of Gmail.

### **Previous Configuration:**
- **From:** Gmail (shreyanshumaske1966@gmail.com)
- **To:** inquiry@hsglobalexport.com
- **Server:** smtp.gmail.com

### **New Configuration:**
- **From:** contact@hsglobalexport.com
- **To:** inquiry@hsglobalexport.com (for admin notifications)
- **To:** Customer's email (for confirmation)
- **Server:** sg2plzcpnl509436.prod.sin2.secureserver.net (GoDaddy)

---

## 🔧 Files Modified

### 1. **Backend Environment File** (`backend/.env`)

```bash
# SMTP Email Configuration (GoDaddy)
# Using contact@hsglobalexport.com to send emails
SMTP_HOST=sg2plzcpnl509436.prod.sin2.secureserver.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@hsglobalexport.com
SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE  # ⚠️ YOU NEED TO UPDATE THIS!

# Email addresses
EMAIL_FROM=contact@hsglobalexport.com
EMAIL_TO=inquiry@hsglobalexport.com
```

### 2. **Email Service** (`backend/services/emailService.js`)

Updated the `createTransporter()` function to:
- Support both `SMTP_*` and `EMAIL_*` environment variables
- Automatically detect GoDaddy vs Gmail configuration
- Use secure SSL connection on port 465

---

## ⚠️ **ACTION REQUIRED**

You **MUST** update the password in the `.env` file:

1. Open `backend/.env`
2. Find line with `SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE`
3. Replace `YOUR_EMAIL_PASSWORD_HERE` with the actual password for `contact@hsglobalexport.com`
4. Save the file
5. Restart the backend server

**Example:**
```bash
SMTP_PASS=your_actual_password_here
```

---

## 📧 How It Works Now

### **When a customer submits the contact form:**

1. **Customer Receives Confirmation Email:**
   - **From:** contact@hsglobalexport.com
   - **To:** customer@example.com
   - **Subject:** "Thank you for contacting HS Global Export"
   - **Content:** Professional confirmation with inquiry summary

2. **Admin Receives Notification Email:**
   - **From:** contact@hsglobalexport.com
   - **To:** inquiry@hsglobalexport.com
   - **Reply-To:** customer@example.com (for easy replies)
   - **Subject:** "New Contact Form Submission: [Subject]"
   - **Content:** Full inquiry details with reference image (if provided)

3. **Database Storage:**
   - All inquiries saved to MongoDB
   - Accessible via admin panel at `/admin`

---

## 🔐 GoDaddy Email Server Settings

**Server Configuration:**
- **Incoming Server:** sg2plzcpnl509436.prod.sin2.secureserver.net
- **IMAP Port:** 993
- **POP3 Port:** 995
- **Outgoing Server:** sg2plzcpnl509436.prod.sin2.secureserver.net
- **SMTP Port:** 465 (SSL/TLS)
- **Username:** contact@hsglobalexport.com
- **Authentication:** Required

---

## 🧪 Testing

After updating the password and restarting the server:

1. **Go to:** http://localhost:5173/contact
2. **Fill out the form:**
   - Name: Test User
   - Email: your_personal_email@example.com
   - Subject: Test Inquiry
   - Message: Testing new email configuration
3. **Submit the form**

**Expected Results:**
- ✅ Form submits successfully
- ✅ Customer receives confirmation at their email
- ✅ Admin receives notification at inquiry@hsglobalexport.com
- ✅ Both emails sent from contact@hsglobalexport.com
- ✅ Inquiry saved in database (visible in admin panel)

---

## 🚀 Restart Backend Server

After updating the password, restart your backend:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
npm start
```

You should see in the console:
```
📧 Configuring email service for sg2plzcpnl509436.prod.sin2.secureserver.net...
```

---

## 📊 Email Flow Diagram

```
Customer Submits Form
        ↓
Backend Validates Data
        ↓
Save to MongoDB
        ↓
    ┌───┴───┐
    ↓       ↓
Email 1     Email 2
(Customer)  (Admin)
    ↓       ↓
FROM: contact@hsglobalexport.com
TO: customer@example.com
SUBJECT: Thank you...
    
            ↓
        FROM: contact@hsglobalexport.com
        TO: inquiry@hsglobalexport.com
        REPLY-TO: customer@example.com
        SUBJECT: New Contact Form Submission...
```

---

## ✅ Benefits of This Change

1. **Professional Branding:**
   - All emails sent from your domain (@hsglobalexport.com)
   - No more Gmail addresses visible

2. **Better Deliverability:**
   - Domain-based email reduces spam risk
   - Proper SPF/DKIM authentication

3. **Easy Replies:**
   - Admin can reply directly to customer emails
   - Reply-To header automatically set

4. **Centralized Management:**
   - All business emails through one account
   - Easier to track and manage

---

## 🔍 Troubleshooting

### **If emails don't send:**

1. **Check password is correct:**
   - Verify `SMTP_PASS` in `.env` file
   - No extra spaces or quotes

2. **Check server logs:**
   - Look for error messages in backend console
   - Should show: "✅ Email sent successfully"

3. **Verify GoDaddy settings:**
   - Ensure SMTP is enabled for the account
   - Check if 2FA is enabled (may need app password)

4. **Test SMTP connection:**
   - Use an email client to verify credentials
   - Ensure port 465 is not blocked by firewall

### **Common Errors:**

- **"Authentication failed"** → Wrong password
- **"Connection timeout"** → Firewall blocking port 465
- **"Invalid credentials"** → Check username is exactly `contact@hsglobalexport.com`

---

## 📝 Next Steps

1. ✅ Update `SMTP_PASS` in `backend/.env`
2. ✅ Restart backend server
3. ✅ Test contact form submission
4. ✅ Check both emails (customer + admin)
5. ✅ Verify in admin panel

---

**Status:** ⚠️ **Waiting for password update**

Once you update the password, the system will be fully operational with professional email sending!
