<div align="center">
  <img src="./public/logo/logo-removebg.png" alt="SkillBridge Logo" width="120" />

  <h1 align="center">SkillBridge</h1>

  <p align="center">
    A peer-to-peer university service marketplace for <strong>North Western University (NWU)</strong> students.
    <br />
    Earn credits by offering services — spend credits to book services from fellow students.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase Auth" />
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary" alt="Cloudinary" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Routes](#-api-routes)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**SkillBridge** is a full-stack web application built specifically for **North Western University** students. It creates a **credit-based service economy** where students can:

- 🛠️ **Offer their skills** — tutoring, design, coding, notes, writing, and more
- 📚 **Book services** from fellow students using credits
- 💬 **Chat** in real-time with booking partners
- ⭐ **Rate & review** completed services
- 🎓 **Verify** their NWU student identity

> *"Bridging the gap between learning and practical application."*

---

## ✨ Features

### 👤 Authentication & Profiles
| Feature | Description |
|---|---|
| **Email/Password Sign Up** | With email verification & `.edu` email validation |
| **Google OAuth** | One-click sign in with Google |
| **Profile Management** | Edit display name, profile photo, skills |
| **Student Verification** | Upload NWU ID — admin approves/rejects |
| **User Status Control** | Admin can block, suspend, or activate users |

### 🛍️ Marketplace
| Feature | Description |
|---|---|
| **Browse Services** | Filter by category, search by keyword |
| **Service CRUD** | Create, edit, delete your own service listings |
| **Image Upload** | Upload service thumbnails via Cloudinary |
| **Availability Toggle** | Mark services as available/unavailable |

### 📅 Bookings & Credits
| Feature | Description |
|---|---|
| **Booking Lifecycle** | Pending → Approved → In Progress → Completed |
| **Credit Economy** | Debit from requester, credit to provider on completion |
| **Google Meet Links** | Providers can add meeting links to bookings |
| **Auto-Approve** | Optional env var to auto-approve bookings |

### 💬 Real-Time Chat
- Per-booking chat threads
- Send text messages & file attachments
- Auto-polling every 5 seconds
- Chat inbox with search & conversation history

### ⭐ Reviews & Ratings
- 1–5 star rating with optional feedback
- Average rating shown on service cards
- Provider review summary on profile

### 🛡️ Admin Panel
| Feature | Description |
|---|---|
| **User Management** | Full directory with search, filtering, credit adjustment, block/suspend/delete |
| **Verification Management** | Approve/reject/delete student verification requests |
| **Booking Management** | View all bookings, filter by status, approve/reject |

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) (Email/Password + Google OAuth) |
| **File Storage** | [Cloudinary](https://cloudinary.com/) (images, documents) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Alerts** | [SweetAlert2](https://sweetalert2.github.io/) |
| **Language** | JavaScript (JSX) |

---

## 📁 Project Structure

```
skillbridge/
├── app/
│   ├── (backend)/             # Server-only code
│   │   ├── api/               # API route handlers
│   │   ├── lib/               # Utilities (MongoDB, Firebase, credits, reviews)
│   │   └── models/            # Mongoose schemas (User, Service, Booking, Chat, Review, Verification)
│   ├── (frontned)/            # Client pages
│   │   ├── (site)/            # Public pages (Home, About, FAQ)
│   │   ├── admin/             # Admin dashboard (users, bookings, verifications)
│   │   ├── dashboard/         # User dashboard (sessions, chat)
│   │   ├── profile/           # User profile, services, bookings, marketplace, verification
│   │   └── components/        # Shared UI components (AuthSync, Navbar, Footer, Booking, Chat, etc.)
│   ├── layout.js              # Root layout
│   ├── globals.css            # Tailwind styles
│   ├── not-found.jsx          # Custom 404
│   └── loading.jsx            # Loading spinner
├── public/                    # Static assets (logo, icons)
├── .env                       # Environment variables
├── next.config.mjs            # Next.js configuration
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
└── jsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** or **yarn** or **pnpm**
- A **MongoDB** database (local or [Atlas](https://www.mongodb.com/atlas))
- A **Firebase** project with Authentication enabled
- A **Cloudinary** account for file uploads

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/skillbridge.git
   cd skillbridge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the following variables into a `.env` file in the project root:

   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Optional: Auto-approve bookings (set to "true" to enable)
   AUTO_APPROVE_BOOKINGS=false
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `AUTO_APPROVE_BOOKINGS` | ❌ | Set `"true"` to auto-approve bookings |

> **Note for admins:** The admin account is identified by email `admin@admin.com`. After signing in with this email, the admin panel becomes accessible at `/admin`.

---

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🌐 API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Validate university email |
| POST | `/api/sync-user` | Sync Firebase user to MongoDB |
| POST | `/api/update-profile` | Update user profile |
| GET/POST | `/api/services` | List / Create services |
| PUT/DELETE | `/api/services/[id]` | Update / Delete service |
| GET | `/api/services/me` | List user's services |
| GET/POST | `/api/booking` | List / Create bookings |
| PUT | `/api/booking/[id]` | Update booking status |
| GET/POST | `/api/reviews` | Get / Submit reviews |
| GET | `/api/chat` | List chat threads |
| GET/POST | `/api/chat/[bookingID]` | Get / Send messages |
| GET | `/api/get-user-verification` | Check verification status |
| POST | `/api/upload-verification-document` | Upload verification document |
| GET/PATCH/DELETE | `/api/admin/users` | Manage users (admin) |
| PATCH | `/api/admin/users/status` | Block/suspend/activate users (admin) |
| GET | `/api/admin/bookings` | List all bookings (admin) |
| PUT | `/api/admin/bookings/[id]` | Approve/reject booking (admin) |
| GET | `/api/admin/pending-verifications` | List pending verifications (admin) |
| POST | `/api/admin/approve-user` | Approve/reject verification (admin) |

---

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ for North Western University students
</div>
