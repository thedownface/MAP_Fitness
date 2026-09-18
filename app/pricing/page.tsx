import Image from "next/image";
import {
  MEMBERSHIPS,
  PRIVATE_TRAINING,
  RECOVERY_SESSION_PRICING,
  CLASS_PRICING,
  MEMBERSHIP_ECOSYSTEM,
  GST_NOTE,
  formatINR,
} from "@/lib/constants";
import { SectionTag } from "@/components/ui/SectionTag";
import { DoubleRuleDivider } from "@/components/ui/DoubleRuleDivider";
import { PricingCard } from "@/components/ui/PricingCard";
import { FeatureTable } from "@/components/ui/FeatureTable";
import { Reveal } from "@/components/ui/Reveal";
import { CTASection } from "@/components/ui/CTASection";

export const metadata = {
  title: "Pricing — MAP Fitness",
  description:
    "Membership, private training, recovery and drop-in class rates at MAP Fitness.",
};

export default function PricingPage() {
  return (
    <>
      {/* Banner */}
      <section className="relative flex h-[55vh] min-h-[380px] w-full items-end overflow-hidden">
        <Image
          src="/images/pricing/banner.jpg"
          alt="MAP Fitness training"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-midnight/10" />
        <div className="relative z-10 flex w-full flex-col gap-3 px-6 pb-16 sm:px-10">
          <SectionTag index="01" label="Pricing" />
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] text-cool-white sm:text-7xl">
            Join The <span className="text-crimson">MAP</span> Community
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-cool-grey">{GST_NOTE}</p>
        </div>
      </section>

      {/* Membership */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="02" label="Membership" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Choose Your <span className="text-crimson">Access</span>
          </h2>
          <p className="max-w-xl text-cool-grey">
            Strength and conditioning on its own, or with the full recovery floor included.
          </p>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MEMBERSHIPS.map((tier) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              note={tier.note}
              price={tier.price}
              features={tier.features}
              highlight={"highlight" in tier && tier.highlight}
            />
          ))}
        </Reveal>
      </section>

      {/* Private training */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="03" label="One To One" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Private <span className="text-crimson">Training</span>
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRIVATE_TRAINING.map((block) => (
            <PricingCard
              key={block.sessions}
              name={`${block.sessions} Sessions`}
              /* Divided out rather than written down, so the headline price
                 and the rate beside it can never drift apart. */
              note={`${formatINR(block.price / block.sessions)} per session`}
              price={block.price}
              ctaLabel="Book Now"
              highlight={block.sessions === 20}
            />
          ))}
        </Reveal>
      </section>

      {/* Pay per session */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="04" label="Pay Per Session" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Drop In <span className="text-crimson">Rates</span>
          </h2>
          <p className="max-w-xl text-cool-grey">
            For non-members, and for members on a strength-only tier.
          </p>
        </Reveal>

        <Reveal className="mt-12 flex flex-col gap-4 rounded-sharp border border-cool-grey/15 bg-midnight-soft/40 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-cool-white">Recovery</h3>
            <p className="text-sm text-cool-grey">Sauna, steam room, ice plunge or red light therapy.</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="font-display text-3xl text-crimson">
                {formatINR(RECOVERY_SESSION_PRICING.single)}
              </p>
              <p className="text-xs uppercase tracking-widest text-cool-grey">Any one service</p>
            </div>
            <div>
              <p className="font-display text-3xl text-crimson">
                {formatINR(RECOVERY_SESSION_PRICING.allAccess)}
              </p>
              <p className="text-xs uppercase tracking-widest text-cool-grey">All four</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-6 rounded-sharp border border-cool-grey/15 bg-midnight-soft/40 p-8">
          <h3 className="font-display text-lg uppercase tracking-wide text-cool-white">Classes</h3>
          <ul className="mt-6 flex flex-col">
            {CLASS_PRICING.map((item) => (
              <li
                key={item.name}
                className="flex items-baseline justify-between gap-6 border-t border-cool-grey/10 py-4 first:border-t-0 first:pt-0"
              >
                <span className="font-display text-base uppercase tracking-wide text-cool-white">
                  {item.name}
                </span>
                <span className="font-display text-2xl text-crimson">
                  {formatINR(item.price)}
                  <span className="ml-2 text-xs uppercase tracking-widest text-cool-grey">
                    per class
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Ecosystem table */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <DoubleRuleDivider className="mb-12" />
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="05" label="One Membership" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            A Complete <span className="text-crimson">Ecosystem</span>
          </h2>
        </Reveal>

        <Reveal className="mt-8">
          <FeatureTable rows={MEMBERSHIP_ECOSYSTEM} />
        </Reveal>
      </section>

      <CTASection headline="Join The MAP Community" subline="Train with purpose. Move with confidence. Recover with intention." />
    </>
  );
}
