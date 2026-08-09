"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NextPage } from "next";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Responsive, Layout, Layouts } from "react-grid-layout";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { PageLoader } from "@/components/PageLoader";
import { Input } from "@/components/ui/input";
import { isLightColor } from "@/lib/utils";
import {
  getPreview,
  importLinktreeAction,
  previewLinktreeAction,
  removeSectionAction,
  updateOrderDesktopSection,
  updateOrderMobileSection,
  updateSectionAction,
} from "@/lib/actions/sections/section.actions";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NavLinks from "../NavLinks";
import { LoggedInButton } from "@/features/auth/LoggedInButton";
import {
  Crop,
  ExternalLink,
  Locate,
  MapPin,
  MessageCircleWarning,
  PaintBucket,
  Trash,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

import { revalidatePath } from "next/cache";
import { redirect, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  geocodeSidefolioLocationAction,
  searchLocationsAction,
  setSidefolioLocationAction,
  updateSidefolioAction,
} from "@/lib/actions/sidefolio/sidefolio.actions";
import dynamic from "next/dynamic";
const LocationMap = dynamic(
  () =>
    import("@/features/platform/shared/LocationMap").then(
      (mod) => mod.LocationMap
    ),
  { ssr: false }
);
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import interact from "interactjs";
import BlurFade from "@/components/magicui/blur-fade";
import {
  updateUserAction,
  uplodadProfileImageAction,
} from "@/lib/actions/users/user.actions";
import CharacterCount from "@tiptap/extension-character-count";
import { useSquareRowHeight } from "@/lib/hooks/useSquareRowHeight";
import { YouTubeChannelCard } from "@/features/platform/shared/YouTubeChannelCard";
import { TwitchChannelCard } from "@/features/platform/shared/TwitchChannelCard";
const ResponsiveReactGridLayout = Responsive;

const safeHostname = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

const editableFieldClass = (background?: string) =>
  isLightColor(background)
    ? "bg-black/[0.04] hover:bg-black/[0.07] focus-visible:bg-black/[0.07]"
    : "bg-white/10 hover:bg-white/[0.15] focus-visible:bg-white/[0.15]";

const SIZE_PRESETS: { w: number; h: number }[] = [
  { w: 2, h: 2 },
  { w: 4, h: 1 },
  { w: 4, h: 2 },
  { w: 4, h: 4 },
  { w: 2, h: 4 },
];

const SIZE_ICON_MAX_PX = 12;
const getSizeIconDims = (preset: { w: number; h: number }) => {
  const scale = SIZE_ICON_MAX_PX / Math.max(preset.w, preset.h);
  return {
    width: Math.max(4, Math.round(preset.w * scale)),
    height: Math.max(4, Math.round(preset.h * scale)),
  };
};

interface SectionsProps {
  user: any;
  sections: any;
  desktop: any;
  mobile: any;
  sidefolio: any;
  className?: string;
  rowHeight?: number;
}

const Sections = ({
  sections,
  sidefolio,
  user,
  desktop,
  mobile,
}: SectionsProps) => {
  const t = useTranslations("editor");
  const locale = useLocale();
  const [isCrop, setIsCrop] = useState("");

  const cols = { lg: 8, md: 8, sm: 4, xs: 4, xxs: 4 };
  const gridMargin = 30;
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const {
    ref: gridWrapperRef,
    width: gridWidth,
    rowHeight: rowHeightPx,
  } = useSquareRowHeight(
    cols[currentBreakpoint as keyof typeof cols] ?? 8,
    gridMargin
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);
  const compactType = "vertical";
  const [side, setSide] = useState(sidefolio?.sidebar);
  const [mounted, setMounted] = useState(false);
  const [importURL, setImportURL] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  const [previewLinks, setPreviewLinks] = useState<
    { url: string; title: string }[] | null
  >(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  const [layouts, setLayouts] = useState<Layouts>({
    lg: desktop,
    md: mobile,
    sm: mobile,
    xs: mobile,
    xxs: mobile,
  });

  // `layouts` is only seeded from desktop/mobile once, on mount. A newly
  // created block only exists in fresh desktop/mobile props (after the
  // server action's revalidate). Merging that in via useEffect runs one
  // render too late — react-grid-layout already sees the new item in
  // `sections` on that first render, invents a 1x1 default for it because
  // `layouts` doesn't know about it yet, and can persist that bad default
  // via onLayoutChange before the effect gets a chance to correct it. The
  // merge has to be synchronous (useMemo), not effect-deferred.
  // Only ADD items that are missing — never touch known ones, so we don't
  // clobber an in-progress drag or an unsaved local position.
  const mergeMissingLayoutItems = (base: Layouts): Layouts => {
    const bpSources: Record<string, any[]> = {
      lg: desktop,
      md: mobile,
      sm: mobile,
      xs: mobile,
      xxs: mobile,
    };
    let changed = false;
    const next: any = { ...base };
    for (const bp of Object.keys(bpSources)) {
      const source = bpSources[bp] || [];
      const current = (base as any)[bp] || [];
      const currentIds = new Set(current.map((item: any) => item.i));
      const missing = source.filter((item: any) => !currentIds.has(item.i));
      if (missing.length > 0) {
        changed = true;
        next[bp] = [...current, ...missing];
      }
    }
    return changed ? next : base;
  };

  const effectiveLayouts = useMemo(
    () => mergeMissingLayoutItems(layouts),
    [layouts, desktop, mobile]
  );

  // Once rendering is correct, also settle it into real state so future
  // drags/resizes start from the merged baseline instead of recomputing
  // the merge every render forever.
  useEffect(() => {
    setLayouts((prev) => mergeMissingLayoutItems(prev));
  }, [desktop, mobile]);

  const nameEditor = useEditor({
    immediatelyRender: false,
    content:
      sidefolio?.name?.replaceAll("\n\n", "<p>") ||
      user.name?.replaceAll("\n\n", "<p>") ||
      "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("namePlaceholder"),
      }),
      CharacterCount.configure({
        limit: 40,
      }),
    ],
    async onUpdate({ editor }) {
      const text = editor.getText();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveSidefolioChanges("name", text);
      }, 3000);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-3 focus:outline-none",
      },
    },
  }, [locale]);
  const bioEditor = useEditor({
    immediatelyRender: false,
    content: sidefolio?.bio || "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("bioPlaceholder"),
        emptyNodeClass: `bio-is-empty`,
      }),
      CharacterCount.configure({
        limit: 300,
      }),
    ],
    async onUpdate({ editor }) {
      const text = editor.getHTML();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveSidefolioChanges("bio", text);
      }, 3000);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl px-3 focus:outline-none",
      },
    },
  }, [locale]);
  const DisabledEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: () => true,
      };
    },
  });
  const locationEditor = useEditor({
    immediatelyRender: false,
    content: sidefolio?.location || "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("locationPlaceholder"),
        emptyNodeClass: "bio-is-empty",
      }),
      DisabledEnter,
      CharacterCount.configure({
        limit: 150,
      }),
    ],
    async onUpdate({ editor }) {
      const text = editor.getText();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveSidefolioChanges("location", text);
        setGeocodingLocation(true);
        geocodeSidefolioLocationAction({
          id: sidefolio.id,
          location: text,
        })
          .then((res) => {
            setLocationCoords(res?.data ?? null);
          })
          .finally(() => {
            setGeocodingLocation(false);
          });
      }, 3000);

      if (locationSuggestTimeoutRef.current) {
        clearTimeout(locationSuggestTimeoutRef.current);
      }
      locationSuggestTimeoutRef.current = setTimeout(() => {
        if (text.trim().length < 2) {
          setLocationSuggestions([]);
          return;
        }
        searchLocationsAction({ query: text }).then((res) => {
          setLocationSuggestions(res?.data ?? []);
        });
      }, 350);
    },
    onFocus() {
      setLocationFocused(true);
    },
    onBlur() {
      setTimeout(() => setLocationFocused(false), 150);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl focus:outline-none",
      },
    },
  }, [locale]);

  const handleSelectLocationSuggestion = (suggestion: {
    label: string;
    lat: number;
    lng: number;
  }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (locationSuggestTimeoutRef.current)
      clearTimeout(locationSuggestTimeoutRef.current);

    locationEditor?.commands.setContent(suggestion.label);
    setLocationSuggestions([]);
    setLocationCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setSidefolioLocationAction({
      id: sidefolio.id,
      location: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  };

  const handleDragImage = (l: any) => {
    const position =
      currentBreakpoint === "xs"
        ? { x: l?.imageMobileX || 0, y: l?.imageMobileY || 0 }
        : { x: l?.imageX || 0, y: l?.imageY || 0 };
    interact(".draggable").draggable({
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
        }),
      ],
      inertia: { resistance: 30, minSpeed: 200, endSpeed: 100 },
      listeners: {
        start(event) {},
        move(event) {
          position.x += event.dx;
          position.y += event.dy;

          event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            if (currentBreakpoint === "xs") {
              saveChanges("imageMobileX", position.x, l);
              saveChanges("imageMobileY", position.y, l);
            } else {
              saveChanges("imageX", position.x, l);
              saveChanges("imageY", position.y, l);
            }
          }, 1500);
        },
      },
    });
  };

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileImageLoading, setProfileImageLoading] =
    useState<boolean>(false);
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    sidefolio?.locationLat != null && sidefolio?.locationLng != null
      ? { lat: sidefolio.locationLat, lng: sidefolio.locationLng }
      : null
  );
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    { label: string; lat: number; lng: number }[]
  >([]);
  const [locationFocused, setLocationFocused] = useState(false);
  const locationSuggestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMountedLayout = useRef(false);
  const layoutSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const onLayoutChange = useCallback(
    (newLayout: any, allLayouts: any) => {
      if (!hasMountedLayout.current) {
        hasMountedLayout.current = true;
        setLayouts(allLayouts);
        return;
      }

      setLayouts(allLayouts);

      if (layoutSaveTimeoutRef.current) {
        clearTimeout(layoutSaveTimeoutRef.current);
      }
      layoutSaveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        if (currentBreakpoint === "xs") {
          const res = await updateOrderMobileSection({
            id: sidefolio.id,
            data: newLayout,
          });
          if (res) {
            setIsSaving(false);
          }
        } else {
          const res = await updateOrderDesktopSection({
            id: sidefolio.id,
            data: newLayout,
          });
          if (res) {
            setIsSaving(false);
          }
        }
      }, 400);
    },

    [currentBreakpoint, sidefolio]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFirstLayoutRender = useRef(true);
  useEffect(() => {
    if (isFirstLayoutRender.current) {
      isFirstLayoutRender.current = false;
      return;
    }
    setIsLayoutTransitioning(true);
    const timeout = setTimeout(() => setIsLayoutTransitioning(false), 350);
    return () => clearTimeout(timeout);
  }, [side, currentBreakpoint]);

  // Détecter la taille de l'écran et forcer le breakpoint mobile entre sm et md
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      // Entre sm (640px) et md (768px) - exclus
      if (width >= 768 && width < 1260) {
        setCurrentBreakpoint("lg");
      } else if (width >= 0 && width < 768) {
        setIsMobile(true);
        setCurrentBreakpoint("xs");
      } else {
        setIsMobile(false);
        setCurrentBreakpoint("lg");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleBreakpointChange = useCallback((breakpoint: string) => {
    const width = window.innerWidth;
    // Empêcher le changement manuel si on est entre sm et md
    if (width >= 768 && width < 1260) {
      setCurrentBreakpoint("lg");
    }
    if (width >= 0 && width < 768) {
      setCurrentBreakpoint("xs");
    } else {
      setCurrentBreakpoint(breakpoint);
    }
  }, []);

  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const handleDragStart = useCallback(
    (
      _layout: any,
      _oldItem: any,
      _newItem: any,
      _placeholder: any,
      event: MouseEvent
    ) => {
      dragPosRef.current = { x: event.clientX, y: event.clientY };
    },
    []
  );
  const handleDrag = useCallback(
    (
      _layout: any,
      _oldItem: any,
      _newItem: any,
      _placeholder: any,
      event: MouseEvent,
      element: HTMLElement
    ) => {
      if (!dragPosRef.current) return;
      const dx = event.clientX - dragPosRef.current.x;
      const dy = event.clientY - dragPosRef.current.y;
      dragPosRef.current = { x: event.clientX, y: event.clientY };

      const lift = element.querySelector<HTMLElement>(".block-lift");
      if (!lift) return;

      const tilt = Math.max(-8, Math.min(8, dx * 1.5));
      const shadowX = Math.max(-14, Math.min(14, -dx * 3));
      const shadowY = Math.max(4, Math.min(28, 14 - dy * 3));
      lift.style.transform = `scale(1.04) rotate(${tilt}deg)`;
      lift.style.boxShadow = `${shadowX}px ${shadowY}px 32px -12px rgba(0,0,0,0.35)`;
    },
    []
  );
  const handleDragStop = useCallback(
    (
      _layout: any,
      _oldItem: any,
      _newItem: any,
      _placeholder: any,
      _event: MouseEvent,
      element: HTMLElement
    ) => {
      dragPosRef.current = null;
      const lift = element.querySelector<HTMLElement>(".block-lift");
      if (lift) {
        lift.style.transform = "";
        lift.style.boxShadow = "";
      }
    },
    []
  );

  const handleSideChange = useCallback((prev: any) => {
    setSide(prev);

    updateSidefolioAction({
      id: sidefolio.id,
      data: { sidebar: prev },
    });
  }, []);
  const handleUpdateProfileImage = async (file: any) => {
    const res = await uplodadProfileImageAction({
      sidefolio: sidefolio,
      file,
    });
    if (res) {
      setProfileImageLoading(false);
    }
  };
  const handleDeleteImageSidefolio = async () => {
    setProfileImageLoading(true);
    const res = await uplodadProfileImageAction({
      sidefolio: sidefolio,
      file: "",
      del: true,
    });
    if (res) {
      setProfileImageLoading(false);
      toast.success(t("removedSuccess"));
    }
  };
  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: Layouts) => {
      onLayoutChange(layout, allLayouts);
    },
    [onLayoutChange]
  );
  const handleApplySize = useCallback(
    (sectionI: string, w: number, h: number) => {
      const bp = currentBreakpoint as keyof typeof cols;
      const maxCols = cols[bp] ?? 4;
      const targetW = Math.min(w, maxCols);
      const currentLayout = effectiveLayouts[bp] || [];
      const newLayout = currentLayout.map((item: Layout) => {
        if (item.i !== sectionI) return item;
        const x = Math.min(item.x, Math.max(0, maxCols - targetW));
        return { ...item, w: targetW, h, x };
      });
      const newAllLayouts = { ...effectiveLayouts, [bp]: newLayout };
      onLayoutChange(newLayout, newAllLayouts);
    },
    [layouts, currentBreakpoint, onLayoutChange]
  );
  // Titles always span the full row width, on a single line — no manual resize allowed.
  // h is a plain grid unit (1 row), not a pixel fraction: each page computes
  // its own rowHeight independently, so "1 row" already renders consistently
  // wherever it's shown — no cross-container fraction to keep in sync.
  useEffect(() => {
    const bp = currentBreakpoint as keyof typeof cols;
    const maxCols = cols[bp] ?? 8;
    const titleH = 1;
    const currentLayout = effectiveLayouts[bp] || [];
    let changed = false;
    const sanitized = currentLayout.map((item: Layout) => {
      const section = sections.find((s: any) => s.i === item.i);
      if (
        section?.type === "TITLE" &&
        (item.w !== maxCols ||
          Math.abs(item.h - titleH) > 0.01 ||
          item.x !== 0)
      ) {
        changed = true;
        return { ...item, w: maxCols, h: titleH, x: 0 };
      }
      return item;
    });
    if (changed) {
      onLayoutChange(sanitized, { ...effectiveLayouts, [bp]: sanitized });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBreakpoint, sections, rowHeightPx]);
  const saveSidefolioChanges = useCallback(
    async (name: any, newValue: any) => {
      const formData = { [name]: newValue };

      setIsSaving(true);

      try {
        await updateSidefolioAction({ id: sidefolio.id, data: formData });
      } catch {
      } finally {
        setIsSaving(false);
      }
    },
    [sidefolio]
  );
  const saveChanges = useCallback(
    async (name: any, newValue: any, l: any) => {
      const formData = { sideId: sidefolio.id, [name]: newValue };

      setIsSaving(true);

      try {
        await updateSectionAction({ id: l.id, data: formData });
      } catch {
      } finally {
        setIsSaving(false);
      }
    },
    [sidefolio]
  );
  const handleChange = async (e: React.ChangeEvent<any>, l: any) => {
    e.preventDefault();
    const newValue = e.target.value;
    const name = e.target.name;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveChanges(name, newValue, l);
    }, 3000);
  };
  const handleLinkTitleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    l: any
  ) => {
    const newValue = e.target.value;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveChanges("link", { ...l.link, title: newValue }, l);
    }, 1500);
  };
  const handleTextColorChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    l: any
  ) => {
    e.preventDefault();
    const newValue = e.target.value;
    const name = e.target.name;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveChanges(name, newValue, l);
    }, 100);
  };
  const handleBackgroundColorChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    l: any
  ) => {
    e.preventDefault();
    const newValue = e.target.value;
    const name = e.target.name;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveChanges(name, newValue, l);
    }, 100);
  };
  const onRemoveItem = async (i: string, image?: string) => {
    setIsSaving(true);
    try {
      await removeSectionAction({ i: i, id: sidefolio.id, image });
      toast.success(t("removedSuccess"));
    } catch {
    } finally {
      setIsSaving(false);
      router.refresh();
    }
  };
  const handlePreviewLinktree = async () => {
    setIsPreviewing(true);
    setPreviewLinks(null);

    const res = await previewLinktreeAction({ url: importURL });

    if (res?.data?.error) {
      toast.error(res.data.error);
    } else if (res?.data?.entries) {
      setPreviewLinks(res.data.entries);
      setSelectedLinks(new Set(res.data.entries.map((e: any) => e.url)));
    } else {
      toast.error(t("invalidLinktreeUrl"));
    }
    setIsPreviewing(false);
  };
  const toggleSelectedLink = (linkUrl: string) => {
    setSelectedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(linkUrl)) {
        next.delete(linkUrl);
      } else {
        next.add(linkUrl);
      }
      return next;
    });
  };
  const resetImportDialog = () => {
    setImportURL("");
    setPreviewLinks(null);
    setSelectedLinks(new Set());
  };
  const handleImportLinks = async () => {
    if (!previewLinks) return;
    const links = previewLinks.filter((l) => selectedLinks.has(l.url));
    if (links.length === 0) {
      toast.error(t("selectAtLeastOneLink"));
      return;
    }

    setIsImporting(true);

    const res = await importLinktreeAction({
      sideId: sidefolio.id,
      links,
    });

    if (res?.data?.error) {
      toast.error(res.data.error);
    } else if (res?.data?.created) {
      toast.success(
        t("importedLinks", { count: res.data.created, total: res.data.total })
      );
      resetImportDialog();
      setOpenImport(false);
      router.refresh();
    } else {
      toast.error(t("failedImport"));
    }
    setIsImporting(false);
  };

  let newPer = nameEditor?.storage.characterCount.characters() - 40;

  const percentage = nameEditor
    ? Math.fround(
        ((nameEditor?.storage.characterCount.characters() - 29) / 10) * 1
      )
    : 0;
  return (
    <div
      style={{
        scrollbarWidth: "none",
        transition: "all .25s cubic-bezier(.427,.073,.105,.997) .1s",
        background: sidefolio?.background
          ? `url("${sidefolio.background}") center / cover no-repeat`
          : sidefolio?.color || "white",
      }}
      className={`flex relative animate-fade  ${
        currentBreakpoint === "xs"
          ? "w-96 border-2 h-[800px] px-4 py-14 flex-col border-b-8 !opacity-100  mt-10 overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl"
          : `w-full h-full overflow-auto flex-col  px-4 md:px-4 lg:px-36 xl:px-10  py-14 ${
              sidefolio?.sidebar === "left"
                ? " xl:flex-row"
                : " xl:flex-row-reverse"
            } !opacity-100`
      }  transition-all`}
    >
      <AnimatePresence>
        {isLayoutTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[60]"
            style={{
              background: sidefolio?.background
                ? `url("${sidefolio.background}") center / cover no-repeat`
                : sidefolio?.color || "white",
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(isPreviewing || isImporting) && <PageLoader />}
      </AnimatePresence>
      <div
        className={`fixed ${
          side === "left" ? "left-16" : "right-16"
        }  bottom-[52px] -m-1 hidden z-50 transition-colors xl:flex duration-400 delay-500`}
      >
        <Dialog
          open={openImport}
          onOpenChange={(next) => {
            setOpenImport(next);
            if (!next) resetImportDialog();
          }}
        >
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full px-5 py-3 font-bold shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: "#42e661", color: "#1e2330" }}
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                width={18}
                height={18}
                fill="#1e2330"
              >
                <path d="m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11666l2.3248-2.3808 4.00468 4.11665V0h3.4727zm-3.4727 10.30614h3.4727V24h-3.4727z" />
              </svg>
              {t("importFromLinktree")}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("importFromLinktree")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  className="flex-[2]"
                  placeholder={t("linktreeUrlPlaceholder")}
                  value={importURL}
                  disabled={isPreviewing}
                  onChange={(e) => {
                    setImportURL(e.target.value);
                    setPreviewLinks(null);
                  }}
                />
                <Button
                  variant={"outline"}
                  disabled={importURL.trim().length === 0 || isPreviewing}
                  onClick={handlePreviewLinktree}
                >
                  {t("preview")}
                </Button>
              </div>

              {previewLinks && (
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto border rounded-md p-2">
                  {previewLinks.map((link) => (
                    <label
                      key={link.url}
                      className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedLinks.has(link.url)}
                        onCheckedChange={() => toggleSelectedLink(link.url)}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                          {link.title || link.url}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {link.url}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className=" flex-1"
                size={"icon"}
                disabled={
                  !previewLinks ||
                  selectedLinks.size === 0 ||
                  isSaving ||
                  isImporting
                }
                onClick={handleImportLinks}
              >
                {previewLinks
                  ? t("importLinksCta", { count: selectedLinks.size })
                  : t("importLinksDefault")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className={` relative  ${
          currentBreakpoint === "xs"
            ? "w-full max-h-[calc(100vh-100px)]"
            : "top-[0rem] max-w-full min-w-[calc(100vw-1000px)] min-h-fit  max-h-[calc(100vh+50px)] xl:min-h-[calc(100vh-150px)] xl:sticky overflow-y-auto"
        } `}
        style={{ scrollbarWidth: "none" }}
      >
        <BlurFade key={`${side}-${currentBreakpoint}`} inView>
          <div
            className={`flex flex-col  w-full rounded-3xl h-full  ${
              side === "right" ? "items-end" : "items-start"
            } justify-start gap-4 py-8 ${
              currentBreakpoint === "xs" ? "px-0" : "2xl:px-12 px-4"
            }`}
            style={{
              scrollbarWidth: "none",
            }}
          >
            <div className="group/avatar rounded-full relative shadow-lg">
              <Avatar
                className={`${
                  currentBreakpoint === "xs"
                    ? "size-28"
                    : "2xl:size-52 md:size-40"
                }  cursor-pointer `}
              >
                {profileImageLoading ? (
                  <AvatarImage
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
                    className=" object-cover"
                  />
                ) : sidefolio?.image ? (
                  <AvatarImage
                    src={sidefolio.image}
                    className=" object-cover"
                    alt={`${sidefolio.name ?? "-"}'s profile picture`}
                    onClick={() => {
                      profileImageRef.current?.click();
                    }}
                  />
                ) : (
                  <AvatarImage
                    src={"/noAvatar.png"}
                    draggable={false}
                    className=" object-cover select-none "
                    onClick={() => {
                      profileImageRef.current?.click();
                    }}
                  />
                )}
              </Avatar>

              <span
                className="absolute  opacity-0 invisible group-focus-visible/avatar:opacity-100 group-focus-visible/avatar:visible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all hover:bg-gray-50 hover:shadow-md border left-3 bottom-0 p-2 shadow  bg-white rounded-full z-20  cursor-pointer"
                onClick={() => {
                  profileImageRef.current?.click();
                }}
              >
                <Upload className="text-noir" size={17} />
              </span>
              <Input
                className=" w-full hidden"
                type="file"
                name="file"
                hidden
                ref={profileImageRef}
                onChangeCapture={async (event) => {
                  event.preventDefault();
                  setProfileImageLoading(true);
                  if (!profileImageRef.current?.files) {
                    throw new Error("No file selected");
                  }

                  const file = profileImageRef.current.files[0];
                  const formData = new FormData();
                  formData.append("file", file);
                  handleUpdateProfileImage(formData);

                  /*  */
                }}
              />
              <span
                className="absolute  opacity-0 invisible group-focus-visible/avatar:opacity-100 group-focus-visible/avatar:visible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all hover:bg-gray-50 hover:shadow-md border right-3 bottom-0 p-2 shadow  bg-white rounded-full z-20  cursor-pointer"
                onClick={handleDeleteImageSidefolio}
              >
                <Trash className="text-noir" size={17} />
              </span>
            </div>
            <div
              className={`w-full transition-all font-bold ${
                side === "right" ? "text-right" : "text-left"
              } ${
                currentBreakpoint === "xs"
                  ? "text-3xl"
                  : "2xl:text-5xl md:text-4xl"
              } `}
            >
              <EditorContent spellCheck={false} editor={nameEditor} />
              {nameEditor?.storage.characterCount.characters() >= 30 && (
                <div
                  className={`text-xs font-extrabold text-gray-500 ${
                    side === "right" ? "text-end" : "text-start"
                  } px-3`}
                  style={{ opacity: percentage }}
                >
                  {nameEditor?.storage.characterCount.characters()} / {40}{" "}
                  {t("characters")}
                </div>
              )}
            </div>

            <div
              className={`w-full transition-all  ${
                side === "right" ? "text-right" : "text-left"
              } ${
                currentBreakpoint === "xs"
                  ? "text-base"
                  : " lg:text-lg md:text-base"
              } `}
            >
              <EditorContent editor={bioEditor} spellCheck={false} />
            </div>
            <div
              className={`z-10 my-5 w-full text-sm flex flex-col gap-2 ${
                side === "right" ? "items-end" : "items-start"
              }`}
            >
              {(locationCoords || geocodingLocation) && (
                <LocationMap
                  lat={locationCoords?.lat}
                  lng={locationCoords?.lng}
                  loading={geocodingLocation}
                  className={
                    currentBreakpoint === "xs"
                      ? "w-full aspect-[2/1]"
                      : "w-72 aspect-[2/1]"
                  }
                />
              )}
              <div className="relative w-full">
                <div
                  className={`flex items-center gap-1 ${
                    side === "right" ? "flex-row-reverse" : ""
                  }`}
                >
                  <MapPin size={16} className="text-primary shrink-0" />
                  <EditorContent
                    editor={locationEditor}
                    max={10}
                    maxLength={10}
                    spellCheck={false}
                  />
                </div>
                {locationFocused && locationSuggestions.length > 0 && (
                  <div
                    className={`absolute z-50 top-full mt-1 w-64 max-w-[80vw] bg-white border rounded-xl shadow-lg overflow-hidden py-1 ${
                      side === "right" ? "right-0" : "left-0"
                    }`}
                  >
                    {locationSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectLocationSuggestion(s)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 truncate"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>

      <div className="w-full  pb-20">
        <div className=" fixed z-[9999] flex bottom-5 left-1/2 -translate-x-2/4 rounded-3xl shadow bg-white/85 backdrop-blur-md">
          <div className="mx-auto p-2 border flex w-full items-center rounded-full shadow-lg  justify-between">
            <div className="flex origin-left  items-center gap-2 text-xl">
              {/* <Image src="/icon.svg" width={30} height={30} alt="boxed.ink Logo" />{" "} */}
              <NavLinks
                currentBreakpoint={currentBreakpoint}
                setCurrentBreakpoint={handleBreakpointChange}
                sidefolio={sidefolio}
                isSaving={isSaving}
                handleSideChange={handleSideChange}
                sections={sections}
                user={user}
                isMobile={isMobile}
              />
              <div className=" items-center gap-2 flex">
                <LoggedInButton user={user} sidefolio={sidefolio} />
              </div>
            </div>
          </div>
        </div>
        <BlurFade
          key={currentBreakpoint}
          inView
          delay={0.4}
          className="pb-20"
        >
          <div
            className={`fixed backdrop-blur-md transition-all opacity-0 bg-black/0 h-full ${
              isCrop && "!w-full !bg-white/50 !opacity-100 z-10"
            }  top-0 left-0`}
          ></div>
          <div ref={gridWrapperRef}>
          <ResponsiveReactGridLayout
            draggableHandle=".dragMe"
            layouts={effectiveLayouts}
            width={gridWidth}
            onBreakpointChange={handleBreakpointChange}
            onLayoutChange={handleLayoutChange}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            useCSSTransforms={mounted}
            compactType={compactType}
            breakpoint={currentBreakpoint}
            cols={cols}
            margin={[gridMargin, gridMargin]}
            containerPadding={[0, 0]}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            preventCollision={!compactType}
            isResizable={false}
            rowHeight={rowHeightPx}
          >
            {sections.map((l: any, i: any) => (
              <div
                id={l.id}
                key={l.i}
                className={`group/item hover:z-50 ${
                  l?.i == isCrop && l?.type === "IMAGE" && "z-50"
                } relative  flex justify-start cursor-grab`}
              >
                {l?.type === "TEXT" ? (
                  <>
                    <div
                      className={
                        "block-lift flex  w-full rounded-3xl h-full items-start overflow-hidden border border-gray-300/50 shadow hover:shadow-md"
                      }
                      style={{
                        background: l?.background ? `${l.background}` : "white",
                      }}
                    >
                      {(() => {
                        const isEditingThis = editingTextId === l.i;
                        return (
                          <>
                            <Textarea
                              key={i}
                              ref={textAreaRef}
                              onChange={(e) => handleChange(e, l)}
                              name="title"
                              onMouseDown={(e) => {
                                if (!isEditingThis) e.preventDefault();
                              }}
                              onDoubleClick={(e) => {
                                setEditingTextId(l.i);
                                (e.currentTarget as HTMLTextAreaElement).focus();
                              }}
                              onBlur={() => setEditingTextId(null)}
                              style={{ color: l?.color ? `${l.color}` : "black" }}
                              className={`${
                                isEditingThis
                                  ? "select-text cursor-text"
                                  : "dragMe select-none cursor-grab"
                              }  z-10 bg-transparent border-none rounded-3xl hover:bg-slate-300/20 resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
                              defaultValue={l.title}
                              placeholder={t("addNewTitlePlaceholder")}
                            />
                            {!isEditingThis && (
                              <span className="block-action absolute bottom-2 right-3 z-20 text-[10px] text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none select-none">
                                {isTouchDevice
                                  ? t("doubleTapToEdit")
                                  : t("doubleClickToEdit")}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
                      <div className="flex items-center gap-1">
                        <Type className="text-noir" size={15} />
                        <Input
                          name="color"
                          type="color"
                          defaultValue={l?.color}
                          onChange={(e) => handleTextColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <PaintBucket className="text-noir" size={15} />
                        <Input
                          name="background"
                          type="color"
                          defaultValue={l?.background || "#FFFFFF"}
                          onChange={(e) => handleBackgroundColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                    </div>
                  </>
                ) : l?.type === "TITLE" ? (
                  <>
                    <div
                      className={
                        "block-lift flex  w-full rounded-[22px] h-full items-start p-0.5 border border-transparent hover:border-gray-300/50 hover:shadow hover:bg-white transition-all"
                      }
                    >
                      <div
                        className={"absolute dragMe top-0 left-0 h-full w-full"}
                      />

                      <Input
                        key={i}
                        ref={textInputRef}
                        onChange={(e) => handleChange(e, l)}
                        name="title"
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        style={{ color: l?.color ? `${l.color}` : "black" }}
                        className={` ${
                          !isFocus ? "dragMe select-none " : "select-text"
                        } ${
                          currentBreakpoint === "xs"
                            ? "text-lg"
                            : "text-sm lg:text-3xl"
                        }  z-10 bg-transparent border-none text-left font-bold break-words hover:bg-slate-300/20 resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-0.5`}
                        defaultValue={l.title}
                        placeholder={t("addNewTitlePlaceholder")}
                      />
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
                      <div className="flex items-center gap-1">
                        <Type className="text-noir" size={15} />
                        <Input
                          name="color"
                          type="color"
                          defaultValue={l?.color}
                          onChange={(e) => handleTextColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                    </div>
                  </>
                ) : l?.type === "LINK" && l?.link?.youtube ? (
                  <>
                    <div className="block-lift dragMe relative w-full h-full rounded-3xl bg-white cursor-grab border border-gray-300/50 shadow hover:shadow-md">
                      {(() => {
                        const bp = currentBreakpoint as keyof typeof cols;
                        const currentItem = (effectiveLayouts[bp] || []).find(
                          (item: Layout) => item.i === l.i
                        );
                        return (
                          <YouTubeChannelCard
                            youtube={l.link.youtube}
                            color={l?.color}
                            w={currentItem?.w ?? 2}
                            h={currentItem?.h ?? 2}
                          />
                        );
                      })()}
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
                      <div className="flex items-center gap-1">
                        <Type className="text-noir" size={15} />
                        <Input
                          name="color"
                          type="color"
                          defaultValue={l?.color}
                          onChange={(e) => handleTextColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                    </div>
                  </>
                ) : l?.type === "LINK" && l?.link?.twitch ? (
                  <>
                    <div className="block-lift dragMe relative w-full h-full rounded-3xl bg-white cursor-grab border border-gray-300/50 shadow hover:shadow-md">
                      {(() => {
                        const bp = currentBreakpoint as keyof typeof cols;
                        const currentItem = (effectiveLayouts[bp] || []).find(
                          (item: Layout) => item.i === l.i
                        );
                        return (
                          <TwitchChannelCard
                            twitch={l.link.twitch}
                            color={l?.color}
                            w={currentItem?.w ?? 2}
                            h={currentItem?.h ?? 2}
                          />
                        );
                      })()}
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
                      <div className="flex items-center gap-1">
                        <Type className="text-noir" size={15} />
                        <Input
                          name="color"
                          type="color"
                          defaultValue={l?.color}
                          onChange={(e) => handleTextColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                    </div>
                  </>
                ) : l?.type === "LINK" ? (
                  <>
                    <div
                      className="block-lift dragMe relative w-full h-full rounded-3xl cursor-grab overflow-hidden flex flex-col gap-1.5 p-3 border border-gray-300/50 shadow hover:shadow-md"
                      style={{
                        background: l?.background ? `${l.background}` : "white",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 w-full shrink-0">
                        <Avatar className="size-9 border shadow-md shrink-0 object-cover p-1.5">
                          <AvatarFallback>{l.link?.title?.[0]}</AvatarFallback>
                          <AvatarImage
                            src={
                              l?.link.url?.split("/")[2] === "read.cv"
                                ? l.link?.favicons?.[1]?.href
                                : `https://www.google.com/s2/favicons?sz=128&domain=${safeHostname(
                                    l?.link?.url
                                  )}`
                            }
                            draggable={false}
                            className="object-cover select-none"
                            alt={`${l?.link && l.link.title} picture`}
                          />
                        </Avatar>
                        <a
                          href={l?.link?.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-gray-400 hover:text-noir transition-colors"
                          title={t("opensInNewTab")}
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                      {(() => {
                        const bp = currentBreakpoint as keyof typeof cols;
                        const currentItem = (effectiveLayouts[bp] || []).find(
                          (item: Layout) => item.i === l.i
                        );
                        const isRow =
                          (currentItem?.w ?? 2) === 4 &&
                          (currentItem?.h ?? 2) === 1;

                        if (isRow) {
                          return (
                            <Input
                              name="linkTitle"
                              onChange={(e) => handleLinkTitleChange(e, l)}
                              style={{
                                color: l?.color ? `${l.color}` : "black",
                              }}
                              className={`shrink-0 min-h-0 h-auto overflow-hidden border-none px-1.5 py-0.5 rounded-md truncate text-sm font-bold focus-visible:ring-0 shadow-none transition-colors ${editableFieldClass(
                                l?.background
                              )}`}
                              defaultValue={l.link?.title}
                              placeholder={t("addTitlePlaceholder")}
                            />
                          );
                        }

                        return (
                          <>
                            <Textarea
                              name="linkTitle"
                              ref={(el) => {
                                if (el) {
                                  el.style.height = "auto";
                                  el.style.height = `${el.scrollHeight}px`;
                                }
                              }}
                              onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                              }}
                              onChange={(e) => handleLinkTitleChange(e, l)}
                              style={{
                                color: l?.color ? `${l.color}` : "black",
                              }}
                              className={`shrink-0 min-h-0 overflow-hidden border-none px-1.5 py-0.5 rounded-md resize-none break-words text-sm font-bold focus-visible:ring-0 shadow-none transition-colors ${editableFieldClass(
                                l?.background
                              )}`}
                              defaultValue={l.link?.title}
                              placeholder={t("addTitlePlaceholder")}
                            />
                            <span className="text-xs text-gray-400 break-all">
                              {l.link?.url}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
                      <div className="flex items-center gap-1">
                        <Type className="text-noir" size={15} />
                        <Input
                          name="color"
                          type="color"
                          defaultValue={l?.color}
                          onChange={(e) => handleTextColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <PaintBucket className="text-noir" size={15} />
                        <Input
                          name="background"
                          type="color"
                          defaultValue={l?.background || "#FFFFFF"}
                          onChange={(e) => handleBackgroundColorChange(e, l)}
                          className="w-6 h-6 p-0 border-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`block-lift
                      ${!isCrop && "dragMe"}
                        absolute  rounded-3xl  top-0 left-0 h-full w-full
                        bg-white border border-gray-300/50 shadow hover:shadow-md

                    `}
                    >
                      <div
                        className={
                          "absolute dragMe  top-0 left-0 h-full w-full"
                        }
                      />
                      <div
                        style={{
                          scrollbarWidth: "none",
                          clipPath:
                            isCrop !== l?.i ? "inset(0px round 24px)" : "",
                        }}
                        className={` h-full w-full`}
                      >
                        {l?.imageUrl && (
                          <>
                            {isCrop === l?.i ? (
                              <div
                                className="relative  flex rounded-3xl shadow-2xl w-full h-full "
                                style={{ filter: "opacity(0.9)" }}
                              >
                                <img
                                  onMouseEnter={() => {
                                    handleDragImage(l);
                                  }}
                                  className="absolute touch-none   !select-none pointer-events-auto draggable max-w-max !cursor-move min-w-full min-h-full   rounded-3xl"
                                  src={l.imageUrl}
                                  style={{
                                    transform: `translate(${
                                      currentBreakpoint === "xs"
                                        ? `${l?.imageMobileX}px, ${l?.imageMobileY}px`
                                        : `${l?.imageX}px, ${l?.imageY}px`
                                    })`,
                                    filter: "inherit",
                                    maxWidth: "unset",
                                    maxHeight: "unset",
                                  }}
                                  alt=""
                                />
                              </div>
                            ) : l?.imageX ||
                              l?.imageY ||
                              l?.imageMobileX ||
                              l?.imageMobileY ? (
                              <img
                                draggable="false"
                                className="absolute overflow-clip  min-w-full min-h-full  rounded-3xl"
                                style={{
                                  transform: `translate(${
                                    currentBreakpoint === "xs"
                                      ? `${l?.imageMobileX}px, ${l?.imageMobileY}px`
                                      : `${l?.imageX}px, ${l?.imageY}px`
                                  })`,
                                  maxWidth: "unset",
                                  maxHeight: "unset",
                                }}
                                src={l.imageUrl}
                                alt=""
                              />
                            ) : (
                              <img
                                draggable="false"
                                className="absolute inset-0 w-full h-full object-cover object-center rounded-3xl"
                                src={l.imageUrl}
                                alt=""
                              />
                            )}
                          </>
                        )}
                        {l.link?.title && (
                          <span
                            style={{ color: l?.color ? `${l.color}` : "black" }}
                          >
                            {l.link?.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="block-action absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="block-action bg-white flex border rounded-full gap-3 cursor-auto px-1 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 shadow transition-all items-center justify-center">
                      <div className="flex items-center ">
                        <Crop
                          onClick={() =>
                            isCrop === "" ? setIsCrop(l?.i) : setIsCrop("")
                          }
                          className={`p-1  cursor-pointer  ${
                            isCrop
                              ? "bg-foreground text-white"
                              : "text-noirbg-white"
                          }  transition-all border  rounded-full`}
                          size={28}
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </>
                )}
                {l?.type !== "TITLE" &&
                  (() => {
                    const bp = currentBreakpoint as keyof typeof cols;
                    const maxCols = cols[bp] ?? 8;
                    const currentItem = (effectiveLayouts[bp] || []).find(
                      (item: Layout) => item.i === l.i
                    );
                    return (
                      <div className="block-action bg-white border shadow flex rounded-full gap-1 cursor-auto px-1.5 py-1.5 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all absolute z-50 left-2 -top-6 items-center justify-center">
                        {SIZE_PRESETS.map((preset) => {
                          const targetW = Math.min(preset.w, maxCols);
                          const isActive =
                            !!currentItem &&
                            currentItem.w === targetW &&
                            currentItem.h === preset.h;
                          const iconDims = getSizeIconDims(preset);
                          return (
                            <button
                              key={`${preset.w}x${preset.h}`}
                              type="button"
                              title={`${preset.h}×${preset.w}`}
                              disabled={isActive}
                              onClick={() =>
                                handleApplySize(l.i, preset.w, preset.h)
                              }
                              className={`size-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isActive
                                  ? "bg-primary text-white cursor-default"
                                  : "hover:bg-gray-100 text-noir/70"
                              }`}
                            >
                              <span
                                className="block border-1.5 border-current rounded-[2px]"
                                style={{
                                  width: iconDims.width,
                                  height: iconDims.height,
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
              </div>
            ))}
          </ResponsiveReactGridLayout>
          </div>
        </BlurFade>
      </div>
    </div>
  );
};

export default Sections;
