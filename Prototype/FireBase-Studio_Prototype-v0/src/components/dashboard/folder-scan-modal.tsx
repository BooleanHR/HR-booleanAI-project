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
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';

interface FolderScanModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  path: string;
}

const mockTree = {
  name: '2026_상반기_공채',
  children: [
    {
      name: '1001_홍길동',
      children: [
        { name: '1. 입사지원서', file: '이력서.pdf' },
        { name: '2. 자격증', file: '정보처리기사.jpg' },
        { name: '3. 경력증명서', file: '건강보험자격득실.pdf' },
        { name: '4. 어학사항', file: '토익성적표.jpg' },
      ],
    },
    {
      name: '1002_김철수',
      children: [
        { name: '1. 입사지원서', file: '이력서.pdf' },
        { name: '2. 자격증', file: 'SQLD.pdf' },
      ],
    },
    {
      name: '1003_이영희',
      children: [
        { name: '1. 입사지원서', file: '이력서.docx' },
        { name: '3. 경력증명서', file: '경력증명서_A사.pdf' },
        { name: '3. 경력증명서', file: '경력증명서_B사.pdf' },
      ],
    }
  ],
};

const TreeItem = ({ name, icon, children, file }: { name: string, icon: React.ReactNode, children?: React.ReactNode, file?: string }) => (
    <div className="pl-4">
        <div className="flex items-center gap-2 py-1">
            {icon}
            <span>{name}</span>
            {file && <span className="text-muted-foreground text-sm ml-2">{'->'} {file}</span>}
        </div>
        {children && <div className="border-l border-dashed border-muted-foreground/50 ml-3">{children}</div>}
    </div>
)


export function FolderScanModal({ isOpen, onOpenChange, path }: FolderScanModalProps) {
    const { toast } = useToast();

    const handleStartVerification = () => {
        toast({
            title: '🔍 검증 시작됨',
            description: `총 ${mockTree.children.length}명의 지원자에 대한 서류 검증을 시작합니다.`,
            className: 'bg-info text-info-foreground'
        });
        onOpenChange(false);
    }
  
    return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>폴더 스캔 결과</DialogTitle>
          <DialogDescription>
            '{path}' 에서 발견된 폴더 구조입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
            <div className='flex items-center gap-2 font-semibold'>
                <Icons.folderOpen className="h-5 w-5 text-primary" />
                {mockTree.name}
            </div>
            <div className="border-l border-dashed border-muted-foreground/50 ml-3">
                {mockTree.children.map(applicant => (
                    <TreeItem key={applicant.name} name={applicant.name} icon={<Icons.folder className="h-5 w-5 text-primary" />}>
                         {applicant.children.map(doc => (
                             <TreeItem key={doc.name+doc.file} name={doc.name} icon={<Icons.folder className="h-5 w-5 text-primary" />} file={doc.file}>
                             </TreeItem>
                         ))}
                    </TreeItem>
                ))}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleStartVerification}>검증 시작</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
