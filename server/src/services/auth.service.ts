import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { School, ISchool } from '../models/School.model';
import { createError, ErrorCodes } from '../utils/error.util';

export class AuthService {
  static async generateTokens(user: IUser) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        schoolId: user.schoolId, 
        role: user.role,
        branchId: user.branchId 
      },
      process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async registerSchool(data: any) {
    // 1. Check if slug exists
    const existingSchool = await School.findOne({ slug: data.schoolSlug });
    if (existingSchool) {
      throw createError(400, ErrorCodes.DUPLICATE_ENTRY, 'School slug already exists');
    }

    // 2. Create School (temporarily setting ownerUserId to a dummy value)
    const dummyId = new User()._id;
    const school = new School({
      name: data.schoolName,
      slug: data.schoolSlug,
      code: data.schoolSlug.toUpperCase().slice(0, 6), // Generate a default code
      address: {
        line1: data.city, // simplified for MVP
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      phone: data.schoolPhone || data.phone,
      email: data.schoolEmail,
      boardAffiliation: data.boardAffiliation,
      ownerUserId: dummyId,
    });

    // 3. Create Owner User
    const owner = new User({
      schoolId: school._id,
      email: data.ownerEmail,
      passwordHash: data.ownerPassword,
      firstName: data.ownerFirstName,
      lastName: data.ownerLastName,
      role: 'OWNER',
    });

    // 4. Update school with actual owner ID
    school.ownerUserId = owner._id;
    
    await school.save();
    await owner.save();

    const tokens = await this.generateTokens(owner);
    return { school, owner: owner.toSafeObject(), tokens };
  }

  static async login(email: string, password: string, schoolSlug?: string) {
    // Find user by email. Note: email + schoolId is unique.
    // If schoolSlug is provided, we can narrow it down.
    let query: any = { email };
    
    if (schoolSlug) {
      const school = await School.findOne({ slug: schoolSlug });
      if (school) {
        query.schoolId = school._id;
      }
    }

    const user = await User.findOne(query).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, ErrorCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw createError(403, ErrorCodes.FORBIDDEN, 'User account is deactivated');
    }

    const tokens = await this.generateTokens(user);
    return { user: user.toSafeObject(), tokens };
  }
}
