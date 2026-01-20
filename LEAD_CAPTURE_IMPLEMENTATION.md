# Lead Capture Popup - Backend Integration

## Summary
Successfully migrated the lead capture popup from EmailJS to a full backend implementation with database storage, email notifications, and admin panel integration.

## Changes Made

### Backend Changes

#### 1. New Model: `LeadCapture.js`
**Location:** `backend/models/LeadCapture.js`

Created a new MongoDB model to store lead capture submissions with the following fields:
- `name` (required)
- `email` (required)
- `countryCode` (required)
- `phone` (required)
- `clientType` (required, enum: 'personal' or 'client')
- `services` (array of strings, required)
- `message` (optional)
- `status` (enum: 'new', 'contacted', 'qualified', 'converted', 'archived')
- `ipAddress` (captured automatically)
- `userAgent` (captured automatically)
- `adminNotes` (for admin use)
- `contactedAt` (timestamp when admin contacts the lead)
- `contactedBy` (reference to User who contacted)
- `timestamps` (createdAt, updatedAt - automatic)

#### 2. New Controller: `leadCaptureController.js`
**Location:** `backend/controllers/leadCaptureController.js`

Implemented the following endpoints:
- `submitLeadCapture` - Public endpoint to submit lead capture form
- `getAllLeadCaptures` - Admin endpoint to get all leads with pagination
- `getLeadCaptureById` - Admin endpoint to get single lead
- `updateLeadCaptureStatus` - Admin endpoint to update lead status
- `deleteLeadCapture` - Admin endpoint to delete lead
- `getLeadCaptureStats` - Admin endpoint to get statistics

**Validation includes:**
- Email format validation
- Phone number validation (10 digits)
- Client type validation
- Required fields check

#### 3. New Routes: `leadCaptureRoutes.js`
**Location:** `backend/routes/leadCaptureRoutes.js`

Routes configured:
- `POST /api/leads/submit` - Public (no auth required)
- `GET /api/leads` - Admin only (requires auth + admin middleware)
- `GET /api/leads/stats` - Admin only
- `GET /api/leads/:id` - Admin only
- `PATCH /api/leads/:id` - Admin only
- `DELETE /api/leads/:id` - Admin only

#### 4. Email Service Functions
**Location:** `backend/services/emailService.js`

Added two new email functions:
- `sendLeadNotificationEmail` - Sends notification to admin with lead details
- `sendLeadConfirmationEmail` - Sends confirmation to customer

**Email Features:**
- Professional HTML templates
- Branded with HS Global Export styling
- Includes all lead information
- Admin email includes quick action links
- Customer email includes what to expect next

#### 5. Server Configuration
**Location:** `backend/server.js`

Added lead capture routes:
```javascript
app.use('/api/leads', require('./routes/leadCaptureRoutes'));
```

### Frontend Changes

#### Updated Component: `LeadCapturePopup.tsx`
**Location:** `frontend/src/components/LeadCapturePopup.tsx`

**Key Changes:**
1. **Removed EmailJS dependency** - No longer using EmailJS for form submission
2. **Backend API integration** - Now submits to `/api/leads/submit`
3. **Improved error handling** - Shows specific error messages from backend
4. **No OTP verification** - Email and phone are required but not verified with OTP
5. **Better validation** - Server-side validation with client-side checks

**Form Fields (All Required):**
- Full Name
- Email Address
- Phone Number (with country code selector)
- Client Type (For Myself / For Client)
- Services (multiple selection: Marble, Granite, Furniture, Marble Engraving)
- Additional Message (optional)

## API Endpoints

### Public Endpoint
```
POST /api/leads/submit
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "countryCode": "+91",
  "phone": "9876543210",
  "clientType": "personal",
  "services": ["Marble", "Granite"],
  "message": "Looking for premium marble"
}

Response:
{
  "ok": true,
  "message": "Thank you for your interest! We will contact you soon.",
  "leadId": "65f1234567890abcdef12345"
}
```

### Admin Endpoints
All admin endpoints require authentication and admin role.

```
GET /api/leads?status=new&page=1&limit=20
GET /api/leads/stats
GET /api/leads/:id
PATCH /api/leads/:id
DELETE /api/leads/:id
```

## Email Notifications

### Admin Notification Email
Sent to: `EMAIL_TO` environment variable (default: inquiry@hsglobalexport.com)
Contains:
- Lead details (name, email, phone, client type)
- Services interested in
- Additional message (if provided)
- Submission timestamp
- Lead ID
- Quick action links

### Customer Confirmation Email
Sent to: Customer's email address
Contains:
- Thank you message
- Summary of their inquiry
- Services they're interested in
- What to expect next
- Contact information
- Company branding

## Database Storage

All lead submissions are stored in MongoDB with:
- Automatic timestamps
- IP address tracking
- User agent tracking
- Status management
- Admin notes capability
- Indexed fields for fast queries

## Admin Panel Integration

Leads can be viewed and managed in the admin panel:
- View all leads with filtering by status
- See statistics (total, today, by status)
- Update lead status
- Add admin notes
- Track who contacted the lead and when
- Delete leads if needed

## Environment Variables Required

Make sure these are set in `backend/.env`:
```
EMAIL_FROM=contact@hsglobalexport.com
EMAIL_TO=inquiry@hsglobalexport.com
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FRONTEND_URL=https://your-frontend-url.com
```

## Testing

To test the implementation:

1. **Frontend Test:**
   - Open the website
   - Click to open the lead capture popup
   - Fill in all required fields
   - Submit the form
   - Verify success message appears

2. **Backend Test:**
   - Check MongoDB for new lead entry
   - Verify admin received notification email
   - Verify customer received confirmation email

3. **Admin Panel Test:**
   - Login to admin panel
   - Navigate to leads section
   - Verify lead appears in the list
   - Test status updates
   - Test adding admin notes

## Benefits of This Implementation

1. **Database Storage** - All leads are saved and can be tracked
2. **Email Notifications** - Both admin and customer receive emails
3. **No Third-Party Dependency** - No longer relying on EmailJS
4. **Admin Management** - Full control over leads in admin panel
5. **Better Tracking** - IP address, user agent, timestamps
6. **Status Management** - Track lead lifecycle
7. **Scalable** - Can handle high volume of submissions
8. **Professional** - Branded email templates
9. **Secure** - Server-side validation and sanitization
10. **Analytics Ready** - Can generate reports from database

## Next Steps

To view leads in the admin panel, you may need to:
1. Add a "Leads" tab to the admin dashboard
2. Create a leads management component
3. Implement filtering and search functionality
4. Add export functionality (CSV/Excel)

The backend is fully ready - just needs frontend admin UI to be built!
