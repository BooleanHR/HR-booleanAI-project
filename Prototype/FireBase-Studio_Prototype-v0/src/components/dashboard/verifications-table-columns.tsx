"use client";

import { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Verification } from "@/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { VerificationDetailModal } from './verification-detail-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const ActionCell = ({ row }: { row: { original: Verification } }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const verification = row.original;
  
    return (
      <>
        <VerificationDetailModal 
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            verification={verification}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
              상세 보기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
};

const FinalResultBadge = ({ result }: { result: '완료' | '확인필요' }) => {
  return (
    <Badge variant={result === '완료' ? 'success' : 'destructive'}>
      {result}
    </Badge>
  );
};


export const columns: ColumnDef<Verification>[] = [
  {
    accessorKey: "examNumber",
    header: "수험번호",
  },
  {
    accessorKey: "applicantName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            지원자명
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "documentType",
    header: "서류 종류",
  },
  {
    accessorKey: "fileName",
    header: "파일명",
  },
  {
    accessorKey: "confidence",
    header: "AI 신뢰도",
    cell: ({ row }) =>
      row.original.confidence ? `${row.original.confidence}%` : "—",
  },
  {
    accessorKey: "verificationMethod",
    header: "확인 방법",
  },
  {
    accessorKey: "finalResult",
    header: "검증 결과",
    cell: ({ row }) => <FinalResultBadge result={row.original.finalResult} />,
  },
  {
    id: "actions",
    header: "액션",
    cell: ActionCell,
  },
];