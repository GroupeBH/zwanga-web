"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BellRing,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LifeBuoy,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  PhoneCall,
  Plus,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  createTicket,
  fetchFaq,
  getAccessToken,
  SupportApiError,
  type SupportFaqEntry,
  type SupportTicketCategory,
  type SupportTicketPriority,
} from "@/lib/support";
import styles from "./home.module.css";

type Benefit = {
  title: string;
  description: string;
};

type Faq = {
  question: string;
  answer: string;
};

type Persona = "passenger" | "driver";

type PreviewFlow = "Passager" | "Conducteur" | "Compte";

type PreviewImage = {
  src: string;
  alt: string;
  flow: PreviewFlow;
  step: string;
  title: string;
};

const passengerBenefits: Benefit[] = [
  {
    title: "Recherche rapide de trajets",
    description:
      "Trouvez un covoiturage Kinshasa disponible selon votre zone, votre heure et votre besoin.",
  },
  {
    title: "Réservation en quelques clics",
    description:
      "Choisissez votre conducteur, confirmez votre place et suivez la course depuis l'application de transport.",
  },
  {
    title: "Plus de confiance au quotidien",
    description:
      "Messagerie, suivi en direct, avis et signalement pour un trajet sécurisé de bout en bout.",
  },
];

const driverBenefits: Benefit[] = [
  {
    title: "Publiez vos trajets quotidiens",
    description:
      "Proposez vos places libres et organisez vos départs simplement depuis votre mobile.",
  },
  {
    title: "Gérez les demandes facilement",
    description:
      "Acceptez ou refusez les réservations en gardant le contrôle sur vos horaires.",
  },
  {
    title: "Conduisez avec les bons outils",
    description:
      "Navigation GPS, suivi en temps réel, notation des passagers et signalement en cas de souci.",
  },
];

const passengerSteps = [
  "Créez votre compte passager en quelques minutes.",
  "Recherchez un trajet selon votre destination.",
  "Réservez votre place et échangez avec le conducteur.",
  "Suivez la course, arrivez, puis notez le trajet.",
];

const driverSteps = [
  "Créez votre profil conducteur.",
  "Passez la vérification d'identité (KYC).",
  "Publiez vos trajets et gérez les réservations.",
  "Lancez la navigation, terminez la course et notez le passager.",
];

const personaContent: Record<
  Persona,
  { label: string; icon: typeof Users; benefits: Benefit[]; steps: string[]; cta: string }
> = {
  passenger: {
    label: "Passager",
    icon: Users,
    benefits: passengerBenefits,
    steps: passengerSteps,
    cta: "Trouver un trajet",
  },
  driver: {
    label: "Conducteur",
    icon: Car,
    benefits: driverBenefits,
    steps: driverSteps,
    cta: "Publier un trajet",
  },
};

const securityPoints = [
  {
    icon: UserCheck,
    title: "Vérification d'identité",
    description: "KYC pour renforcer la confiance entre passager et conducteur.",
  },
  {
    icon: Navigation,
    title: "Suivi en temps réel",
    description: "Visualisez le trajet en direct pendant toute la course.",
  },
  {
    icon: BellRing,
    title: "Alertes et notifications",
    description: "Recevez les infos importantes de sécurité et de trajet.",
  },
  {
    icon: PhoneCall,
    title: "Contacts d'urgence",
    description: "Accès rapide depuis l'application en cas de besoin.",
  },
];

const marqueeItems = [
  "Covoiturage urbain",
  "Suivi en direct",
  "Messagerie intégrée",
  "Vérification d'identité",
  "Alertes de sécurité",
  "Notation mutuelle",
  "Contacts d'urgence",
  "Navigation GPS",
];

const supportFlow = [
  {
    title: "Vous ouvrez un ticket",
    description: "Sujet, catégorie, priorité et premier message, directement depuis l'application.",
  },
  {
    title: "L'équipe le prend en charge",
    description: "Un membre du support est assigné et vous répond dans le fil du ticket.",
  },
  {
    title: "Suivi jusqu'à la résolution",
    description: "Vous voyez l'avancement à chaque étape et pouvez rouvrir le ticket si besoin.",
  },
];

const supportCategoryOptions: { label: string; value: SupportTicketCategory }[] = [
  { label: "Information générale", value: "general" },
  { label: "Compte", value: "account" },
  { label: "Paiement", value: "payment" },
  { label: "Réservation", value: "booking" },
  { label: "Sécurité", value: "safety" },
  { label: "Technique", value: "technical" },
  { label: "Autre", value: "other" },
];

