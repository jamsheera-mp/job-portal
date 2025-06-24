import express, { type Application  } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import mainRoutes from "./presentation/routes/main.routes";
import { errorHandler } from './presentation/middleware/error-handler.middleware';



//import session from 'express-session';
//import MongoStore from 'connect-mongo';
//import passport from 'passport';

dotenv.config();

const app: Application = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal';


//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
/*
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
*/

//  Initialize Passport and restore login sessions
//app.use(passport.initialize());
//app.use(passport.session());


//Routes

app.use("/api", mainRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();