import { useState } from 'react';
import { Layout, TopBar } from '../components/Layout';
import { StageSelector } from '../components/StageSelector';
import { MetricToggle } from '../components/MetricToggle';
import { GroupButton } from '../components/GroupButton';
import { MemberVerificationSheet } from '../components/MemberVerificationSheet';
import { useAppStore } from '../store/AppStoreContext';
import { STAGES, STAGE_BY_KEY } from '../constants';
import { allPositions, groupsFor, nowISO } from '../utils';
import type { EvidenceStage, ObservationFocus } from '../types';
import { getVerification, verificationState } from '../selectors/observations';

export function MarkingPage({ lessonId }: { lessonId: string }) {
  const { state, navigate, setVerification, clearVerification } = useAppStore();
  const lesson = state.lessons.find((l) => l.id === lessonId);
  const cls = lesson ? state.classes.find((c) => c.id === lesson.classId) : undefined;

  const focusStages =
    lesson && lesson.focusStages && lesson.focusStages.length
      ? lesson.focusStages
      : STAGES.map((s) => s.key);

  const [stage, setStage] = useState<EvidenceStage>(focusStages[0]);
  const [metricMode, setMetricMode] = useState<'primary' | 'secondary'>('primary');
  /** 当前打开核验面板的组 index（1-based）；null = 关闭 */
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);

  if (!lesson || !cls) {
    return (
      <Layout>
        <TopBar title="课中打点" onBack={() => navigate({ name: 'class-setup' })} />
        <p className="muted">未找到任务。</p>
      </Layout>
    );
  }

  const metric = metricMode === 'primary' ? lesson.primaryMetric : lesson.secondaryMetric;
  const groups = groupsFor(cls);
  const mpp = cls.membersPerGroup;
  const stageMeta = STAGE_BY_KEY[stage];
  const focus: ObservationFocus | null = metric
    ? { lessonId: lesson.id, metricId: metric.id, stage }
    : null;

  const sheetGroup = sheetIndex !== null ? groups[sheetIndex - 1] : null;
  const existingMark =
    sheetGroup && focus
      ? getVerification(state.verifications, lesson.id, metric!.id, stage, sheetGroup.index)
      : undefined;

  /** 短按 = 核验该组全员（N/N）。永不在此清除；清除只能经面板「撤销本组记录」。 */
  const handleShortPress = (groupIndex: number) => {
    if (!focus) return;
    setVerification({
      focus,
      groupIndex,
      observedMembers: allPositions(mpp),
      notObservedMembers: [],
      verifiedAll: true,
      timestamp: nowISO(),
    });
  };

  /** 面板确认：按教师勾选生成 observed / notObserved（互补）。 */
  const handleConfirm = (groupIndex: number, observed: number[], notObserved: number[]) => {
    if (!focus) return;
    setVerification({
      focus,
      groupIndex,
      observedMembers: observed,
      notObservedMembers: notObserved,
      verifiedAll: observed.length >= mpp,
      timestamp: nowISO(),
    });
    setSheetIndex(null);
  };

  /** 撤销本组记录 → 回到 unknown。 */
  const handleClear = (groupIndex: number) => {
    if (!focus) return;
    clearVerification(focus, groupIndex);
    setSheetIndex(null);
  };

  return (
    <Layout>
      <TopBar title={lesson.title} onBack={() => navigate({ name: 'class-setup' })} />
      <div className="marking">
        <div className="marking__ctx">
          <MetricToggle
            primary={lesson.primaryMetric.label}
            secondary={lesson.secondaryMetric?.label}
            value={metricMode}
            onChange={(v) => {
              if (v === 'primary' || lesson.secondaryMetric) setMetricMode(v);
            }}
          />
          <div className="muted small">当前观察：{metric?.label}</div>
          {lesson.targetEvidence && (
            <div className="muted small evidence-box">
              目标证据：{lesson.targetEvidence}
            </div>
          )}
        </div>

        <StageSelector value={stage} onChange={setStage} stages={focusStages} />

        <div className="group-grid">
          {groups.map((g) => {
            const vState = metric
              ? verificationState(
                  state.verifications,
                  lesson.id,
                  metric.id,
                  stage,
                  g.index,
                  mpp
                )
              : 'unknown';
            const observedCount =
              metric
                ? getVerification(
                    state.verifications,
                    lesson.id,
                    metric.id,
                    stage,
                    g.index
                  )?.observedMembers.length ?? 0
                : 0;
            return (
              <GroupButton
                key={g.id}
                index={g.index}
                state={vState}
                observedCount={observedCount}
                membersPerGroup={mpp}
                stage={stageMeta}
                onPress={() => handleShortPress(g.index)}
                onLongPress={() => setSheetIndex(g.index)}
              />
            );
          })}
        </div>

        <div className="hint-bar">
          点 = 核验该组 <b>全员</b>（{mpp}/{mpp}）；<b>长按</b> = 进入四人核验面板，可点掉暂未见。
          灰色「待观察」= <b>未核验</b>，不进入统计，不代表未发生。
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate({ name: 'feedback', lessonId: lesson.id })}
        >
          结束 · 查看反馈
        </button>
      </div>

      {sheetGroup && metric && focus && (
        <MemberVerificationSheet
          open={true}
          groupIndex={sheetGroup.index}
          stage={stageMeta}
          metricLabel={metric.label}
          membersPerGroup={mpp}
          initialObserved={existingMark ? existingMark.observedMembers : allPositions(mpp)}
          hasExisting={!!existingMark}
          onConfirm={(observed, notObserved) =>
            handleConfirm(sheetGroup.index, observed, notObserved)
          }
          onClear={() => handleClear(sheetGroup.index)}
          onClose={() => setSheetIndex(null)}
        />
      )}
    </Layout>
  );
}
