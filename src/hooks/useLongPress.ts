import { useCallback, useRef } from 'react';

interface LongPressOptions {
  /** 触发长按的延时（ms） */
  delay?: number;
  /** 指针移动超过该距离（px）视为滚动/平移，取消整个手势 */
  moveTolerance?: number;
}

/**
 * 统一处理「短按 = 核验 / 长按 = 个体核验面板」。
 *
 * 防误触的关键（修复滚动会误打点的问题）：
 *  - 指针移动超过阈值 → gestureCanceled = true，并清掉长按计时；
 *  - 浏览器因滚动/平移/缩放触发的 pointercancel → gestureCanceled = true；
 *  - 指针在按下状态离开元素 → 视为取消，避免「滑出后抬手」误触发短按；
 *  - pointerup 时若 gestureCanceled 或已长按，则【不】触发短按回调。
 *
 * 不依赖「只取消长按计时」——滚动时浏览器常以 pointercancel
 * 结束指针序列，必须显式处理取消状态。
 */
export function useLongPress(
  onLongPress: () => void,
  onClick: () => void,
  options: LongPressOptions = {}
) {
  const { delay = 450, moveTolerance = 10 } = options;
  const timer = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const longPressed = useRef(false);
  const gestureCanceled = useRef(false);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    startPos.current = null;
  }, [clearTimer]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 仅响应主键 / 触控 / 笔
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      longPressed.current = false;
      gestureCanceled.current = false;
      startPos.current = { x: e.clientX, y: e.clientY };
      clearTimer();
      timer.current = window.setTimeout(() => {
        longPressed.current = true;
        onLongPress();
      }, delay);
    },
    [delay, onLongPress, clearTimer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current || gestureCanceled.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > moveTolerance * moveTolerance) {
        // 滚动/平移 → 取消整个手势（关键修复点）
        gestureCanceled.current = true;
        clearTimer();
      }
    },
    [moveTolerance, clearTimer]
  );

  const onPointerUp = useCallback(() => {
    const wasLong = longPressed.current;
    const wasCanceled = gestureCanceled.current;
    reset();
    // 长按已触发，或手势被取消（滚动/平移/离开）→ 不触发短按
    if (wasLong || wasCanceled) return;
    onClick();
  }, [reset, onClick]);

  const onPointerCancel = useCallback(() => {
    // 浏览器接管指针用于滚动/缩放等 → 必须显式取消
    gestureCanceled.current = true;
    reset();
  }, [reset]);

  const onPointerLeave = useCallback(() => {
    // 按下状态下指针离开元素 → 视为取消，避免「滑出后抬手」误触短按
    if (startPos.current && !longPressed.current) {
      gestureCanceled.current = true;
      clearTimer();
    }
  }, [clearTimer]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
  };
}
