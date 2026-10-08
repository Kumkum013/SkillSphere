import Navbar from '../components/Navbar';
import { ProjectChatPanel } from './ProjectDetail';

const Chat = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-700 text-ink">Project Chat</h1>
          <p className="text-sm text-ink/50 mt-1">Team and private conversations for this project.</p>
        </div>
        <ProjectChatPanel />
      </main>
    </div>
  );
};

export default Chat;
