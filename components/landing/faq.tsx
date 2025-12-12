import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { PlusIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const faq = [
  {
    key: "item1",
  },
  {
    key: "item2",
  },
  {
    key: "item3",
  },
  {
    key: "item4",
  },
  {
    key: "item5",
  },
  {
    key: "item6",
  },
  {
    key: "item7",
  },
  {
    key: "item8",
  },
  {
    key: "item9",
  },
  {
    key: "item10",
  },
];

const FAQ = () => {
  const { t } = useTranslation();
  return (
    <div
      id="faq"
      className="w-full max-w-(--breakpoint-xl) mx-auto py-8 xs:py-16 px-6"
    >
      <h2 className="md:text-center text-3xl xs:text-4xl md:text-5xl leading-[1.15]! font-bold tracking-tighter">
        {t('landing.faq.title')}
      </h2>
      <p className="mt-1.5 md:text-center xs:text-lg text-muted-foreground">
        {t('landing.faq.description')}
      </p>

      <div className="min-h-[550px] md:min-h-[320px] xl:min-h-[300px]">
        <Accordion
          type="single"
          collapsible
          className="mt-8 space-y-4 md:columns-2 gap-4"
        >
          {faq.map(({ key }, index) => (
            <AccordionItem
              key={key}
              value={`question-${index}`}
              className="bg-accent py-1 px-4 rounded-xl border-none mt-0! mb-4! break-inside-avoid"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                  className={cn(
                    "flex flex-1 items-center justify-between py-4 font-semibold tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                    "text-start text-lg"
                  )}
                >
                  {t(`landing.faq.items.${key}.question`)}
                  <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent className="text-[15px]">
                {t(`landing.faq.items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
