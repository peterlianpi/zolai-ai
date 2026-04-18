import Link from "next/link";

interface HeroProps {
  title: string;
  breadcrumb?: string[];
  breadcrumbHrefs?: string[];
}

export function Hero({ title, breadcrumb = ["Home"], breadcrumbHrefs = ["/"] }: HeroProps) {
  return (
    <section className="py-14 bg-gradient-to-br from-red-950 via-red-900 to-rose-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-amber-400 to-green-500" aria-hidden="true" />
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
        <nav aria-label="Breadcrumb">
          <ol className="flex justify-center gap-1 text-sm text-white/80 flex-wrap">
            {breadcrumb.map((item, index) => {
              const href = breadcrumbHrefs[index];
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && <span className="text-white/60" aria-hidden="true">/</span>}
                  {isLast || !href ? (
                    <span className="text-white font-medium" aria-current="page">{item}</span>
                  ) : (
                    <Link href={href} className="hover:text-white transition-colors">{item}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}
