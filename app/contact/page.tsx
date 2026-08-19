import Image from "next/image";
import { CONTACT, BRAND } from "@/lib/constants";
import { SectionTag } from "@/components/ui/SectionTag";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: "Contact — MAP Fitness",
  description: "Visit MAP Fitness in HRBR Layout, Kalyan Nagar, Bengaluru, or send us a message.",
};

export default function ContactPage() {
  return (
    <>
      {/* Banner */}
      <section className="relative flex h-[50vh] min-h-[340px] w-full items-end overflow-hidden">
        <Image
          src="/images/contact/banner.jpg"
          alt="MAP Fitness"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_35%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-midnight/10" />
        <div className="relative z-10 flex w-full flex-col gap-3 px-6 pb-16 sm:px-10">
          <SectionTag index="01" label="Contact" />
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] text-cool-white sm:text-7xl">
            {BRAND.tagline}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-section-y-sm sm:px-10 sm:py-section-y lg:grid-cols-[1fr_1.1fr]">
        {/* Details */}
        <Reveal stagger className="flex flex-col gap-10">
          <div>
            <SectionTag index="02" label="Visit" />
            <address className="mt-4 flex flex-col gap-1 text-lg not-italic leading-relaxed text-cool-grey">
              {CONTACT.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>

          <DoubleRuleDivider />

          <div>
            <h3 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Call Us</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {CONTACT.phones.map((phone) => (
                <li key={phone.number}>
                  <a
                    href={`tel:${phone.number.replace(/\s/g, "")}`}
                    data-cursor="link"
                    className="text-lg text-cool-white transition-colors hover:text-crimson"
                  >
                    {phone.label}: {phone.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <DoubleRuleDivider />

          <div>
            <h3 className="font-display text-xs uppercase tracking-[0.25em] text-crimson">Follow</h3>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="mt-4 inline-block text-lg text-cool-white transition-colors hover:text-crimson"
            >
              {CONTACT.instagram}
            </a>
          </div>

          <div className="overflow-hidden rounded-sharp border border-cool-grey/15">
            <iframe
              title="MAP Fitness location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="h-64 w-full grayscale invert-[0.92] contrast-[1.1]"
              loading="lazy"
            />
          </div>
        </Reveal>

        {/* Form */}
        <Reveal className="flex flex-col gap-6">
          <SectionTag index="03" label="Send a Message" />
          <h2 className="font-display text-3xl uppercase leading-[0.95] text-cool-white sm:text-4xl">
            Let&rsquo;s Talk <span className="text-crimson">Training</span>
          </h2>
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
