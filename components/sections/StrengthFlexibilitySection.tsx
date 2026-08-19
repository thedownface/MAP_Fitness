import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/constants";

const FORCES = [
  {
    name: "Strength",
    traits: ["Heavy", "Dense", "Rigid", "Powerful"],
  },
  {
    name: "Flexibility",
    traits: ["Fluid", "Mobile", "Controlled", "Dynamic"],
  },
] as const;

/** The brand's central philosophy, made an interactive moment rather than a
 * paragraph: two opposing forces, stated separately, then resolved into one
 * word — MAP doesn't choose a side, it trains both on purpose. */
export function StrengthFlexibilitySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-section-y-sm sm:px-10 sm:py-section-y">
      <Reveal className="flex flex-col gap-4">
        <SectionTag index="02" label="Philosophy" />
        <h2 className="max-w-3xl font-display text-4xl uppercase leading-[0.95] text-cool-white sm:text-6xl">
          Two <span className="text-crimson">Forces.</span>
        </h2>
      </Reveal>

      <Reveal stagger className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sharp bg-cool-grey/15 sm:grid-cols-2">
        {FORCES.map((force) => (
          <div key={force.name} className="flex flex-col gap-6 bg-midnight p-8 sm:p-12">
            <h3 className="font-display text-3xl uppercase tracking-tight text-cool-white sm:text-5xl">
              {force.name}
            </h3>
            <ul className="flex flex-col gap-2">
              {force.traits.map((trait) => (
                <li
                  key={trait}
                  className="font-display text-xs uppercase tracking-[0.3em] text-cool-grey"
                >
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-16 flex flex-col items-center gap-6 text-center">
        <p className="font-display text-2xl uppercase tracking-tight text-cool-white sm:text-4xl">
          Muscle <span className="text-crimson">×</span> Performance
        </p>
        <p className="max-w-2xl text-cool-grey">{BRAND.story[2]}</p>
      </Reveal>
    </section>
  );
}
