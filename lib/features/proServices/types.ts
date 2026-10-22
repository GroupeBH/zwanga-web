export interface Offering {
  code: string;
  name: string;
  description: string;
  availability: "open" | "paused" | "coming_soon";
  engagementEnabled: boolean;
  documentOptions: { code: string; label: string }[];
  terms: {
    version: string;
    text: string;
    validationReference: string;
    custodyCodes: string[];
  } | null;
}
