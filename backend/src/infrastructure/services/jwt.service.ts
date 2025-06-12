import jwt from 'jsonwebtoken';
import { User } from '../../domain/interfaces/user.interface';
import { RefreshTokenModel } from '../database/refresh-token.schema';

export class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'your_access_secret_key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
  }

  generateAccessToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, this.accessSecret, { expiresIn: '1h' });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const token = jwt.sign({ id: user.id }, this.refreshSecret, { expiresIn: '7d' });
    await RefreshTokenModel.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return token;
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    const record = await RefreshTokenModel.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!record) return null;
    try {
      const payload = jwt.verify(token, this.refreshSecret) as { id: string };
      return payload.id;
    } catch {
      return null;
    }
  }

  async invalidateRefreshToken(token: string): Promise<void> {
    await RefreshTokenModel.deleteOne({ token });
  }
}