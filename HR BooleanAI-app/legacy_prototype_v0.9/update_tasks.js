const fs = require('fs');
const path = require('path');

const tasksDir = path.join(__dirname, 'tasks');
const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(tasksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1-1. Global Replacements
  content = content.replace(/SRS-HR-AI-Verification-v1\.1\.md/g, 'SRS-HR-AI-Verification-v1.3.md');
  content = content.replace(/TASK-LIST-HR-AI-Verification-v1\.1\.md/g, 'TASK-LIST-HR-AI-Verification-v1_2.md');
  
  // Replace the SRS: v1.1 at the bottom line
  // Example: *Document Version: v0.1 (초안) | Source: TASK-LIST G-001 | SRS: v1.1*
  content = content.replace(/(Document Version: v0\.1 \(초안\) \| Source: TASK-LIST .* \| SRS: )v1\.1/g, '$1v1.3');

  // Extract source_task_id
  const match = content.match(/source_task_id:\s*(.+)/);
  if (match) {
    const taskId = match[1].trim();

    // 1-2. OCR Tasks
    if (['G-001', 'G-002', 'G-003', 'G-004'].includes(taskId)) {
      content = content.replace(/(- \*\*목적:\*\*.*)/g, '$1 v1.3: doc_category별 전용 프롬프트 분기 및 doc_source 자동 판별(webminwon/certpia/gov24/icerts) 적용.');
    }
    // 1-3. RPA Tasks
    else if (/^D-00[1-7]$/.test(taskId)) {
      content = content.replace(/(- \*\*목적:\*\*.*)/g, '$1 v1.3: agency_config.json 기반 동적 URL/셀렉터 로드. 4단계 폴백 전략 적용.');
    }
    // 1-4. HITL Tasks
    else if (/^K-00[1-5]$/.test(taskId)) {
      content = content.replace(/(- \*\*목적:\*\*.*)/g, '$1 v1.3: AI Reviewer Agent(APPROVE/REJECT/ESCALATE) 1차 자동 판정 후 담당자 최종 확인 구조.');
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log('Task updates completed.');
