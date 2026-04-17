import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
      userRole?: string;
      userId?: string;
      branchId?: string;
      jwtPayload?: {
        userId: string;
        schoolId: string;
        role: string;
        branchId?: string;
      };
    }
  }
}

export {};
