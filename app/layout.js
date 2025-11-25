import "./globals.css";

export const metadata = {
  title: "ISA Workload Assessment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
