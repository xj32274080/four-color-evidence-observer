import { Layout, TopBar } from '../components/Layout';
import { CoverageNotice } from '../components/CoverageNotice';
import { useAppStore } from '../store/AppStoreContext';
import { generateFeedback } from '../services/feedback';
import { groupsFor } from '../utils';

export function FeedbackPage({ lessonId }: { lessonId: string }) {
  const { state, navigate } = useAppStore();
  const lesson = state.lessons.find((l) => l.id === lessonId);
  const cls = lesson ? state.classes.find((c) => c.id === lesson.classId) : undefined;

  if (!lesson || !cls) {
    return (
      <Layout>
        <TopBar title="课后反馈" onBack={() => navigate({ name: 'class-setup' })} />
        <p className="muted">未找到任务。</p>
      </Layout>
    );
  }

  const session = {
    lesson,
    classConfig: cls,
    verifications: state.verifications.filter((m) => m.focus.lessonId === lesson.id),
  };
  const groups = groupsFor(cls);
  const result = generateFeedback(session, groups);

  return (
    <Layout>
      <TopBar
        title={`反馈 · ${lesson.title}`}
        onBack={() => navigate({ name: 'marking', lessonId: lesson.id })}
      />
      <div className="feedback">
        <CoverageNotice {...result.coverageSummary} />

        {lesson.targetEvidence && (
          <section className="card card--target">
            <h3>目标证据</h3>
            <p className="fb-block">{lesson.targetEvidence}</p>
            <p className="muted small">主指标：{lesson.primaryMetric.label}</p>
          </section>
        )}

        <section className="card">
          <h3>已核验样本描述</h3>
          {result.blocks.map((b, i) => (
            <p key={i} className={`fb-block fb-block--${b.type}`}>
              {b.text}
            </p>
          ))}
          {result.blocks.length === 0 && <p className="muted">暂无可输出的描述。</p>}
        </section>

        <section className="card card--caveats">
          <h3>说明与免责</h3>
          <ul className="caveats">
            {result.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>

        <div className="fb-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate({ name: 'marking', lessonId: lesson.id })}
          >
            继续核验
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate({ name: 'class-setup' })}
          >
            返回首页
          </button>
        </div>
      </div>
    </Layout>
  );
}
