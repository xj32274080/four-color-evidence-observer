import type { ClassConfig, Group } from './types';

/** 生成唯一 id（优先 crypto.randomUUID，回退到时间+随机） */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/** 组 id 由班级 id + 位号派生（稳定，不持久化组实体） */
export function groupIdFor(classId: string, index: number): string {
  return `${classId}-g${index}`;
}

export function groupIdsFor(cls: ClassConfig): string[] {
  return Array.from({ length: cls.groupCount }, (_, i) => groupIdFor(cls.id, i + 1));
}

export function groupsFor(cls: ClassConfig): Group[] {
  return Array.from({ length: cls.groupCount }, (_, i) => ({
    id: groupIdFor(cls.id, i + 1),
    classId: cls.id,
    index: i + 1,
    membersPerGroup: cls.membersPerGroup,
  }));
}

/** 全部成员位号 1..n（用于「全员核验 / 默认全观察到」） */
export function allPositions(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

/** 今日日期 YYYY-MM-DD（仅用于任务默认日期） */
export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 当前时间 ISO 字符串（用于 VerificationMark.timestamp） */
export function nowISO(): string {
  return new Date().toISOString();
}
