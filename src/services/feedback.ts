import type { FeedbackBlock, Group, LessonSession } from '../types';
import {
  COVERAGE_THRESHOLD,
  NOT_SEEN_SEMANTICS,
  STAGE_BY_KEY,
  STAGES,
  UNKNOWN_SEMANTICS,
  VERIFICATION_SEMANTICS,
} from '../constants';
import {
  getVerification,
  verifiedSample,
} from '../selectors/observations';

export interface FeedbackResult {
  coverageSummary: {
    verifiedGroups: number;
    totalGroups: number;
    verifiedStudents: number;
    expectedStudents: number;
    ratio: number;
    sufficient: boolean;
  };
  blocks: FeedbackBlock[];
  caveats: string[];
}

/**
 * 生成课后反馈（第一版为 mock，预留为真实 API 的签名）。
 *
 * 契约（无论后端如何都必须在前端守住）：
 *  - 只基于「已核验样本」生成；未核验小组不进入统计；
 *  - 覆盖率（已核验组占比）低于阈值时，拒绝形成全班判断；
 *  - 永不出现「完成率/达成率/全员完成/多数学生已经完成/未完成」等措辞；
 *  - 「暂未见」仅表示本次未观察到，不是「不会/未完成/没做到」。
 *
 * 换接真实服务时：保持本函数签名不变；真实结果仍须经同一套
 * 「覆盖率门控 + 兜底话术」包裹后再返回（见 README 的 API 安全边界）。
 */
export function generateFeedback(
  session: LessonSession,
  _groups: Group[]
): FeedbackResult {
  const v = session.verifications;
  const { lesson, classConfig } = session;
  const metric = lesson.primaryMetric;
  const sec = lesson.secondaryMetric;
  const stages =
    lesson.focusStages && lesson.focusStages.length
      ? lesson.focusStages
      : STAGES.map((s) => s.key);
  const totalGroups = classConfig.groupCount;
  const mpp = classConfig.membersPerGroup;
  const expectedStudents = totalGroups * mpp;

  // 主指标：在任一聚焦色阶被核验过的组（并集）
  const overallVerified = new Set<number>();
  for (const stage of stages) {
    for (let i = 1; i <= totalGroups; i++) {
      if (getVerification(v, lesson.id, metric.id, stage, i)) {
        overallVerified.add(i);
      }
    }
  }
  const verifiedGroups = overallVerified.size;
  const verifiedStudents = verifiedGroups * mpp;
  const ratio = totalGroups === 0 ? 0 : verifiedGroups / totalGroups;
  const sufficient = verifiedGroups > 0 && ratio >= COVERAGE_THRESHOLD;

  const blocks: FeedbackBlock[] = [];
  const caveats: string[] = [VERIFICATION_SEMANTICS, NOT_SEEN_SEMANTICS, UNKNOWN_SEMANTICS];

  // 1) 零样本：直接拒绝
  if (verifiedGroups === 0) {
    blocks.push({
      type: 'refusal',
      text: `主指标「${metric.label}」尚无任何核验样本，不形成判断。`,
    });
    return {
      coverageSummary: {
        verifiedGroups: 0,
        totalGroups,
        verifiedStudents: 0,
        expectedStudents,
        ratio: 0,
        sufficient: false,
      },
      blocks,
      caveats,
    };
  }

  // 2) 核验覆盖陈述（永远打印分母：组与人）
  const pct = Math.round(ratio * 100);
  blocks.push({
    type: 'coverage',
    text: `已核验 ${verifiedGroups}/${totalGroups} 个小组（共 ${verifiedStudents}/${expectedStudents} 名学生），核验覆盖率 ${pct}%。`,
  });

  if (!sufficient) {
    // 3a) 覆盖率不足：拒绝全班判断
    blocks.push({
      type: 'refusal',
      text: `核验样本不足（覆盖率低于 ${Math.round(COVERAGE_THRESHOLD * 100)}%），暂不形成全班判断。`,
    });
    caveats.push('核验样本不足，未核验小组不进入统计，不形成全班判断。');
  } else {
    // 3b) 达标：可在样本层面描述（仍非普查）
    blocks.push({
      type: 'note',
      text: `以下为已核验 ${verifiedGroups} 个小组的观察描述（非全班普查）。`,
    });
    caveats.push(`仅基于已核验 ${verifiedGroups}/${totalGroups} 组，非全班普查，不等于全班判断。`);
  }

  // 4) 按色阶列出已核验样本
  for (const stage of stages) {
    const meta = STAGE_BY_KEY[stage];
    const s = verifiedSample(v, lesson.id, metric.id, stage, totalGroups, mpp);
    if (s.verifiedGroups === 0) continue; // 该环节无人核验 → 不进入描述
    let line =
      `【${meta.label}·${meta.phase}】已核验 ${s.verifiedGroups} 个小组共 ${s.verifiedStudents} 名学生：` +
      `${s.observedStudents} 名观察到目标证据、${s.notSeenStudents} 名暂未见。`;
    if (s.ratio < COVERAGE_THRESHOLD) {
      line += '（该环节核验覆盖率不足，仅作样本描述。）';
    }
    blocks.push({ type: 'verified', text: line });
  }

  // 5) 副指标简述（同样基于已核验样本，不下全班判断）
  if (sec) {
    let secVerified = 0;
    for (const stage of stages) {
      const s = verifiedSample(v, lesson.id, sec.id, stage, totalGroups, mpp);
      secVerified = Math.max(secVerified, s.verifiedGroups);
    }
    blocks.push({
      type: 'note',
      text:
        secVerified > 0
          ? `副指标「${sec.label}」：至少核验了 ${secVerified}/${totalGroups} 组（同样仅基于已核验样本，不下全班判断）。`
          : `副指标「${sec.label}」：尚无核验样本。`,
    });
  }

  caveats.push('未核验小组不进入统计；未核验 ≠ 未发生，也 ≠ 未完成。');
  caveats.push('「暂未见」仅表示本次未观察到，不是「不会/未完成/没做到」。');

  return {
    coverageSummary: {
      verifiedGroups,
      totalGroups,
      verifiedStudents,
      expectedStudents,
      ratio,
      sufficient,
    },
    blocks,
    caveats,
  };
}
