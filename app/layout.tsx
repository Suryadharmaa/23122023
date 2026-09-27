import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Memory Desktop',description:'A personal memory archive in a Sonoma inspired desktop.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
