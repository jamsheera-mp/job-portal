import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { MongoUserRepository } from '../repositories/user.repository';
import { User } from '../../domain/interfaces/user.interface';
import dotenv from 'dotenv';

dotenv.config();

const userRepository = new MongoUserRepository();

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email not provided by Google'), null as any);
        }

        let user = await userRepository.findByEmail(email);
        if (!user) {
          const userData: Partial<User> = {
            email,
            name: profile.displayName,
            role: 'jobSeeker', // Default role; adjust as needed
            isEmailVerified: true, // Since Google verifies the email
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          user = await userRepository.create(userData as User);
        }

        return done(null, user);
      } catch (error: any) {
        return done(error, null as any);
      }
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: '/auth/linkedin/callback',
      scope: ['email', 'profile'],
      
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email not provided by LinkedIn'), null);
        }

        let user = await userRepository.findByEmail(email);
        if (!user) {
          const userData: Partial<User> = {
            email,
            name: profile.displayName,
            role: 'jobSeeker', // Default role; adjust as needed
            isEmailVerified: true, // Since LinkedIn verifies the email
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          user = await userRepository.create(userData as User);
        }

        return done(null, user);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;