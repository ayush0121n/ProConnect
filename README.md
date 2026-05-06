# ProConnect – Professional Networking Platform

A full-stack MERN (MongoDB, Express, React, Node.js) professional networking platform inspired by LinkedIn. Connect with professionals, find jobs, share updates, and grow your career.

## 🚀 Features

- **Authentication** – Register, login, email verification, forgot/reset password
- **Activity Feed** – Create posts, like, comment, share with hashtag support
- **Job Portal** – Browse, search, filter, apply for jobs with cover letters
- **Networking** – Send/accept/reject connection requests, follow/unfollow users
- **Real-time Messaging** – Socket.io powered direct messaging with typing indicators
- **Notifications** – Real-time notifications for connections, likes, comments
- **Profile Management** – Experience, education, skills, certifications, endorsements
- **Groups** – Create and join professional groups
- **Search** – Global search across users, jobs, posts, and groups

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **TanStack Query** for data fetching
- **React Router v6** for routing
- **Socket.io Client** for real-time features
- **Framer Motion** for animations
- **React Hook Form + Yup** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js + Express** REST API
- **MongoDB + Mongoose** ODM
- **Socket.io** for real-time communication
- **JWT** authentication with httpOnly cookies
- **Cloudinary** for image/file uploads
- **Nodemailer** for email sending
- **Winston** for logging
- **Helmet, CORS, Rate Limiting** for security

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/ayush0121n/ProConnect.git
cd ProConnect

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/proconnect
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### Running Locally

```bash
# Start the server (from server/)
cd server
npm run dev

# Start the client (from client/)
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🌐 Deployment (Render)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `cd server && npm install && cd ../client && npm install && npm run build`
   - **Start Command:** `cd server && node server.js`
5. Add environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL, etc.)
6. Deploy!

## 📁 Project Structure

```
ProConnect/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth, Socket)
│   │   ├── pages/          # Page components
│   │   ├── routes/         # App routing
│   │   ├── services/       # API service layer
│   │   └── index.css       # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # DB, Socket, Cloudinary, Email
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, Error, Upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── sockets/        # Socket.io handlers
│   │   └── utils/          # Helpers (JWT, Logger)
│   ├── server.js           # Entry point
│   └── package.json
├── render.yaml             # Render deployment config
└── README.md
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 👤 Author

**Ayush Narkhede** - [GitHub](https://github.com/ayush0121n)
