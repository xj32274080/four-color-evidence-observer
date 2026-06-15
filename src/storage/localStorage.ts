import type { AppState } from '../types';
import { STORAGE_KEY } from '../constants';

const EMPTY_STATE: AppState = {
  classes: [],
  lessons: [],
  verifications: [],
};

/** v2 形状校验：verifications 数组 */
function isV2(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.classes) &&
    Array.isArray(d.lessons) &&
    Array.isArray(d.verifications)
  );
}

/**
 * 迁移：v1（groupMarks/memberMarks，语义=组内出现）→ v2（verifications，语义=全员核验）。
 * v1 与 v2 语义不可互换，因此旧打点记录直接丢弃，仅保留班级与任务配置。
 */
function migrate(data: unknown): AppState {
  if (isV2(data)) return data;

  // v1 旧模型：保留 classes/lessons，丢弃已失效的 groupMarks/memberMarks
  if (
    data &&
    typeof data === 'object' &&
    (Array.isArray((data as Record<string, unknown>).groupMarks) ||
      Array.isArray((data as Record<string, unknown>).memberMarks))
  ) {
    console.warn(
      '[storage] 检测到 v1（组内出现）数据模型，语义已变更为「全员核验」；旧打点记录被丢弃，仅保留班级与任务配置。'
    );
    const d = data as Record<string, unknown>;
    return {
      classes: Array.isArray(d.classes) ? (d.classes as AppState['classes']) : [],
      lessons: Array.isArray(d.lessons) ? (d.lessons as AppState['lessons']) : [],
      verifications: [],
    };
  }

  console.warn('[storage] 数据形状非法，回退到空状态，不做任何推断。');
  return { ...EMPTY_STATE };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as { state?: unknown } | unknown;
    const data =
      parsed && typeof parsed === 'object' && 'state' in parsed
        ? (parsed as { state: unknown }).state
        : parsed;
    return migrate(data);
  } catch (e) {
    console.warn('[storage] 读取失败，回退到空状态：', e);
    return { ...EMPTY_STATE };
  }
}

export function saveState(state: AppState): void {
  try {
    // 仅写 v2 形状；不再持久化导航视图
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state }));
  } catch (e) {
    // 配额满或隐私模式：静默降级，不阻断课堂打点（本节观察仍在内存中）
    console.warn('[storage] 写入失败（本节观察仍在内存中）：', e);
  }
}

/** 调试用：手动清空持久化数据 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
