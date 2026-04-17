import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import { School } from '../../src/models/School.model';
import { Branch } from '../../src/models/Branch.model';
import { User, UserRole } from '../../src/models/User.model';
import { StaffProfile } from '../../src/models/StaffProfile.model';
import { AuthService } from '../../src/services/auth.service';

describe('Staff API Integration', () => {
  let schoolId: mongoose.Types.ObjectId;
  let branchId: mongoose.Types.ObjectId;
  let adminToken: string;

  beforeAll(async () => {
    // Wait for the memory DB connection established by setup.ts and server.ts
    // 1. Create a dummy school
    const school = new School({
      name: 'Test School',
      slug: 'test-school',
      code: 'TEST-S',
      address: { line1: '123', city: 'Test City', state: 'TS', pincode: '123456' },
      phone: '1234567890',
      email: 'admin@test.com',
      ownerUserId: new mongoose.Types.ObjectId(),
    });
    await school.save();
    schoolId = school._id as mongoose.Types.ObjectId;

    // 2. Create a dummy branch
    const branch = new Branch({
      schoolId,
      name: 'Main Branch',
      code: 'MAIN',
      address: { line1: '123', city: 'Test City', state: 'TS', pincode: '123456' },
      createdBy: new mongoose.Types.ObjectId(),
    });
    await branch.save();
    branchId = branch._id as mongoose.Types.ObjectId;

    // 3. Create Admin user & token
    const admin = new User({
      schoolId,
      email: 'admin@test.com',
      passwordHash: 'hashedpassword',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
    });
    await admin.save();
    
    // Assign proper owner
    school.ownerUserId = admin._id as mongoose.Types.ObjectId;
    await school.save();

    const tokens = await AuthService.generateTokens(admin);
    adminToken = tokens.accessToken;
  });

  afterEach(async () => {
    // Clear only staff and users created during the tests
    await User.deleteMany({ role: UserRole.TEACHER });
    await StaffProfile.deleteMany({});
  });

  it('should successfully create a staff member with only the mandatory minimalist fields', async () => {
    const minimalPayload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'SecurePassword123!',
      role: 'TEACHER',
      branchId: branchId.toString(),
      designation: 'TEACHER',
      employmentType: 'FULL_TIME',
      joiningDate: '2023-01-01',
      // Explicitly leaving out employeeId, bankDetails, emergencyContact, qualifications
    };

    const response = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(minimalPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(minimalPayload.email);
    
    // Assert auto-generated employeeId
    expect(response.body.data.profile.employeeId).toBeDefined();
    expect(response.body.data.profile.employeeId).toMatch(/^EMP-[0-9A-F]{6}$/);

    // Verify it exists in the database
    const dbProfile = await StaffProfile.findOne({ userId: response.body.data.user.id });
    expect(dbProfile).not.toBeNull();
    expect(dbProfile?.bankDetails).toBeUndefined();
    expect(dbProfile?.emergencyContact).toBeUndefined();
  });
});
