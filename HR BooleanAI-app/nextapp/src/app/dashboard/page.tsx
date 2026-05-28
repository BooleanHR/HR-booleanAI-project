import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // 배치 목록 및 통계 로드
  const [batches, stats] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: { select: { applicants: true } },
      },
    }),
    prisma.batch.aggregate({
      _sum: {
        totalCount: true,
        passCount: true,
        failCount: true,
        escalateCount: true,
      },
      _count: { id: true },
    }),
  ]);

  const escalateTotal = stats._sum.escalateCount ?? 0;
  const totalBatches = stats._count.id;
  const totalApplicants = stats._sum.totalCount ?? 0;
  const totalPass = stats._sum.passCount ?? 0;

  return (
    <DashboardClient
      session={session}
      batches={batches}
      stats={{ escalateTotal, totalBatches, totalApplicants, totalPass }}
    />
  );
}
