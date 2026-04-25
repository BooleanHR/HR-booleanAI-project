'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icons } from '../icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface FileUploaderProps {
    onFileChange: (file: File | null) => void;
}

export function FileUploader({ onFileChange }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const acceptedFile = acceptedFiles[0];
            setFile(acceptedFile);
            onFileChange(acceptedFile);
        }
    }, [onFileChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/heic': ['.heic'],
            'image/bmp': ['.bmp'],
            'image/tiff': ['.tiff', '.tif'],
        },
        multiple: false,
    });

    const handleFileRemove = () => {
        setFile(null);
        onFileChange(null);
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    if (file) {
        return (
            <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icons.attachment className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleFileRemove}>
                    <Icons.delete className="h-5 w-5 text-destructive" />
                </Button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
            <input {...getInputProps()} />
            <div className="text-center space-y-2">
                <Icons.addFile className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">PDF, JPG, PNG, DOCX, HEIC 파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-sm text-muted-foreground">최대 파일 크기: 20MB</p>
                <div className="flex flex-wrap justify-center gap-1 pt-2">
                    {['PDF', 'JPG', 'PNG', 'DOCX', 'HEIC', 'BMP', 'TIFF'].map(format => (
                         <Badge key={format} variant="secondary">{format}</Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
