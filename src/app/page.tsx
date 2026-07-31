import { JsonLd } from "@/components/seo/json-ld";
import { HomeHero } from "@/components/home/home-hero";
import { faqJsonLd } from "@/lib/seo";
import { GLOBAL_FAQS } from "@/lib/faqs";

export default function HomePage() {
  return (
    <div>
      <JsonLd data={faqJsonLd(GLOBAL_FAQS)} />
      <HomeHero />
    </div>
  );
}
