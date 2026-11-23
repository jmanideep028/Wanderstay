# Wanderstay

Full stack travel-listing platform (Express + MongoDB + EJS + Passport + Cloudinary + Bootstrap).

## Features
- Sign up / log in / log out (Passport local strategy, sessions stored in MongoDB)
- Create, view, edit, delete listings with image upload (Cloudinary)
- Only the owner can edit or delete a listing; only the author can delete a review
- Reviews with 1-5 star ratings and a computed average
- Search by title, location or country
- Server + client validation (Joi and Bootstrap), flash messages, error pages

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in MongoDB + Cloudinary values
3. `npm run seed` (optional demo data; login `demohost` / `demo1234`)
4. `npm run dev` then open http://localhost:8080

## Deploy (Render)
Set the same variables from `.env.example` in the dashboard, with `NODE_ENV=production`
and `ATLAS_DB_URL` pointing at MongoDB Atlas. Build: `npm install`, Start: `npm start`.
