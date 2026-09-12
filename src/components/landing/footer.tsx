import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/">
              <BrandLogo size="sm" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Inventory + POS + Monitoring — gawa para sa Pinoy negosyo.
            </p>
          </div>

          {[
            {
              title: "Produkto",
              links: ["Features", "Presyo", "Integrations"],
            },
            {
              title: "Kumpanya",
              links: ["About", "Blog", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy", "Terms", "Security"],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PinoyStock. Lahat ng karapatan ay
          nakalaan.
        </div>
      </div>
    </footer>
  );
}
