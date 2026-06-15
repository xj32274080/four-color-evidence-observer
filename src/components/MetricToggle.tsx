interface Props {
  primary: string;
  secondary?: string;
  value: 'primary' | 'secondary';
  onChange: (v: 'primary' | 'secondary') => void;
}

/** 主/副指标切换（仅在存在副指标时显示） */
export function MetricToggle({ primary, secondary, value, onChange }: Props) {
  if (!secondary) {
    return <div className="metric-toggle metric-toggle--single">主指标 · {primary}</div>;
  }
  return (
    <div className="metric-toggle" role="tablist" aria-label="切换观察指标">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'primary'}
        className={value === 'primary' ? 'is-active' : ''}
        onClick={() => onChange('primary')}
      >
        主 · {primary}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'secondary'}
        className={value === 'secondary' ? 'is-active' : ''}
        onClick={() => onChange('secondary')}
      >
        副 · {secondary}
      </button>
    </div>
  );
}
