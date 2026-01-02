import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DirectMessages } from '@/components/DirectMessages';

const Messages = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DirectMessages />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
