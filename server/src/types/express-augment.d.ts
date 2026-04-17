// express-augment.d.ts — Unified Express Request augmentation
// Matches the middleware chain: auth → tenant → rbac → handler

declare global {
  namespace Express {
    interface Request {
      // Populated by authMiddleware (JWT verification)
      jwtPayload?: {
        userId: string;
        schoolId: string;
        role: string;
        branchId?: string;
      };

      // Convenience shortcuts (set by authMiddleware)
      userId?: string;
      userRole?: string;

      // Populated by tenantContextMiddleware (school validation)
      tenantId?: string;
      tenantSlug?: string;
      branchId?: string;
    }
  }
}

export {};
