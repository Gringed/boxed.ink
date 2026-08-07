"use client";
import { Button, buttonVariants } from "@/components/ui/button";

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
  Contact,
  Heading,
  Image as Image2,
  ImageOff,
  ImagePlus,
  Link2,
  Loader2,
  LoaderCircle,
  Monitor,
  Plus,
  Share2,
  Smartphone,
  Type,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import React, { startTransition, useCallback, useRef, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { del } from "@vercel/blob";
import Image from "next/image";
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
  const [url, setURL] = useState("");
  const [openLink, setOpenLink] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageSideLoading, setImageSideLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublish, setIsPublish] = useState<boolean>(false);
  const [isSavingC, setIsSavingC] = useState<boolean>(false);
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
      toast.success("Your changes have been saved");
      startTransition(() => {
        router.refresh();
      });
    });
  };
  const handleUploadImage = async (file: any) => {
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
      setImageLoading(false);
      toast.success("Your changes have been saved");
      startTransition(() => {
        router.refresh();
      });
    }
  };
  const handleUploadImageSidefolio = async (file: any) => {
    const res = await uploadImageSidefolio({
      id: sidefolio.id,
      file,
    });
    if (res) {
      setImageSideLoading(false);
      toast.success("Your changes have been saved");
    }
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
        justPublished
          ? "Published online and link copied to clipboard"
          : "Link copied to clipboard"
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
      toast.error("Could not copy the link");
    }
  };
  const handleCreateLink = async () => {
    setIsLoading(true);
    let urlFull = url.includes("https://");
    let newUrl;
    if (urlFull) {
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
      toast.error("Please fill a valid url");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setOpenLink(false);
      setURL("");
      toast.success("Your changes have been saved");
      startTransition(() => {
        router.refresh();
      });
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
        toast.success("Your changes have been saved");
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={shareButtonRef}
              size={"icon"}
              disabled={isSaving || isPublish}
              className="rounded-full"
              onClick={handleShare}
            >
              {isSaving || isPublish ? (
                <LoaderCircle className=" animate-spin" size={17} />
              ) : (
                <Share2 size={17} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy share link</TooltipContent>
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
        <PopoverContent side="top" className="w-full mb-2">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Add blocks</h4>
            </div>
            <div className="grid gap-2">
              <div className="flex w-full justify-between gap-3 flex-wrap items-center">
                <div className="group/tooltip relative">
                  <Button
                    size={"icon"}
                    variant={"outline"}
                    className="rounded-sm "
                    disabled={isSaving || isLoading}
                    onClick={() =>
                      handleCreateSection("New title bloc", "TITLE")
                    }
                  >
                    <Heading strokeWidth={3} size={17} />
                  </Button>
                  <span className="group-hover/tooltip:visible transition-all p-1 px-2 font-medium group-hover/tooltip:opacity-100 z-50 text-xs text-white rounded-full bg-primary opacity-0 absolute -top-7 -translate-x-2/4 left-1/2 invisible">
                    Title
                  </span>
                </div>
                <div className="group/tooltip relative  ">
                  <Button
                    size={"icon"}
                    variant={"outline"}
                    className="rounded-sm"
                    disabled={isSaving || isLoading}
                    onClick={() => {
                      handleCreateSection("New text bloc", "TEXT");
                    }}
                  >
                    <Type strokeWidth={3} size={17} />
                  </Button>
                  <span className="group-hover/tooltip:visible transition-all p-1 px-2 font-medium group-hover/tooltip:opacity-100 z-50 text-xs text-white rounded-full bg-primary opacity-0 absolute -top-7 -translate-x-2/4 left-1/2 invisible">
                    Text
                  </span>
                </div>
                <div className="group/tooltip relative  ">
                  <Input
                    className=" flex-1 hidden"
                    type="file"
                    name="file"
                    hidden
                    ref={inputFileRef}
                    onChangeCapture={async (event) => {
                      event.preventDefault();
                      setImageLoading(true);
                      if (!inputFileRef.current?.files) {
                        throw new Error("No file selected");
                      }

                      const file = inputFileRef.current.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      handleUploadImage(formData);

                      /*  */
                    }}
                  />

                  <Button
                    onClick={() => {
                      inputFileRef.current?.click();
                    }}
                    size={"icon"}
                    variant={"outline"}
                    className="rounded-sm"
                    disabled={imageLoading || isSaving}
                  >
                    {imageLoading ? (
                      <Loader2 className=" animate-spin" size={16} />
                    ) : (
                      <ImagePlus strokeWidth={2.5} size={17} />
                    )}
                  </Button>
                  <span className="group-hover/tooltip:visible transition-all p-1 px-2 font-medium group-hover/tooltip:opacity-100 z-50 text-xs text-white rounded-full bg-primary opacity-0 absolute -top-7 -translate-x-2/4 left-1/2 invisible">
                    Image
                  </span>
                </div>

                <div className="group/tooltip relative  ">
                  <Dialog open={openLink} onOpenChange={setOpenLink}>
                    <DialogTrigger asChild>
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="rounded-sm"
                        disabled={isLoading || isSaving}
                      >
                        <Link2 strokeWidth={2.5} size={17} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add link</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          type="text"
                          className="flex-[2]"
                          placeholder="Paste your link here"
                          onChange={(e) => setURL(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          className=" flex-1"
                          size={"icon"}
                          disabled={
                            url.match(
                              /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
                            ) === null ||
                            isSaving ||
                            isLoading
                          }
                          onClick={handleCreateLink}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Adding link...
                            </>
                          ) : (
                            "Add link"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <span className="group-hover/tooltip:visible transition-all p-1 px-2 font-medium group-hover/tooltip:opacity-100 z-50 text-xs text-white rounded-full bg-primary opacity-0 absolute -top-7 -translate-x-2/4 left-1/2 invisible">
                    Link
                  </span>
                </div>

                {/*  */}
              </div>
              <div className="flex w-full h-full justify-between items-center">
                <div className="w-full h-full flex items-center">
                  Background
                </div>
                <div className="w-full flex justify-between gap-3 h-full">
                  <Input
                    type="color"
                    name="color"
                    disabled={sidefolio?.background}
                    defaultValue={sidefolio?.color || "#ffffff"}
                    onChange={(e) => handleBackgroundColorChange(e)}
                    className={cn(
                      buttonVariants({ size: "default", variant: "outline" }),
                      "rounded-sm flex-1 p-1"
                    )}
                  />
                  <Input
                    className=" w-full hidden"
                    type="file"
                    name="file"
                    hidden
                    ref={inputFileSideRef}
                    onChangeCapture={async (event) => {
                      event.preventDefault();
                      setImageSideLoading(true);
                      if (!inputFileSideRef.current?.files) {
                        throw new Error("No file selected");
                      }

                      const file = inputFileSideRef.current.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      handleUploadImageSidefolio(formData);

                      /*  */
                    }}
                  />

                  <Button
                    onClick={() => {
                      sidefolio?.background
                        ? handleDeleteImageSidefolio()
                        : inputFileSideRef.current?.click();
                    }}
                    size={"icon"}
                    variant={"outline"}
                    className="rounded-sm"
                    disabled={imageSideLoading || isSavingC}
                  >
                    {imageSideLoading ? (
                      <Loader2 className=" animate-spin" size={16} />
                    ) : sidefolio?.background ? (
                      <ImageOff strokeWidth={2.5} size={17} />
                    ) : (
                      <Image2 strokeWidth={2.5} size={17} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
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
            {sidefolio?.sidebar &&
              sidefolio?.sidebar[0].toUpperCase() + sidefolio?.sidebar.slice(1)}
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
            <TooltipContent>Device</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </nav>
  );
};

export default NavLinks;
