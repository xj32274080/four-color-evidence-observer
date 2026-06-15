interface Props {
  verifiedGroups: number;
  totalGroups: number;
  verifiedStudents: number;
  expectedStudents: number;
  ratio: number;
  sufficient: boolean;
}

/**
 * 核验覆盖条。
 * 注意：这里的「覆盖率」= 已核验组占比（核验覆盖），【不是】出现证据占比。
 * 始终展示分母（组与人）；达标与否仅决定能否在样本层面描述，绝不等于「全班达成」。
 */
export function CoverageNotice({
  verifiedGroups,
  totalGroups,
  verifiedStudents,
  expectedStudents,
  ratio,
  sufficient,
}: Props) {
  const pct = Math.round(ratio * 100);
  return (
    <div className={`coverage ${sufficient ? 'is-ok' : 'is-low'}`}>
      <div className="coverage__num">
        已核验 <b>{verifiedGroups}</b>/{totalGroups} 组 · {verifiedStudents}/{expectedStudents} 人 ·
        核验覆盖率 {pct}%
      </div>
      <div className="coverage__bar" aria-hidden>
        <span style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="coverage__note">
        {sufficient
          ? '核验样本达标：可在样本层面描述（仍非全班普查，不下全班结论）。'
          : '核验样本不足：暂不形成全班判断；未核验小组不进入统计。'}
      </div>
    </div>
  );
}
