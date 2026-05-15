# ProConnect Client

This directory contains the React frontend for the ProConnect platform, built using Vite.

## Tech Stack
- **React 19**
- **Vite** (Build Tool)
- **TanStack Query** (Data Fetching & State Management)
- **React Router v6** (Routing)
- **Socket.io Client** (Real-time features)
- **Framer Motion** (Animations)
- **React Hook Form & Yup** (Forms & Validation)

## Available Scripts

In the `client` directory, you can run:

### `npm run dev`
Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`
Locally preview the production build after running `npm run build`.

## Environment Variables
Create a `.env` file in this directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
*(In production, these will point to your deployed backend URL)*
