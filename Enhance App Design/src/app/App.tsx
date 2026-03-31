import { TeacherApplicationForm } from './components/TeacherApplicationForm';

export default function App() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#040913' }}>
      {/* Background gradient effects - copied from reference */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,212,200,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,106,247,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(0,212,200,0.03) 0%, transparent 60%)
          `,
          zIndex: 0
        }}
      />
      {/* Grid texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          zIndex: 0
        }}
      />
      {/* Main content */}
      <div className="relative z-[1]">
        <TeacherApplicationForm />
      </div>
    </div>
  );
}
