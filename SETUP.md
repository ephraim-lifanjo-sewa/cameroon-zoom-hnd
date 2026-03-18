# Cameroon Zoom - Project Setup Guide

This guide explains how to re-initialize the **Cameroon Zoom** institutional business directory. Follow these steps to set up the project in a new environment.

## 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Account** (Google account)

## 2. Local Environment Setup
1. **Clone/Copy** all project folders and files to your local directory.
2. Run `npm install` to install all dependencies (Next.js, Tailwind, ShadCN, Firebase, Lucide, etc.).
3. Ensure your `.env` file at the root contains the following variables:
   ```env
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   GOOGLE_GENAI_API_KEY=...
   ```

## 3. Firebase Console Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named "Cameroon Zoom".
3. **Authentication**:
   - Enable "Email/Password" provider.
   - (Optional) Enable "Anonymous" sign-in.
4. **Cloud Firestore**:
   - Create a database in **Production Mode**.
   - Copy the rules from `firestore.rules` in this project and paste them into the "Rules" tab in the Firebase console.
5. **Project Settings**:
   - Register a "Web App" to get your credentials.
   - Update your `.env` file with the keys provided by Firebase.

## 4. Institutional Data Seeding
To populate your live database with the 8 target Hubs and specialist reviews:
1. Run the app: `npm run dev`.
2. Go to `/signup` and create an account with the email `admin@gmail.com`.
3. Log in and navigate to the **Governance Hub** (Menu -> Governance Hub or `/admin`).
4. Click the **"Seed Hub Records"** button. 
   - This will migrate all 104+ institutional logs (including Ephraim Lifanjo's reviews) from the mock layer to Firestore.

## 5. Development Commands
- `npm run dev`: Starts the Next.js development server.
- `npm run genkit:dev`: Starts the Genkit AI developer UI for location refinement debugging.

## 6. Architecture Overview
- **Frontend**: Next.js 15 (App Router).
- **Backend**: Firebase Authentication & Firestore.
- **AI**: Genkit with Gemini 2.0 Flash (Location Refinement & TTS).
- **Styling**: Tailwind CSS & ShadCN UI.
- **Images**: Base64 strings stored in Firestore for portability.
