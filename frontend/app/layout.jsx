import './globals.css';
import { AuthProvider } from './auth';
import CursorAura from './components/CursorAura';

export const metadata = {
  title: 'Cafe Experience Tracker',
  description: 'All your cafe visits, ratings and work-friendly spots in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CursorAura />
        <AuthProvider>
          <main className="container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
