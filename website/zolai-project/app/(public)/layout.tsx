import { Header, Footer, UnderDevelopmentBanner } from "@/features/home/components";
import { getPublicLayoutData } from "@/features/public/server/get-public-layout-data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { menus, siteSettings } = await getPublicLayoutData();

  return (
    <div className="flex min-h-screen flex-col">
      <UnderDevelopmentBanner siteSettings={siteSettings} />
      <Header menus={menus} siteSettings={siteSettings} />
      <main className="flex-1 w-full">{children}</main>
      <Footer menus={menus} siteSettings={siteSettings} />
    </div>
  );
}
