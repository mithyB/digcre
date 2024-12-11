import './globals.css';

export const metadata = {
  title: 'AmbiRead',
  description: 'DIGCRE HS24',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
