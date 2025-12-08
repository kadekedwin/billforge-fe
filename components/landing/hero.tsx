import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent">
      <div className="max-w-(--breakpoint-xl) w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        <div className="max-w-xl">
          <Badge className="rounded-full py-1 border-none">
            🚀 Free to Start • No Credit Card Required
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2]! tracking-tight">
            Modern POS & Billing Made Simple
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg text-muted-foreground">
            Transform your business with professional receipts, instant checkout, and powerful analytics.
            Built for cafes, restaurants, retail stores, and small businesses everywhere.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base"
            >
              Start Free Trial <ArrowUpRight className="h-5! w-5!" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none"
            >
              <CirclePlay className="h-5! w-5!" /> See How It Works
            </Button>
          </div>
        </div>
        <div className="relative lg:max-w-lg xl:max-w-xl w-full rounded-xl aspect-square">
          <Image
            src="/hero-image.png"
            fill
            alt=""
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
