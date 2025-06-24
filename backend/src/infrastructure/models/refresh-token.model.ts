import { model, Schema } from 'mongoose';
import { RefreshToken } from '../../domain/interfaces/refreshToken.interface';


const RefreshTokenSchema = new Schema<RefreshToken>({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '7d' } },
});

export const RefreshTokenModel = model<RefreshToken>('RefreshToken', RefreshTokenSchema);