const supportPriorityOptions: { label: string; value: SupportTicketPriority }[] = [
  { label: "Moyenne", value: "medium" },
  { label: "Basse", value: "low" },
  { label: "Haute", value: "high" },
  { label: "Urgente", value: "urgent" },
];

const faqs: Faq[] = [
  {
    question: "Zwanga, c'est quoi exactement ?",
    answer:
      "Zwanga est une application de transport de covoiturage Kinshasa. Elle relie passagers et conducteurs pour les trajets urbains du quotidien.",
  },
  {
    question: "Comment réserver un trajet ?",
    answer:
      "Vous recherchez une offre, choisissez un conducteur et confirmez votre place en quelques clics.",
  },
  {
    question: "Comment devenir conducteur sur Zwanga ?",
    answer:
      "Inscrivez-vous, complétez la vérification d'identité, puis publiez vos trajets.",
  },
  {
    question: "Comment savoir si mon trajet est sécurisé ?",
    answer:
      "Vous avez le profil vérifié, les avis, le suivi en direct, les alertes et le système de signalement.",
  },
  {
    question: "Puis-je parler avec le conducteur avant le départ ?",
    answer: "Oui. La messagerie intégrée permet d'écrire avant et pendant la course.",
  },
  {
    question: "Que faire en cas d'incident ?",
    answer:
      "Signalez immédiatement depuis l'écran de course ou ouvrez un ticket support. Notre équipe suit le dossier jusqu'à résolution.",
  },
  {
    question: "Comment suivre mon ticket support ?",
    answer:
      "Votre ticket passe par les étapes ouvert, en cours, en attente de votre retour, résolu puis fermé : vous savez toujours où il en est.",
  },
  {
    question: "Puis-je rouvrir un ticket fermé ou résolu ?",
    answer:
      "Oui. Vous pouvez rouvrir votre ticket depuis l'application si le problème continue.",
  },
  {
    question: "Zwanga est disponible où ?",
    answer: "Zwanga est centré sur Kinshasa pour offrir un service local adapté à la ville.",
  },
];

const previewImages: PreviewImage[] = [
  {
    src: "/Screenshot_20261022_122600.png",
    alt: "Accueil passager Zwanga avec la carte de Kinshasa et la recherche « Où allez-vous ? »",
    flow: "Passager",
    step: "01",
    title: "Tout commence par « Où allez-vous ? »",
  },
  {
    src: "/Screenshot_20261022_123140.png",
    alt: "Choix de la destination sur la carte avec lieux favoris",
    flow: "Passager",
    step: "02",
    title: "Choisir sa destination sur la carte",
  },
  {
    src: "/Screenshot_20261022_123149.png",
    alt: "Commande d'un trajet : départ, arrivée et choix du véhicule",
    flow: "Passager",
    step: "03",
    title: "Voiture, moto ou tricycle : à vous de choisir",
  },
  {
    src: "/Screenshot_20261022_123207.png",
    alt: "Sélection de l'heure de départ souhaitée",
    flow: "Passager",
    step: "04",
    title: "Fixer son heure de départ",
  },
  {
    src: "/Screenshot_20261022_123249.png",
    alt: "Suivi d'une commande en attente d'un conducteur",
    flow: "Passager",
    step: "05",
    title: "Suivre sa commande en temps réel",
  },
  {
    src: "/Screenshot_20261022_144453.png",
    alt: "Liste des trajets publiés triés par prix ou par horaire",
    flow: "Passager",
    step: "06",
    title: "Trouver un trajet déjà publié",
  },
  {
    src: "/app-trip-details.png",
    alt: "Détails d'un trajet et bouton de réservation",
    flow: "Passager",
    step: "07",
    title: "Consulter puis réserver sa place",
  },
  {
    src: "/Screenshot_20261022_124821.png",
    alt: "Accueil conducteur avec clients à proximité et gains",
    flow: "Conducteur",
    step: "08",
    title: "Un accueil pensé pour le conducteur",
  },
  {
    src: "/Screenshot_20261022_144356.png",
    alt: "Liste des commandes de passagers à accepter",
    flow: "Conducteur",
    step: "09",
    title: "Voir et accepter les commandes",
  },
  {
    src: "/Screenshot_20261022_144506.png",
    alt: "Gestion des trajets publiés et des trajets réguliers",
    flow: "Conducteur",
    step: "10",
    title: "Publier et gérer ses trajets réguliers",
  },
  {
    src: "/Screenshot_20261022_144627.png",
    alt: "Gestion d'un trajet avant le départ",
    flow: "Conducteur",
    step: "11",
    title: "Démarrer et partager son trajet",
  },
  {
    src: "/Screenshot_20261022_144711.png",
    alt: "Navigation pendant un trajet en cours avec bouton SOS",
    flow: "Conducteur",
    step: "12",
    title: "Navigation guidée et bouton SOS",
  },
  {
    src: "/Screenshot_20261022_144720.png",
    alt: "Options disponibles pendant un trajet en cours",
    flow: "Conducteur",
    step: "13",
    title: "Ajuster le trajet en pleine course",
  },
  {
    src: "/Screenshot_20261022_144542.png",
    alt: "Revenus du conducteur et retrait vers Mobile Money",
    flow: "Conducteur",
    step: "14",
    title: "Retirer ses gains sur Mobile Money",
  },
  {
    src: "/Screenshot_20261022_144518.png",
    alt: "Profil conducteur avec tableau de bord",
    flow: "Compte",
    step: "15",
    title: "Piloter son activité depuis son profil",
  },
  {
    src: "/Screenshot_20261022_122722.png",
    alt: "Profil passager avec vérification d'identité et parrainage",
    flow: "Compte",
    step: "16",
    title: "Vérifier son identité, inviter ses proches",
  },
  {
    src: "/Screenshot_20261022_144557.png",
    alt: "Solde et historique des jetons Zwanga",
    flow: "Compte",
    step: "17",
    title: "Recharger et partager ses jetons",
  },
  {
    src: "/Screenshot_20261022_144744.png",
    alt: "Services pro : demandes de documents et autorisations",
    flow: "Compte",
    step: "18",
    title: "Confier ses démarches à Zwanga",
  },
  {
    src: "/app-login.png",
    alt: "Connexion à Zwanga par téléphone ou Google",
    flow: "Compte",
    step: "19",
    title: "Commencer en quelques secondes",
  },
];

