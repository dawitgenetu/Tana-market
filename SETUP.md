# Setup Guide - Tana Market E-Commerce Platform

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tana_market
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important**: 
- Make sure MongoDB is running on your system
- Get your Chapa API keys from https://chapa.co/
- Change the JWT_SECRET to a secure random string

Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
npm install
```

Create a `.env` file in the root folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Admin Dashboard: http://localhost:5173/admin

## Creating Admin User

To create an admin user, you can use MongoDB directly or create a script:

```javascript
// In MongoDB shell or create a script
use tana_market
db.users.insertOne({
  name: "Admin User",
  email: "admin@tanamarket.com",
  password: "$2a$10$...", // Use bcrypt hash
  role: "admin"
})
```

Or use the registration endpoint and then manually update the role in MongoDB.

## Chapa Payment Setup

1. Sign up at https://chapa.co/
2. Go to your dashboard
3. Get your API keys:
   - Secret Key (for backend)
   - Public Key (for frontend if needed)
4. Add them to your backend `.env` file

## MongoDB Setup

### Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/tana_market`

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Features Overview

### Admin Dashboard
- Access at `/admin` route
- View sales statistics
- Manage products, orders, users
- Generate reports
- Professional AdminLTE interface

### Customer Features
- Browse products
- Add to cart
- Checkout with Chapa payment
- Track orders
- View order history

### Manager Features
- Add/edit products
- Approve orders
- Ship orders (generates tracking numbers)
- Manage comments

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend

### Payment not working
- Verify Chapa API keys are correct
- Check Chapa dashboard for transaction logs
- Ensure callback URLs are correct

### AdminLTE styles not loading
- Check if files are in `public/css/` and `public/js/`
- Verify paths in `index.html`
- Check browser console for 404 errors

## Next Steps

1. Set up your MongoDB database
2. Configure Chapa payment gateway
3. Create admin user
4. Add products
5. Test the payment flow
6. Customize the dashboard as needed

