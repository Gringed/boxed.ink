"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { Responsive, Layout, Layouts } from "react-grid-layout";
import { useSquareRowHeight } from "@/lib/hooks/useSquareRowHeight";
import { Input } from "@/components/ui/input";

import { ImageOff, Mail, MapPin, Phone } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { isLightColor, isUsableImageUrl } from "@/lib/utils";
import { SOCIAL_BRAND } from "@/lib/socialProfile";
import { InstagramProfileCard } from "@/features/platform/shared/InstagramProfileCard";
import { TikTokProfileCard } from "@/features/platform/shared/TikTokProfileCard";
import { TikTokVideosPlaceholder } from "@/features/platform/shared/TikTokVideosPlaceholder";
import BlurFade from "@/components/magicui/blur-fade";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { YouTubeChannelCard } from "@/features/platform/shared/YouTubeChannelCard";
import { TwitchChannelCard } from "@/features/platform/shared/TwitchChannelCard";
import { formatCount } from "@/lib/youtube";
import dynamic from "next/dynamic";
const LocationMap = dynamic(
  () =>
    import("@/features/platform/shared/LocationMap").then(
      (mod) => mod.LocationMap
    ),
  { ssr: false }
);

const ResponsiveReactGridLayout = Responsive;
const GRID_MARGIN = 30;

const safeHostname = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

interface SectionsProps {
  sections: any;
  sidefolio: any;
  desktop: any;
  mobile: any;
}

