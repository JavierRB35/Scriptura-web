import { Literata, Source_Sans_3 } from "next/font/google";

const literata = Literata({
  variable: "--font-library-literata",
  subsets: ["latin"],
  display: "swap",
});
const sourceSans = Source_Sans_3({
  variable: "--font-library-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={literata.variable + " " + sourceSans.variable}
      style={{ fontFamily: "var(--font-library-sans), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
