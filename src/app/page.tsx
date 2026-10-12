import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MissingMediaNotice } from "@/components/layout/MissingMediaNotice";
import { ProgressRail } from "@/components/layout/ProgressRail";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Details } from "@/components/sections/Details";
import { Experience } from "@/components/sections/Experience";
import { Finale } from "@/components/sections/Finale";
import { Hero } from "@/components/sections/Hero";
import { Performance } from "@/components/sections/Performance";
import { Reveal } from "@/components/sections/Reveal";
import { resolveMedia } from "@/lib/media.server";

export default function Home() {
  // Checked at build time: scenes only reference files that exist in /public.
  const media = resolveMedia();

  return (
    <SmoothScroll>
      <Header />
      <ProgressRail />
      <Cursor />

      <main id="main" tabIndex={-1}>
        <Hero
          poster={media.heroVideo && media.heroFilm ? media.heroFilm : media.heroPoster}
          video={media.heroVideo}
          videoWebm={media.heroVideoWebm}
        />
        <Reveal front={media.revealFront} />
        <Performance />
        <Details aero={media.heroPoster} light={media.detailLight} carbon={media.detailWheel} />
        <Experience media={media} />
        <Finale poster={media.finalePoster} video={media.finaleVideo} />
      </main>

      <Footer />
      {process.env.NODE_ENV === "development" && <MissingMediaNotice media={media} />}
    </SmoothScroll>
  );
}
