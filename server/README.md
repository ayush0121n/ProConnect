# ProConnect Backend API

This directory contains the Node.js backend for the ProConnect platform.

## Tech Stack
- **Node.js + Express** (REST API)
- **MongoDB + Mongoose** (Database & ODM)
- **Socket.io** (Real-time communication)
- **JWT & bcryptjs** (Authentication & Security)
- **Cloudinary** (Image & File Uploads)
- **Nodemailer** (Email notifications)

## Directory Structure
- `src/config/`: Configuration for Database, Socket.io, Cloudinary, Email
- `src/controllers/`: Route request handlers
- `src/middleware/`: Authentication, File Upload, Error Handling
- `src/models/`: Mongoose schemas (User, Job, Post, Connection, etc.)
- `src/routes/`: Express route definitions
- `src/seeders/`: Scripts to seed the database with test data (Admins, Jobs, Connections)
- `src/sockets/`: Socket.io real-time event handlers

## Getting Started

1. Install dependencies: `npm install`
2. Create `.env` file with required variables.
3. Run development server: `npm run dev`

## Seeders
You can use the provided seeder scripts to populate your local database:
- `node src/seeders/makeAdmin.js` - Promotes the first user to Admin.
- `node src/seeders/seedJobs.js` - Populates the database with 10 sample jobs.
- `node src/seeders/seedConnections.js` - Generates 15 sample users and creates connections.
- `node src/seeders/resetAdmin.js` - Resets the admin password to `admin123`.
