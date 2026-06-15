import { useState } from 'react';
import type { StageMeta } from '../constants';
import { NOT_SEEN_COLOR, NOT_SEEN_SOFT } from '../constants';

interface Props {
  open: boolean;
  groupIndex: number;
  stage: StageMeta;
  metricLabel: string;
  membersPerGroup: number;
  /** 初始「观察到」的成员位号；无既有记录时默认全部 */
  initialObserved: number[];
  /** 是否存在既有记录（决定「撤销本组记录」是否可用） */
  hasExisting: boolean;
  /** 确认：传入 observed / notObserved 两个互补数组 */
  onConfirm: (observed: number[], notObserved: number[]) => void;
  /** 撤销本组记录：清除该 (观察点, 组) → 回到 unknown */
  onClear: () => void;
  onClose: () => void;
}

/**
 * 四人核验面板（底部抽屉）。唯一进入个体级数据的入口。
 * 默认 N 人均「观察到」，教师点掉暂未见的成员；
 * 被点掉 = 「本次暂未见」，绝不写成「不会/未完成/没做到」（中性色，非红叉）。
 */
export function MemberVerificationSheet(props: Props) {
  const {
    open,
    groupIndex,
    stage,
    metricLabel,
    membersPerGroup,
    initialObserved,
    hasExisting,
    onConfirm,
    onClear,
    onClose,
  } = props;

  const [observed, setObserved] = useState<Set<number>>(
    () => new Set(initialObserved)
  );

  if (!open) return null;

  const positions = Array.from({ length: membersPerGroup }, (_, i) => i + 1);
  const toggle = (p: number) =>
    setObserved((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const observedArr = positions.filter((p) => observed.has(p));
  const notObservedArr = positions.filter((p) => !observed.has(p));

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`第${groupIndex}组 当前观察点核验`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__handle" />
        <div className="sheet__head">
          <strong>
            第{groupIndex}组 当前观察点核验
          </strong>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>
        <div className="sheet__ctx">
          环节 <b style={{ color: stage.color }}>{stage.label}·{stage.phase}</b>
          ｜ 指标「{metricLabel}」
        </div>
        <p className="sheet__hint">
          默认 {membersPerGroup} 人均观察到，请<b>点掉暂未见</b>的成员。
          被点掉仅表示「本次暂未见」，不是「不会/未完成/没做到」。
        </p>

        <div className="member-chips">
          {positions.map((p) => {
            const on = observed.has(p);
            return (
              <button
                key={p}
                type="button"
                className={`member-chip ${on ? 'is-on' : 'is-off'}`}
                style={
                  on
                    ? { background: stage.color, borderColor: stage.color, color: '#fff' }
                    : { background: NOT_SEEN_SOFT, borderColor: NOT_SEEN_COLOR, color: '#9a6020' }
                }
                onClick={() => toggle(p)}
                aria-pressed={on}
                aria-label={`${p}号 ${on ? '观察到' : '暂未见'}`}
              >
                <span className="member-chip__mark">{on ? '✓' : '·'}</span>
                <span className="member-chip__no">{p}号</span>
                <span className="member-chip__state">{on ? '观察到' : '暂未见'}</span>
              </button>
            );
          })}
        </div>

        <p className="sheet__count">
          当前 {observedArr.length}/{membersPerGroup} 观察到
          {notObservedArr.length > 0 && `，${notObservedArr.length} 暂未见`}
        </p>

        <div className="sheet__actions">
          <button type="button" className="btn-primary sheet__btn" onClick={() => onConfirm(observedArr, notObservedArr)}>
            确认
          </button>
          <button
            type="button"
            className="btn-ghost sheet__btn sheet__btn--danger"
            onClick={onClear}
            disabled={!hasExisting}
            title={hasExisting ? '清除本组核验记录，回到待观察' : '本组尚无记录'}
          >
            撤销本组记录
          </button>
        </div>
        <p className="sheet__foot">位号不对应任何姓名；记录仅本地保存。</p>
      </div>
    </div>
  );
}
