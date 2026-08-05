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
import { Input } from "@/components/ui/input";
import {
  getPreview,
  importLinktreeAction,
  previewLinktreeAction,
  removeSectionAction,
  updateOrderDesktopSection,
  updateOrderMobileSection,
  updateSectionAction,
  updateSectionImageAction,
} from "@/lib/actions/sections/section.actions";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NavLinks from "../NavLinks";
import { LoggedInButton } from "@/features/auth/LoggedInButton";
import {
  Captions,
  CaptionsOff,
  Crop,
  Heart,
  ImageIcon,
  ImageOff,
  Loader2,
  LoaderIcon,
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
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  manageBillingAction,
  subscribeSupporterAction,
  updateSidefolioAction,
} from "@/lib/actions/sidefolio/sidefolio.actions";
import Link from "next/link";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const NO_PREVIEW_IMAGE =
  "https://learning.knowbility.org/local/sitepages/upload/no-preview-available.png";

const safeHostname = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

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
  const [openReview, setOpenReview] = useState(false);
  const compactType = "vertical";
  const [side, setSide] = useState(sidefolio?.sidebar);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    content:
      sidefolio?.name?.replaceAll("\n\n", "<p>") ||
      user.name?.replaceAll("\n\n", "<p>") ||
      "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your name",
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
  });
  const bioEditor = useEditor({
    content: sidefolio?.bio || "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Introduce yourself...",
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
  });
  const DisabledEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: () => true,
      };
    },
  });
  const locationEditor = useEditor({
    content: sidefolio?.location || "",
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your location",
        emptyNodeClass: "bio-is-empty",
      }),
      DisabledEnter,
      CharacterCount.configure({
        limit: 35,
      }),
    ],
    async onUpdate({ editor }) {
      const text = editor.getText();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveSidefolioChanges("location", text);
      }, 3000);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl px-3 focus:outline-none",
      },
    },
  });

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
  const [imgLoading, setImgLoading] = useState<string | null>(null);
  const [profileImageLoading, setProfileImageLoading] =
    useState<boolean>(false);

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
            toast.success("Your changes have been saved");
          }
        } else {
          const res = await updateOrderDesktopSection({
            id: sidefolio.id,
            data: newLayout,
          });
          if (res) {
            setIsSaving(false);
            toast.success("Your changes have been saved");
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

  const handleSideChange = useCallback((prev: any) => {
    setSide(prev);

    updateSidefolioAction({
      id: sidefolio.id,
      data: { sidebar: prev },
    }).then(() => toast.success("Your changes have been saved"));
  }, []);
  const handleUpdateProfileImage = async (file: any) => {
    const res = await uplodadProfileImageAction({
      sidefolio: sidefolio,
      file,
    });
    if (res) {
      setProfileImageLoading(false);
      toast.success("Your changes have been saved");
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
      toast.success("Removed successfully");
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
        toast.success("Your changes have been saved");
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
        toast.success("Your changes have been saved");
      } catch {
      } finally {
        setIsSaving(false);
      }
    },
    [sidefolio]
  );
  const handleChangeImageOptions = async (
    l: any,
    img: boolean,
    url: boolean
  ) => {
    setImgLoading(l?.id);
    const data = {
      showImage: img ? !l?.showImage : l?.showImage,
      showTitleUrl: url ? !l?.showTitleUrl : l?.showTitleUrl,
      sideId: sidefolio.id,
    };
    const res = await updateSectionImageAction({ id: l.id, data: data });
    if (res) {
      setImgLoading(null);
      toast.success("Your changes have been saved");
    }
  };
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
      toast.success("Removed successfully");
    } catch {
    } finally {
      setIsSaving(false);
      router.refresh();
    }
  };
  const handleBecomeSupporter = async () => {
    setIsLoading(true);
    try {
      await subscribeSupporterAction({});
    } catch {
      setIsLoading(false);
    }
  };
  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      await manageBillingAction({});
    } catch {
      setIsLoading(false);
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
      toast.error("Please fill a valid Linktree username or url");
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
      toast.error("Select at least one link to import");
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
        `Imported ${res.data.created} link${
          res.data.created > 1 ? "s" : ""
        } out of ${res.data.total} selected`
      );
      resetImportDialog();
      setOpenImport(false);
      router.refresh();
    } else {
      toast.error("Failed to import the selected links");
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
              Importer depuis Linktree
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Import from Linktree</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  className="flex-[2]"
                  placeholder="linktr.ee/username or just username"
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
                  {isPreviewing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Preview"
                  )}
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
                {isImporting ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                {previewLinks
                  ? `Import ${selectedLinks.size} link${
                      selectedLinks.size > 1 ? "s" : ""
                    }`
                  : "Import links"}
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
            } justify-start gap-4 2xl:px-12 px-4 py-8`}
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
                  characters
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
              className={`z-10 my-5 w-full text-sm flex items-center gap-1 ${
                side === "right" ? "flex-row-reverse" : ""
              }`}
            >
              <div className="rounded-full  ms-2 border bg-white backdrop-blur-sm shadow">
                <Image
                  src={
                    "https://www.svgrepo.com/show/235547/planet-earth-global.svg"
                  }
                  className=""
                  width={25}
                  height={25}
                  alt=""
                />
              </div>
              <EditorContent
                editor={locationEditor}
                max={10}
                maxLength={10}
                spellCheck={false}
              />
            </div>
          </div>
        </BlurFade>
      </div>

      <div className="w-full  pb-20">
        <div className=" fixed z-[9999] flex bottom-5 left-1/2 -translate-x-2/4 rounded-3xl shadow bg-white/85 backdrop-blur-md">
          <div className="mx-auto p-2 border flex w-full items-center rounded-full shadow-lg  justify-between">
            <div className="flex origin-left  items-center gap-2 text-xl">
              {/* <Image src="/icon.svg" width={30} height={30} alt="bentoh.me Logo" />{" "} */}
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
                <Dialog open={openReview} onOpenChange={setOpenReview}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            className="rounded-full"
                          >
                            <Heart
                              size={17}
                              className={
                                user?.plan === "SUPPORTER"
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }
                            />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        {user?.plan === "SUPPORTER"
                          ? "You're a Supporter"
                          : "Become a Supporter"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        Support bentoh.me
                        <Heart className="fill-red-500 text-red-500" size={18} />
                      </DialogTitle>
                      <DialogDescription>
                        {user?.plan === "SUPPORTER"
                          ? "You're a Supporter - thank you for helping keep bentoh.me alive!"
                          : "A small monthly subscription that changes nothing in the app - it's just here to support development."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-2 text-sm text-foreground/70">
                      <p>
                        bentoh.me stays free forever, no feature is ever
                        locked behind this. Becoming a Supporter (€2/month)
                        just gets you a small Supporter badge and early
                        access to potential new features before anyone else
                        - it's mainly a way to say thanks and help cover the
                        costs of running the app.
                      </p>
                    </div>
                    <DialogFooter className="flex !justify-between items-center">
                      {user?.plan === "SUPPORTER" ? (
                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={handleManageBilling}
                        >
                          {isLoading && (
                            <Loader2 size={20} className="mr-2 animate-spin" />
                          )}
                          Manage my subscription
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={handleBecomeSupporter}
                        >
                          {isLoading && (
                            <Loader2 size={20} className="mr-2 animate-spin" />
                          )}
                          Become a Supporter - €2/mo
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                className={`${
                  l?.type === "TITLE"
                    ? "border border-transparent hover:border-gray-300/50 hover:shadow hover:bg-white hover:rounded-3xl transition-all"
                    : "border border-gray-300/50 shadow hover:shadow-md rounded-3xl bg-white"
                } group/item hover:z-50 ${
                  l?.i == isCrop && l?.type === "IMAGE" && "z-50"
                } relative  flex justify-start cursor-grab`}
              >
                {l?.type === "TEXT" ? (
                  <>
                    <div
                      className={
                        "flex  w-full rounded-3xl h-full items-start overflow-hidden"
                      }
                      style={{
                        background: l?.background ? `${l.background}` : "white",
                      }}
                    >
                      <div
                        className={"absolute dragMe top-0 left-0 h-full w-full"}
                      />

                      <Textarea
                        key={i}
                        ref={textAreaRef}
                        onChange={(e) => handleChange(e, l)}
                        name="title"
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        style={{ color: l?.color ? `${l.color}` : "black" }}
                        className={` ${
                          !isFocus ? "dragMe select-none " : "select-text"
                        }  z-10 bg-transparent border-none rounded-3xl hover:bg-slate-300/20 resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
                        defaultValue={l.title}
                        placeholder="Add a new title"
                      />
                    </div>
                    <span
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
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
                        "flex  w-full rounded-[22px] h-full items-start p-0.5"
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
                        placeholder="Add a new title"
                      />
                    </div>
                    <span
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
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
                    <div className="dragMe relative w-full h-full rounded-3xl bg-white cursor-grab">
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
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
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
                    <div className="dragMe relative w-full h-full rounded-3xl bg-white cursor-grab">
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
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
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
                      className={
                        "flex  w-full rounded-3xl h-full items-start p-2"
                      }
                      style={{
                        background: l?.background ? `${l.background}` : "white",
                      }}
                    >
                      <div
                        className={"absolute dragMe top-0 left-0 h-full w-full"}
                      />
                      <Link
                        target="_blank"
                        href={l?.link?.url || "#"}
                        style={{ scrollbarWidth: "none" }}
                        className="z-0 h-full overflow-auto w-full flex gap-2 items-start cursor-pointer break-all justify-center"
                      >
                        <Avatar className="size-10 border shadow-md h-fit object-cover p-1.5">
                          <AvatarFallback>{l.link?.title?.[0]}</AvatarFallback>
                          <AvatarImage
                            src={
                              l?.link.url?.split("/")[2] === "read.cv"
                                ? l.link?.favicons?.[1]?.href
                                : `https://www.google.com/s2/favicons?sz=128&domain=${safeHostname(
                                    l?.link?.url
                                  )}`
                            }
                            className=" object-cover "
                            alt={`${l?.link && l.link.title} picture`}
                          />
                        </Avatar>
                        <div
                          className={`${
                            !l?.showImage && !l?.showTitleUrl
                              ? "hidden"
                              : "flex"
                          } ${
                            imgLoading === l.id && "opacity-30"
                          } flex-col h-full w-full relative  gap-3`}
                        >
                          {imgLoading === l.id && (
                            <Loader2 className=" absolute top-1/2 left-[45%]  animate-spin" />
                          )}
                          {l?.showImage && (
                            <img
                              className=" object-cover w-full h-full rounded-3xl"
                              src={
                                l.link?.["og:image"] ||
                                l.link?.imgTags?.[0]?.src ||
                                NO_PREVIEW_IMAGE
                              }
                              alt=""
                            />
                          )}
                          {l?.showTitleUrl && (
                            <span
                              className=" break-normal"
                              style={{
                                color: l?.color ? `${l.color}` : "black",
                              }}
                            >
                              {l.link?.title}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                    <span
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white border shadow flex rounded-full gap-3 cursor-auto px-2 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 transition-all items-center justify-center">
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              {l?.showImage ? (
                                <ImageIcon
                                  onClick={() =>
                                    handleChangeImageOptions(l, true, false)
                                  }
                                  className="p-1 text-noir cursor-pointer bg-white border  rounded-full"
                                  size={28}
                                />
                              ) : (
                                <ImageOff
                                  onClick={() =>
                                    handleChangeImageOptions(l, true, false)
                                  }
                                  className="p-1 text-noir cursor-pointer bg-white border  rounded-full"
                                  size={28}
                                />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {l?.showImage ? "Hide image" : "Show image"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              {l?.showTitleUrl ? (
                                <Captions
                                  onClick={() =>
                                    handleChangeImageOptions(l, false, true)
                                  }
                                  className="p-1 text-noir cursor-pointer bg-white border  rounded-full"
                                  size={28}
                                />
                              ) : (
                                <CaptionsOff
                                  onClick={() =>
                                    handleChangeImageOptions(l, false, true)
                                  }
                                  className="p-1 text-noir cursor-pointer bg-white border  rounded-full"
                                  size={28}
                                />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {l?.showTitleUrl ? "Hide title" : "Show title"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                      className={`
                      ${!isCrop && "dragMe"}
                        absolute  rounded-3xl  top-0 left-0 h-full w-full

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
                            ) : (
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
                            )}
                          </>
                        )}
                        {l?.showTitleUrl && (
                          <span
                            style={{ color: l?.color ? `${l.color}` : "black" }}
                          >
                            {l.link?.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="absolute group/span opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all hover:bg-gray-50 hover:shadow-md -right-2 p-2 shadow -m-1 bg-white border rounded-full z-20 -top-2 cursor-pointer"
                      onClick={() => onRemoveItem(l.i, l.image)}
                    >
                      <Trash className="text-noir" size={15} />
                    </span>
                    <div className="bg-white flex border rounded-full gap-3 cursor-auto px-1 py-1 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 absolute z-50 left-1/2 -translate-x-2/4 -bottom-4 shadow transition-all items-center justify-center">
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
                      <div className="bg-white border shadow flex rounded-full gap-1 cursor-auto px-1.5 py-1.5 opacity-0 group-focus-visible/item:opacity-100 group-hover/item:opacity-100 transition-all absolute z-50 left-2 -top-6 items-center justify-center">
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
