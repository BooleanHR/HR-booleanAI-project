import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { loadAgencies } from '@/lib/rpa/agency-config';
import AgenciesClient from './AgenciesClient';

export default async function AgenciesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN') redirect('/dashboard');

  const [credentials, agencies] = await Promise.all([
    prisma.siteCredential.findMany({
      orderBy: { siteName: 'asc' },
    }),
    Promise.resolve(loadAgencies()),
  ]);

  return <AgenciesClient session={session} credentials={credentials} initialAgencies={agencies} />;
}
