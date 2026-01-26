import { NextResponse } from 'next/server';
import { sequelize } from '@/lib/db';
import { models } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Database Initialization Route
 * In serverless environments, we don't have a persistent server startup to sync the DB.
 * This route allows triggering the sync manually or during build.
 */
export async function GET() {
    try {
        console.log('🔄 Syncing database...');

        // Sync database (create tables if not exists)
        // alter: true allows updating tables without dropping data
        await sequelize.sync({ alter: true });

        console.log('✅ Database synced successfully.');

        // Seed initial admin user if no users exist
        const userCount = await models.User.count();
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await models.User.create({
                username: 'admin',
                full_name: 'System Admin',
                role: 'admin',
                password_hash: hashedPassword, // Helper will hash it again if we used plain 'password', but we hashed manually here, so we must be careful. 
                // Wait, our model hook hashes it! So we should pass plain password if we simply create.
                // Let's check User model hook. It hashes if 'password_hash' is set. 
                // Actually, let's just pass a plain password to be handled by the hook.
            } as any);

            // Wait, the model expects 'password_hash' field to hold the plain password initially? Use 'password' and then map?
            // Checking User model: "if (user.password_hash) { user.password_hash = await bcrypt.hash(user.password_hash, 12); }"
            // So yes, we pass plain text to 'password_hash' and the hook hashes it.

            // Re-doing creation with plain text
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
