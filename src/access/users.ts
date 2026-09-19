import type { Access, FieldAccess } from 'payload';

type Role = 'admin' | 'customer';
type RoleUser = { id?: number | string; role?: Role };

function getRoleUser(user: unknown) {
  return user as RoleUser | null | undefined;
}

export function hasRole(user: unknown, role: Role) {
  return getRoleUser(user)?.role === role;
}

export const publicAccess: Access = () => true;

export const adminOnly = ({ req }: { req: { user?: unknown } }) =>
  hasRole(req.user, 'admin');

export const adminOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true;

  const user = getRoleUser(req.user);
  return user?.id ? { id: { equals: user.id } } : false;
};

export const adminOnlyField: FieldAccess = ({ req }) =>
  hasRole(req.user, 'admin');
