import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Stock<span className="text-indigo-500">Flow</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Smart inventory management for modern businesses.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Integrations", "Changelog"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
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
          &copy; {new Date().getFullYear()} StockFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
