import { useState } from 'react';
import { Layout, TopBar } from '../components/Layout';
import { useAppStore } from '../store/AppStoreContext';
import { STAGES } from '../constants';
import { todayISO, uid } from '../utils';
import type { EvidenceStage, Metric } from '../types';

export function LessonCreatePage({ classId }: { classId: string }) {
  const { state, navigate, addLesson } = useAppStore();
  const cls = state.classes.find((c) => c.id === classId);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO());
  const [primary, setPrimary] = useState('');
  const [evidence, setEvidence] = useState('');
  const [secondary, setSecondary] = useState('');
  const [focus, setFocus] = useState<EvidenceStage[]>(STAGES.map((s) => s.key));

  if (!cls) {
    return (
      <Layout>
        <TopBar title="创建任务" onBack={() => navigate({ name: 'class-setup' })} />
        <p className="muted">未找到班级。</p>
      </Layout>
    );
  }

  const toggleFocus = (k: EvidenceStage) =>
    setFocus((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const create = () => {
    const primaryMetric: Metric = {
      id: uid(),
      label: primary.trim() || '主指标',
    };
    const secondaryMetric: Metric | undefined = secondary.trim()
      ? { id: uid(), label: secondary.trim() }
      : undefined;
    const id = addLesson({
      classId,
      title: title.trim() || '未命名任务',
      date,
      primaryMetric,
      secondaryMetric,
      focusStages: focus.length ? focus : undefined,
      // 目标证据说明：写入 Lesson，供打点页回显、反馈页引用
      targetEvidence: evidence.trim() || undefined,
    });
    navigate({ name: 'marking', lessonId: id });
  };

  return (
    <Layout>
      <TopBar title={`创建任务 · ${cls.label}`} onBack={() => navigate({ name: 'class-setup' })} />
      <section className="card">
        <label className="field">
          <span>课题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如 《铺满金色巴掌的水泥道》朗读"
          />
        </label>
        <label className="field">
          <span>日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>主指标（可观察的证据）</span>
          <input
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            placeholder="如 能在朗读中读出疑问语气"
          />
        </label>
        <label className="field">
          <span>目标证据说明（可观察，将保存）</span>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="怎样算「观察到该证据」？例：能不顿读、语气上扬地读出疑问句。"
            rows={3}
          />
        </label>
        <label className="field">
          <span>副指标（可选，最多一个）</span>
          <input
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            placeholder="留空 = 不观察副指标"
          />
        </label>
        <div className="field">
          <span>聚焦色阶（默认四色全开）</span>
          <div className="chip-row">
            {STAGES.map((s) => {
              const on = focus.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`chip ${on ? 'is-on' : ''}`}
                  style={
                    on
                      ? { background: s.soft, borderColor: s.color, color: s.color }
                      : undefined
                  }
                  onClick={() => toggleFocus(s.key)}
                  aria-pressed={on}
                >
                  {s.label}·{s.phase}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={create}>
          创建并进入打点
        </button>
        <p className="muted small">每节课 1 个主指标，最多 1 个副指标。</p>
      </section>
    </Layout>
  );
}
