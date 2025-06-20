import jwt from 'jsonwebtoken';
import { User } from '../../domain/interfaces/user.interface';
import { RefreshTokenModel } from '../database/refresh-token.schema';

export class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'e07a49001c273a8298f96c5701e1c7494a98e32040e62430bf27d89f899570d9';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || '139643f1a088d2a7990a1cfb2976eec285b3a1359091ff3cf56539aa1b9e7d17';
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('[JwtService] Warning: JWT secrets not set in environment variables. Using fallback secrets.');
    }
  }

  generateAccessToken(user: User): string {
    if (!user.id) {
      console.error('[JwtService] User ID is missing for access token generation:', user);
      throw new Error('User ID is required for token generation');
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    console.log('[JwtService] Access token payload:', payload);
    try {
      return jwt.sign(payload, this.accessSecret, { expiresIn: '1h' });
    } catch (error: any) {
      console.error('[JwtService] Error generating access token:', error.message);
      throw new Error('Failed to generate access token');
    }
  }

  async generateRefreshToken(user: User): Promise<string> {
    if (!user.id) {
      console.error('[JwtService] User ID is missing for refresh token generation:', user);
      throw new Error('User ID is required for token generation');
    }
    const payload = { id: user.id };
    console.log('[JwtService] Refresh token payload:', payload);
    try {
      const token = jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
      await RefreshTokenModel.create({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      console.log('[JwtService] Refresh token stored in database for userId:', user.id);
      return token;
    } catch (error: any) {
      console.error('[JwtService] Error generating refresh token:', error.message);
      throw new Error('Failed to generate refresh token');
    }
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    try {
      const record = await RefreshTokenModel.findOne({ token, expiresAt: { $gt: new Date() } });
      if (!record) {
        console.log('[JwtService] No valid refresh token found for token:', token);
        return null;
      }
      const payload = jwt.verify(token, this.refreshSecret) as { id: string };
      console.log('[JwtService] Refresh token validated for userId:', payload.id);
      return payload.id;
    } catch (error: any) {
      console.error('[JwtService] Error validating refresh token:', error.message);
      return null;
    }
  }

  async invalidateRefreshToken(token: string): Promise<void> {
    try {
      const result = await RefreshTokenModel.deleteOne({ token });
      console.log('[JwtService] Refresh token invalidated:', { token, deletedCount: result.deletedCount });
    } catch (error: any) {
      console.error('[JwtService] Error invalidating refresh token:', error.message);
      throw new Error('Failed to invalidate refresh token');
    }
  }
}