const previewFilters: ("Tous" | PreviewFlow)[] = ["Tous", "Passager", "Conducteur", "Compte"];

const rawPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zwanga-app.com";
const publicSiteUrl =
  rawPublicSiteUrl.startsWith("http://") || rawPublicSiteUrl.startsWith("https://")
    ? rawPublicSiteUrl
    : `https://${rawPublicSiteUrl}`;

/** Délai d'apparition échelonné pour les éléments [data-reveal]. */
const revealDelay = (index: number): CSSProperties =>
  ({ "--reveal-delay": `${index * 80}ms` }) as CSSProperties;

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [persona, setPersona] = useState<Persona>("passenger");
  const [previewFilter, setPreviewFilter] = useState<"Tous" | PreviewFlow>("Tous");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportSuccessTicketId, setSupportSuccessTicketId] = useState<string | null>(null);
  const [isSupportAuthenticated, setIsSupportAuthenticated] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportCategory, setSupportCategory] = useState<SupportTicketCategory>("general");
  const [supportPriority, setSupportPriority] = useState<SupportTicketPriority>("medium");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportFeedback, setSupportFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const supportSubjectInputRef = useRef<HTMLInputElement | null>(null);
  const previewTrackRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const androidAppUrl =
    process.env.NEXT_PUBLIC_ANDROID_APP_URL ||
    "https://play.google.com/store/apps/details?id=com.zwanga";
  const appStoreUrl =
    process.env.NEXT_PUBLIC_IOS_APP_URL ||
    "https://apps.apple.com/cd/app/zwanga/id6756211830?l=fr-FR";
  const [isSubmittingSupportTicket, setIsSubmittingSupportTicket] = useState(false);
  const [faqResponse, setFaqResponse] = useState<SupportFaqEntry[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFaq(controller.signal)
      .then(setFaqResponse)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const faqItems = useMemo(() => {
    const backendFaqList = faqResponse;

    if (!backendFaqList.length) {
      return faqs;
    }

    const normalized = backendFaqList
      .map((entry) => ({
        question: entry.question?.trim(),
        answer: entry.answer?.trim(),
      }))
      .filter((entry) => entry.question && entry.answer) as Faq[];

    return normalized.length ? normalized.slice(0, 8) : faqs;
  }, [faqResponse]);

  const visiblePreviews = useMemo(
    () =>
      previewFilter === "Tous"
        ? previewImages
        : previewImages.filter((shot) => shot.flow === previewFilter),
    [previewFilter],
  );

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zwanga",
        url: publicSiteUrl,
        logo: `${publicSiteUrl}/zwanga.png`,
        email: "contact@biso-tech.org",
      },
      {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        name: "Zwanga",
        operatingSystem: "Android, iOS",
        applicationCategory: "TravelApplication",
        description:
          "Application de transport de covoiturage Kinshasa pour passager et conducteur avec trajet sécurisé.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.slice(0, 8).map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
    [faqItems],
  );

  useEffect(() => {
    setIsSupportAuthenticated(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Révèle chaque bloc [data-reveal] une seule fois, quand il entre dans l'écran.
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => (target.dataset.visible = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    targets
      .filter((target) => target.dataset.visible !== "true")
      .forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [persona, visiblePreviews, faqItems]);

  useEffect(() => {
    previewTrackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [previewFilter]);

  useEffect(() => {
    const hasOpenModal = isSupportModalOpen || Boolean(supportSuccessTicketId);

    if (!hasOpenModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSupportModalOpen) {
          setIsSupportModalOpen(false);
          return;
        }

        if (supportSuccessTicketId) {
          setSupportSuccessTicketId(null);
          return;
        }

      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSupportModalOpen, supportSuccessTicketId]);

  const goToDownloadSection = () => {
    const section = document.getElementById("download-apps");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollPreviews = (direction: 1 | -1) => {
    const track = previewTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  const openSupportCenter = () => {
    setSupportSuccessTicketId(null);
    setSupportFeedback(null);
    setIsSupportModalOpen(true);
    window.setTimeout(() => supportSubjectInputRef.current?.focus(), 120);
  };

  const closeSupportModal = () => {
    setIsSupportModalOpen(false);
  };

  const closeSupportSuccessModal = () => {
    setSupportSuccessTicketId(null);
  };

  const handleStartDownload = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isAndroid = /android/i.test(userAgent);
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      window.location.href = androidAppUrl;
      return;
    }

    if (isIOS) {
      window.location.href = appStoreUrl;
      return;
    }

    goToDownloadSection();
  };

  const handleSupportRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportFeedback(null);

    if (!isSupportAuthenticated) {
      closeSupportModal();
      handleStartDownload();
      return;
    }

    const subject = supportSubject.trim();
    const message = supportMessage.trim();

    if (!subject || !message) {
      setSupportFeedback({
        type: "error",
        message: "Ajoutez un sujet et un message pour envoyer votre demande.",
      });
      return;
    }

    setIsSubmittingSupportTicket(true);
    try {
      const createdTicket = await createTicket({
        subject,
        category: supportCategory,
        priority: supportPriority,
        message,
      });

      setSupportFeedback(null);
      setIsSupportModalOpen(false);
      setSupportSuccessTicketId(createdTicket.id);
      setSupportSubject("");
      setSupportMessage("");
      setSupportCategory("general");
      setSupportPriority("medium");
    } catch (error) {
      const status = error instanceof SupportApiError ? error.status : undefined;
      const backendMessage = error instanceof SupportApiError ? error.data?.message : undefined;
      const messageText =
        Array.isArray(backendMessage) && backendMessage.length
          ? backendMessage.join(", ")
          : typeof backendMessage === "string"
            ? backendMessage
            : "Impossible de créer le ticket pour le moment.";

      if (status === 401 || status === 403) {
        setIsSupportAuthenticated(false);
        closeSupportModal();
        handleStartDownload();
        return;
      }

      setSupportFeedback({
        type: "error",
        message: messageText,
      });
    } finally {
      setIsSubmittingSupportTicket(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  const activePersona = personaContent[persona];

  const renderStoreButtons = (variant: "light" | "dark" = "dark") => (
    <div className={styles.appButtons}>
      <a
        href={androidAppUrl}
        className={`${styles.appBtn} ${variant === "light" ? styles.appBtnLight : ""}`}
        aria-label="Télécharger sur Google Play"
        target="_blank"
        rel="noreferrer"
      >
        <Image
          src="/play-store.svg"
          alt=""
          width={24}
          height={24}
          className={styles.appBtnIcon}
          aria-hidden="true"
        />
        <span className={styles.appBtnLabel}>
          <span className={styles.appBtnLabelHint}>Disponible sur</span>
          <span className={styles.appBtnLabelName}>Google Play</span>
        </span>
      </a>
      <a
        href={appStoreUrl}
        className={`${styles.appBtn} ${variant === "light" ? styles.appBtnLight : ""}`}
        aria-label="Télécharger sur App Store"
        target="_blank"
        rel="noreferrer"
      >
        <Image
          src="/apple.svg"
          alt=""
          width={22}
          height={22}
          className={`${styles.appBtnIcon} ${variant === "dark" ? styles.appBtnIconInvert : ""}`}
          aria-hidden="true"
        />
        <span className={styles.appBtnLabel}>
          <span className={styles.appBtnLabelHint}>Télécharger dans l&apos;</span>
          <span className={styles.appBtnLabelName}>App Store</span>
        </span>
      </a>
    </div>
  );

  return (
    <div className={styles.page} ref={pageRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>

      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/zwanga.png"
              alt=""
              width={32}
              height={32}
              className={styles.logoImage}
              priority
            />
            <span>Zwanga</span>
          </Link>
          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              Comment ça marche
            </Link>
            <Link href="#app-preview" onClick={() => setMobileMenuOpen(false)}>
              L&apos;application
            </Link>
            <Link href="#security" onClick={() => setMobileMenuOpen(false)}>
              Sécurité
            </Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link
              href="#download-apps"
              className={styles.navCta}
              onClick={() => setMobileMenuOpen(false)}
            >
              Télécharger
              <ArrowRight size={16} className={styles.arrow} />
            </Link>
          </nav>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className={styles.hero} id="hero">
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroShell}`}>
            <div className={styles.heroText}>
              <a href="#app-preview" className={`${styles.announce} ${styles.heroIn}`}>
                <span className={styles.announceBadge}>Nouveau</span>
                <span>Demandes de trajet sur mesure</span>
                <ArrowRight size={14} className={styles.arrow} />
              </a>
              <h1 className={`${styles.heroTitle} ${styles.heroIn}`} style={revealDelay(1)} lang="ln">
                Mema nga,
                <br />
                na mema yo,
                <br />
                <em className={styles.serifAccent}>to memana.</em>
              </h1>
              <p className={`${styles.heroTranslation} ${styles.heroIn}`} style={revealDelay(2)}>
                Emmène-moi, je t&apos;emmène, on s&apos;emmène ensemble.
              </p>
              <p className={`${styles.heroSubtitle} ${styles.heroIn}`} style={revealDelay(2)}>
                Le covoiturage pensé pour Kinshasa. Trouvez une place ou proposez la vôtre,
                avec une communauté locale et des outils de sécurité intégrés.
              </p>
              <div className={`${styles.heroActions} ${styles.heroIn}`} style={revealDelay(3)}>
                <button type="button" className={styles.primaryBtn} onClick={handleStartDownload}>
                  Télécharger Zwanga
                  <ArrowRight size={18} className={styles.arrow} />
                </button>
                <a href="#how-it-works" className={styles.ghostBtn}>
                  Voir comment ça marche
                </a>
              </div>
              <ul className={`${styles.heroProof} ${styles.heroIn}`} style={revealDelay(4)}>
                <li>
                  <CheckCircle2 size={16} /> Gratuit
                </li>
                <li>
                  <CheckCircle2 size={16} /> iPhone & Android
                </li>
                <li>
                  <CheckCircle2 size={16} /> Conducteurs vérifiés
                </li>
              </ul>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.phoneMockup}>
                <div className={styles.phoneScreen}>
                  <Image
                    src="/Screenshot_20261022_122600.png"
                    alt="Accueil de l'application Zwanga à Kinshasa"
                    fill
                    className={styles.screenshot}
                    priority
                    sizes="(max-width: 768px) 240px, 300px"
                  />
                </div>
              </div>
              <div className={`${styles.floatCard} ${styles.floatCardA}`} aria-hidden="true">
                <span className={`${styles.floatIcon} ${styles.floatIconGreen}`}>
                  <ShieldCheck size={16} />
                </span>
                <span>
                  <strong>Conducteur vérifié</strong>
                  <small>Identité contrôlée (KYC)</small>
                </span>
              </div>
              <div className={`${styles.floatCard} ${styles.floatCardB}`} aria-hidden="true">
                <span className={styles.floatIcon}>
                  <MapPin size={16} />
                </span>
                <span>
                  <strong>Suivi en direct</strong>
                  <small>Partagez votre trajet</small>
                </span>
              </div>
              <div className={`${styles.floatCard} ${styles.floatCardC}`} aria-hidden="true">
                <span className={`${styles.floatIcon} ${styles.floatIconDark}`}>
                  <Star size={16} />
                </span>
                <span>
                  <strong>Notation mutuelle</strong>
                  <small>Après chaque course</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className={styles.marqueeItem}>
                <span className={styles.marqueeDot} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="benefits" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead} data-reveal>
              <span className={styles.kicker}>Pourquoi Zwanga</span>
              <h2 className={styles.sectionTitle}>
                Une seule app, <em className={styles.serifAccent}>deux façons</em> de rouler.
              </h2>
              <p className={styles.sectionSubtitle}>
                Passager ou conducteur, choisissez votre côté de la route.
              </p>
            </div>

            <div className={styles.segmented} role="tablist" aria-label="Choisir un profil" data-reveal>
              <span
                className={styles.segmentedThumb}
                style={{ transform: persona === "driver" ? "translateX(100%)" : "none" }}
                aria-hidden="true"
              />
              {(Object.keys(personaContent) as Persona[]).map((key) => {
                const Icon = personaContent[key].icon;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={persona === key}
                    className={`${styles.segment} ${persona === key ? styles.segmentActive : ""}`}
                    onClick={() => setPersona(key)}
                  >
                    <Icon size={16} />
                    {personaContent[key].label}
                  </button>
                );
              })}
            </div>

            <div className={styles.benefitGrid} key={`benefits-${persona}`}>
              {activePersona.benefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className={`${styles.benefitCard} ${styles.swapIn}`}
                  style={revealDelay(index)}
                >
                  <span className={styles.benefitIndex}>0{index + 1}</span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={`${styles.container} ${styles.howLayout}`}>
            <div className={styles.howIntro} data-reveal>
              <span className={styles.kicker}>Comment ça marche</span>
              <h2 className={styles.sectionTitle}>
                Quatre étapes.
                <br />
                <em className={styles.serifAccent}>C&apos;est tout.</em>
              </h2>
              <p className={styles.sectionSubtitle}>
                Parcours {activePersona.label.toLowerCase()} : de l&apos;inscription à
                l&apos;arrivée, sans friction.
              </p>
              <div className={styles.inlineSwitch}>
                {(Object.keys(personaContent) as Persona[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.chip} ${persona === key ? styles.chipActive : ""}`}
                    onClick={() => setPersona(key)}
                    aria-pressed={persona === key}
                  >
                    {personaContent[key].label}
                  </button>
                ))}
              </div>
              <a href="#download-apps" className={styles.textLink}>
                {activePersona.cta}
                <ArrowRight size={16} className={styles.arrow} />
              </a>
            </div>

            <ol className={styles.timeline} key={`steps-${persona}`}>
              {activePersona.steps.map((step, index) => (
                <li key={step} className={styles.swapIn} style={revealDelay(index)}>
                  <span className={styles.timelineDot}>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="app-preview" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.previewHead} data-reveal>
              <div>
                <span className={styles.kicker}>Dans l&apos;application</span>
                <h2 className={styles.sectionTitle}>
                  Tout votre trajet, <em className={styles.serifAccent}>au même endroit.</em>
                </h2>
                <p className={styles.sectionSubtitle}>
                  Rechercher, demander, publier et suivre : l&apos;expérience Zwanga telle
                  qu&apos;elle est aujourd&apos;hui.
                </p>
              </div>
              <div className={styles.previewControls}>
                <button
                  type="button"
                  className={styles.roundBtn}
                  onClick={() => scrollPreviews(-1)}
                  aria-label="Captures précédentes"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className={styles.roundBtn}
                  onClick={() => scrollPreviews(1)}
                  aria-label="Captures suivantes"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className={styles.chipRow} data-reveal>
              {previewFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`${styles.chip} ${previewFilter === filter ? styles.chipActive : ""}`}
                  onClick={() => setPreviewFilter(filter)}
                  aria-pressed={previewFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.previewTrack}
            ref={previewTrackRef}
            aria-label="Captures de l'application Zwanga"
          >
            {visiblePreviews.map((shot, index) => (
              <figure
                key={`${previewFilter}-${shot.src}`}
                className={`${styles.previewCard} ${styles.swapIn}`}
                style={revealDelay(Math.min(index, 5))}
              >
                <div className={styles.previewFrame}>
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={1080}
                    height={2340}
                    className={styles.previewImage}
                    sizes="(max-width: 640px) 64vw, 260px"
                  />
                </div>
                <figcaption className={styles.previewMeta}>
                  <span
                    className={`${styles.previewFlowTag} ${
                      shot.flow === "Passager"
                        ? styles.previewFlowPassenger
                        : shot.flow === "Conducteur"
                          ? styles.previewFlowDriver
                          : styles.previewFlowAccount
                    }`}
                  >
                    {shot.flow}
                  </span>
                  <span className={styles.previewStep}>{shot.step}</span>
                  <strong className={styles.previewTitle}>{shot.title}</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="security" className={styles.securitySection}>
          <div className={styles.container}>
            <div className={styles.sectionHead} data-reveal>
              <span className={`${styles.kicker} ${styles.kickerOnDark}`}>Sécurité & confiance</span>
              <h2 className={styles.sectionTitle}>
                La confiance n&apos;est pas une option.
                <br />
                <em className={styles.serifAccent}>C&apos;est le produit.</em>
              </h2>
              <p className={styles.sectionSubtitle}>
                Vérification d&apos;identité, suivi en direct, alertes et contacts d&apos;urgence
                pour un trajet sécurisé.
              </p>
            </div>
            <div className={styles.securityGrid}>
              {securityPoints.map((point, index) => (
                <article
                  key={point.title}
                  className={styles.securityCard}
                  data-reveal
                  style={revealDelay(index)}
                >
                  <span className={styles.securityIcon}>
                    <point.icon size={20} />
                  </span>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className={styles.section}>
          <div className={`${styles.container} ${styles.supportLayout}`}>
            <div data-reveal>
              <span className={styles.kicker}>Signalement & assistance</span>
              <h2 className={styles.sectionTitle}>
                Un souci ? <em className={styles.serifAccent}>On s&apos;en occupe.</em>
              </h2>
              <p className={styles.sectionSubtitle}>
                Passager et conducteur peuvent signaler depuis l&apos;application ou ouvrir un
                ticket support, suivi du premier message jusqu&apos;à la résolution.
              </p>
              <ol className={styles.supportSteps}>
                {supportFlow.map((step, index) => (
                  <li key={step.title}>
                    <span className={styles.supportStepIndex}>{index + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.supportCard} data-reveal style={revealDelay(2)}>
              <span className={styles.supportCardIcon}>
                <LifeBuoy size={22} />
              </span>
              <h3>Demander de l&apos;aide depuis le site</h3>
              <p>
                Posez votre question en quelques secondes. Le ticket est ensuite suivi dans
                l&apos;application Zwanga.
              </p>
              <button type="button" className={styles.primaryBtn} onClick={openSupportCenter}>
                Ouvrir le formulaire d&apos;aide
                <ArrowRight size={18} className={styles.arrow} />
              </button>
              <div className={styles.supportQuickLinks}>
                <a href="#faq">
                  <MessageCircle size={15} /> Voir la FAQ
                </a>
                <a href="#download-apps">
                  <Clock3 size={15} /> Télécharger l&apos;application
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={`${styles.container} ${styles.faqLayout}`}>
            <div className={styles.faqIntro} data-reveal>
              <span className={styles.kicker}>FAQ</span>
              <h2 className={styles.sectionTitle}>
                Questions <em className={styles.serifAccent}>fréquentes.</em>
              </h2>
              <p className={styles.sectionSubtitle}>
                Les réponses claires avant d&apos;installer Zwanga.
              </p>
              <button type="button" className={styles.ghostBtn} onClick={openSupportCenter}>
                Une autre question ?
              </button>
            </div>
            <div className={styles.faqList}>
              {faqItems.map((faq, index) => {
                const isOpen = openFaq === index;
                const answerId = `faq-answer-${index}`;
                return (
                  <article
                    key={faq.question}
                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                    data-reveal
                    style={revealDelay(Math.min(index, 4))}
                  >
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span>{faq.question}</span>
                      <Plus size={18} className={styles.faqIcon} />
                    </button>
                    <div className={styles.faqAnswerWrap} id={answerId} role="region">
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="download-apps" className={styles.download}>
          <div className={styles.container}>
            <div className={styles.downloadShell} data-reveal>
              <div className={styles.downloadText}>
                <span className={`${styles.kicker} ${styles.kickerOnPrimary}`}>
                  Prêt à commencer ?
                </span>
                <h2 className={styles.downloadTitle}>
                  Kinshasa avance.
                  <br />
                  <em className={styles.serifAccent}>Avancez avec Zwanga.</em>
                </h2>
                <p className={styles.downloadSubtitle}>
                  Installez gratuitement l&apos;application et lancez votre prochain trajet.
                </p>
                {renderStoreButtons("dark")}
              </div>
              <div className={styles.downloadVisual}>
                <div className={`${styles.phoneMockup} ${styles.phoneTilt}`}>
                  <div className={styles.phoneScreen}>
                    <Image
                      src="/app-trip-details.png"
                      alt="Détails et réservation d'un trajet Zwanga"
                      fill
                      className={styles.screenshot}
                      sizes="(max-width: 768px) 220px, 280px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {isSupportModalOpen ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeSupportModal();
              }
            }}
          >
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="Fermer le formulaire d'aide"
                onClick={closeSupportModal}
              >
                <X size={18} />
              </button>

              <h3 id="support-modal-title">Demander de l&apos;aide</h3>
              <p>
                Décrivez votre besoin, nous vous guidons rapidement. Le ticket est suivi via
                l&apos;application Zwanga ; sans session, ce bouton ouvre le téléchargement.
              </p>

              <form className={styles.supportForm} onSubmit={handleSupportRequest}>
                <input
                  type="text"
                  ref={supportSubjectInputRef}
                  value={supportSubject}
                  onChange={(event) => setSupportSubject(event.target.value)}
                  placeholder="Sujet de votre demande"
                  aria-label="Sujet de votre demande"
                  maxLength={120}
                  required={isSupportAuthenticated}
                />

                <div className={styles.supportFormRow}>
                  <select
                    value={supportCategory}
                    aria-label="Catégorie"
                    onChange={(event) => setSupportCategory(event.target.value as SupportTicketCategory)}
                  >
                    {supportCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={supportPriority}
                    aria-label="Priorité"
                    onChange={(event) => setSupportPriority(event.target.value as SupportTicketPriority)}
                  >
                    {supportPriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        Priorité {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={supportMessage}
                  onChange={(event) => setSupportMessage(event.target.value)}
                  placeholder="Décrivez votre problème ou votre question"
                  aria-label="Message"
                  rows={4}
                  required={isSupportAuthenticated}
                />

                {supportFeedback ? (
                  <p
                    className={`${styles.supportFeedback} ${
                      supportFeedback.type === "error"
                        ? styles.supportFeedbackError
                        : styles.supportFeedbackInfo
                    }`}
                    role="alert"
                  >
                    {supportFeedback.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmittingSupportTicket}
                >
                  {isSubmittingSupportTicket
                    ? "Envoi en cours..."
                    : isSupportAuthenticated
                      ? "Soumettre ma demande"
                      : "Télécharger l'application"}
                  {isSubmittingSupportTicket ? null : <ArrowRight size={18} className={styles.arrow} />}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {supportSuccessTicketId ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-success-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeSupportSuccessModal();
              }
            }}
          >
            <div className={`${styles.modal} ${styles.successModal}`}>
              <div className={styles.successIconWrap}>
                <CheckCircle2 size={26} />
              </div>
              <h3 id="support-success-title">Demande envoyée avec succès</h3>
              <p>
                Ticket créé : <strong>{supportSuccessTicketId}</strong>
                <br />
                Notre équipe vous répondra dans les plus brefs délais.
              </p>
              <div className={styles.successActions}>
                <button type="button" className={styles.primaryBtn} onClick={closeSupportSuccessModal}>
                  Fermer
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    closeSupportSuccessModal();
                    goToDownloadSection();
                  }}
                >
                  Continuer sur le site
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.logo}>
                <Image src="/zwanga.png" alt="" width={28} height={28} className={styles.logoImage} />
                <span>Zwanga</span>
              </Link>
              <p className={styles.footerSlogan} lang="ln">
                Mema nga, na mema yo, <em className={styles.serifAccent}>to memana.</em>
              </p>
              <p className={styles.footerText}>
                Zwanga est une application de transport de covoiturage Kinshasa pour passager et
                conducteur.
              </p>
              <div className={styles.socialLinks}>
                {[
                  { label: "Facebook", src: "/Facebook-f_Logo-Blue-Logo.wine.png" },
                  { label: "Instagram", src: "/Instagram-Logo.wine.png" },
                  { label: "LinkedIn", src: "/LinkedIn-Icon-Logo.wine.png" },
                  { label: "TikTok", src: "/TikTok-Logo.wine.png" },
                ].map((social) => (
                  <a key={social.label} href="#" aria-label={social.label}>
                    <Image
                      src={social.src}
                      alt=""
                      width={18}
                      height={18}
                      className={styles.socialIcon}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Produit</h4>
              <Link href="#benefits">Avantages</Link>
              <Link href="#how-it-works">Comment ça marche</Link>
              <Link href="#security">Sécurité & confiance</Link>
              <Link href="/enquiry">Zwanga Services</Link>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Légal</h4>
              <Link href="/privacy">Politique de confidentialité</Link>
              <Link href="/terms">Conditions d&apos;utilisation</Link>
              <Link href="/sales-policy">Politique de vente</Link>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Contact</h4>
              <a href="mailto:contact@biso-tech.org">contact@biso-tech.org</a>
              <a href="tel:+243999403012">+243 999 403 012</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} Zwanga. Tous droits réservés.</p>
            <a href="#hero" className={styles.backToTop}>
              Retour en haut ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
