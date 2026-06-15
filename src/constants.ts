import type { EvidenceStage } from './types';

/** localStorage 版本化键（升级时 bump VERSION 并在 storage 层加迁移） */
export const STORAGE_KEY = 'fccobserver';
export const STORAGE_VERSION = 2; // v1=组内出现模型；v2=全员核验模型

/**
 * 核验覆盖率阈值：已核验组占比 < 该值时，反馈拒绝形成全班判断。
 * 可调；默认 0.5。
 */
export const COVERAGE_THRESHOLD = 0.5;

export interface StageMeta {
  key: EvidenceStage;
  label: string; // 铅笔/蓝笔/黑笔/红笔
  phase: string; // 独立起点/组内来源/个人重构/全班修订
  color: string; // 主色
  soft: string; // 浅色底
}

export const STAGES: StageMeta[] = [
  { key: 'pencil', label: '铅笔', phase: '独立起点', color: '#9a8c7a', soft: '#efe9e0' },
  { key: 'blue', label: '蓝笔', phase: '组内来源', color: '#2f6fb0', soft: '#e2ecf7' },
  { key: 'black', label: '黑笔', phase: '个人重构', color: '#33333a', soft: '#e7e7e9' },
  { key: 'red', label: '红笔', phase: '全班修订', color: '#c0392b', soft: '#f8e4e1' },
];

export const STAGE_BY_KEY: Record<EvidenceStage, StageMeta> = STAGES.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<EvidenceStage, StageMeta>
);

/** 「暂未见」成员的中性色（刻意避免红叉等失败暗示） */
export const NOT_SEEN_COLOR = '#d98a3a';
export const NOT_SEEN_SOFT = '#fbeedd';

/** 反复出现在 UI / 反馈里的铁律话术 */
export const VERIFICATION_SEMANTICS =
  '核验 = 教师已逐人核验该组成员是否观察到当前目标证据；未核验 = 尚未观察，不进入统计，绝不等于未发生。';
export const NOT_SEEN_SEMANTICS =
  '「暂未见」仅表示本次未观察到该成员出现该证据；不是「不会/未完成/没做到」。';
export const UNKNOWN_SEMANTICS =
  '未核验 = 尚未观察，绝不等于没有发生，也不进入统计。';
