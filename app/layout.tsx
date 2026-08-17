import './globals.css';

export const metadata = {
  title: 'Carteles QR',
  description: 'Panel de administración de carteles QR dinámicos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
