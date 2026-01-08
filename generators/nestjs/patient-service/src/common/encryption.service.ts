import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Simple application-level encryption service placeholder.
 * Replace with AWS KMS / Vault in production.
 */
@Injectable()
export class EncryptionService {
  private key: Buffer;
  constructor() {
    const k = process.env.APP_ENCRYPTION_KEY || 'dev-key-32-bytes-length-dev-key-32!!';
    this.key = Buffer.from(k.padEnd(32).slice(0, 32));
  }

  async encrypt(plaintext: string): Promise<Buffer> {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]);
  }

  async decrypt(payload: Buffer): Promise<string> {
    const iv = payload.slice(0, 12);
    const tag = payload.slice(12, 28);
    const data = payload.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
