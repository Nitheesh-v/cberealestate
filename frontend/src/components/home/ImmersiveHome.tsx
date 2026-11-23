'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, KeyRound, MoveUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/** Scroll-driven transforms are tied to the section, not to a global scroll listener. */
export function ImmersiveHome(): React.JSX.Element {
  const stage = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const scale = useTransform(progress, [0, 0.38, 0.75, 1], [0.82, 1, 1.12, 1.25]);
  const rotateX = useTransform(progress, [0, 0.4, 0.8, 1], [13, 0, -8, -14]);
  const rotateY = useTransform(progress, [0, 0.5, 1], [-7, 0, 6]);
  const cardY = useTransform(progress, [0, 0.6, 1], [55, 0, -65]);
  const captionOpacity = useTransform(progress, [0, 0.2, 0.7, 0.95], [1, 1, 0.3, 0]);
  const foregroundY = useTransform(progress, [0, 1], [0, -95]);

  return (
    <div className="overflow-clip bg-[#f6f3ec] text-[#19382e] dark:bg-[#101c18] dark:text-[#f6f3ec]">
      <section ref={stage} className="relative h-[230vh] min-h-[1200px]" aria-label="Discover a new perspective on home">
        <div className="sticky top-0 flex h-[100svh] min-h-[600px] items-center justify-center overflow-hidden px-5 py-16 sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#e8e5d8_0%,#f6f3ec_65%)] dark:bg-[radial-gradient(ellipse_at_50%_40%,#284137_0%,#101c18_70%)]" />
          <div className="absolute left-6 top-8 z-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#597267] sm:left-12">SBR / A new perspective</div>
          <span className="absolute right-6 top-8 z-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#597267] sm:right-12">01 — 03</span>

          <div className="relative z-[1] w-full max-w-[1100px]" style={{ perspective: '1300px' }}>
            <motion.div
              style={reduceMotion ? undefined : { scale, rotateX, rotateY, y: cardY, transformStyle: 'preserve-3d' }}
              className="relative mx-auto aspect-[4/5] w-full max-w-[760px] overflow-hidden rounded-[12px] bg-[#254538] shadow-[0_40px_90px_-35px_rgba(12,40,28,0.55)] sm:aspect-[5/4] lg:aspect-[16/10]"
            >
              <motion.div
                style={reduceMotion ? undefined : { y: foregroundY, scale: 1.18 }}
                className="absolute inset-[-12%] bg-cover bg-center"
                role="img"
                aria-label="A welcoming residential property"
              >
                <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a14]/85 via-[#071a14]/10 to-[#071a14]/25" />
              <motion.div style={reduceMotion ? undefined : { opacity: captionOpacity }} className="absolute inset-x-6 bottom-7 text-white sm:inset-x-12 sm:bottom-12">
                <span className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e0cb91]"><span className="h-px w-6 bg-[#e0cb91]" /> A space to belong</span>
                <p className="max-w-xl font-heading text-4xl leading-[1.1] sm:text-6xl lg:text-7xl">Find your place<br /><em>in the world.</em></p>
              </motion.div>
            </motion.div>
          </div>
          <motion.div style={reduceMotion ? undefined : { y: foregroundY }} className="pointer-events-none absolute bottom-[9%] left-[5%] z-[2] hidden font-heading text-[clamp(5rem,13vw,13rem)] leading-none tracking-[-0.085em] text-[#19382e] mix-blend-normal lg:block dark:text-[#f6f3ec]" aria-hidden="true">LIVE</motion.div>
          <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] sm:right-12"><span>Scroll to explore</span><ArrowDown className="h-4 w-4" /></div>
        </div>
      </section>

      <section className="relative z-10 bg-[#19382e] px-6 py-28 text-[#f7f4eb] sm:px-12 lg:py-40">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <motion.div initial={reduceMotion ? false : { opacity: 0, x: -35 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d6b966]">The art of arriving</span>
            <p className="mt-6 font-heading text-5xl leading-[1.15] sm:text-6xl">More than<br />an address.<br /><em>A feeling.</em></p>
          </motion.div>
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 55, rotateX: 10 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8 }} className="flex flex-col justify-end border-l border-white/20 pl-8 sm:pl-12">
            <p className="max-w-lg text-lg leading-relaxed text-white/75 sm:text-xl">A home is where life unfolds. Explore spaces designed for the everyday moments that become your favorite memories.</p>
            <Link href="/properties" className="mt-10 inline-flex w-fit items-center gap-4 border-b border-[#d6b966] pb-3 text-xs font-semibold uppercase tracking-[0.2em] transition-all hover:gap-7">Explore properties <ArrowUpRight className="h-5 w-5" /></Link>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-12 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div><span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a48742]">Your journey, your way</span><h2 className="mt-4 font-heading text-4xl sm:text-6xl">The next chapter <em>starts here.</em></h2></div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#788c80]">02 — 03</span>
          </div>
          <div className="grid gap-5 md:grid-cols-3" style={{ perspective: '1100px' }}>
            {[
              { number: '01', title: 'Explore spaces', body: 'Discover places with room for everything that matters.', icon: Compass, href: '/properties' },
              { number: '02', title: 'Make it yours', body: 'Take the first step toward a place you can call home.', icon: KeyRound, href: '/contact' },
              { number: '03', title: 'Start a conversation', body: 'Connect with us and find the right path forward.', icon: MoveUpRight, href: '/contact' },
            ].map(({ number, title, body, icon: Icon, href }, index) => (
              <motion.div key={number} initial={reduceMotion ? false : { opacity: 0, y: 90, rotateX: 18 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: index * 0.12 }} className="group flex min-h-[350px] flex-col rounded-sm border border-[#d9ded2] bg-white p-8 shadow-[0_16px_35px_-30px_rgba(10,40,25,0.4)] transition-shadow hover:shadow-[0_24px_45px_-22px_rgba(10,40,25,0.3)] dark:border-white/10 dark:bg-[#1a2c23]">
                <div className="flex items-start justify-between"><span className="text-xs tracking-[0.2em] text-[#849589]">{number} / 03</span><Icon className="h-7 w-7 text-[#a48742]" strokeWidth={1.25} /></div>
                <div className="mt-auto"><h3 className="font-heading text-3xl">{title}</h3><p className="mt-4 max-w-xs text-sm leading-7 text-[#64766b] dark:text-white/60">{body}</p><Link href={href} className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-widest hover:text-[#a48742]">Discover more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#dedacb] px-6 py-24 text-center text-[#19382e] sm:px-12 lg:py-32 dark:bg-[#263c30] dark:text-[#f7f4eb]">
        <span className="text-xs font-semibold uppercase tracking-[0.3em]">03 — 03 / Your next chapter</span>
        <h2 className="mx-auto mt-6 max-w-3xl font-heading text-5xl leading-tight sm:text-7xl">There&apos;s no place<br /><em>like your place.</em></h2>
        <Link href="/properties" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#19382e] px-8 py-4 text-xs font-semibold uppercase tracking-[0.17em] text-white transition-transform hover:-translate-y-1 dark:bg-[#e6c779] dark:text-[#19382e]">Find your space <ArrowUpRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
