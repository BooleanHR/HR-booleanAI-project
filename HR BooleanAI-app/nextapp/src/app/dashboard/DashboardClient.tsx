'use client';

import { useState } from 'react';
import { logoutAction } from '@/app/login/actions';
import type { SessionUser } from '@/lib/auth/session';
import type { Batch } from '@/generated/prisma/client';
import { downloadManualExcelAction, uploadManualExcelAction } from './actions';

interface BatchWithCount extends Batch {
  _count: { applicants: number };
}

interface DashboardStats {
  escalateTotal: number;
  totalBatches: number;
  totalApplicants: number;
  totalPass: number;
}

interface Props {
  session: SessionUser;
  batches: BatchWithCount[];
  stats: DashboardStats;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'var(--tx2)' },
  RUNNING: { label: '진행 중', color: 'var(--blu)' },
  COMPLETED: { label: '완료', color: 'var(--acc)' },
  FAILED: { label: '오류', color: 'var(--red)' },
};

export default function DashboardClient({ session, batches, stats }: Props) {
  const [activeTab, setActiveTab] = useState<'batches' | 'escalate'>('batches');
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const filteredBatches = batches.filter((b) => filter === 'ALL' || b.status === filter);

  const handleDownloadExcel = async (batchId: string, batchName: string) => {
    try {
      const res = await downloadManualExcelAction(batchId);
      if (res.success && res.data) {
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data}`;
        link.download = `수동검증명단_${batchName}.xlsx`;
        link.click();
      } else {
        alert(`엑셀 다운로드 실패: ${res.error}`);
      }
    } catch (err: any) {
      alert(`오류 발생: ${err.message || err}`);
    }
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (!base64) return;
      
      try {
        const res = await uploadManualExcelAction(base64);
        if (res.success) {
          alert(`수동 검증 동기화 완료: 성공 ${res.successCount}건, 실패 ${res.failCount}건`);
          window.location.reload();
        } else {
          alert(`엑셀 반영 실패: ${res.error}`);
        }
      } catch (err: any) {
        alert(`반영 중 오류 발생: ${err.message || err}`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ── 사이드바 + 메인 레이아웃 ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 사이드바 */}
        <aside style={{
          width: 220,
          background: 'var(--s1)',
          borderRight: '1px solid var(--bd1)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* 로고 */}
          <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--bd1)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--acc)', letterSpacing: 2 }}>
              HR BOOLEANAI
            </div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>v1.0 — 서류 진위확인 AI</div>
          </div>

          {/* 네비게이션 */}
          <nav style={{ flex: 1, padding: '12px 10px' }}>
            {[
              { href: '/dashboard', icon: '📊', label: '대시보드' },
              { href: '/settings/agencies', icon: '⚙️', label: '기관 설정' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--r)',
                  fontSize: 13,
                  color: item.href === '/dashboard' ? 'var(--tx0)' : 'var(--tx2)',
                  background: item.href === '/dashboard' ? 'var(--acc2)' : 'transparent',
                  border: item.href === '/dashboard' ? '1px solid var(--acc3)' : '1px solid transparent',
                  textDecoration: 'none',
                  marginBottom: 2,
                  transition: 'all .15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* 사용자 정보 */}
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--bd1)' }}>
            <div style={{ fontSize: 12, color: 'var(--tx0)', fontWeight: 600 }}>{session.name}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{session.email}</div>
            <div style={{ marginTop: 4 }}>
              <span className="badge b-info" style={{ fontSize: 9 }}>{session.role}</span>
            </div>
            <form action={logoutAction} style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                로그아웃
              </button>
            </form>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* 상단 헤더 */}
          <header style={{
            padding: '18px 28px',
            borderBottom: '1px solid var(--bd1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: 'rgba(11,15,26,.6)',
            backdropFilter: 'blur(10px)',
          }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>대시보드</h1>
              <p style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 2 }}>배치 관리 및 검증 현황</p>
            </div>
            <button
              id="btn-new-batch"
              className="btn btn-acc"
              onClick={() => setShowNewBatchModal(true)}
            >
              + 새 배치 등록
            </button>
          </header>

          <div style={{ padding: '24px 28px', flex: 1 }}>
            {/* ESCALATE 배너 */}
            {stats.escalateTotal > 0 && (
              <div style={{
                background: 'var(--yel2)',
                border: '1px solid var(--yel3)',
                borderRadius: 'var(--rl)',
                padding: '14px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--yel)' }}>
                      수동 검토 필요: {stats.escalateTotal}건
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx1)', marginTop: 2 }}>
                      AI가 판정하지 못한 서류가 있습니다. 수동으로 확인해주세요.
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--yel)', color: '#000', fontWeight: 700 }}
                  onClick={() => setActiveTab('escalate')}
                >
                  확인하기 →
                </button>
              </div>
            )}

            {/* 통계 카드 */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
              {[
                { label: '전체 배치', value: stats.totalBatches, color: 'var(--blu)', icon: '📦' },
                { label: '검증 완료', value: stats.totalApplicants, color: 'var(--tx1)', icon: '👥' },
                { label: '승인 (PASS)', value: stats.totalPass, color: 'var(--acc)', icon: '✅' },
                { label: '수동 검토', value: stats.escalateTotal, color: 'var(--yel)', icon: '⚠️' },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {[
                { key: 'batches', label: '배치 목록' },
                { key: 'escalate', label: `수동 검토 (${stats.escalateTotal})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: activeTab === tab.key ? 'var(--acc)' : 'var(--s2)',
                    color: activeTab === tab.key ? '#000' : 'var(--tx2)',
                    transition: 'all .15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 배치 목록 탭 */}
            {activeTab === 'batches' && (
              <div>
                {/* 필터 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {['ALL', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 100,
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: `1px solid ${filter === f ? 'var(--acc)' : 'var(--bd2)'}`,
                        background: filter === f ? 'var(--acc2)' : 'transparent',
                        color: filter === f ? 'var(--acc)' : 'var(--tx2)',
                        transition: 'all .15s',
                      }}
                    >
                      {f === 'ALL' ? '전체' : STATUS_MAP[f]?.label ?? f}
                    </button>
                  ))}
                </div>

                {/* 배치 테이블 */}
                {filteredBatches.length === 0 ? (
                  <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--tx2)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 14 }}>등록된 배치가 없습니다.</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>새 배치를 등록하여 검증을 시작하세요.</div>
                  </div>
                ) : (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--bd1)', background: 'var(--s1)' }}>
                          {['배치명', '상태', '지원자', '승인', '반려', '수동검토', '등록일', '액션'].map((h) => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--tx2)', fontWeight: 600, letterSpacing: 0.5 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBatches.map((batch) => {
                          const statusInfo = STATUS_MAP[batch.status] ?? STATUS_MAP.PENDING;
                          return (
                            <tr key={batch.id} style={{ borderBottom: '1px solid var(--bd1)', transition: 'background .15s' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 600 }}>{batch.name}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: statusInfo.color,
                                }}>
                                  {batch.status === 'RUNNING' && (
                                    <span
                                      style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, display: 'inline-block' }}
                                      className="animate-blink"
                                    />
                                  )}
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--tx1)', fontFamily: 'var(--font-mono)' }}>{batch._count.applicants}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--acc)', fontFamily: 'var(--font-mono)' }}>{batch.passCount}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{batch.failCount}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--yel)', fontFamily: 'var(--font-mono)' }}>{batch.escalateCount}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--tx2)', fontSize: 11 }}>
                                {new Date(batch.createdAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <button className="btn btn-ghost btn-sm">상세</button>
                                  {batch.status === 'PENDING' && (
                                    <button className="btn btn-acc btn-sm">검증 시작</button>
                                  )}
                                  <button 
                                    className="btn btn-sm" 
                                    style={{ background: 'var(--s3)', border: '1px solid var(--bd2)', color: 'var(--tx1)' }}
                                    onClick={() => handleDownloadExcel(batch.id, batch.name)}
                                  >
                                    📥 엑셀 받기
                                  </button>
                                  <label 
                                    className="btn btn-sm" 
                                    style={{ background: 'var(--s3)', border: '1px solid var(--bd2)', color: 'var(--tx1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                  >
                                    📤 결과 올리기
                                    <input 
                                      type="file" 
                                      accept=".xlsx" 
                                      style={{ display: 'none' }} 
                                      onChange={(e) => handleUploadExcel(e)}
                                    />
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 수동 검토 탭 */}
            {activeTab === 'escalate' && (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--tx2)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14, color: 'var(--tx0)' }}>수동 검토 목록</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {stats.escalateTotal > 0
                    ? `${stats.escalateTotal}건의 서류가 수동 검토를 기다리고 있습니다.`
                    : '수동 검토가 필요한 서류가 없습니다.'}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 새 배치 등록 모달 */}
      {showNewBatchModal && (
        <NewBatchModal onClose={() => setShowNewBatchModal(false)} />
      )}
    </div>
  );
}

function NewBatchModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      id="modal-new-batch"
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-modal-in"
        style={{
          background: 'var(--s2)', border: '1px solid var(--bd2)',
          borderRadius: 'var(--rl)', width: '100%', maxWidth: 500,
          boxShadow: '0 32px 80px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--bd1)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>새 배치 등록</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--bd2)', color: 'var(--tx2)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <form className="flex flex-col gap-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>배치명 *</label>
              <input id="batch-name" name="name" className="inp" placeholder="예: 2026년 하반기 공개채용" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>설명 (선택)</label>
              <textarea id="batch-desc" name="description" className="inp" placeholder="배치에 대한 간단한 설명을 입력하세요." rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>지원자 엑셀/CSV 업로드</label>
              <div style={{
                border: '2px dashed var(--bd2)', borderRadius: 'var(--r)',
                padding: '24px', textAlign: 'center', cursor: 'pointer',
                transition: 'border-color .2s',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
                <div style={{ fontSize: 13, color: 'var(--tx1)' }}>파일을 드래그하거나 클릭하여 업로드</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4 }}>.xlsx, .csv 지원 (최대 1,000명)</div>
                <input id="batch-file" type="file" accept=".xlsx,.csv" style={{ display: 'none' }} />
              </div>
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--bd1)' }}>
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button id="btn-create-batch" className="btn btn-acc">배치 생성</button>
        </div>
      </div>
    </div>
  );
}
