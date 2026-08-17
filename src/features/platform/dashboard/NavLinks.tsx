"use client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  createSectionAction,
  getPreview,
  uploadImageSection,
} from "@/lib/actions/sections/section.actions";
import { cn } from "@/lib/utils";
import {
  SocialConnectDialog,
  type SocialPlatformKey,
} from "@/features/platform/shared/SocialConnectPrompt";
import {
  Check,
  Contact,
  Image as Image2,
  Loader2,
  LoaderCircle,
  Monitor,
  Plus,
  Share2,
  Smartphone,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  publishSidefolioAction,
  updateSidefolioAction,
  uploadImageSidefolio,
} from "../../../lib/actions/sidefolio/sidefolio.actions";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { del } from "@vercel/blob";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FlagLanguageSwitcher } from "@/components/FlagLanguageSwitcher";
import { LinkCatalog } from "./LinkCatalog";

const MAX_BLOCK_IMAGE_MB = 2;
const MAX_BLOCK_IMAGE_BYTES = MAX_BLOCK_IMAGE_MB * 1024 * 1024;
const MAX_BACKGROUND_IMAGE_MB = 2;
const MAX_BACKGROUND_IMAGE_BYTES = MAX_BACKGROUND_IMAGE_MB * 1024 * 1024;

// The character classes exclude ":" and "/" so a url can't be mistaken for an
// address: "https://www.tiktok.com/@alexandre.g258" otherwise matched, with
// everything before the "@" read as the local part.
const isEmail = (value: string) =>
  /^[^\s@:/]+@[^\s@:/]+\.[^\s@:/]+$/.test(value);
const isMailtoOrEmail = (value: string) =>
  /^mailto:/i.test(value) || isEmail(value);
// Loose match for a typed phone number: digits with optional +, spaces,
// dashes, dots or parens, at least 6 digits so it doesn't catch stray short
// numbers.
const isPhone = (value: string) =>
  /^\+?[\d\s().-]{6,}$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 6;
const isTelOrPhone = (value: string) => /^tel:/i.test(value) || isPhone(value);

// Static mock-ups of what each block looks like once dropped on the page, so
// the picker is readable at a glance instead of relying on a hover tooltip.
const TitlePreview = () => (
  <span className="flex w-full flex-col gap-1.5 px-4">
    <span className="h-2.5 w-4/5 rounded-full bg-noir/75" />
    <span className="h-1.5 w-2/5 rounded-full bg-noir/20" />
  </span>
);

const TextPreview = () => (
  <span className="flex w-full flex-col gap-1 px-4">
    <span className="h-1.5 w-full rounded-full bg-noir/25" />
    <span className="h-1.5 w-full rounded-full bg-noir/25" />
    <span className="h-1.5 w-3/5 rounded-full bg-noir/25" />
  </span>
);

const ImagePreview = () => (
  <span className="relative h-11 w-16 overflow-hidden rounded-md border border-sky-200 bg-gradient-to-b from-sky-100 to-sky-50">
    <span className="absolute right-2 top-1.5 size-2.5 rounded-full bg-amber-300" />
    <span className="absolute -bottom-2 left-1 size-7 rotate-45 rounded bg-emerald-300" />
    <span className="absolute -bottom-3 right-1 size-8 rotate-45 rounded bg-emerald-400" />
  </span>
);

// Mirrors the real link block: logo and title on the left, visual on the right.
const LinkPreview = () => (
  <span className="flex h-11 w-[4.5rem] items-center gap-1.5 rounded-md border border-gray-200 bg-white p-1.5 shadow-sm">
    <span className="flex flex-1 flex-col gap-1">
      <span className="size-3 rounded bg-noir/70" />
      <span className="h-1 w-full rounded-full bg-noir/25" />
    </span>
    <span className="h-full w-5 shrink-0 rounded bg-gray-200" />
  </span>
);

