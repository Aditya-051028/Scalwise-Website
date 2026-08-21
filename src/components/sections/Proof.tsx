import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProofGrid } from "./ProofGrid";

export async function Proof() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "case-studies", limit: 50 });

  return (
    <section id="proof" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Proof of work"
          title="Results, by industry"
          description="A mix of verified client work and illustrative examples while our case-study library grows — every card says which is which."
        />
        <ProofGrid caseStudies={docs} />
      </div>
    </section>
  );
}
