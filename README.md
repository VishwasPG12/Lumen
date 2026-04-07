# Lumen - Knowledge Vault

Lumen is a full-stack MERN application that serves as a private archive for web insights. It uses the Groq Cloud API (Llama 3.3 70B) to automatically analyze, summarize, and categorize web links saved by the user.

## Project Structure

The repository is organized into two main directories:
- **/server**: Node.js and Express backend.
- **/client**: React (Vite) and Tailwind CSS frontend.

## Features

- **JWT Authentication**: Secure user registration and login system.
- **AI Distillation**: Automatic summary and hashtag generation for any submitted URL.
- **Personalized Vault**: Users only have access to the data they have created.
- **Responsive Masonry Grid**: A dynamic layout for viewing saved insights across all devices.
- **Detail View**: Full-screen modal for reading AI-generated summaries.
- **Account Management**: Profile section with the ability to purge all user data.

## Tech Stack

### Backend
- Node.js & Express
- MongoDB (Atlas)
- Mongoose (ODM)
- JSON Web Tokens (JWT)
- Groq Cloud API (AI Analysis)

### Frontend
- React.js (Vite)
- Tailwind CSS
- Lucide React (Icons)
- Axios (API Requests)
- React Hot Toast (Notifications)

## Installation and Local Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Lumen.git](https://github.com/YOUR_USERNAME/Lumen.git)
cd Lumen
```
### 2. Backend Configuration
Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```
Create a .env file in the /server folder with the following variables:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Frontend Configuration
Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```
Create a .env file in the /client folder:

```bash
VITE_API_URL=http://localhost:5000
```
Deployment Instructions
Server (Render)
Set the Root Directory to server.

Build Command: 
```bash
npm install
```

Start Command:
```bash
 node index.js
 ```

Add all environment variables from your local server .env to the Render Dashboard.

Client (Vercel)
Set the Root Directory to client.

Framework Preset: Vite.

Environment Variable: Add VITE_API_URL pointing to your deployed Render URL.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
Created by Vishwas P G.
