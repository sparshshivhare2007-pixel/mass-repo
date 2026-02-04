# Mass Report System

A Next.js-based Mass Reporting System for Telegram with MongoDB integration.

## Features

- 🔐 **Authentication System** - Secure login with session management
- 📱 **Mobile Responsive** - Drawer navigation for mobile devices
- 🎨 **Black & Indigo Theme** - Modern dark theme with indigo accents
- 💾 **MongoDB Integration** - Store sessions and report history
- 🤖 **Telegram Integration** - Mass reporting via Pyrogram
- 📊 **Report History** - Track all your reports with detailed results
- ⚙️ **Session Management** - Add/remove multiple Telegram sessions

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Python (Pyrogram)
- **Database**: MongoDB
- **Authentication**: Cookie-based sessions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
pip install pyrogram
```

### 3. Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Access the Application

- Login Page: `http://localhost:3000/mass-report/login`
- Dashboard: `http://localhost:3000/mass-report`

## Default Credentials

- **Email**: pranav@enhanceai.art
- **Password**: massreport@1321

## Usage

### 1. Login
Navigate to `/mass-report/login` and use the default credentials.

### 2. Add Sessions
- Go to "Sessions" tab
- Click "Add Session"
- Enter session details:
  - Owner Name
  - Phone Number (optional)
  - Session String (from Pyrogram)

### 3. Execute Mass Report
- Go to "Mass Report" tab
- Enter target (username or channel ID)
- Select report reason
- Write report message
- Click "Execute Mass Report"

### 4. View History
- Go to "History" tab
- View all past reports with detailed results

## Report Reasons

- Report for child abuse
- Report for impersonation
- Report for copyrighted content
- Report an irrelevant geogroup
- Reason for Pornography
- Report an illegal drug
- Report for offensive person detail
- Report for spam
- Report for Violence

## API Routes

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Add new session
- `DELETE /api/sessions?id=<id>` - Delete session
- `GET /api/reports` - Get report history
- `POST /api/reports` - Execute mass report

## Database Models

### TelegramSession
- userId
- sessionString
- ownerName
- phoneNumber
- isActive
- lastUsed

### ReportLog
- userId
- target
- targetType
- reportReason
- reportMessage
- sessionsUsed
- successCount
- failureCount
- status
- results[]

## Security Notes

- Sessions are stored securely in MongoDB
- Authentication uses HTTP-only cookies
- All API routes are protected with authentication checks
- Session strings are never exposed to the client

## Mobile Support

The application is fully responsive with:
- Drawer navigation for mobile devices
- Touch-friendly UI elements
- Optimized layouts for small screens

## Contributing

This is a private project. For issues or suggestions, contact the administrator.

## License

Private - All rights reserved
