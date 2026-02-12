import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { models } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'myshop_fallback_secret_for_production_safety';

export interface AuthContext {
    user: any;
    userId: string;
    role: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthContext | null> {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        if (!decoded || !decoded.userId) {
            return null;
        }

        const user = await models.User.findByPk(decoded.userId);
        if (!user || !user.is_active) {
            return null;
        }

        return {
            user,
            userId: user.id,
            role: user.role
        };
    } catch (error) {
        return null;
    }
}

export async function verifyCustomerAuth(req: NextRequest): Promise<{ customerId: string; phone: string } | null> {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        if (!decoded || !decoded.id || decoded.role !== 'customer') {
            return null;
        }

        return {
            customerId: decoded.id,
            phone: decoded.phone
        };
    } catch (error) {
        return null;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
    }, { status: 401 });
}

export function forbiddenResponse() {
    return NextResponse.json({
        success: false,
        message: 'Permission denied'
    }, { status: 403 });
}
