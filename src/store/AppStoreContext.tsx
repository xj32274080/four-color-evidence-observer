import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppState,
  ClassConfig,
  Lesson,
  ObservationFocus,
  VerificationMark,
  View,
} from '../types';
import { reducer } from './reducer';
import { loadState, saveState } from '../storage/localStorage';
import { uid } from '../utils';

interface AppStore {
  state: AppState;
  view: View;
  navigate: (view: View) => void;
  addClass: (c: Omit<ClassConfig, 'id'>) => void;
  /** 创建任务，返回新任务 id（便于跳转到打点页） */
  addLesson: (l: Omit<Lesson, 'id'>) => string;
  /** 设置/覆盖一个 (观察点, 组) 的核验记录 */
  setVerification: (mark: VerificationMark) => void;
  /** 撤销一个 (观察点, 组) 的核验记录 → 回到 unknown */
  clearVerification: (focus: ObservationFocus, groupIndex: number) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [view, setView] = useState<View>({ name: 'class-setup' });

  // 仅持久化领域数据；导航视图不持久化
  useEffect(() => {
    saveState(state);
  }, [state]);

  const store: AppStore = {
    state,
    view,
    navigate: setView,
    addClass: (c) => dispatch({ type: 'ADD_CLASS', payload: { ...c, id: uid() } }),
    addLesson: (l) => {
      const id = uid();
      dispatch({ type: 'ADD_LESSON', payload: { ...l, id } });
      return id;
    },
    setVerification: (mark) => dispatch({ type: 'SET_VERIFICATION', payload: mark }),
    clearVerification: (focus, groupIndex) =>
      dispatch({ type: 'CLEAR_VERIFICATION', payload: { focus, groupIndex } }),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore 必须在 <AppStoreProvider> 内使用');
  return ctx;
}
