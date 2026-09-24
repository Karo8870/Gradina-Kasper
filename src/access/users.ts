import type { Access, FieldAccess, Where } from 'payload';

type Role = 'admin' | 'customer';
type RoleUser = { id?: number | string; role?: Role };

function getRoleUser(user: unknown) {
  return user as RoleUser | null | undefined;
}

export function hasRole(user: unknown, role: Role) {
  return getRoleUser(user)?.role === role;
}

export const publicAccess: Access = () => true;

export const denyFieldAccess: FieldAccess = () => false;

export const adminOnly = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, 'admin');

export const adminOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  const user = getRoleUser(req.user);
  return user?.id ? { id: { equals: user.id } } : false;
};

export const adminOnlyField: FieldAccess = ({ req }) =>
  hasRole(req.user, 'admin');

export const isAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isCustomer: FieldAccess = ({ req }) =>
  hasRole(req.user, 'customer');

export const isDocumentOwner: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  const user = getRoleUser(req.user);
  return user?.id ? { customer: { equals: user.id } } : false;
};

export const adminOrPublishedProduct: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  const publicProductWhere: Where = {
    and: [
      {
        _status: {
          equals: 'published'
        }
      },
      {
        visibility: {
          equals: 'public'
        }
      }
    ]
  };

  return publicProductWhere;
};

export const adminOrPublishedContent: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  return {
    _status: {
      equals: 'published'
    }
  };
};
