"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { Responsive, Layout, Layouts } from "react-grid-layout";
import { useSquareRowHeight } from "@/lib/hooks/useSquareRowHeight";
import { Input } from "@/components/ui/input";

import { MapPin } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";
import BlurFade from "@/components/magicui/blur-fade";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "next/image";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { YouTubeChannelCard } from "@/features/platform/shared/YouTubeChannelCard";
import { TwitchChannelCard } from "@/features/platform/shared/TwitchChannelCard";

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
    content: sidefolio?.name.replaceAll("\n\n", "<p>") || "",
    editable: false,

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
    content: sidefolio?.location || "No Location",
    editable: false,
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
          "prose prose-sm sm:prose-base  no-underline lg:prose-lg xl:prose-2xl px-3 focus:outline-none",
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
      <div
        className={` relative  ${
          currentBreakpoint === "xs"
            ? "w-full max-h-[calc(100vh-100px)]"
            : "top-[0rem] max-w-full min-w-[calc(100vw-1000px)] min-h-fit  max-h-[calc(100vh+50px)] xl:min-h-[calc(100vh-150px)] xl:sticky overflow-y-auto"
        } `}
        style={{ scrollbarWidth: "none" }}
      >
        <BlurFade inView>
          <div
            className={`flex flex-col  w-full rounded-3xl h-full  ${
              sidefolio?.sidebar === "right" ? "items-end" : "items-start"
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
            <div
              className={`z-10 my-5 w-full text-sm flex items-center gap-1 ${
                sidefolio?.sidebar === "right" ? "flex-row-reverse" : ""
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
                  : "border border-gray-300/50 shadow react-grid-item-publish hover:shadow-md group/item rounded-3xl bg-white relative  flex justify-start cursor-default"
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
                      className={`cursor-default  z-10 bg-transparent border-none rounded-3xl resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
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
                      }  z-10 bg-transparent border-none text-left font-bold break-words  resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-0.5`}
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
                      className={`  z-10 bg-transparent border-none text-left font-bold text-sm h-fit  lg:text-3xl break-words  resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none  w-full p-3`}
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
                      className={`  z-10 bg-transparent border-none text-base   resize-none min-h-20 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none h-full  w-full p-3`}
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
                        className={`   z-10 bg-transparent border-none text-left font-bold text-sm h-fit break-words  resize-none min-h-0 focus-visible:bg-slate-300/20 focus-visible:ring-0 shadow-none  w-full p-3`}
                        defaultValue={l.location}
                        placeholder="Add a new location"
                      />
                    </div>
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
                    className={"flex  w-full rounded-3xl h-full items-start p-2"}
                    style={{
                      background: l?.background ? `${l.background}` : "white",
                    }}
                  >
                    <Link
                      target="_blank"
                      href={l?.link.url}
                      style={{ scrollbarWidth: "none" }}
                      className="z-10 h-full overflow-auto w-full flex gap-2 items-start cursor-pointer break-all justify-center"
                    >
                      <Avatar className="size-10 border shadow-md h-fit object-cover p-1.5">
                        <AvatarFallback>{l.link?.title[0]}</AvatarFallback>
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
                          !l?.showImage && !l?.showTitleUrl ? "hidden" : "flex"
                        }  flex-col h-full w-full relative  gap-3`}
                      >
                        {l?.showImage && (
                          <object
                            data={
                              l.link?.["og:image"] || l.link?.imgTags[0]?.src
                            }
                            type="image/jpeg"
                            className=" object-cover w-full h-full rounded-3xl"
                          >
                            <img
                              className=" object-cover w-full h-full rounded-3xl"
                              src="https://learning.knowbility.org/local/sitepages/upload/no-preview-available.png"
                              alt=""
                            />
                          </object>
                        )}
                        {l?.showTitleUrl && (
                          <span
                            className=" break-normal"
                            style={{ color: l?.color ? `${l.color}` : "black" }}
                          >
                            {l.link?.title}
                          </span>
                        )}
                      </div>
                    </Link>
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
                          <img
                            draggable="false"
                            className="absolute overflow-clip min-w-full min-h-full  rounded-3xl"
                            style={{
                              transform: `translate(${
                                !matches
                                  ? `${l?.imageMobileX}px, ${l?.imageMobileY}px`
                                  : `${l?.imageX}px, ${l?.imageY}px`
                              })`,
                              maxWidth: "unset",
                              maxHeight: "unset",
                            }}
                            src={l.imageUrl}
                            alt=""
                          />
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
