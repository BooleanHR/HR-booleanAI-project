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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Icons } from '../icons';
import Image from 'next/image';
import placeholderData from '@/lib/placeholder-images.json';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReorderSplitModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ReorderModal({ isOpen, onOpenChange }: ReorderSplitModalProps) {
  const { toast } = useToast();
  const [selectedPages, setSelectedPages] = useState<Record<string, boolean>>({});
  const thumbnails = placeholderData.placeholderImages;

  const handleSelectionChange = (pageId: string) => {
    setSelectedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  const selectedCount = Object.values(selectedPages).filter(Boolean).length;
  
  const handleSplit = () => {
    if (selectedCount === 0) return;
    toast({
        title: '✂️ 페이지 분리됨',
        description: `${selectedCount}개의 페이지가 별도 문서로 분리되었습니다.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>페이지 순서 변경 / 분리 (Drag & Drop)</DialogTitle>
          <DialogDescription>
            페이지 썸네일을 드래그하여 순서를 변경하거나, 특정 페이지만 선택하여 별도 문서로 분리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Alert>
                <Icons.review className="h-4 w-4" />
                <AlertTitle>기능 안내</AlertTitle>
                <AlertDescription>
                    이 프로토타입에서는 실제 드래그앤드롭 및 분리 기능이 아닌 UI 컨셉만 확인 가능합니다.
                </AlertDescription>
            </Alert>
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {thumbnails.map((thumb, index) => (
                    <div key={thumb.id} className="space-y-2">
                        <Label htmlFor={thumb.id} className="relative aspect-[3/4] border rounded-md p-1 group cursor-move block">
                            <Image src={thumb.imageUrl} alt={thumb.description} layout='fill' objectFit='cover' className='rounded-sm'/>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.reorder className="text-white h-8 w-8" />
                            </div>
                            <div className="absolute top-1 right-1 bg-background/80 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                            </div>
                        </Label>
                         <div className="flex items-center space-x-2">
                            <Checkbox 
                                id={thumb.id} 
                                checked={!!selectedPages[thumb.id]}
                                onCheckedChange={() => handleSelectionChange(thumb.id)}
                            />
                            <Label htmlFor={thumb.id} className="text-sm font-medium leading-none">선택</Label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <DialogFooter className="!justify-between items-center">
          <div className='text-sm text-muted-foreground'>
            {selectedCount > 0 ? `${selectedCount}개 페이지 선택됨` : ''}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button onClick={handleSplit} disabled={selectedCount === 0}>선택 페이지 분리</Button>
            <Button onClick={() => onOpenChange(false)}>순서 저장</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
