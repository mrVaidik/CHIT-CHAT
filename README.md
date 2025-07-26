# CHITCHAT 💬

A modern real-time chat application built with React, Vite, and Socket.IO that enables seamless communication with multiple users across different chat rooms.

## ✨ Features

- **Real-time messaging** with Socket.IO
- **User authentication** (Login, Register, Guest access)
- **Multiple chat rooms** for organized conversations
- **Online user presence** tracking
- **Typing indicators** for enhanced user experience
- **Responsive design** with Bootstrap 5
- **Modern UI/UX** with smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Socket.IO Client
- Bootstrap 5
- Modern CSS3

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB
- JWT Authentication

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 14 or higher)
- MongoDB (running locally or connection to MongoDB Atlas)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chitchat
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
```

**Backend Environment Variables (.env):**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key-change-in-production-please
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm start
```

The backend server will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file with the following variables:
```

**Frontend Environment Variables (.env):**
```env
VITE_APP_API_URL=http://localhost:3000
VITE_APP_SOCKET_URL=http://localhost:3000
```

```bash
# Start the development server
npm run dev
```

The frontend application will run on `http://localhost:5173`

## 🎯 Usage

1. **Access the Application**: Open your browser and navigate to `http://localhost:5173`

2. **Authentication Options**:
   - **Register**: Create a new account with username and password
   - **Login**: Sign in with existing credentials
   - **Guest**: Enter as a guest user (limited features)

3. **Chat Features**:
   - Join different chat rooms
   - Send real-time messages
   - See who's online
   - View typing indicators when others are typing
   - Responsive design works on desktop and mobile


## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest access

### Chat
- `GET /api/rooms` - Get available chat rooms
- `GET /api/messages/:roomId` - Get messages for a room
- `POST /api/messages` - Send a message

### Users
- `GET /api/users/online` - Get online users
- `GET /api/users/profile` - Get user profile

## 🔌 Socket Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server → Client
- `message_received` - New message received
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - Someone is typing
- `user_stopped_typing` - Someone stopped typing
- `online_users` - Updated online users list

## 🛡️ Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended for production)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Update `MONGODB_URI` in environment variables
3. Set secure `JWT_SECRET`
4. Deploy to services like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Update API URLs in environment variables
2. Build the project: `npm run build`
3. Deploy to services like Vercel, Netlify, or GitHub Pages

## 🔧 Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running locally
   - Check the `MONGODB_URI` in your .env file

2. **Socket Connection Failed**:
   - Verify backend server is running on port 3000
   - Check `VITE_APP_SOCKET_URL` in frontend .env

3. **CORS Errors**:
   - Ensure `FRONTEND_URL` is correctly set in backend .env
   - Check CORS configuration in backend

4. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version conflicts in package.json

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Contact the development team

---

**Built with ❤️ using React, Socket.IO, and MongoDB**