import { NextResponse } from 'next/server';
import connectDB, { getConnectionStatus } from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * Test API Route to verify MongoDB connection
 * GET /api/test-db
 */
export async function GET() {
    try {
        // Attempt to connect to MongoDB
        await connectDB();

        // Get connection status
        const status = getConnectionStatus();

        // Get database name
        const dbName = mongoose.connection.db?.databaseName || 'N/A';

        // Get MongoDB server info
        const serverInfo = await mongoose.connection.db?.admin().serverInfo();

        return NextResponse.json(
            {
                success: true,
                message: 'MongoDB connection successful! 🎉',
                details: {
                    status: status,
                    database: dbName,
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    mongoVersion: serverInfo?.version || 'N/A',
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database connection test failed:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'MongoDB connection failed',
                error: error.message,
                details: {
                    status: getConnectionStatus(),
                    mongoUri: process.env.MONGO_URI ? 'Set (hidden for security)' : 'Not set',
                },
            },
            { status: 500 }
        );
    }
}

