import { STAGES } from '../constants';
import type { EvidenceStage } from '../types';

interface Props {
  value: EvidenceStage;
  onChange: (s: EvidenceStage) => void;
  /** 仅展示这些色阶（任务聚焦色阶）；默认四色全开 */
  stages?: EvidenceStage[];
}

/** 四色色阶切换：代表课堂当前环节 */
export function StageSelector({ value, onChange, stages }: Props) {
  const list = stages ? STAGES.filter((s) => stages.includes(s.key)) : STAGES;
  return (
    <div className="stage-selector" role="tablist" aria-label="课堂环节（色阶）">
      {list.map((s) => {
        const active = value === s.key;
        return (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`stage-chip ${active ? 'is-active' : ''}`}
            style={
              active
                ? { background: s.color, borderColor: s.color, color: '#fff' }
                : { color: s.color, borderColor: s.color }
            }
            onClick={() => onChange(s.key)}
          >
            <span className="stage-chip__pen">{s.label}</span>
            <span className="stage-chip__phase">{s.phase}</span>
          </button>
        );
      })}
    </div>
  );
}
