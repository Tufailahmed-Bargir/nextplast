import { Mail, MapPin, Phone } from "lucide-react";

/**
 * Landing contact section — demo-friendly (mailto + campus details).
 */
export function Contact() {
  return (
    <section id="contact" className="border-t border-border/60 bg-muted/20 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Contact
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold">
            Talk to the NexPlast team
          </h2>
          <p className="mt-3 text-muted-foreground">
            For demo walkthroughs, college viva support, or partnership questions,
            reach out using the channels below.
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
          <a
            href="mailto:support@nexplast.com"
            className="flex items-center gap-3 text-sm hover:text-emerald-700"
          >
            <Mail className="h-4 w-4 text-emerald-600" />
            support@nexplast.com
          </a>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-emerald-600" />
            +91 98765 43210 (demo)
          </p>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Circular Economy Lab · Campus Innovation Hub
          </p>
        </div>
      </div>
    </section>
  );
}
