import { getSession } from '@/lib/api/auth';
import { ReactNode } from 'react';

export default async function layout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session?.admin) {
    return <>Not found</>;
  }

  return <>{children}</>;
}
