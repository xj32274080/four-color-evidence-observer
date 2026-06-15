import type { EvidenceStage, VerificationMark } from '../types';

/**
 * 核验切片：AppState 与 LessonSession 都结构兼容。
 * 选择器只产出四种状态，刻意把「未核验」独立为 unknown，
 * 永不被当作 false / 未发生 / 未完成。
 */
export interface VerificationSlice {
  verifications: VerificationMark[];
}

/**
 * unknown         未核验（没有任何标记）→ 不进入统计
 * verified_all    N/N 均观察到
 * verified_partial 1..N-1 观察到（其余暂未见）
 * verified_none   0/N（极少用，结构允许）
 */
export type VerificationState =
  | 'unknown'
  | 'verified_all'
  | 'verified_partial'
  | 'verified_none';

export function getVerification(
  v: VerificationMark[],
  lessonId: string,
  metricId: string,
  stage: EvidenceStage,
  groupIndex: number
): VerificationMark | undefined {
  return v.find(
    (m) =>
      m.focus.lessonId === lessonId &&
      m.focus.metricId === metricId &&
      m.focus.stage === stage &&
      m.groupIndex === groupIndex
  );
}

export function verificationState(
  v: VerificationMark[],
  lessonId: string,
  metricId: string,
  stage: EvidenceStage,
  groupIndex: number,
  membersPerGroup: number
): VerificationState {
  const mark = getVerification(v, lessonId, metricId, stage, groupIndex);
  if (!mark) return 'unknown';
  const observed = mark.observedMembers.length;
  if (observed <= 0) return 'verified_none';
  if (observed >= membersPerGroup) return 'verified_all';
  return 'verified_partial';
}

export interface VerifiedSample {
  verifiedGroups: number;
  totalGroups: number;
  membersPerGroup: number;
  verifiedStudents: number; // = verifiedGroups * membersPerGroup
  observedStudents: number; // 本次「观察到」
  notSeenStudents: number; // 本次「暂未见」
  ratio: number; // 核验覆盖率 = verifiedGroups / totalGroups
}

/**
 * 统计某观察点下的已核验样本。
 * 关键：只有「已核验」的组进入分母意义上的样本；unknown 永不参与。
 */
export function verifiedSample(
  v: VerificationMark[],
  lessonId: string,
  metricId: string,
  stage: EvidenceStage,
  totalGroups: number,
  membersPerGroup: number
): VerifiedSample {
  let verifiedGroups = 0;
  let observedStudents = 0;
  let notSeenStudents = 0;
  for (let i = 1; i <= totalGroups; i++) {
    const mark = getVerification(v, lessonId, metricId, stage, i);
    if (!mark) continue; // 未核验 → 跳过
    verifiedGroups += 1;
    observedStudents += mark.observedMembers.length;
    notSeenStudents += mark.notObservedMembers.length;
  }
  const verifiedStudents = verifiedGroups * membersPerGroup;
  const ratio = totalGroups === 0 ? 0 : verifiedGroups / totalGroups;
  return {
    verifiedGroups,
    totalGroups,
    membersPerGroup,
    verifiedStudents,
    observedStudents,
    notSeenStudents,
    ratio,
  };
}
