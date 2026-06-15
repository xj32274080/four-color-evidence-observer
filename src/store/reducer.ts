import type {
  AppState,
  ClassConfig,
  Lesson,
  ObservationFocus,
  VerificationMark,
} from '../types';

/** 一个 (观察点, 组) 槽位的唯一键 */
interface Slot {
  focus: ObservationFocus;
  groupIndex: number;
}

function sameSlot(a: Slot, b: Slot): boolean {
  return (
    a.focus.lessonId === b.focus.lessonId &&
    a.focus.metricId === b.focus.metricId &&
    a.focus.stage === b.focus.stage &&
    a.groupIndex === b.groupIndex
  );
}

export type Action =
  | { type: 'ADD_CLASS'; payload: ClassConfig }
  | { type: 'ADD_LESSON'; payload: Lesson }
  | { type: 'SET_VERIFICATION'; payload: VerificationMark }
  | { type: 'CLEAR_VERIFICATION'; payload: Slot };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_CLASS':
      return { ...state, classes: [...state.classes, action.payload] };

    case 'ADD_LESSON':
      return { ...state, lessons: [...state.lessons, action.payload] };

    case 'SET_VERIFICATION': {
      // upsert：同槽位至多一条
      const p = action.payload;
      const others = state.verifications.filter((m) => !sameSlot(m, p));
      return { ...state, verifications: [...others, p] };
    }

    case 'CLEAR_VERIFICATION': {
      // 撤销本组记录 → 回到 unknown
      const p = action.payload;
      return {
        ...state,
        verifications: state.verifications.filter((m) => !sameSlot(m, p)),
      };
    }

    default:
      return state;
  }
}
