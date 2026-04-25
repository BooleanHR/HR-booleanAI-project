'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { verifications as allVerifications } from '@/lib/mock-data';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/dashboard/verifications-table-columns';
import { Icons } from '@/components/icons';
import { SiteSettingsModal } from '@/components/dashboard/site-settings-modal';
import { NotificationModal } from '@/components/dashboard/notification-modal';
import { FolderScanModal } from '@/components/dashboard/folder-scan-modal';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  
  const [isSiteSettingsOpen, setIsSiteSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFolderScanOpen, setIsFolderScanOpen] = useState(false);
  const [scanPath, setScanPath] = useState('C:\\JobPostings\\2026_상반기_공채');
  const { toast } = useToast();

  const handleScan = () => {
    if(!scanPath) {
        toast({
            title: '경고',
            description: '폴더 경로를 입력해주세요.',
            variant: 'destructive'
        });
        return;
    }
    setIsFolderScanOpen(true);
  }

  const failuresData = allVerifications.filter(v => v.finalResult === '확인필요');
  const manualReviewData = allVerifications.filter(v => v.status === 'MANUAL_REVIEW');

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground">서류 검증 현황을 확인하세요.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSiteSettingsOpen(true)}>
              <Icons.settings className="mr-2" />
              사이트 계정 설정
            </Button>
          </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className='text-lg'>채용공고 폴더 스캔</CardTitle>
                <CardDescription>로컬에 저장된 채용공고 폴더를 스캔하여 서류 검증을 시작합니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input 
                        value={scanPath}
                        onChange={(e) => setScanPath(e.target.value)}
                        placeholder="채용공고 폴더 경로 입력"
                    />
                    <Button onClick={handleScan}>
                        <Icons.folderScan className="mr-2" />
                        경로 스캔
                    </Button>
                </div>
            </CardContent>
        </Card>

        <StatsCards />
        
        <Tabs value={tab} className="w-full">
          <div className='flex justify-between items-center mb-2'>
            <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
              <TabsTrigger value="all">전체 보기</TabsTrigger>
              <TabsTrigger value="failures">확인 필요</TabsTrigger>
              <TabsTrigger value="manual">수동 리뷰 큐</TabsTrigger>
            </TabsList>
            <div className='flex gap-2'>
              <Button variant="outline" onClick={() => setIsNotificationOpen(true)}>
                <Icons.notifications className="mr-2" />
                불일치 알림 발송
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <DataTable
              columns={columns}
              data={allVerifications}
              filterColumnId="applicantName"
              filterPlaceholder="지원자명 또는 파일명으로 검색..."
            />
          </TabsContent>
          <TabsContent value="failures">
            <DataTable
              columns={columns}
              data={failuresData}
              filterColumnId="applicantName"
              filterPlaceholder="지원자명 또는 파일명으로 검색..."
            />
          </TabsContent>
          <TabsContent value="manual">
            <DataTable
              columns={columns}
              data={manualReviewData}
              filterColumnId="applicantName"
              filterPlaceholder="지원자명 또는 파일명으로 검색..."
            />
          </TabsContent>
        </Tabs>
        <div className='flex justify-end gap-2'>
            <Button variant="outline">
                <Icons.download className="mr-2" />
                엑셀 결과 다운로드
            </Button>
            <Button variant="outline">
                <Icons.file className="mr-2" />
                감사 PDF 리포트 다운로드
            </Button>
        </div>
      </div>
      <SiteSettingsModal isOpen={isSiteSettingsOpen} onOpenChange={setIsSiteSettingsOpen} />
      <NotificationModal isOpen={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
      <FolderScanModal isOpen={isFolderScanOpen} onOpenChange={setIsFolderScanOpen} path={scanPath} />
    </>
  );
}
