import type { ReactNode } from 'react';

/** 应用外壳：手机端优先，桌面端居中限宽，便于预览。 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <div className="app__inner">{children}</div>
    </div>
  );
}

interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function TopBar({ title, onBack, right }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        {onBack && (
          <button
            type="button"
            className="topbar__back"
            onClick={onBack}
            aria-label="返回"
          >
            ‹
          </button>
        )}
        <span className="topbar__title">{title}</span>
      </div>
      {right && <div className="topbar__right">{right}</div>}
    </header>
  );
}
