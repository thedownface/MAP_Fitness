import Image from "next/image";
import {
  FOUNDING_MEMBERSHIP,
  STANDARD_MEMBERSHIP,
  PERSONAL_TRAINING,
  WELLNESS_MEMBERSHIPS,
  WELLNESS_SESSION_PRICING,
  HYVE_UPGRADE,
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
  description: "Founding memberships, personal training, wellness sessions and more at MAP Fitness.",
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

      {/* Founding membership */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="02" label={FOUNDING_MEMBERSHIP.label} />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Founding <span className="text-crimson">Membership</span>
          </h2>
          <p className="max-w-xl text-cool-grey">Limited pre-launch pricing. Become a founding member.</p>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PricingCard
            name="Individual"
            price={FOUNDING_MEMBERSHIP.individual.price}
            features={FOUNDING_MEMBERSHIP.includes}
            highlight
          />
          <PricingCard
            name="Couple / Buddy"
            note={FOUNDING_MEMBERSHIP.couple.note}
            price={FOUNDING_MEMBERSHIP.couple.price}
            features={FOUNDING_MEMBERSHIP.includes}
          />
        </Reveal>
      </section>

      {/* Standard membership */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="03" label="Post Launch" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Standard <span className="text-crimson">Membership</span>
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PricingCard name="Individual" price={STANDARD_MEMBERSHIP.individual.price} />
          <PricingCard name="Couple / Buddy" price={STANDARD_MEMBERSHIP.couple.price} />
        </Reveal>
      </section>

      {/* Personal training */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="04" label={PERSONAL_TRAINING.subtitle} />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Personal <span className="text-crimson">Training</span>
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PERSONAL_TRAINING.tiers.map((tier) => (
            <PricingCard key={tier.name} name={tier.name} price={tier.price} highlight={tier.name === "Pro"} />
          ))}
        </Reveal>
      </section>

      {/* Wellness */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="05" label="Recovery & Wellness" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Wellness <span className="text-crimson">Memberships</span>
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {WELLNESS_MEMBERSHIPS.map((tier) => (
            <PricingCard
              key={tier.duration}
              name={tier.duration}
              price={tier.price}
              note={`${tier.sessions} wellness sessions`}
              highlight={tier.duration === "3 Months"}
            />
          ))}
        </Reveal>

        <Reveal className="mt-12 flex flex-col gap-4 rounded-sharp border border-cool-grey/15 bg-midnight-soft/40 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-cool-white">
              Single-Session Wellness Pricing
            </h3>
            <p className="text-sm text-cool-grey">Sauna, steam, ice plunge or red light therapy.</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="font-display text-3xl text-crimson">{formatINR(WELLNESS_SESSION_PRICING.single)}</p>
              <p className="text-xs uppercase tracking-widest text-cool-grey">Single service</p>
            </div>
            <div>
              <p className="font-display text-3xl text-crimson">{formatINR(WELLNESS_SESSION_PRICING.allFour)}</p>
              <p className="text-xs uppercase tracking-widest text-cool-grey">All four services</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* HYVE upgrade */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="06" label="HYVE → MAP" />
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
            Upgrade Your <span className="text-crimson">Membership</span>
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HYVE_UPGRADE.map((tier) => (
            <PricingCard key={tier.duration} name={tier.duration} price={tier.price} />
          ))}
        </Reveal>
      </section>

      {/* Ecosystem table */}
      <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
        <DoubleRuleDivider className="mb-12" />
        <Reveal className="flex flex-col gap-4">
          <SectionTag index="07" label="One Membership" />
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
