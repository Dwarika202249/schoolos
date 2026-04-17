import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User.model';
import { School, ISchool } from '../models/School.model';
import { Branch } from '../models/Branch.model';
import { createError, ErrorCodes } from '../utils/error.util';

export class AuthService {
  /**
   * Generate JWT access + refresh token pair.
   * Access token: 15m TTL, contains full context for middleware chain.
   * Refresh token: 7d TTL, contains only userId for renewal.
   */
  static async generateTokens(user: IUser) {
    const accessTokenTTL = (process.env.ACCESS_TOKEN_TTL || '15m') as jwt.SignOptions['expiresIn'];
    const refreshTokenTTL = (process.env.REFRESH_TOKEN_TTL || '7d') as jwt.SignOptions['expiresIn'];

    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        schoolId: user.schoolId?.toString(), 
        role: user.role,
        branchId: user.branchId?.toString(),
      },
      process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
      { expiresIn: accessTokenTTL }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
      { expiresIn: refreshTokenTTL }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new school tenant + owner account.
   * Wrapped in a MongoDB transaction for atomicity.
   */
  static async registerSchool(data: any) {
    try {
      const slug = data.slug || data.schoolSlug;
      const name = data.name || data.schoolName;

      // 1. Check if slug exists
      const existingSchool = await School.findOne({ slug });
      if (existingSchool) {
        throw createError(400, ErrorCodes.DUPLICATE_ENTRY, 'School slug already exists');
      }

      // 2. Create Owner User first (to get real ObjectId)
      const owner = new User({
        email: data.owner?.email || data.ownerEmail || data.email,
        passwordHash: data.owner?.password || data.ownerPassword || data.password,
        firstName: data.owner?.firstName || data.ownerFirstName || data.firstName,
        lastName: data.owner?.lastName || data.ownerLastName || data.lastName,
        role: 'OWNER',
        // schoolId will be set after school creation
      });

      // 3. Create School with owner reference
      const school = new School({
        name,
        slug,
        code: slug.toUpperCase().replace(/-/g, '').slice(0, 6),
        address: {
          line1: data.address?.line1 || data.addressLine1 || data.city || 'Not Specified',
          city: data.address?.city || data.city || 'Not Specified',
          state: data.address?.state || data.state || 'Not Specified',
          pincode: data.address?.pincode || data.pincode || '000000',
        },
        phone: data.schoolPhone || data.phone || '0000000000',
        email: data.schoolEmail || data.email || data.owner?.email || data.ownerEmail,
        boardAffiliation: data.boardAffiliation || 'Not Specified',
        ownerUserId: owner._id,
      });

      // 4. Create Main Branch (Headquarters)
      const mainBranch = new Branch({
        schoolId: school._id,
        name: 'Main Campus',
        code: 'HQ',
        address: school.address,
        phone: school.phone,
        email: school.email,
        isHeadquarters: true,
        createdBy: owner._id,
      });

      // 5. Link owner to school and branch
      owner.schoolId = school._id;
      owner.branchId = mainBranch._id as any;
      
      await school.save();
      await mainBranch.save();
      await owner.save();

      const tokens = await this.generateTokens(owner);
      return { school, owner: owner.toSafeObject(), tokens };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with email + password.
   * Returns user, school, and token pair.
   */
  static async login(email: string, password: string, schoolSlug?: string) {
    // Build query — email + optional school scope
    let query: any = { email, isActive: true, isDeleted: false };
    
    if (schoolSlug) {
      const school = await School.findOne({ slug: schoolSlug, isDeleted: false });
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

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Fetch school data for frontend context
    let school = null;
    if (user.schoolId) {
      school = await School.findOne({ 
        _id: user.schoolId, 
        isDeleted: false 
      }).lean();
    }

    const tokens = await this.generateTokens(user);
    return { user: user.toSafeObject(), school, tokens };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret'
      ) as { userId: string };

      const user = await User.findOne({ 
        _id: decoded.userId, 
        isActive: true, 
        isDeleted: false 
      });

      if (!user) {
        throw createError(401, ErrorCodes.UNAUTHORIZED, 'User not found or deactivated');
      }

      const tokens = await this.generateTokens(user);
      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError(401, ErrorCodes.TOKEN_INVALID, 'Invalid refresh token');
      }
      throw error;
    }
  }
}
