import mongoose from 'mongoose';
import { DatabaseError } from '../../core/errors/database-error';

export class MongooseService {
    private static isConnected = false;

    public static async connect(uri: string, dbName?: string): Promise<void> {
        if (this.isConnected) return;

        try {
            await mongoose.connect(uri, {
                dbName: dbName || process.env.MONGODB_DATABASE_NAME || 'dione',
                serverSelectionTimeoutMS: 5000,
            });

            this.isConnected = true;
            console.log('✅ [DATABASE]: Mongoose connected successfully.');

            mongoose.connection.on('error', (err) => {
                console.error('🟥 [DATABASE ERROR]: Mongoose connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                this.isConnected = false;
                console.warn('⚠️ [DATABASE WARNING]: Mongoose disconnected.');
            });
        } catch (error: any) {
            this.isConnected = false;
            console.error('🟥 [DATABASE ERROR]: Failed to connect Mongoose:', error);
            throw new DatabaseError(error.message || 'Error de conexión inicial');
        }
    }

    public static async disconnect(): Promise<void> {
        if (!this.isConnected) return;
        await mongoose.disconnect();
        this.isConnected = false;
    }

    public static get status(): boolean {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

