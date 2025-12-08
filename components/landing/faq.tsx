import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { PlusIcon } from "lucide-react";

const faq = [
  {
    question: "Is BillForge really free to use?",
    answer:
      "Yes! Our Free plan includes 1 business, 50 items, 50 customers, 50 transactions per month, and all basic features. Perfect for small businesses getting started. Upgrade to Pro or Enterprise for higher limits and advanced features.",
  },
  {
    question: "What's the difference between Free, Pro, and Enterprise plans?",
    answer:
      "Free plan has basic limits (1 business, 50 items, 50 transactions/month). Pro offers 10x those limits (10 businesses, 500 items, 500 transactions/month). Enterprise provides unlimited items, customers, and transactions with advanced features like multi-user access and API access.",
  },
  {
    question: "Can I customize my receipts?",
    answer:
      "Absolutely! BillForge offers multiple receipt templates with full customization options. Add your business logo, custom footer messages, QR codes, and choose from various professional designs. Receipts can be printed or sent digitally to customers.",
  },
  {
    question: "What payment methods can I accept?",
    answer:
      "BillForge supports all major payment methods including cash, credit/debit cards, mobile payments, and digital wallets. The Free plan allows up to 5 payment methods, while Pro and Enterprise offer unlimited payment method options.",
  },
  {
    question: "How do I manage discounts and taxes?",
    answer:
      "Our platform includes built-in discount and tax management. Create percentage or fixed-amount discounts, apply them to specific items or entire transactions. Set up multiple tax rates for different product categories. Free plan includes 30 discount and tax configurations.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes! All data is securely stored in the cloud with encryption. We perform regular backups and use industry-standard security practices. Your transaction history, customer information, and business data are protected and accessible only to you.",
  },
  {
    question: "Can I track customer purchase history?",
    answer:
      "Yes! BillForge includes customer management features. Store customer details, view purchase history, and build better relationships with your regulars. Track what they buy, when they visit, and their total spending to provide personalized service.",
  },
  {
    question: "Do I need any special hardware?",
    answer:
      "No special hardware required! BillForge works on any device with a web browser - desktop, tablet, or smartphone. If you want to print receipts, you can use any standard printer. The system is cloud-based, so you can access it from anywhere.",
  },
  {
    question: "What happens if I exceed my monthly transaction limit?",
    answer:
      "On the Free plan, you're limited to 50 transactions per month. If you need more, you can upgrade to Pro (500 transactions/month) or Enterprise (unlimited). Your data is never deleted, and you can always view past transactions regardless of your current plan.",
  },
  {
    question: "How can I get support if I need help?",
    answer:
      "We offer email support for all users. Pro and Enterprise customers get priority support with faster response times. Enterprise customers also receive 24/7 support and a dedicated account manager. Check our documentation and tutorials for quick self-help guides.",
  },
];

const FAQ = () => {
  return (
    <div
      id="faq"
      className="w-full max-w-(--breakpoint-xl) mx-auto py-8 xs:py-16 px-6"
    >
      <h2 className="md:text-center text-3xl xs:text-4xl md:text-5xl leading-[1.15]! font-bold tracking-tighter">
        Frequently Asked Questions
      </h2>
      <p className="mt-1.5 md:text-center xs:text-lg text-muted-foreground">
        Everything you need to know about BillForge and how it can help your business.
      </p>

      <div className="min-h-[550px] md:min-h-[320px] xl:min-h-[300px]">
        <Accordion
          type="single"
          collapsible
          className="mt-8 space-y-4 md:columns-2 gap-4"
        >
          {faq.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
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
                  {question}
                  <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent className="text-[15px]">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
