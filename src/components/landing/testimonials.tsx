import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria Santos",
    role: "May-ari, TechMart Quezon City",
    content:
      "PinoyStock ang nagpalaki ng negosyo namin! Yung low stock alerts lang, nakatipid na kami ng libo-libo sa lost sales.",
    initials: "MS",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Operations Manager, Manila Trade Co.",
    content:
      "Sobrang dali gamitin ang POS at monitoring dashboard. Na-reduce namin ang overstock ng 40% sa unang buwan pa lang.",
    initials: "JC",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Founder, EcoGoods Davao",
    content:
      "Maganda ang design at madaling intindihin. Within one hour, running na ang team namin. Highly recommended sa mga Pinoy SME!",
    initials: "SJ",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pinapahalagahan ng{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Pinoy Negosyante
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Basahin ang kwento ng mga customers namin sa buong Pilipinas.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs text-white">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
