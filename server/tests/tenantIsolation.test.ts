import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';
import { School } from '../src/models/School.model';
import { Branch } from '../src/models/Branch.model';
import { User, UserRole } from '../src/models/User.model';
import { StaffProfile } from '../src/models/StaffProfile.model';
import { AuthService } from '../src/services/auth.service';

describe('Tenant Isolation Infrastructure', () => {
  let schoolAId: mongoose.Types.ObjectId;
  let schoolBId: mongoose.Types.ObjectId;
  let adminAToken: string;
  let adminBToken: string;

  beforeAll(async () => {
    // 1. Setup School A and its Admin
    const schoolA = new School({
      name: 'School A', slug: 'school-a', code: 'S-A',
      address: { line1: '1', city: 'A', state: 'A', pincode: '123' },
      email: 'a@a.com', ownerUserId: new mongoose.Types.ObjectId(),
    });
    await schoolA.save();
    schoolAId = schoolA._id as mongoose.Types.ObjectId;

    const branchA = new Branch({
      schoolId: schoolAId, name: 'Main A', code: 'MA',
      address: { line1: '1', city: 'A', state: 'A', pincode: '123' },
      createdBy: new mongoose.Types.ObjectId(),
    });
    await branchA.save();

    const adminA = new User({
      schoolId: schoolAId, email: 'adminA@a.com', passwordHash: 'pwd',
      firstName: 'Admin', lastName: 'A', role: UserRole.ADMIN,
      isActive: true, createdBy: new mongoose.Types.ObjectId(),
    });
    await adminA.save();
    const tokenA = await AuthService.generateTokens(adminA);
    adminAToken = tokenA.accessToken;

    // 2. Setup School B and its Admin
    const schoolB = new School({
      name: 'School B', slug: 'school-b', code: 'S-B',
      address: { line1: '2', city: 'B', state: 'B', pincode: '321' },
      email: 'b@b.com', ownerUserId: new mongoose.Types.ObjectId(),
    });
    await schoolB.save();
    schoolBId = schoolB._id as mongoose.Types.ObjectId;

    const branchB = new Branch({
      schoolId: schoolBId, name: 'Main B', code: 'MB',
      address: { line1: '2', city: 'B', state: 'B', pincode: '321' },
      createdBy: new mongoose.Types.ObjectId(),
    });
    await branchB.save();

    const adminB = new User({
      schoolId: schoolBId, email: 'adminB@b.com', passwordHash: 'pwd',
      firstName: 'Admin', lastName: 'B', role: UserRole.ADMIN,
      isActive: true, createdBy: new mongoose.Types.ObjectId(),
    });
    await adminB.save();
    const tokenB = await AuthService.generateTokens(adminB);
    adminBToken = tokenB.accessToken;

    // 3. Inject cross-tenant data (Create a Staff in School B)
    const userB = new User({
      schoolId: schoolBId, branchId: branchB._id, email: 'teacher@b.com',
      passwordHash: 'pwd', firstName: 'Teacher', lastName: 'B',
      role: UserRole.TEACHER, isActive: true, createdBy: adminB._id,
    });
    await userB.save();

    const staffB = new StaffProfile({
      schoolId: schoolBId, branchId: branchB._id, userId: userB._id,
      employeeId: 'EMP-B-01', designation: 'TEACHER', employmentType: 'FULL_TIME',
      joiningDate: new Date(), createdBy: adminB._id,
    });
    await staffB.save();
  });

  afterAll(async () => {
    await School.deleteMany({});
    await Branch.deleteMany({});
    await User.deleteMany({});
    await StaffProfile.deleteMany({});
  });

  it('verifies that School A Admin cannot view School B staff', async () => {
    // School A requests staff list
    const responseA = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${adminAToken}`);

    expect(responseA.status).toBe(200);
    // Even though there is a staff member in the DB, it belongs to School B
    expect(responseA.body.data).toHaveLength(0);

    // School B requests staff list
    const responseB = await request(app)
      .get('/api/v1/staff')
      .set('Authorization', `Bearer ${adminBToken}`);

    expect(responseB.status).toBe(200);
    // School B should successfully see their own staff
    expect(responseB.body.data).toHaveLength(1);
    expect(responseB.body.data[0].employeeId).toBe('EMP-B-01');
  });
});
