# Recording Submission Portal

A production-ready MERN-style monorepo with:

- User registration and login before uploads
- A protected upload page for WAV submissions
- A protected admin login and dashboard
- MongoDB for metadata storage
- Cloudinary raw uploads for `.wav` files
- JWT-based user and admin authentication
- ZIP export for selected recordings

## Project Structure

```text
Recording/
|-- client/
|-- server/
|-- .env.example
`-- README.md
```

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Axios
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose
- File Storage: Cloudinary raw uploads
- Authentication: JWT
- Password hashing: bcryptjs
- ZIP generation: archiver

## Environment Setup

1. Copy the root `.env.example` file into `server/.env`.
2. Fill in all required values:

```env
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_super_secret_jwt_key
ADMIN_USERNAME=admin_username_here
ADMIN_PASSWORD=admin_password_here
PORT=5000
```

3. Optional: if your frontend will call a backend URL other than `http://localhost:5000`, create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

Admin credentials stay in `server/.env`. Admin accounts are not created from the UI.

## Cloudinary Setup

1. Create a Cloudinary account and get your cloud name, API key, and API secret.
2. This app uploads audio files from the backend using the signed Upload API, so you do not need an unsigned upload preset.
3. The backend uploads files with `resource_type: "raw"` so `.wav` files are accepted as raw assets.
4. Uploaded files are stored in the Cloudinary folder named `recordings`.
5. Make sure your Cloudinary environment supports raw asset uploads.

## Install Dependencies

Install client dependencies:

```bash
cd client
npm install
```

Install server dependencies:

```bash
cd server
npm install
```

If PowerShell blocks `npm` with an execution-policy error on Windows, use `npm.cmd` instead.

## Run in Development

Run the backend in one terminal:

```bash
cd server
npm run dev
```

Run the frontend in another terminal:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## User Flow

1. Open `http://localhost:5173/register` and create a user account.
2. After registering, the app stores the user JWT and redirects to `/`.
3. Logged-in users can upload WAV files from `/`.
4. Each upload stores the speaker name from the form and the uploader username from the JWT as `uploadedBy`.

## Admin Flow

1. Open `http://localhost:5173/admin/login`.
2. Log in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `server/.env`.
3. Admins can search by speaker name, filter by uploader, filter by date range, and download one or many files.

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

Start the backend:

```bash
cd server
npm start
```

## Features Included

- User registration and login pages
- Protected upload page with uploader navbar and logout
- Multer memory upload handling
- Cloudinary `upload_stream` for `.wav` files
- MongoDB metadata storage with upload timestamps and `uploadedBy`
- JWT-protected user uploads
- JWT-protected admin routes
- Admin dashboard with name search
- Admin dashboard with uploader dropdown filtering
- Admin dashboard with inclusive date range filtering
- Admin dashboard with pagination
- Admin dashboard with row selection and select-all controls
- Admin dashboard with single file download
- Admin dashboard with bulk ZIP download
- Automatic logout and redirect on `401 Unauthorized`
- IST date formatting in the dashboard

## API Overview

### Public Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected User

- `POST /api/upload`

### Admin

- `POST /api/admin/login`
- `GET /api/admin/users`
- `GET /api/admin/recordings`
- `GET /api/admin/recordings/:id/download`
- `POST /api/admin/download-zip`

## Notes

- Upload timestamps are stored as UTC `Date` values and displayed in IST on the frontend.
- Downloaded files are renamed using the submitted speaker name, not the uploader username.
- Duplicate names inside ZIP exports are automatically suffixed with counters such as `name_1.wav`.
