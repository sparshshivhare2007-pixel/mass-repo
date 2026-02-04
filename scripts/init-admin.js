const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function initAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found in .env.local');
      console.log('\n📝 Please create .env.local file with:');
      console.log('MONGODB_URI=your_mongodb_connection_string');
      console.log('JWT_SECRET=your_secret_key');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: 'pranav@enhanceai.art' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📧 Email: pranav@enhanceai.art');
      console.log('🔑 Password: massreport@1321');
      console.log('👤 Role:', existingAdmin.role);
      console.log('✅ Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
    } else {
      console.log('📝 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('massreport@1321', 10);
      
      const admin = await User.create({
        email: 'pranav@enhanceai.art',
        password: hashedPassword,
        name: 'Pranav',
        username: 'pranav_admin',
        role: 'admin',
        isActive: true
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📧 Email: pranav@enhanceai.art');
      console.log('🔑 Password: massreport@1321');
      console.log('👤 Role: admin');
      console.log('🆔 User ID:', admin._id);
    }

    console.log('\n🎉 Setup complete!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/mass-report/login');
    console.log('3. Login with above credentials');
    console.log('4. Change password after first login!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.log('\n⚠️  Duplicate key error - Admin might already exist');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

initAdmin();
