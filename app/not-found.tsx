import { BoaLogo } from "@/components/ui/BoaLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <BoaLogo variant="icon" size={64} className="mx-auto mb-5 shadow-card" />
        <h1 className="font-serif font-semibold text-2xl mb-2 text-ink">Page not found</h1>
        <p className="text-ink-soft text-sm mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/admin/questions"
          className="bg-ink text-white rounded-[9px] px-5 py-2.5 font-semibold text-sm hover:bg-black transition-colors"
        >
          Go to Admin
        </Link>
      </div>
    </div>
  );
}
