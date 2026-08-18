import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Trading Calendar",
  description: "Calendario y panel de riesgo para tus cuentas de trading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="bg-fx" aria-hidden="true">
          <div className="grid-overlay" />
          <svg className="ticker-watermark" viewBox="0 0 480 260" preserveAspectRatio="xMaxYMax meet">
            <line x1="18" y1="40" x2="18" y2="80" stroke="currentColor" strokeWidth="2" />
            <rect x="10" y="48" width="16" height="24" rx="1.5" fill="currentColor" />
            <line x1="58" y1="60" x2="58" y2="110" stroke="currentColor" strokeWidth="2" />
            <rect x="50" y="68" width="16" height="30" rx="1.5" fill="currentColor" />
            <line x1="98" y1="30" x2="98" y2="72" stroke="currentColor" strokeWidth="2" />
            <rect x="90" y="38" width="16" height="20" rx="1.5" fill="currentColor" />
            <line x1="138" y1="52" x2="138" y2="100" stroke="currentColor" strokeWidth="2" />
            <rect x="130" y="60" width="16" height="28" rx="1.5" fill="currentColor" />
            <line x1="178" y1="10" x2="178" y2="58" stroke="currentColor" strokeWidth="2" />
            <rect x="170" y="18" width="16" height="26" rx="1.5" fill="currentColor" />
            <line x1="218" y1="34" x2="218" y2="76" stroke="currentColor" strokeWidth="2" />
            <rect x="210" y="42" width="16" height="22" rx="1.5" fill="currentColor" />
            <line x1="258" y1="4" x2="258" y2="46" stroke="currentColor" strokeWidth="2" />
            <rect x="250" y="10" width="16" height="24" rx="1.5" fill="currentColor" />
            <polyline points="18,60 58,85 98,50 138,76 178,32 218,54 258,22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
          </svg>
        </div>
        {children}
      </body>
    </html>
  );
}
