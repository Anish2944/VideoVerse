# VideoVerse

**VideoVerse** is a video-sharing platform where users can upload, view, and manage videos. This project aims to provide a YouTube-like experience with features such as video uploading, subscriptions, and channel profiles.

## Demo

Check out the live version of VideoVerse: [VideoVerse](https://video-verse-gamma.vercel.app)

## Features

- **User Authentication**: Sign up, log in, and secure sessions using JWT tokens.
- **Video Upload & Management**: Users can upload videos, manage their content, and edit video details.
- **Subscription System**: Users can subscribe to channels and manage their subscriptions.
- **Profile Viewing**: Click on a channel to view its profile and the videos uploaded by the user.
- **Pagination & Infinite Scrolling**: Efficiently loads videos with pagination and infinite scroll for a better user experience.
- **Responsive Design**: Optimized for various devices using Tailwind CSS and DaisyUI.

## Technologies Used

- **Frontend**:
  - React.js
  - Redux Toolkit & RTK Query
  - Tailwind CSS & DaisyUI for styling
  - React Hook Form for form management
  - Intersection Observer for infinite scroll implementation

- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose for database management
  - JWT Authentication
  - Cloudinary for video uploads and storage
  - Multer for file uploads

- **Deployment**:
  - Frontend: Vercel
  - Backend: Render(https://videoverse-9x11.onrender.com/api/v1/healthcheck/)

## Project Structure

```bash
videoverse/
├── backend/          # Backend (Node.js & Express.js)
├── frontend/         # Frontend (React.js)
└── README.md         # Project README
