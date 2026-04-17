import { FilterQuery } from 'mongoose';
import { Request } from 'express';

/**
 * MANDATORY utility — wraps any MongoDB filter with tenant scope.
 */
export const withTenantScope = <T>(
  req: Request,
  filter: FilterQuery<T> = {}
): FilterQuery<T> => {
  if (!req.tenantId) {
    throw new Error('CRITICAL: withTenantScope called without tenant context');
  }
  
  return {
    ...filter,
    schoolId: req.tenantId,
    isDeleted: { $ne: true },
  };
};

/**
 * Branch-scoped variant for multi-branch operations.
 */
export const withBranchScope = <T>(
  req: Request,
  filter: FilterQuery<T> = {}
): FilterQuery<T> => {
  const base = withTenantScope(req, filter);
  
  if (req.branchId) {
    return { ...base, branchId: req.branchId };
  }
  
  return base;
};
