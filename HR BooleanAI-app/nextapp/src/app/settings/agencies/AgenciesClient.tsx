'use client';

import { useState } from 'react';
import { logoutAction } from '@/app/login/actions';
import type { SessionUser } from '@/lib/auth/session';
import type { SiteCredential } from '@/generated/prisma/client';
import { saveAgencyAction, testAgencyConnectionAction, analyzeSelectorsAction } from './actions';
import { Agency } from '@/lib/rpa/agency-config';

interface Props {
  session: SessionUser;
  credentials: SiteCredential[];
  initialAgencies: Agency[];
}

const SITE_ICONS: Record<string, string> = {
  TOEIC_SITE: '🎓',
  OPIC_SITE: '🗣️',
  QNET_SITE: '📜',
  GOVT24: '🏛️',
  HIRA: '🏥',
  EDUPURE: '📚',
  WINSPACK: '💼',
};

export default function AgenciesClient({ session, credentials, initialAgencies }: Props) {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [selectedCredential, setSelectedCredential] = useState<SiteCredential | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [testResult, setTestResult] = useState<Record<string, 'testing' | 'ok' | 'fail'>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleTest = async (siteCode: string, url: string) => {
    setTestResult((prev) => ({ ...prev, [siteCode]: 'testing' }));
    try {
      const res = await testAgencyConnectionAction(siteCode, url);
      if (res.success) {
        setTestResult((prev) => ({ ...prev, [siteCode]: 'ok' }));
      } else {
        setTestResult((prev) => ({ ...prev, [siteCode]: 'fail' }));
        alert(`테스트 실패: ${res.message}`);
      }
    } catch (err: any) {
      setTestResult((prev) => ({ ...prev, [siteCode]: 'fail' }));
      alert(`테스트 오류: ${err.message || err}`);
    }
  };

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      const res = await saveAgencyAction(data);
      if (res.success) {
        window.location.reload();
      } else {
        alert(`저장 실패: ${res.error}`);
      }
    } catch (err: any) {
      alert(`저장 오류: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* 사이드바 */}
      <aside style={{ width: 220, background: 'var(--s1)', borderRight: '1px solid var(--bd1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--bd1)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--acc)', letterSpacing: 2 }}>HR BOOLEANAI</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>v1.0 — 서류 진위확인 AI</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {[
            { href: '/dashboard', icon: '📊', label: '대시보드', active: false },
            { href: '/settings/agencies', icon: '⚙️', label: '기관 설정', active: true },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--r)', fontSize: 13,
                color: item.active ? 'var(--tx0)' : 'var(--tx2)',
                background: item.active ? 'var(--acc2)' : 'transparent',
                border: item.active ? '1px solid var(--acc3)' : '1px solid transparent',
                textDecoration: 'none', marginBottom: 2, transition: 'all .15s',
              }}
            >
              <span>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--bd1)' }}>
          <div style={{ fontSize: 12, color: 'var(--tx0)', fontWeight: 600 }}>{session.name}</div>
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{session.email}</div>
          <form action={logoutAction} style={{ marginTop: 10 }}>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>로그아웃</button>
          </form>
        </div>
      </aside>

      {/* 메인 */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '18px 28px', borderBottom: '1px solid var(--bd1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(11,15,26,.6)', backdropFilter: 'blur(10px)' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>기관 설정</h1>
            <p style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 2 }}>RPA 대상 사이트 자격증명 및 셀렉터 관리</p>
          </div>
          <button id="btn-add-agency" className="btn btn-acc" onClick={() => { setSelectedCredential(null); setSelectedAgency(null); setShowForm(true); }}>+ 기관 추가</button>
        </header>

        <div style={{ padding: '24px 28px' }}>
          {/* 안내 배너 */}
          <div style={{ background: 'var(--blu2)', border: '1px solid var(--blu3)', borderRadius: 'var(--rl)', padding: '14px 20px', marginBottom: 22, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <div style={{ fontSize: 12, color: 'var(--tx1)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--blu)' }}>Hot-load 설정:</strong> 기관 자격증명 및 셀렉터는 DB와 JSON 파일에 동시 반영되어 서버 재시작 없이 즉시 적용됩니다.<br />
              <strong style={{ color: 'var(--blu)' }}>RPA 테스트:</strong> 테스트 버튼을 클릭하면 Puppeteer가 해당 사이트에 접속하여 페이지 로드 성공 여부를 확인합니다.
            </div>
          </div>

          {/* 기관 카드 목록 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {agencies.map((agency) => {
              const siteCode = agency.agency_id.toUpperCase();
              const saved = credentials.find((c) => c.siteCode.toUpperCase() === siteCode);
              const testStatus = testResult[saved?.siteCode || siteCode];
              const isManual = ['EDUPURE', 'WINSPACK'].includes(siteCode);

              return (
                <div
                  key={agency.agency_id}
                  className="card card-hover"
                  style={{ padding: '20px 22px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedCredential(saved ?? null);
                    setSelectedAgency(agency);
                    setShowForm(true);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{SITE_ICONS[siteCode] ?? '🌐'}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{agency.display_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{siteCode}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {isManual && <span className="badge b-manual">수동처리</span>}
                      {saved?.isActive && !isManual && <span className="badge b-pass">활성</span>}
                      {!saved && !isManual && <span className="badge b-pending">미설정</span>}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--font-mono)', marginBottom: 14, wordBreak: 'break-all' }}>
                    {agency.url}
                  </div>

                  {saved && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--tx2)' }}>
                        아이디: <span style={{ color: saved.username ? 'var(--tx0)' : 'var(--tx3)' }}>{saved.username ?? '미설정'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx2)' }}>
                        비밀번호: <span style={{ color: saved.encPassword ? 'var(--acc)' : 'var(--tx3)' }}>{saved.encPassword ? '••••••••' : '미설정'}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      id={`btn-edit-${siteCode}`}
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCredential(saved ?? null);
                        setSelectedAgency(agency);
                        setShowForm(true);
                      }}
                    >
                      ✏️ 편집
                    </button>
                    {!isManual && (
                      <button
                        id={`btn-test-${siteCode}`}
                        className="btn btn-sm"
                        style={{
                          background: testStatus === 'ok' ? 'var(--acc2)' : testStatus === 'fail' ? 'var(--red2)' : 'var(--s3)',
                          color: testStatus === 'ok' ? 'var(--acc)' : testStatus === 'fail' ? 'var(--red)' : 'var(--tx1)',
                          border: `1px solid ${testStatus === 'ok' ? 'var(--acc3)' : testStatus === 'fail' ? 'var(--red3)' : 'var(--bd2)'}`,
                        }}
                        disabled={testStatus === 'testing'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTest(saved?.siteCode || siteCode, agency.url);
                        }}
                      >
                        {testStatus === 'testing' ? (
                          <><span className="animate-spin" style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} /> 테스트 중...</>
                        ) : testStatus === 'ok' ? '✅ 성공' : testStatus === 'fail' ? '❌ 실패' : '🔌 RPA 테스트'}
                      </button>
                    )}
                    {saved?.lastTestedAt && (
                      <span style={{ fontSize: 10, color: 'var(--tx3)', alignSelf: 'center', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                        최종: {new Date(saved.lastTestedAt).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 기관 편집 폼 모달 */}
      {showForm && (
        <AgencyFormModal
          onClose={() => { setShowForm(false); setSelectedCredential(null); setSelectedAgency(null); }}
          credential={selectedCredential}
          agency={selectedAgency}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

interface ModalProps {
  onClose: () => void;
  credential: SiteCredential | null;
  agency: Agency | null;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}

function AgencyFormModal({ onClose, credential, agency, onSave, isSaving }: ModalProps) {
  const [siteCode, setSiteCode] = useState(credential?.siteCode || '');
  const [siteName, setSiteName] = useState(credential?.siteName || agency?.display_name || '');
  const [siteUrl, setSiteUrl] = useState(credential?.siteUrl || agency?.url || '');
  const [username, setUsername] = useState(credential?.username || '');
  const [password, setPassword] = useState('');
  const [selectorsJson, setSelectorsJson] = useState(
    credential?.selectors || (agency ? JSON.stringify(agency.rpa_selectors, null, 2) : JSON.stringify({
      loginUrl: '',
      usernameSelector: '#userId',
      passwordSelector: '#userPw',
      loginButtonSelector: '#btnLogin',
      searchInputSelector: '',
      searchButtonSelector: '',
      resultSelector: '',
    }, null, 2))
  );

  const [applicableDocTypes, setApplicableDocTypes] = useState<string[]>(
    agency?.applicable_doc_types || ['졸업증명서']
  );
  const [validDays, setValidDays] = useState<string>(
    agency?.valid_days !== undefined && agency?.valid_days !== null ? String(agency.valid_days) : ''
  );
  const [notes, setNotes] = useState(agency?.notes || '');

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDocTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setApplicableDocTypes((prev) => [...prev, type]);
    } else {
      setApplicableDocTypes((prev) => prev.filter((t) => t !== type));
    }
  };

  const handleAnalyze = async () => {
    if (!siteUrl || siteUrl.trim() === '') {
      alert('분석할 사이트 URL을 먼저 입력해 주세요.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await analyzeSelectorsAction(siteUrl);
      if (res.success && res.recommendation) {
        const formatted = JSON.stringify({
          loginUrl: res.recommendation.loginUrl || '',
          usernameSelector: res.recommendation.usernameSelector || '',
          passwordSelector: res.recommendation.passwordSelector || '',
          loginButtonSelector: res.recommendation.loginButtonSelector || '',
          searchInputSelector: res.recommendation.searchInputSelector || '',
          searchButtonSelector: res.recommendation.searchButtonSelector || '',
          resultSelector: res.recommendation.resultSelector || ''
        }, null, 2);
        setSelectorsJson(formatted);
        alert('AI가 사이트 구조를 분석하여 적절한 셀렉터 설정을 추천했습니다!');
      } else {
        alert(`분석 실패: ${res.error}`);
      }
    } catch (err: any) {
      alert(`분석 중 오류 발생: ${err.message || err}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteCode || !siteName || !siteUrl) {
      alert('필수 입력값(*)이 누락되었습니다.');
      return;
    }

    onSave({
      siteCode,
      siteName,
      siteUrl,
      username,
      password,
      selectorsJson,
      applicableDocTypes,
      validDays: validDays ? parseInt(validDays, 10) : null,
      notes,
    });
  };

  const docTypes = ['졸업증명서', '성적증명서', '자격증', '건강보험자격득실확인서', '토익', '오픽'];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-modal-in"
        style={{ background: 'var(--s2)', border: '1px solid var(--bd2)', borderRadius: 'var(--rl)', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,.6)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--bd1)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>{credential || agency ? '기관 설정 편집' : '새 기관 추가'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--bd2)', color: 'var(--tx2)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>사이트 코드 *</label>
              <input
                id="agency-code"
                name="siteCode"
                className="inp"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="TOEIC_SITE"
                style={{ fontFamily: 'var(--font-mono)' }}
                disabled={!!(credential || agency)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>사이트명 *</label>
              <input
                id="agency-name"
                name="siteName"
                className="inp"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="TOEIC (YBM)"
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>사이트 URL *</label>
            <input
              id="agency-url"
              name="siteUrl"
              type="url"
              className="inp"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://exam.ybmnet.co.kr"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>아이디 (로그인)</label>
              <input
                id="agency-username"
                name="username"
                className="inp"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="로그인 아이디"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>비밀번호 {credential && '(변경 시 입력)'}</label>
              <input
                id="agency-password"
                name="password"
                type="password"
                className="inp"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="저장 시 AES-256 GCM 암호화"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 8 }}>적용 서류 유형</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', background: 'var(--s1)', padding: 12, borderRadius: 'var(--r)', border: '1px solid var(--bd1)' }}>
              {docTypes.map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={applicableDocTypes.includes(type)}
                    onChange={(e) => handleDocTypeChange(type, e.target.checked)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>유효 기간 (일 단위)</label>
              <input
                type="number"
                className="inp"
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                placeholder="예: 180 (영구 자격은 비워둠)"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', marginBottom: 6 }}>특이사항 (메모)</label>
              <input
                className="inp"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="RPA 로그인 관련 주의사항 등"
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx2)' }}>CSS 셀렉터 설정 (JSON)</label>
              <button 
                type="button" 
                className="btn btn-sm btn-ghost" 
                style={{ fontSize: 11, color: 'var(--acc)', padding: '2px 8px' }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '분석 중...' : '🔍 AI 자동 분석 추천'}
              </button>
            </div>
            <textarea
              id="agency-selectors"
              name="selectors"
              className="inp"
              rows={5}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }}
              value={selectorsJson}
              onChange={(e) => setSelectorsJson(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid var(--bd1)', paddingTop: 14 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>취소</button>
            <button type="submit" id="btn-save-agency" className="btn btn-acc" disabled={isSaving}>
              {isSaving ? '저장 중...' : '💾 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
