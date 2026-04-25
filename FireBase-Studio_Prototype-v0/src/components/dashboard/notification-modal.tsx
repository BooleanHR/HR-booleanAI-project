'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { applicantsWithFailures } from '@/lib/mock-data';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Icons } from '../icons';

interface NotificationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NotificationModal({ isOpen, onOpenChange }: NotificationModalProps) {
  const { toast } = useToast();
  const [selectedApplicants, setSelectedApplicants] = useState<Record<string, boolean>>({});

  const handleSelectionChange = (applicantId: string) => {
    setSelectedApplicants(prev => ({
      ...prev,
      [applicantId]: !prev[applicantId],
    }));
  };

  const selectedCount = Object.values(selectedApplicants).filter(Boolean).length;

  const handleSend = () => {
    if (selectedCount === 0) return;
    
    toast({
      title: `📧 ${selectedCount}건의 알림 발송됨`,
      description: '선택된 지원자에게 서류 보완 요청 이메일이 발송되었습니다.',
      className: 'bg-info text-info-foreground'
    });
    setSelectedApplicants({});
    onOpenChange(false);
  }

  const generatePreview = () => {
    const firstSelectedId = Object.keys(selectedApplicants).find(id => selectedApplicants[id]);
    if (!firstSelectedId) {
      return "발송할 지원자를 선택하면 이메일 미리보기가 표시됩니다.";
    }
    const applicant = applicantsWithFailures.find(a => a.id === firstSelectedId);
    if (!applicant) return "";

    return `[${applicant.docType}]의 [${applicant.discrepancyItem}] 항목이 일치하지 않습니다. 정부24 등 공식 사이트에서 재발급받아 제출해주세요.`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>불일치 알림 발송</DialogTitle>
          <DialogDescription>
            '확인필요' 상태의 지원자에게 서류 보완 요청 이메일을 발송합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4 max-h-[60vh]">
            <div className="flex flex-col gap-4">
                <h4 className="font-semibold">발송 대상 선택</h4>
                <ScrollArea className="h-72 rounded-md border p-4">
                    <div className="space-y-4">
                        {applicantsWithFailures.map(applicant => (
                            <div key={applicant.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`notif-${applicant.id}`}
                                    checked={!!selectedApplicants[applicant.id]}
                                    onCheckedChange={() => handleSelectionChange(applicant.id)}
                                />
                                <Label htmlFor={`notif-${applicant.id}`} className="w-full cursor-pointer">
                                    <div className='flex justify-between'>
                                        <span>{applicant.name}</span>
                                        <span className='text-xs text-muted-foreground'>{applicant.docType}</span>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="flex flex-col gap-4">
                 <h4 className="font-semibold">이메일 미리보기</h4>
                 <Card className="h-72 flex flex-col justify-center">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                        {generatePreview()}
                    </CardContent>
                 </Card>
            </div>
        </div>
        <DialogFooter className="!justify-between">
            <div className="text-sm text-muted-foreground">
                {selectedCount}명 선택됨
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                <Button onClick={handleSend} disabled={selectedCount === 0}>
                    <Icons.sent className="mr-2" />
                    선택 발송
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
