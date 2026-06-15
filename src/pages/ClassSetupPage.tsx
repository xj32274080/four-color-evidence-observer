import { useState } from 'react';
import { Layout, TopBar } from '../components/Layout';
import { useAppStore } from '../store/AppStoreContext';

export function ClassSetupPage() {
  const { state, navigate, addClass } = useAppStore();
  const [label, setLabel] = useState('');
  const [groupCount, setGroupCount] = useState(6);
  const [membersPerGroup, setMembersPerGroup] = useState(4);

  const create = () => {
    addClass({
      label: label.trim() || '未命名班级',
      groupCount: clamp(groupCount, 1, 12),
      membersPerGroup: clamp(membersPerGroup, 1, 8),
    });
    setLabel('');
  };

  return (
    <Layout>
      <TopBar title="四色证据链观察器" />
      <p className="tagline">
        课堂共学观察 · 教师端。前台极简，后台严谨。
      </p>

      <section className="card">
        <h2>新建班级</h2>
        <label className="field">
          <span>班级标签（不写姓名）</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="如 三(2)班"
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>小组数</span>
            <input
              type="number"
              min={1}
              max={12}
              value={groupCount}
              onChange={(e) => setGroupCount(+e.target.value || 1)}
            />
          </label>
          <label className="field">
            <span>每组人数</span>
            <input
              type="number"
              min={1}
              max={8}
              value={membersPerGroup}
              onChange={(e) => setMembersPerGroup(+e.target.value || 1)}
            />
          </label>
        </div>
        <button type="button" className="btn-primary" onClick={create}>
          创建班级
        </button>
        <p className="muted small">
          组与成员按位号自动命名（第N组 / 1~{membersPerGroup}号），不保存任何姓名。
        </p>
      </section>

      <section className="card">
        <h2>已有班级与任务</h2>
        {state.classes.length === 0 && (
          <p className="muted">暂无班级，先创建一个再开始观察。</p>
        )}
        {state.classes.map((c) => (
          <div key={c.id} className="class-item">
            <div className="class-item__head">
              <strong>{c.label}</strong>
              <span className="muted small">
                {c.groupCount} 组 × {c.membersPerGroup} 人
              </span>
              <button
                type="button"
                className="btn-mini"
                onClick={() => navigate({ name: 'lesson-create', classId: c.id })}
              >
                ＋新任务
              </button>
            </div>
            <ClassLessons classId={c.id} />
          </div>
        ))}
      </section>
    </Layout>
  );
}

function ClassLessons({ classId }: { classId: string }) {
  const { state, navigate } = useAppStore();
  const lessons = state.lessons.filter((l) => l.classId === classId);
  if (lessons.length === 0) return <p className="muted small">暂无任务</p>;
  return (
    <ul className="lesson-list">
      {lessons.map((l) => (
        <li key={l.id}>
          <span className="lesson-list__title">
            {l.title} <span className="muted">· {l.date}</span>
          </span>
          <span className="lesson-list__acts">
            <button
              type="button"
              className="btn-mini"
              onClick={() => navigate({ name: 'marking', lessonId: l.id })}
            >
              打点
            </button>
            <button
              type="button"
              className="btn-mini"
              onClick={() => navigate({ name: 'feedback', lessonId: l.id })}
            >
              反馈
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(n) || min));
}
