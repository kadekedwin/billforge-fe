"use client";

import FAQ from "@/components/landing/faq";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import Pricing from "@/components/landing/pricing";
import Testimonial from "@/components/landing/testimonial";

export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <FAQ />
            <Testimonial />
            <Pricing />
            <Footer />
        </>
    );
}
