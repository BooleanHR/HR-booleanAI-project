'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { applicants } from "@/lib/mock-data";
import type { Applicant, DocumentType } from "@/types";
import { FileUploader } from "@/components/upload/file-uploader";
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const documentTypes: DocumentType[] = ['졸업증명서', '자격증', '경력증명서', '성적증명서', '기타'];

type UploadStep = 'form' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStep, setUploadStep] = useState<UploadStep>('form');
    const [progress, setProgress] = useState(0);

    const handleUpload = () => {
        setUploadStep('uploading');
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploadStep('success');
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const resetForm = () => {
        setSelectedApplicant(null);
        setSelectedDocType(null);
        setFile(null);
        setUploadStep('form');
        setProgress(0);
    }

    const isButtonDisabled = !selectedApplicant || !selectedDocType || !file;

    const renderContent = () => {
        switch (uploadStep) {
            case 'uploading':
                return (
                    <div className="text-center space-y-4 py-12">
                        <Icons.spinner className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">AI 검증 중...</h3>
                        <p className="text-sm text-muted-foreground">OCR → Triple Check → Audit Trail</p>
                        <Progress value={progress} className="w-full" />
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center space-y-4 py-12">
                        <Icons.pass className="mx-auto h-16 w-16 text-success" />
                        <h3 className="text-lg font-semibold">검증 완료: PASS (신뢰도 94%)</h3>
                        <p className="text-sm text-muted-foreground">파일명: {file?.name}</p>
                        <div className="flex justify-center gap-2 pt-4">
                            <Button variant="outline" onClick={resetForm}>새 서류 업로드</Button>
                            <Button asChild>
                                <Link href="/dashboard">대시보드에서 결과 확인</Link>
                            </Button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center space-y-4 py-12">
                        <Icons.fail className="mx-auto h-16 w-16 text-destructive" />
                        <h3 className="text-lg font-semibold">검증 실패</h3>
                        <p className="text-sm text-muted-foreground">파일을 처리하는 중 오류가 발생했습니다.</p>
                         <div className="flex justify-center gap-2 pt-4">
                            <Button variant="outline" onClick={resetForm}>다시 시도</Button>
                        </div>
                    </div>
                );
            case 'form':
            default:
                return (
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-lg font-medium mb-1">Step 1: 지원자 선택</h4>
                            <Select onValueChange={(value) => setSelectedApplicant(applicants.find(a => a.id === value) || null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="지원자를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {applicants.map(applicant => (
                                        <SelectItem key={applicant.id} value={applicant.id}>
                                            {applicant.name} ({applicant.examNumber ? `수험번호: ${applicant.examNumber}` : '수험번호 없음'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium mb-1">Step 2: 서류 종류 선택</h4>
                            <Select onValueChange={(value: DocumentType) => setSelectedDocType(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="서류 종류를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium mb-1">Step 3: 파일 업로드</h4>
                            <FileUploader onFileChange={setFile} />
                        </div>
                        
                        <Separator />
                        
                        <Button className="w-full" size="lg" disabled={isButtonDisabled} onClick={handleUpload}>
                            <Icons.upload className="mr-2 h-4 w-4" />
                            업로드 및 검증 시작
                        </Button>
                    </div>
                );
        }
    }


    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>서류 업로드 및 AI 검증</CardTitle>
                    <CardDescription>지원자의 서류를 업로드하여 진위확인을 시작합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
