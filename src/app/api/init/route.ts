import { NextResponse } from 'next/server';
import { sequelize } from '@/lib/db';
import { models } from '@/lib/db';

/**
 * Database Initialization Route
 * In serverless environments, we don't have a persistent server startup to sync the DB.
 * This route allows triggering the sync manually or during build.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceSync = searchParams.get('force') === 'true';

        console.log(`🔄 Syncing database... (force: ${forceSync})`);

        // Sync database
        // force: true will drop and recreate all tables (use with caution!)
        // alter: true will try to update tables without dropping data
        await sequelize.sync({ force: forceSync, alter: !forceSync });

        console.log('✅ Database synced successfully.');

        // Seed initial admin user if no users exist
        const userCount = await models.User.count();
        if (userCount === 0) {
            // The User model hook will hash the password_hash field automatically
            await models.User.create({
                username: 'admin',
                full_name: 'System Admin',
                role: 'admin',
                password_hash: 'admin123',
            });
            console.log('👤 Created default admin user: admin / admin123');
        }

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            users: userCount
        });
    } catch (error: any) {
        console.error('❌ Database init failed:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
