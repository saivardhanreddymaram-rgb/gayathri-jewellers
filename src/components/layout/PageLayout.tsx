import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  hideAnnouncement?: boolean;
  hideFooter?: boolean;
}

export function PageLayout({ children, hideAnnouncement = false, hideFooter = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideAnnouncement && <AnnouncementBar />}
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