const PublishedSections = ({
  sections,
  sidefolio,
  desktop,
  mobile,
}: SectionsProps) => {
  const cols = { lg: 8, md: 8, sm: 4, xs: 4, xxs: 4 };
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const {
    ref: gridWrapperRef,
    width: gridWidth,
    rowHeight: gridRowHeight,
  } = useSquareRowHeight(
    cols[currentBreakpoint as keyof typeof cols] ?? 8,
    GRID_MARGIN
  );

  const compactType = "vertical";

  const [mounted, setMounted] = useState(false);
  // Sections whose scraped preview image (og:image/twitter:image) 404'd or
  // otherwise failed to load — falls back to the plain title/url layout
  // instead of leaving an empty image area.
  const [failedPreviewImages, setFailedPreviewImages] = useState<Set<string>>(
    new Set()
  );
  // Sections whose preview image has actually finished loading — the
  // placeholder stays the visible layer until this flips, so a 404/broken
  // image never shows the browser's torn-icon while it's still resolving.
  const [loadedPreviewImages, setLoadedPreviewImages] = useState<Set<string>>(
    new Set()
  );
  const [layouts, setLayouts] = useState<Layouts>({
    lg: desktop,
    md: mobile,
    sm: mobile,
    xs: mobile,
    xxs: mobile,
  });

  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQueryList = window.matchMedia("(min-width: 1024px)");
      setMatches(mediaQueryList.matches);

      const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

      mediaQueryList.addEventListener("change", handler);

      return () => {
        mediaQueryList.removeEventListener("change", handler);
      };
    }
  }, []);

  // Drive the grid's breakpoint (and avatar/text sizing) from the real
  // viewport width, not the grid sub-container's own (narrower) width —
  // otherwise react-grid-layout picks its breakpoint internally from
  // `width={gridWidth}` and silently renders the mobile position dataset
  // even on desktop screens.
  useEffect(() => {
    setCurrentBreakpoint(matches ? "lg" : "xs");
  }, [matches]);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nameEditor = useEditor({
    content: sidefolio?.name?.replaceAll("\n\n", "<p>") || "",
    editable: false,
    immediatelyRender: false,

    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your name",
      }),
      CharacterCount.configure({
        limit: 40,
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-3 focus:outline-none",
      },
    },
  });
  const bioEditor = useEditor({
    content: sidefolio?.bio || "No bio",
    editable: false,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Introduce yourself...",
        emptyNodeClass: "bio-is-empty",
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl px-3 focus:outline-none",
      },
    },
  });

  const locationEditor = useEditor({
    content: sidefolio?.location || "",
    editable: false,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your location",
        emptyNodeClass: "bio-is-empty",
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl focus:outline-none",
      },
    },
  });
  return (
    <div
      style={{
        scrollbarWidth: "none",
        transition: "all .25s cubic-bezier(.427,.073,.105,.997) .1s",
        background: sidefolio?.background
          ? `url("${sidefolio.background}") center / cover no-repeat`
          : sidefolio?.color || "white",
      }}
      className={`flex relative animate-fade w-full h-full overflow-auto flex-col px-4 md:px-4 lg:px-36 xl:px-10 py-14 ${
        sidefolio?.sidebar === "left" ? " xl:flex-row" : " xl:flex-row-reverse"
      } !opacity-100 transition-all`}
    >
      <div
        className={` relative  ${
          currentBreakpoint === "xs"
            ? "w-full"
            : "top-[0rem] max-w-full min-w-[calc(100vw-1000px)] min-h-fit  max-h-[calc(100vh+50px)] xl:min-h-[calc(100vh-150px)] xl:sticky overflow-y-auto"
        } `}
        style={{ scrollbarWidth: "none" }}
      >
        <BlurFade inView>
          <div
            className={`flex flex-col  w-full rounded-3xl h-full  ${
              sidefolio?.sidebar === "right" ? "items-end" : "items-start"
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
                {sidefolio?.image ? (
                  <AvatarImage
                    src={sidefolio?.image}
                    className=" object-cover"
                    alt={`${sidefolio?.name ?? "-"}'s profile picture`}
                  />
                ) : (
                  <AvatarImage
                    src={"/noAvatar.png"}
                    draggable={false}
                    className=" object-cover select-none "
                  />
                )}
              </Avatar>
            </div>
            <div
              className={`w-full transition-all font-bold ${
                sidefolio?.sidebar === "right" ? "text-right" : "text-left"
              } ${
                currentBreakpoint === "xs"
                  ? "text-3xl"
                  : "2xl:text-5xl md:text-4xl"
              } `}
            >
              <EditorContent spellCheck={false} editor={nameEditor} />
            </div>

            <div
              className={`w-full transition-all  ${
                sidefolio?.sidebar === "right" ? "text-right" : "text-left"
              } ${
                currentBreakpoint === "xs"
                  ? "text-base"
                  : " lg:text-lg md:text-base"
              } `}
            >
              <EditorContent editor={bioEditor} spellCheck={false} />
            </div>
            {sidefolio?.location && (
              <div
                className={`z-10 my-5 w-full text-sm flex flex-col gap-2 ${
                  sidefolio?.sidebar === "right" ? "items-end" : "items-start"
                }`}
              >
                <LocationMap
                  lat={sidefolio?.locationLat}
                  lng={sidefolio?.locationLng}
                  className={
                    currentBreakpoint === "xs"
                      ? "w-full aspect-[2/1]"
                      : "w-72 aspect-[2/1]"
                  }
                />
                <div
                  className={`flex items-center gap-1 ${
                    sidefolio?.sidebar === "right" ? "flex-row-reverse" : ""
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
              </div>
            )}
          </div>
        </BlurFade>
      </div>
      <div className="w-full pb-20">
        <BlurFade inView delay={0.2} className="pb-20">
        <div ref={gridWrapperRef}>
        <ResponsiveReactGridLayout
          layouts={layouts}
          width={gridWidth}
          breakpoint={currentBreakpoint}
          useCSSTransforms={mounted}
          compactType={compactType}
          cols={cols}
          isDraggable={false}
          isResizable={false}
          margin={[GRID_MARGIN, GRID_MARGIN]}
          containerPadding={[0, 0]}
          preventCollision={!compactType}
          rowHeight={gridRowHeight}
        >
          {sections.map((l: any, i: any) => (
            <div
              id={l.id}
              key={l.i}
              className={
                l?.type === "TITLE"
                  ? "border border-transparent group/item relative flex justify-start cursor-default"
                  : "border border-gray-200 shadow-sm react-grid-item-publish hover:shadow group/item rounded-3xl bg-white relative  flex justify-start cursor-default"
              }
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
                    <Textarea
                      key={i}
                      ref={textAreaRef}
                      readOnly
                      name="title"
                      style={{ color: l?.color ? `${l.color}` : "black" }}
                      className={`cursor-default  z-10 bg-transparent border-none rounded-3xl resize-none min-h-0 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
                      defaultValue={l.title}
                      placeholder="Add a new title"
                    />
                  </div>
                </>
              ) : l?.type === "TITLE" ? (
                <>
                  <div
                    className={"flex  w-full rounded-[22px] h-full items-start p-0.5"}
                  >
                    <Input
                      key={i}
                      ref={textInputRef}
                      name="title"
                      readOnly
                      style={{ color: l?.color ? `${l.color}` : "black" }}
                      className={`cursor-default ${
                        currentBreakpoint === "xs"
                          ? "text-lg"
                          : "text-sm lg:text-3xl"
                      }  z-10 bg-transparent border-none text-left font-bold break-words  resize-none min-h-0 focus-visible:ring-0 shadow-none h-full  w-full p-0.5`}
                      defaultValue={l.title}
                      placeholder="Add a new title"
                    />
                  </div>
                </>
              ) : l?.type === "ME" ? (
                <>
                  <div
                    key={i}
                    className={
                      "flex flex-col overflow-auto  w-full rounded-3xl h-full items-start justify-start gap-6 p-3"
                    }
                    style={{
                      background: l?.background ? `${l.background}` : "white",
                      scrollbarWidth: "none",
                    }}
                  >
                    <Avatar className="size-32 cursor-pointer ">
                      <AvatarFallback>
                        {sidefolio?.publicName?.[0]}
                      </AvatarFallback>
                      {sidefolio.publicImage ? (
                        <AvatarImage
                          src={sidefolio.publicImage}
                          className=" object-cover"
                          alt={`${
                            sidefolio.publicName ?? "-"
                          }'s profile picture`}
                        />
                      ) : null}
                    </Avatar>

                    <Input
                      ref={textInputRef}
                      name="name"
                      readOnly
                      style={{ color: l?.color ? `${l.color}` : "black" }}
                      className={`  z-10 bg-transparent border-none text-left font-bold text-sm h-fit  lg:text-3xl break-words  resize-none min-h-0 focus-visible:ring-0 shadow-none  w-full p-3`}
                      defaultValue={l.name}
                      placeholder="Add a new name"
                    />

                    <Textarea
                      ref={textAreaRef}
                      name="bio"
                      readOnly
                      style={{
                        color: l?.color ? `${l.color}` : "black",
                        scrollbarWidth: "none",
                      }}
                      className={`  z-10 bg-transparent border-none text-base   resize-none min-h-20 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
                      defaultValue={l.bio}
                      placeholder="Add a new bio"
                    />
                    <div className="z-10 w-full flex items-center gap-1">
                      <span>
                        <MapPin size={20} className="ms-2 text-primary" />
                      </span>
                      <Input
                        ref={textInputRef}
                        name="location"
                        readOnly
                        style={{ color: l?.color ? `${l.color}` : "black" }}
                        className={`   z-10 bg-transparent border-none text-left font-bold text-sm h-fit break-words  resize-none min-h-0 focus-visible:ring-0 shadow-none  w-full p-3`}
                        defaultValue={l.location}
                        placeholder="Add a new location"
                      />
                    </div>
                  </div>
                </>
              ) : l?.type === "LINK" &&
                (l?.link?.instagram || l?.link?.tiktok) ? (
                <>
                  <div
                    className="relative w-full h-full rounded-3xl bg-white cursor-pointer"
                    onClick={() =>
                      window.open(
                        l.link.instagram?.profileUrl ||
                          l.link.tiktok?.profileUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    {(() => {
                      const bp = currentBreakpoint as keyof typeof cols;
                      const currentItem = (layouts[bp] || []).find(
                        (item: Layout) => item.i === l.i
                      );
                      return l?.link?.instagram ? (
                        <InstagramProfileCard
                          instagram={l.link.instagram}
                          color={l?.color}
                          w={currentItem?.w ?? 2}
                          h={currentItem?.h ?? 2}
                        />
                      ) : (
                        <TikTokProfileCard
                          tiktok={l.link.tiktok}
                          color={l?.color}
                          w={currentItem?.w ?? 2}
                          h={currentItem?.h ?? 2}
                        />
                      );
                    })()}
                  </div>
                </>
              ) : l?.type === "LINK" && l?.link?.youtube ? (
                <>
                  <div
                    className="relative w-full h-full rounded-3xl bg-white cursor-pointer"
                    onClick={() =>
                      window.open(
                        l.link.youtube.channelUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    {(() => {
                      const bp = currentBreakpoint as keyof typeof cols;
                      const currentItem = (layouts[bp] || []).find(
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
                </>
              ) : l?.type === "LINK" && l?.link?.twitch ? (
                <>
                  <div
                    className="relative w-full h-full rounded-3xl bg-white cursor-pointer"
                    onClick={() =>
                      window.open(
                        l.link.twitch.channelUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    {(() => {
                      const bp = currentBreakpoint as keyof typeof cols;
                      const currentItem = (layouts[bp] || []).find(
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
                </>
              ) : l?.type === "LINK" ? (
                <>
                  <div
                    className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col gap-1.5 p-3 cursor-pointer"
                    style={{
                      background: l?.background ? `${l.background}` : "white",
                    }}
                    onClick={() =>
                      window.open(l?.link.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    {(() => {
                      const mutedColor = isLightColor(l?.background)
                        ? "rgb(0 0 0 / 0.4)"
                        : "rgb(255 255 255 / 0.55)";
                      const bp = currentBreakpoint as keyof typeof cols;
                      const currentItem = (layouts[bp] || []).find(
                        (item: Layout) => item.i === l.i
                      );
                      const isRow =
                        (currentItem?.w ?? 2) === 4 &&
                        (currentItem?.h ?? 2) === 1;
                      const isSquareImage =
                        (currentItem?.w ?? 2) === 4 &&
                        (currentItem?.h ?? 2) === 4;
                      const isWideImage =
                        (currentItem?.w ?? 2) === 4 &&
                        (currentItem?.h ?? 2) === 2;
                      const isTallImage =
                        (currentItem?.w ?? 2) === 2 &&
                        (currentItem?.h ?? 2) === 4;
                      const isMailto =
                        !!l?.link?.mailto ||
                        /^mailto:/i.test(l?.link?.url || "");
                      const isTel =
                        !!l?.link?.tel || /^tel:/i.test(l?.link?.url || "");
                      const logoSrc = isMailto || isTel
                        ? null
                        : l?.link.url?.split("/")[2] === "read.cv"
                        ? l.link?.favicons?.[1]?.href
                        : `https://www.google.com/s2/favicons?sz=128&domain=${safeHostname(
                            l?.link?.url
                          )}`;
                      // A custom-uploaded image always wins. Otherwise only a
                      // real scraped preview photo earns the big image
                      // layout — no image (or it 404'd) just falls through to
                      // the plain title/url layout instead of leaving an
                      // empty block (no upload affordance here, this is the
                      // read-only public page).
                      // Load/failure is tracked per image URL, not per block,
                      // so a block whose scraped image 404'd doesn't stay
                      // marked as broken once a working image replaces it.
                      const previewImageCandidate = [
                        l?.link?.customImage,
                        l?.link?.image,
                        l?.link?.["og:image"],
                        l?.link?.["twitter:image"],
                      ].find(isUsableImageUrl);
                      const previewImage =
                        previewImageCandidate &&
                        !failedPreviewImages.has(previewImageCandidate)
                          ? previewImageCandidate
                          : undefined;

                      // How many lines of title fit in this exact block
                      // before the header row (36px logo), gap and url line —
                      // so the default (no-image) layout can line-clamp
                      // precisely instead of scrolling or hard-clipping
                      // mid-line.
                      const blockH = currentItem?.h ?? 2;
                      const blockHeightPx =
                        gridRowHeight * blockH + GRID_MARGIN * (blockH - 1);
                      const titleLineClamp = Math.max(
                        1,
                        Math.floor((blockHeightPx - 24 - 36 - 8 - 16 - 4) / 20)
                      );

                      // No frame around the logo — just the mark itself.
                      // rounded-md still clips it, so a logo that ships its
                      // own background doesn't show hard square corners.
                      // The box is square but logos often aren't: the small
                      // padding keeps a wide/tall one off the clipped edges
                      // instead of running flush into them.
                      const logo = (
                        <div className="relative size-9 shrink-0 rounded-md overflow-hidden flex items-center justify-center">
                          {isMailto ? (
                            <Mail size={18} className="text-noir/70" strokeWidth={2} />
                          ) : isTel ? (
                            <Phone size={18} className="text-noir/70" strokeWidth={2} />
                          ) : (
                            <>
                              <span className="invisible text-xs font-medium">
                                {l.link?.title[0]}
                              </span>
                              <img
                                src={logoSrc}
                                draggable={false}
                                className="absolute inset-0 h-full w-full object-contain p-0.5 select-none"
                                alt={`${l?.link && l.link.title} picture`}
                                onError={(e) => {
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = "none";
                                  const fallback =
                                    img.previousElementSibling as HTMLElement | null;
                                  if (fallback)
                                    fallback.style.visibility = "visible";
                                }}
                              />
                            </>
                          )}
                        </div>
                      );

                      // Only shown on a creator's own profile/channel page
                      // (see detectSocialProfile) — a plain post/tweet/video
                      // link never gets this.
                      const socialProfile = l?.link?.socialProfile;
                      const brand =
                        SOCIAL_BRAND[
                          socialProfile?.platform as keyof typeof SOCIAL_BRAND
                        ];
                      const followButton = socialProfile && brand && (
                        <a
                          href={l?.link?.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: brand.color,
                            borderColor: brand.color,
                            backgroundColor: brand.background,
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap transition-opacity hover:opacity-80"
                        >
                          {socialProfile.label}
                          {typeof socialProfile.followerCount === "number" && (
                            <span className="opacity-70">
                              · {formatCount(socialProfile.followerCount)}
                            </span>
                          )}
                        </a>
                      );

                      if (isRow) {
                        return (
                          <div className="flex items-center gap-2 w-full h-full">
                            {logo}
                            <span
                              className="flex-1 min-w-0 truncate text-sm font-bold"
                              style={{
                                color: l?.color ? `${l.color}` : "black",
                              }}
                            >
                              {l.link?.title}
                            </span>
                            {followButton}
                          </div>
                        );
                      }

                      const isImageLoaded =
                        !!previewImage && loadedPreviewImages.has(previewImage);
                      // Not loaded yet (still fetching, 404'd, or just
                      // doesn't exist) — the empty-state icon is the base
                      // layer in all of those cases, so nothing ever shows
                      // the browser's broken-image icon.
                      const showImagePlaceholder = !previewImage || !isImageLoaded;

                      const markImageLoaded = () =>
                        setLoadedPreviewImages((prev) =>
                          !previewImage || prev.has(previewImage)
                            ? prev
                            : new Set(prev).add(previewImage)
                        );
                      const markImageFailed = () =>
                        setFailedPreviewImages((prev) =>
                          !previewImage || prev.has(previewImage)
                            ? prev
                            : new Set(prev).add(previewImage)
                        );

                      const previewImageEl = !previewImage ? null : (
                        <img
                          src={previewImage}
                          alt=""
                          draggable={false}
                          style={{ opacity: isImageLoaded ? 1 : 0 }}
                          className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
                          // A cached image can finish loading before React
                          // attaches onLoad, so that event never fires —
                          // check the already-settled state on mount too.
                          ref={(node) => {
                            if (!node || !node.complete) return;
                            if (node.naturalWidth > 0) markImageLoaded();
                            else markImageFailed();
                          }}
                          onLoad={markImageLoaded}
                          onError={markImageFailed}
                        />
                      );

                      // Empty-state icon as the base layer, with the real
                      // image fading in on top only once it has actually
                      // loaded — no image, a 404, or a broken one all just
                      // keep showing the icon instead of a broken picture.
                      // A TikTok profile link the owner hasn't connected gets
                      // the video-stack stand-in rather than the generic
                      // "no image" icon — same visual as the editor, minus
                      // the connect action, which means nothing to a visitor.
                      const isUnconnectedTikTok =
                        l?.link?.socialProfile?.platform === "tiktok" &&
                        !l?.link?.tiktok;

                      const imageArea = (
                        <>
                          {showImagePlaceholder &&
                            (isUnconnectedTikTok ? (
                              <TikTokVideosPlaceholder />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-dashed border-noir/15 bg-noir/[0.02] text-noir/25">
                                <ImageOff size={20} />
                              </div>
                            ))}
                          {previewImageEl}
                        </>
                      );

                      const titleEl = (
                        <span
                          className="shrink-0 truncate text-sm font-bold"
                          style={{
                            color: l?.color ? `${l.color}` : "black",
                          }}
                        >
                          {l.link?.title}
                        </span>
                      );

                      // Multiline but never scrollable — line-clamp trims
                      // the overflow once it hits max lines, no scrollbar.
                      const titleMultilineEl = (
                        <span
                          className="line-clamp-3 shrink-0 break-words text-sm font-bold"
                          style={{
                            color: l?.color ? `${l.color}` : "black",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {l.link?.title}
                        </span>
                      );

                      // Sits at the very bottom of whichever column used to
                      // carry the url line. mt-auto pins it there however
                      // tall the title above it ends up.
                      const bottomFollow = followButton && (
                        <div className="mt-auto flex shrink-0 pt-1">
                          {followButton}
                        </div>
                      );

                      const urlLine = (
                        <span
                          className="shrink-0 truncate text-xs"
                          style={{ color: mutedColor }}
                        >
                          {l.link?.url}
                        </span>
                      );

                      if (isSquareImage) {
                        return (
                          <>
                            <div className="flex items-center justify-between gap-2 w-full shrink-0">
                              {logo}
                              {followButton}
                            </div>
                            <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg">
                              {imageArea}
                            </div>
                            {titleEl}
                          </>
                        );
                      }

                      if (isWideImage) {
                        return (
                          <div className="flex min-h-0 flex-1 items-stretch gap-2">
                            <div className="flex min-w-0 flex-1 flex-col justify-start gap-1">
                              {logo}
                              {titleMultilineEl}
                              {/* A social profile shows its Follow pill
                                  instead — the url would be redundant next
                                  to it. */}
                              {!socialProfile && urlLine}
                              {bottomFollow}
                            </div>
                            <div className="relative h-full aspect-square shrink-0 overflow-hidden rounded-lg">
                              {imageArea}
                            </div>
                          </div>
                        );
                      }

                      if (isTallImage) {
                        return (
                          <>
                            <div className="flex items-center justify-between gap-2 w-full shrink-0">
                              {logo}
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              {titleMultilineEl}
                            </div>
                            <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg">
                              {imageArea}
                            </div>
                            {bottomFollow}
                          </>
                        );
                      }

                      return (
                        <>
                          <div className="flex items-center justify-between gap-2 w-full shrink-0">
                            {logo}
                          </div>
                          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                            <span
                              className="min-h-0 break-words text-sm font-bold"
                              style={{
                                color: l?.color ? `${l.color}` : "black",
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: titleLineClamp,
                                overflow: "hidden",
                                whiteSpace: "pre-line",
                              }}
                            >
                              {l.link?.title}
                            </span>
                            {bottomFollow}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={
                      "absolute  rounded-3xl  top-0 left-0 h-full w-full"
                    }
                  >
                    <div
                      style={{
                        scrollbarWidth: "none",
                        clipPath: "inset(0px round 24px)",
                      }}
                      className={` h-full w-full`}
                    >
                      {l?.imageUrl && (
                        <>
                          {l?.imageX ||
                          l?.imageY ||
                          l?.imageMobileX ||
                          l?.imageMobileY ||
                          l?.imageScale ||
                          l?.imageMobileScale ? (
                            <img
                              draggable="false"
                              className="absolute overflow-clip w-full h-full object-cover  rounded-3xl"
                              style={{
                                transform: `translate(${
                                  !matches
                                    ? `${l?.imageMobileX}px, ${l?.imageMobileY}px`
                                    : `${l?.imageX}px, ${l?.imageY}px`
                                }) scale(${
                                  (!matches
                                    ? l?.imageMobileScale
                                    : l?.imageScale) || 1
                                })`,
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
                </>
              )}
            </div>
          ))}
        </ResponsiveReactGridLayout>
        </div>
        </BlurFade>
      </div>
    </div>
  );
};

export default PublishedSections;
