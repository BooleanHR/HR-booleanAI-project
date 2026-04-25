'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Verification } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '../ui/button';
import { VerificationStatusBadge } from '../verification-status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ReorderModal } from './reorder-modal';
import { Icons } from '../icons';

interface VerificationDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  verification: Verification | null;
}

export function VerificationDetailModal({
  isOpen,
  onOpenChange,
  verification,
}: VerificationDetailModalProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  if (!verification) return null;

  const handleApprove = () => {
    toast({
      title: "✅ 승인 처리 및 저장 완료",
      description: `${verification.applicantName}님의 ${verification.documentType}이(가) 승인되어 로컬 '5. 진위확인결과' 폴더에 저장되었습니다.`,
      variant: 'default',
      className: 'bg-success text-success-foreground'
    });
    onOpenChange(false);
  };
  
  const handleReject = () => {
    toast({
        title: "❌ 반려 처리되었습니다.",
        description: `사유: ${rejectionReason}`,
        variant: 'destructive',
    });
    setRejectionReason('');
    setIsRejectDialogOpen(false);
    onOpenChange(false);
  };

  const hasDiscrepancy = verification.discrepancies && verification.discrepancies.some(d => !d.match);
  const aiAssessmentText = "입사지원서의 토익 점수와 실제 어학성적표의 점수는 일치하나, 기관 조회 화면의 발급번호가 다릅니다.";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                검증 결과 상세 — {verification.applicantName} | {verification.documentType}
              </span>
              <VerificationStatusBadge status={verification.status} />
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 h-full overflow-y-auto pr-4 py-4">
              {/* Top Section: Parallel Capture Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
                  <Card>
                      <CardHeader className="flex-row items-center justify-between py-3">
                          <CardTitle className="text-lg">지원자 제출 원본 서류</CardTitle>
                          <div className='flex items-center gap-1'>
                              <Button variant="outline" size="sm" onClick={() => setIsReorderOpen(true)}><Icons.reorder className="mr-2 h-4 w-4" /> 페이지 순서 변경/분리</Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.zoomIn className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.zoomOut className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.maximize className="h-4 w-4" /></Button>
                          </div>
                      </CardHeader>
                      <CardContent className="relative bg-muted/50 aspect-[4/3]">
                          <Image src="https://picsum.photos/seed/doc1/800/1100" alt="Original document" layout="fill" objectFit="contain" data-ai-hint="document certificate"/>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader className="flex-row items-center justify-between py-3">
                          <CardTitle className="text-lg">기관조회 로컬 RPA 캡처</CardTitle>
                           <div className='flex items-center gap-1'>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.zoomIn className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.zoomOut className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Icons.maximize className="h-4 w-4" /></Button>
                          </div>
                      </CardHeader>
                      <CardContent className="relative bg-muted/50 aspect-[4/3]">
                          <Image src="https://picsum.photos/seed/rpa1/800/600" alt="RPA Capture" layout="fill" objectFit="contain" data-ai-hint="screenshot website" />
                      </CardContent>
                  </Card>
              </div>

              {/* Bottom Section: Triple Check Data Table & AI Assessment */}
              <div className="flex flex-col gap-4">
                  <Card>
                      <CardHeader className='py-3'>
                          <CardTitle className="text-lg">Triple Check 데이터 비교</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>항목</TableHead>
                                      <TableHead>1.입사지원서 기재내용</TableHead>
                                      <TableHead>2.증빙서류 OCR 추출</TableHead>
                                      <TableHead>3.기관 조회 결과</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {verification.discrepancies?.map((item) => (
                                      <TableRow key={item.item} className={cn(!item.match && "bg-destructive/10")}>
                                          <TableCell className="font-medium">{item.item}</TableCell>
                                          <TableCell>{item.claimValue}</TableCell>
                                          <TableCell>{item.ocrValue}</TableCell>
                                          <TableCell className={cn(!item.match && "text-destructive font-semibold")}>{item.dbValue}</TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader className='py-3'>
                          <CardTitle className="text-lg">Vision LLM AI 종합 평가</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Alert variant={hasDiscrepancy ? "destructive" : "default"} className={cn(hasDiscrepancy ? "" : "bg-success/10 border-success/50")}>
                              <Icons.review className={cn("h-4 w-4", hasDiscrepancy ? "" : "text-success")} />
                              <AlertTitle>{hasDiscrepancy ? '불일치 항목 발견' : '모든 항목 일치'}</AlertTitle>
                              <AlertDescription>
                                  {hasDiscrepancy ? aiAssessmentText : "AI가 모든 항목의 일치함을 확인했습니다."}
                              </AlertDescription>
                          </Alert>
                      </CardContent>
                  </Card>
              </div>
          </div>

          <DialogFooter className="pt-4 border-t !justify-between">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>닫기</Button>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="bg-success hover:bg-success/90">✅ 승인 (로컬 저장)</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>결과를 승인하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          승인 처리 후에는 되돌릴 수 없습니다. 최종 확인 후 진행해주세요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-success hover:bg-success/90">승인</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>❌ 반려</Button>
              </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>반려 사유 입력</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                  <Textarea
                      placeholder="반려 사유를 구체적으로 입력하세요. 이 내용은 지원자에게 발송될 수 있습니다. (필수)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                  />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>취소</Button>
                  <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                  >
                      반려 처리
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <ReorderModal isOpen={isReorderOpen} onOpenChange={setIsReorderOpen} />
    </>
  );
}
