'use client';

import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { UserNav } from '@/components/user-nav';
import { usePathname, useSearchParams } from 'next/navigation';
import { verifications } from '@/lib/mock-data';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const manualReviewCount = verifications.filter(
    (v) => v.status === 'MANUAL_REVIEW'
  ).length;

  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: Icons.home, tab: null },
    {
      href: '/dashboard?tab=failures',
      label: '확인 필요',
      icon: Icons.fail,
      tab: 'failures',
      badge: verifications.filter(v => v.finalResult === '확인필요').length,
    },
    {
      href: '/dashboard?tab=manual',
      label: '수동 리뷰 큐',
      icon: Icons.review,
      tab: 'manual',
      badge: manualReviewCount,
    },
    { href: '#', label: '리포트', icon: Icons.reports, disabled: true, tab: 'reports' },
  ];

  const checkIsActive = (item: typeof navItems[0]) => {
    if (item.href.startsWith('/dashboard')) {
        if (pathname !== '/dashboard') return false;
        return item.tab === currentTab;
    }
    return pathname === item.href;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold text-primary">
                HR BooleanAI
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={checkIsActive(item)}
                    disabled={item.disabled}
                    className="justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.badge && item.badge > 0 ? (
                        <span className="ml-auto inline-flex h-5 items-center justify-center rounded-full bg-warning px-2 text-xs font-semibold text-warning-foreground">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
            <UserNav />
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
