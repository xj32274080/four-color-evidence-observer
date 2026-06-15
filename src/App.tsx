import { AppStoreProvider, useAppStore } from './store/AppStoreContext';
import { ClassSetupPage } from './pages/ClassSetupPage';
import { LessonCreatePage } from './pages/LessonCreatePage';
import { MarkingPage } from './pages/MarkingPage';
import { FeedbackPage } from './pages/FeedbackPage';

function Router() {
  const { view } = useAppStore();
  switch (view.name) {
    case 'class-setup':
      return <ClassSetupPage />;
    case 'lesson-create':
      return <LessonCreatePage classId={view.classId} />;
    case 'marking':
      return <MarkingPage lessonId={view.lessonId} />;
    case 'feedback':
      return <FeedbackPage lessonId={view.lessonId} />;
    default:
      return <ClassSetupPage />;
  }
}

export default function App() {
  return (
    <AppStoreProvider>
      <Router />
    </AppStoreProvider>
  );
}
