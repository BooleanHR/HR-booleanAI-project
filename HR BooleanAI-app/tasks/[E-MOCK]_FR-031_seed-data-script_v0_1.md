---
name: Feature Task
title: "[Feature] FR-031: Seed 데이터 생성 스크립트"
labels: 'feature, mock-external, database, priority:high'
version: v0.1
status: 초안 — 검수 대기
source_task_id: D-005
---

## :dart: Summary
- **기능명:** [FR-031] Seed 데이터 생성 스크립트
- **Epic:** Mock/External
- **목적:** 개발 환경에서 테스트용 초기 데이터를 자동 생성하는 Prisma Seed 스크립트를 작성한다. User 3건(역할별), Batch 1건, Applicant 6건(수험번호 유/무 각 3건)을 생성하여 즉시 기능 테스트가 가능한 환경을 확보한다.

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] **TB-1:** `prisma/seed.ts` 파일 생성
  ```typescript
  import { PrismaClient, UserRole, UserStatus, BatchStatus } from '@prisma/client'
  const prisma = new PrismaClient()

  async function main() {
    // User 3건
    const operator = await prisma.user.create({
      data: { email: 'operator@test.com', nameMasked: '김○○', role: 'OPERATOR', passwordHash: 'hashed', status: 'ACTIVE' }
    });
    const admin = await prisma.user.create({
      data: { email: 'admin@test.com', nameMasked: '이○○', role: 'ADMIN', passwordHash: 'hashed', status: 'ACTIVE' }
    });
    const auditor = await prisma.user.create({
      data: { email: 'auditor@test.com', nameMasked: '박○○', role: 'AUDITOR', passwordHash: 'hashed', status: 'ACTIVE' }
    });

    // Batch 1건
    const batch = await prisma.batch.create({
      data: { batchName: '2026년 상반기 공채 1차', status: 'OPEN', createdById: admin.userId }
    });

    // Applicant 6건 (수험번호 유 3건, 무 3건)
    for (let i = 1; i <= 3; i++) {
      await prisma.applicant.create({
        data: { batchId: batch.batchId, examNumber: `2026-000${i}`, nameMasked: `홍○○${i}`, email: `applicant${i}@test.com` }
      });
      await prisma.applicant.create({
        data: { batchId: batch.batchId, nameMasked: `김○○${i}`, email: `applicant${i+3}@test.com` }
      });
    }
  }
  main().catch(console.error).finally(() => prisma.$disconnect());
  ```
- [ ] **TB-2:** `package.json`에 prisma seed 설정 추가
  ```json
  "prisma": { "seed": "tsx prisma/seed.ts" }
  ```
- [ ] **TB-3:** `npx prisma db seed` 실행 → 데이터 생성 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
**Scenario 1:** `npx prisma db seed` 실행 → User 3건, Batch 1건, Applicant 6건 생성
**Scenario 2:** 수험번호 있는 Applicant 3건, 없는 Applicant 3건 구분 확인

## :construction: Dependencies & Blockers
- **Depends on:** FR-016 (B-010: DB 마이그레이션 완료)
- **Blocks:** 없음 (개발 편의용)

---
*Document Version: v0.1 (초안) | Source: TASK-LIST D-005 | SRS: v1.1*
