import type { StageMeta } from '../constants';
import { NOT_SEEN_COLOR, NOT_SEEN_SOFT } from '../constants';
import type { VerificationState } from '../selectors/observations';
import { useLongPress } from '../hooks/useLongPress';

interface Props {
  index: number;
  state: VerificationState; // unknown | verified_all | verified_partial | verified_none
  observedCount: number; // 已「观察到」的成员数
  membersPerGroup: number;
  stage: StageMeta;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * 小组按钮（全员核验模式）。
 *   未核验   → 「待观察」中性灰 + 虚框
 *   N/N      → 实色（环节色），表示全员观察到
 *   k/N(k<N) → 浅橙中性色，表示「存在暂未见成员」（非失败）
 *
 * 短按 = 核验该组全员（N/N）；长按 = 进入四人核验面板。
 * 未观察刻意不用红叉/空勾，避免暗示「未发生/未完成」。
 */
export function GroupButton({
  index,
  state,
  observedCount,
  membersPerGroup,
  stage,
  onPress,
  onLongPress,
}: Props) {
  const handlers = useLongPress(onLongPress, onPress);
  const verified = state !== 'unknown';
  const partial = state === 'verified_partial' || state === 'verified_none';

  const style = verified
    ? state === 'verified_all'
      ? { background: stage.soft, borderColor: stage.color, color: stage.color }
      : { background: NOT_SEEN_SOFT, borderColor: NOT_SEEN_COLOR, color: '#9a6020' }
    : undefined;

  return (
    <button
      type="button"
      className={`group-btn ${verified ? 'is-verified' : 'is-unknown'} ${
        partial ? 'is-partial' : ''
      }`}
      style={style}
      onContextMenu={(e) => e.preventDefault()}
      {...handlers}
    >
      <span className="group-btn__title">第{index}组</span>
      <span className="group-btn__state">
        {state === 'unknown' && <span className="muted">待观察</span>}
        {state === 'verified_all' && (
          <>
            <span className="dot" style={{ background: stage.color }} />
            {membersPerGroup}/{membersPerGroup} 核验
          </>
        )}
        {partial && (
          <>
            <span className="dot" style={{ background: NOT_SEEN_COLOR }} />
            {observedCount}/{membersPerGroup}
          </>
        )}
      </span>
    </button>
  );
}
