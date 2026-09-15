import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "比稿資料平台 | 依角色優化資訊呈現",
  description: "讓不同角色用最有效的方式看到對的資訊。創意看視覺拼貼，策略看數據圖表，業務看重點摘要。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
