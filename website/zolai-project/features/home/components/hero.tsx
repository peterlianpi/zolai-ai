interface HeroProps {
  title: string;
  breadcrumb?: string[];
}

export function Hero({ title, breadcrumb = ["Home"] }: HeroProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-red-950 via-red-900 to-rose-900">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
        <nav aria-label="breadcrumb">
          <ol className="flex justify-center gap-1 text-sm text-red-100">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && <span className="text-red-300">/</span>}
                <span className={index === breadcrumb.length - 1 ? "text-white font-medium" : ""}>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
