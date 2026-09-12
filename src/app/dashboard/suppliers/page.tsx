"use client";

import { Mail, MapPin, Phone, Star } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { useInventory } from "@/context/inventory-context";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SuppliersPage() {
  const { suppliers, products } = useInventory();

  return (
    <>
      <Header
        title="Suppliers"
        subtitle="Manage your supplier relationships"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {suppliers.map((supplier) => {
            const productCount = products.filter(
              (p) => p.supplierId === supplier.id
            ).length;
            const initials = supplier.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);

            return (
              <Card
                key={supplier.id}
                className="border-border/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold truncate">
                          {supplier.name}
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          {productCount} products
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.floor(supplier.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {supplier.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {supplier.address}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
