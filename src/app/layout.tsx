import React from 'react';
import type { Metadata } from 'next';
import '../CyberDock.css'; // global css 또는 cyberdock.css 불러오기 (파일명/경로에 맞게 수정)

export const metadata: Metadata = {
  title: 'CyberDock',
  description: 'CyberDock Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        {children}
      </body>
    </html>
  );
}