"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import {
  Check,
  CheckCircle,
  CheckCircle2,
  CirclePlus,
  CreditCard,
  Globe,
  Home,
  Layers,
  Loader2,
  LogOut,
  MessageCircleWarning,
  Pencil,
  Sparkles,
  Square,
  User2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signOutAction } from "./auth.action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateSectionAction,
  verifySlug,
} from "@/lib/actions/sections/section.actions";
import { updateSidefolioAction } from "@/lib/actions/sidefolio/sidefolio.actions";

export const LoggedInDropdown = (props: any) => {
  const router = useRouter();
  const pathname = usePathname();
  let sidefolio = props?.sidefolio;
  const user = props?.user;
  const isPremium = user?.plan === "PRO";

  const [isLoading, setIsLoading] = useState(false);
  const [field, setField] = useState<string>(sidefolio?.slug);
  const [isAvailable, setIsAvailable] = useState<Boolean>(
    field === sidefolio?.slug ? false : true
  );
  const [open, setOpen] = useState(false);
  const handleVerifySlug = async (e: any) => {
    e.preventDefault();
    const value = e.target.value;

    setIsLoading(true);
    setField(e.target.value);
    try {
      const available = await verifySlug({ value });
      setIsAvailable(available.data!);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateSidefolio = async () => {
    try {
      await updateSidefolioAction({
        id: sidefolio.id,
        data: {
          slug: field,
        },
      });
      setOpen(false);
      toast.success("Public boxed.ink name updated successfully");
      router.refresh();
    } catch {
    }
  };
  const handleGoToUpgrade = () => {
    setOpen(false);
    router.push("/upgrade");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="w-72 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pathname !== "/dashboard" && (
              <DropdownMenuItem
                className="hover:bg-gray-200/10 focus:bg-gray-200/10 hover:text-primary focus:text-primary cursor-pointer font-medium"
                onClick={() => router.push("/dashboard")}
              >
                <Pencil size={16} className="mr-2" />
                Continue my build
              </DropdownMenuItem>
            )}
            <DialogTrigger asChild>
              <DropdownMenuItem className="hover:bg-gray-200/10 focus:bg-gray-200/10 hover:text-primary focus:text-primary cursor-pointer font-medium">
                <Layers size={16} className="mr-2" />
                Change my boxed.ink name
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuItem
              className="hover:bg-gray-200/10 focus:bg-gray-200/10 hover:text-primary focus:text-primary cursor-pointer font-medium"
              onClick={() => {
                signOutAction();
              }}
            >
              <LogOut size={16} className="mr-2" />
              Logout
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit your public boxed.ink name</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="h-full w-full">
              <label className="flex relative border h-full border-noir bg-primary-foreground flex-row  items-center rounded ">
                <span className="pl-5 w-full h-full text-black/50 flex-[0] py-3 font-medium">
                  boxed.ink/
                </span>
                <Input
                  type="text"
                  placeholder="yourname"
                  defaultValue={sidefolio?.slug}
                  className="flex-[2] pl-0.5 text-base focus-visible:ring-0 shadow-none h-full border-0 rounded-sm  min-w-[8rem] w-full"
                  required
                  onChange={(e) => handleVerifySlug(e)}
                />
                <div className="absolute right-2">
                  {isLoading ? (
                    <Loader2 size={20} className=" animate-spin" />
                  ) : !isAvailable || sidefolio?.slug === field || !field ? (
                    <CirclePlus
                      size={20}
                      className="text-destructive rotate-45"
                    />
                  ) : (
                    <CheckCircle2 size={20} className="text-primary" />
                  )}
                </div>
              </label>
            </div>
          </div>
          <DialogFooter className="flex !justify-between items-center">
            <div>
              {!isAvailable && sidefolio?.slug !== field && (
                <span className="text-destructive  font-bold text-sm">
                  Is already taken
                </span>
              )}
              {sidefolio?.slug === field && (
                <span className="text-destructive  font-bold text-sm">
                  Is my actually name
                </span>
              )}
            </div>
            <Button
              disabled={!isAvailable || sidefolio?.slug === field || !field}
              type="button"
              onClick={handleUpdateSidefolio}
            >
              Save changes
            </Button>
          </DialogFooter>

          <div className="border-t pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-noir" />
              <span className="font-semibold text-sm">Custom domain</span>
              <span className="flex items-center gap-1 rounded-full bg-noir/10 text-noir/60 text-xs font-bold px-2 py-0.5">
                Coming soon
              </span>
              {!isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/15 text-amber-600 text-xs font-bold px-2 py-0.5">
                  <Sparkles size={11} />
                  Pro
                </span>
              )}
            </div>

            {isPremium ? (
              <p className="text-sm text-foreground/70">
                We're still building this - as a Pro member, you'll be the
                first to set one up once it's ready.
              </p>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-noir/5 p-3">
                <p className="text-sm text-foreground/70">
                  Use your own domain instead of boxed.ink/{sidefolio?.slug}.
                </p>
                <Button size="sm" onClick={handleGoToUpgrade}>
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
