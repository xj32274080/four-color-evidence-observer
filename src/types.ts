// ─────────────────────────────────────────────────────────────
// 四色证据链观察器 · 领域类型（全员核验模型 v2）
// 设计铁律（贯穿全代码）：
//   1) 一个 (观察点, 组) 至多一条 VerificationMark；没有 = unknown（未核验）。
//   2) 未核验 = unknown，绝不等于「未发生」，也不进入统计分母。
//   3) 短按小组 = 教师已逐人核验，N/N 均观察到目标证据。
//   4) 「暂未见」仅表示本次未观察到，绝不是「不会/未完成/没做到」。
//   5) 任何输出都不得出现「完成率/达成率/全员完成」等绝对化、误导性措辞。
// ─────────────────────────────────────────────────────────────

/** 四色 = 课堂环节的时间序列（证据链四个阶段） */
export type EvidenceStage = 'pencil' | 'blue' | 'black' | 'red';
//   pencil 铅笔 = 独立起点
//   blue   蓝笔 = 组内来源
//   black  黑笔 = 个人重构
//   red    红笔 = 全班修订

/** 班级设置（不含任何学生姓名） */
export interface ClassConfig {
  id: string;
  label: string;
  groupCount: number;
  membersPerGroup: number; // 默认 4
}

/** 观察指标（每节课 1 主，可选 1 副） */
export interface Metric {
  id: string;
  label: string;
}

/** 课堂任务 */
export interface Lesson {
  id: string;
  classId: string;
  title: string;
  date: string; // YYYY-MM-DD
  primaryMetric: Metric;
  secondaryMetric?: Metric;
  /** 聚焦色阶；留空 = 四色全开 */
  focusStages?: EvidenceStage[];
  /** 目标证据说明：怎样算「观察到该证据」（教师填写，可空） */
  targetEvidence?: string;
}

/** 观察点 = 一节课里某个指标 × 某个色阶环节 */
export interface ObservationFocus {
  lessonId: string;
  metricId: string;
  stage: EvidenceStage;
}

/** 成员位号（1..membersPerGroup；位号不对应任何姓名） */
export type MemberPosition = number;

/**
 * 核验型标记。一个 (观察点, 组) 至多一条。
 *   observedMembers    本次「观察到」目标证据的成员位号
 *   notObservedMembers 本次「暂未见」的成员位号（≠ 不会/未完成/没做到）
 *   verifiedAll        是否 N/N 全员观察到
 * 任意小组若没有任何 VerificationMark ⇒ unknown（未核验），不进入统计。
 */
export interface VerificationMark {
  focus: ObservationFocus;
  groupIndex: number; // 1-based
  observedMembers: MemberPosition[];
  notObservedMembers: MemberPosition[];
  verifiedAll: boolean;
  timestamp: string; // ISO
}

/** 持久化应用状态（写入 localStorage） */
export interface AppState {
  classes: ClassConfig[];
  lessons: Lesson[];
  verifications: VerificationMark[];
}

/** 派生：一个小组 */
export interface Group {
  id: string;
  classId: string;
  index: number;
  membersPerGroup: number;
}

/** 派生：一节课的核验切片（喂给反馈服务） */
export interface LessonSession {
  lesson: Lesson;
  classConfig: ClassConfig;
  verifications: VerificationMark[];
}

/** 极简视图导航（不持久化） */
export type View =
  | { name: 'class-setup' }
  | { name: 'lesson-create'; classId: string }
  | { name: 'marking'; lessonId: string }
  | { name: 'feedback'; lessonId: string };

/** 反馈文本块类型 */
export type FeedbackBlockType =
  | 'coverage' // 核验覆盖陈述
  | 'verified' // 已核验样本的观察描述
  | 'refusal'  // 拒绝下结论
  | 'note';    // 说明性备注

export interface FeedbackBlock {
  type: FeedbackBlockType;
  text: string;
}
