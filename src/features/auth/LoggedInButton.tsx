import { currentUser } from "@/auth/current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { SignInButton } from "./SignInButton";
import { LoggedInDropdown } from "./LoggedInDropdown";
import { StarFilledIcon } from "@radix-ui/react-icons";

export const LoggedInButton = ({ user, sidefolio }: any) => {
  return (
    <LoggedInDropdown sidefolio={sidefolio}>
      <div className="relative w-fit">
        <Avatar className="size-9 cursor-pointer ">
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          {sidefolio?.image ? (
            <AvatarImage
              src={sidefolio.image}
              className=" object-cover"
              alt={`${sidefolio.name ?? "-"}'s profile picture`}
            />
          ) : (
            <AvatarImage
              src={"/noAvatar.png"}
              className=" object-cover aspect-square"
            />
          )}
        </Avatar>
        {user.plan === "PREMIUM_ONE" || user.plan === "PREMIUM_LIFE" ? (
          <svg
            fill="#5584FA"
            viewBox="0 -5.47 56.254 56.254"
            xmlns="http://www.w3.org/2000/svg"
            width={15}
            className="absolute bottom-0 end-0 p-[2px] rounded-full bg-white"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                id="diamond_premium"
                data-name="diamond premium"
                d="M494.211,354.161l1.174-1.366H482.552L469.8,367.5h12.94Zm-8.4,13.336H510.05l-6.589-7.664-5.528-6.429-8.354,9.713Zm-15.856,2.329,24.1,25.356L482.53,369.826Zm40.824,0h-2.1l-8.829,0H485.083l12.774,28.1.082.178,12.17-26.8Zm-8.94,25.322,24.057-25.32H513.337Zm24.215-27.65L513.3,352.8H500.478l12.642,14.7Z"
                transform="translate(-469.802 -352.795)"
              ></path>{" "}
            </g>
          </svg>
        ) : user.plan === "SUPPORTER" ? (
          <div className="absolute bottom-0 end-0 p-[3px] rounded-full bg-white">
            <Heart size={12} className="fill-red-500 text-red-500" />
          </div>
        ) : null}
      </div>
    </LoggedInDropdown>
  );
};
