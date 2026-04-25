'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SiteSettingsModal({ isOpen, onOpenChange }: SiteSettingsModalProps) {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: '✅ 계정 정보 저장됨',
      description: '사이트 계정 정보가 안전하게 저장되었습니다.',
      className: 'bg-success text-success-foreground'
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사이트 계정 설정</DialogTitle>
          <DialogDescription>
            RPA가 서류를 검증할 외부 사이트(예: TOEIC, 정부24)의 계정 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="site-name" className="text-right">
              사이트명
            </Label>
            <Input id="site-name" value="TOEIC" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              아이디
            </Label>
            <Input id="username" value="testuser" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              비밀번호
            </Label>
            <Input id="password" type="password" value="password123" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