const BlockTile = ({
  preview,
  label,
  description,
  onClick,
  disabled,
  loading,
  dropProps,
  isDropTarget,
}: {
  preview: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  dropProps?: React.DOMAttributes<HTMLButtonElement>;
  isDropTarget?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    {...dropProps}
    className={cn(
      // No inner frame: the preview area bleeds to the top and side edges and
      // the tile's own overflow-hidden rounds it, so there's a single radius.
      "flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-colors hover:border-primary/50 disabled:pointer-events-none disabled:opacity-50",
      isDropTarget ? "border-primary" : "border-gray-200"
    )}
  >
    <span
      className={cn(
        "relative flex h-16 w-full items-center justify-center",
        isDropTarget ? "bg-primary/10" : "bg-gray-50"
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin text-noir/50" size={18} />
      ) : (
        preview
      )}
    </span>
    <span className="block p-2">
      <span className="block text-sm font-bold leading-tight">{label}</span>
      <span className="mt-0.5 block text-xs leading-snug text-noir/55">
        {description}
      </span>
    </span>
  </button>
);

const NavLinks = ({
  currentBreakpoint,
  setCurrentBreakpoint,
  sidefolio,
  isSaving,
  handleSideChange,
  sections,
  user,
  isMobile,
}: any) => {
  const router = useRouter();
  const t = useTranslations("editor");
  const [url, setURL] = useState("");
  const [openLink, setOpenLink] = useState(false);
  const [connectDialogPlatform, setConnectDialogPlatform] =
    useState<SocialPlatformKey | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  // Mirrors the picker so the swatch updates while dragging the colour wheel.
  const [bgColor, setBgColor] = useState<string>(sidefolio?.color || "#ffffff");
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageSideLoading, setImageSideLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublish, setIsPublish] = useState<boolean>(false);
  const [isSavingC, setIsSavingC] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState(false);
  const wasSavingRef = useRef(false);

  useEffect(() => {
    const wasSaving = wasSavingRef.current;
    wasSavingRef.current = isSaving;
    if (wasSaving && !isSaving) {
      setJustSaved(true);
      const timeout = setTimeout(() => setJustSaved(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isSaving]);
  function makeid(length: number) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const handleCreateSection = (title: string, type: any) => {
    createSectionAction({
      title,
      slug: "",
      type: type,
      description: "Add a new description",
      sideId: sidefolio.id,
      i: `n${makeid(40)}`,
    }).then(() => {
      startTransition(() => {
        router.refresh();
      });
    });
  };
  const handleUploadImage = async (file: any) => {
    try {
      const res = await uploadImageSection({
        file,
        data: {
          title: "New image bloc",
          slug: "",
          type: "IMAGE",
          description: "Add a new description",
          sideId: sidefolio.id,
          i: `n${makeid(40)}`,
        },
      });
      if (res) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      toast.error(t("uploadImageFailed"));
    } finally {
      setImageLoading(false);
    }
  };
  const handleUploadImageSidefolio = async (file: any) => {
    try {
      await uploadImageSidefolio({
        id: sidefolio.id,
        file,
      });
    } catch {
      toast.error(t("uploadImageFailed"));
    } finally {
      setImageSideLoading(false);
    }
  };
  // Shared by the file picker and the drop zone so both validate identically.
  const uploadBackgroundFile = (file: File) => {
    if (
      !file.type.startsWith("image/") ||
      file.size > MAX_BACKGROUND_IMAGE_BYTES
    ) {
      toast.error(t("uploadImageFailed", { maxMB: MAX_BACKGROUND_IMAGE_MB }));
      return;
    }
    setImageSideLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    handleUploadImageSidefolio(formData);
  };
  const backgroundDropProps = {
    onDragOver: (e: React.DragEvent) => {
      if (!Array.from(e.dataTransfer.types).includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDraggingBackground(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      // Ignore the leave events fired when moving between child elements.
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setIsDraggingBackground(false);
    },
    onDrop: (e: React.DragEvent) => {
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingBackground(false);
      uploadBackgroundFile(file);
    },
  };
  const handleShare = async () => {
    let justPublished = false;
    if (!sidefolio.publish) {
      setIsPublish(true);
      const res = await publishSidefolioAction({
        id: sidefolio.id,
        data: user,
      });
      setIsPublish(false);
      if (!res.data) return;
      justPublished = true;
    }
    const url = `${window.location.origin}/${sidefolio.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(
        justPublished ? t("publishedAndCopied") : t("linkCopied")
      );
      const rect = shareButtonRef.current?.getBoundingClientRect();
      const origin = rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: rect.top / window.innerHeight,
          }
        : { y: 0.6 };
      confetti({
        particleCount: 150,
        spread: 100,
        origin,
      });
    } catch {
      toast.error(t("copyFailed"));
    }
  };
  const handleCreateLink = async () => {
    setIsLoading(true);
    let newUrl;
    if (/^mailto:/i.test(url) || /^tel:/i.test(url)) {
      newUrl = url;
    } else if (isEmail(url)) {
      newUrl = `mailto:${url}`;
    } else if (isPhone(url)) {
      newUrl = `tel:${url.replace(/[\s().-]/g, "")}`;
    } else if (url.includes("https://")) {
      newUrl = url;
    } else {
      newUrl = "https://" + url;
    }
    const res = await getPreview({
      title: newUrl,
      description: "Add a new description",
      sideId: sidefolio.id,
      type: "LINK",
      i: `n${makeid(40)}`,
    });
    if (res.data?.error) {
      toast.error(t("invalidUrl"));
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setOpenLink(false);
      setURL("");
      startTransition(() => {
        router.refresh();
      });
      // Adding an Instagram/TikTok profile is the natural moment to offer
      // the connection — declining just leaves an ordinary link block.
      // Opened only once the add-link dialog has finished closing: two Radix
      // dialogs overlapping fight over focus and the scroll lock, which
      // showed up as the first one flashing back open.
      const platform = (res.data as any)?.socialProfile?.platform;
      if (platform === "instagram" || platform === "tiktok") {
        setTimeout(() => setConnectDialogPlatform(platform), 250);
      }
    }
  };
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const inputFileSideRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveChanges = useCallback(
    async (name: any, newValue: any, image?: string) => {
      const formData = { [name]: newValue };

      setIsSavingC(true);

      try {
        await updateSidefolioAction({
          id: sidefolio.id,
          data: formData,
          image,
        });
      } catch {
      } finally {
        setIsSavingC(false);
      }
    },
    [sidefolio]
  );
  const handleDeleteImageSidefolio = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveChanges("background", "", sidefolio.background);
    }, 100);
  };
  const handleBackgroundColorChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const newValue = e.target.value;
    const name = e.target.name;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveChanges(name, newValue);
    }, 100);
  };
  return (
    <nav className={cn("flex items-center gap-2 ")}>
      <SocialConnectDialog
        platform={connectDialogPlatform}
        open={!!connectDialogPlatform}
        onOpenChange={(open) => !open && setConnectDialogPlatform(null)}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <AnimatePresence>
                {justSaved && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary pointer-events-none"
                    initial={{ scale: 1, opacity: 0.55 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
              <Button
                ref={shareButtonRef}
                size={"icon"}
                disabled={isSaving || isPublish}
                className={cn(
                  "rounded-full relative transition-colors",
                  justSaved && "!bg-white"
                )}
                onClick={handleShare}
              >
                {isSaving || isPublish ? (
                  <LoaderCircle className=" animate-spin" size={17} />
                ) : justSaved ? (
                  <motion.div
                    initial={{ scale: 0.6 }}
                    animate={{ scale: [0.6, 1.25, 1] }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Check size={17} className="text-primary" />
                  </motion.div>
                ) : (
                  <Share2 size={17} />
                )}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>{t("copyShareLink")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Popover open={openAdd} onOpenChange={setOpenAdd}>
        <PopoverTrigger asChild>
          <Button size={"icon"} variant={"outline"} className="rounded-full">
            <Plus
              size={17}
              className={cn(
                "transition-transform duration-200",
                openAdd && "rotate-45"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="mb-2 w-[min(92vw,26rem)] overflow-hidden rounded-2xl p-0"
        >
          <section className="p-4">
            <h4 className="text-sm font-bold leading-none">{t("addBlocks")}</h4>
            <p className="mt-1.5 text-xs text-noir/55">{t("addBlocksHint")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <BlockTile
                preview={<TitlePreview />}
                label={t("blockTitle")}
                description={t("blockTitleDesc")}
                disabled={isSaving || isLoading}
                onClick={() => handleCreateSection("New title bloc", "TITLE")}
              />
              <BlockTile
                preview={<TextPreview />}
                label={t("blockText")}
                description={t("blockTextDesc")}
                disabled={isSaving || isLoading}
                onClick={() => handleCreateSection("New text bloc", "TEXT")}
              />
              <BlockTile
                preview={<ImagePreview />}
                label={t("blockImage")}
                description={t("blockImageDesc")}
                loading={imageLoading}
                disabled={imageLoading || isSaving}
                onClick={() => inputFileRef.current?.click()}
              />
              <BlockTile
                preview={<LinkPreview />}
                label={t("blockLink")}
                description={t("blockLinkDesc")}
                disabled={isLoading || isSaving}
                onClick={() => {
                  // Close the popover first: a dialog opened from inside it
                  // ends up fighting over focus with the popover's own trap.
                  setOpenAdd(false);
                  setOpenLink(true);
                }}
              />
            </div>
          </section>

          <section className="border-t border-gray-200 bg-gray-50/70 p-4">
            <h4 className="text-sm font-bold leading-none">
              {t("backgroundTitle")}
            </h4>
            <p className="mt-1.5 text-xs text-noir/55">{t("backgroundHint")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-colors",
                  sidefolio?.background
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-primary/50"
                )}
              >
                <span
                  className="flex h-16 w-full items-center justify-center"
                  style={{ background: bgColor }}
                >
                  <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-noir/70">
                    {bgColor}
                  </span>
                </span>
                <span className="block p-2">
                  <span className="block text-sm font-bold leading-tight">
                    {t("backgroundColor")}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-noir/55">
                    {sidefolio?.background
                      ? t("backgroundColorLocked")
                      : t("backgroundColorHint")}
                  </span>
                </span>
                <input
                  type="color"
                  name="color"
                  disabled={!!sidefolio?.background}
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    handleBackgroundColorChange(e);
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
              </label>

              <BlockTile
                preview={
                  sidefolio?.background ? (
                    <img
                      src={sidefolio.background}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image2 size={20} strokeWidth={2} className="text-noir/40" />
                  )
                }
                label={t("backgroundImage")}
                description={
                  isDraggingBackground
                    ? t("backgroundDropHere")
                    : sidefolio?.background
                    ? t("backgroundRemoveImage")
                    : t("backgroundImageHint", {
                        maxMB: MAX_BACKGROUND_IMAGE_MB,
                      })
                }
                loading={imageSideLoading}
                disabled={imageSideLoading || isSavingC}
                dropProps={backgroundDropProps}
                isDropTarget={isDraggingBackground}
                onClick={() =>
                  sidefolio?.background
                    ? handleDeleteImageSidefolio()
                    : inputFileSideRef.current?.click()
                }
              />
            </div>
          </section>
        </PopoverContent>
      </Popover>

      {/* File pickers live outside the popover so they stay mounted while the
          OS dialog is open and the popover closes behind it. */}
      <Input
        className="hidden"
        type="file"
        name="file"
        hidden
        ref={inputFileRef}
        onChangeCapture={async (event) => {
          event.preventDefault();
          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];
          if (file.size > MAX_BLOCK_IMAGE_BYTES) {
            toast.error(t("uploadImageFailed", { maxMB: MAX_BLOCK_IMAGE_MB }));
            if (inputFileRef.current) inputFileRef.current.value = "";
            return;
          }
          setImageLoading(true);
          const formData = new FormData();
          formData.append("file", file);
          handleUploadImage(formData);
        }}
      />
      <Input
        className="hidden"
        type="file"
        name="file"
        hidden
        ref={inputFileSideRef}
        onChangeCapture={async (event) => {
          event.preventDefault();
          if (!inputFileSideRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileSideRef.current.files[0];
          uploadBackgroundFile(file);
          if (inputFileSideRef.current) inputFileSideRef.current.value = "";
        }}
      />

      <Dialog open={openLink} onOpenChange={setOpenLink}>
        <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("addLinkTitle")}</DialogTitle>
            <p className="text-sm text-noir/55">{t("addLinkSubtitle")}</p>
          </DialogHeader>
          <div className="py-4">
            <LinkCatalog />
          </div>
          <div className="grid gap-4 pb-6">
            <Input
              type="text"
              className="h-11 text-base"
              placeholder={t("addLinkPlaceholder")}
              onChange={(e) => setURL(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              className="h-11 flex-1"
              size={"icon"}
              disabled={
                (!isMailtoOrEmail(url) &&
                  !isTelOrPhone(url) &&
                  url.match(
                    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
                  ) === null) ||
                isSaving ||
                isLoading
              }
              onClick={handleCreateLink}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {t("addingLink")}
                </>
              ) : (
                t("addLinkTitle")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              variant={"outline"}
              className="rounded-full"
              onClick={() =>
                handleSideChange(
                  sidefolio?.sidebar === "left" ? "right" : "left"
                )
              }
            >
              {sidefolio?.sidebar === "left" ? (
                <Image src={"/sideleft.svg"} width={17} height={17} alt="" />
              ) : (
                <Image src={"/sideright.svg"} width={17} height={17} alt="" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {sidefolio?.sidebar === "left"
              ? t("moveProfileRight")
              : t("moveProfileLeft")}
          </TooltipContent>
        </Tooltip>
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className="rounded-full"
                onClick={() =>
                  currentBreakpoint === "xs"
                    ? setCurrentBreakpoint("lg")
                    : setCurrentBreakpoint("xs")
                }
              >
                {currentBreakpoint === "xs" ? (
                  <Smartphone size={17} />
                ) : (
                  <Monitor size={17} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentBreakpoint === "xs"
                ? t("previewDesktop")
                : t("previewMobile")}
            </TooltipContent>
          </Tooltip>
        )}
        <FlagLanguageSwitcher />
      </TooltipProvider>
    </nav>
  );
};

export default NavLinks;
