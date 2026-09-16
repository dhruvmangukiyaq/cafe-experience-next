import './globals.css';

export const metadata = {
  title: 'Cafe Experience',
  description: 'Track and rate your cafe experiences',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}