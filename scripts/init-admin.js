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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function initAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI missing in .env.local");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const email = 'pranav@enhanceai.art';
    const password = 'massreport@1321';

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Resetting password...");
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log("✅ Password reset successful!");
    } else {
      await User.create({
        email,
        password: hashedPassword,
        name: 'Pranav',
        username: 'pranav_admin',
        role: 'admin',
        isActive: true
      });
      console.log("✅ Admin created successfully!");
    }

    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

initAdmin();
