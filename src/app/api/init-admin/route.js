import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/utils/db';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'pranav@enhanceai.art' });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists'
      });
    }

    const hashedPassword = await bcrypt.hash('massreport@1321', 10);

    await User.create({
      email: 'pranav@enhanceai.art',
      password: hashedPassword,
      name: 'Pranav',
      username: 'pranav_admin',
      role: 'admin',
      isActive: true
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
