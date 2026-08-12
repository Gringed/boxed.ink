"use client";

const TikTokGlyph = ({ className }: { className?: string }) => (
  <span
    className={className}
    role="img"
    aria-label="TikTok"
    style={{ display: "inline-flex", lineHeight: 0 }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect width="40" height="40" rx="10" fill="white" />
      <path
        d="M25.1101 16.6705C26.6565 17.7754 28.5508 18.4254 30.5969 18.4254V14.4903C30.2096 14.4904 29.8235 14.4501 29.4446 14.3698V17.4673C27.3988 17.4673 25.5046 16.8172 23.9579 15.7125V23.7429C23.9579 27.7601 20.6997 31.0165 16.6807 31.0165C15.1811 31.0165 13.7873 30.5633 12.6295 29.7863C13.9509 31.1367 15.7938 31.9745 17.8327 31.9745C21.852 31.9745 25.1103 28.7181 25.1103 24.7007L25.1101 16.6705ZM26.5315 12.7005C25.7414 11.8376 25.2224 10.7224 25.1101 9.48953V8.9834H24.0183C24.2931 10.5504 25.2306 11.8891 26.5315 12.7005ZM15.1715 26.7036C14.73 26.125 14.4914 25.4171 14.4924 24.6892C14.4924 22.8519 15.9827 21.3622 17.8214 21.3622C18.164 21.3621 18.5046 21.4146 18.8312 21.5181V17.4951C18.4495 17.4428 18.0644 17.4206 17.6794 17.4287V20.5601C17.3526 20.4565 17.0118 20.4039 16.6691 20.4043C14.8305 20.4043 13.3403 21.8938 13.3403 23.7314C13.3403 25.0306 14.0852 26.1555 15.1715 26.7036Z"
        fill="#FF004F"
      />
      <path
        d="M23.9579 15.7125C25.5046 16.8172 27.3988 17.4673 29.4446 17.4673V14.3698C28.3026 14.1266 27.2916 13.5301 26.5315 12.7005C25.2306 11.8891 24.2931 10.5504 24.0183 8.9834H21.1499V24.7006C21.1434 26.533 19.6557 28.0165 17.821 28.0165C16.7398 28.0165 15.7798 27.5015 15.1715 26.7036C14.0852 26.1555 13.3403 25.0306 13.3403 23.7314C13.3403 21.8938 14.8305 20.4043 16.6691 20.4043C17.0214 20.4043 17.3609 20.4591 17.6794 20.5601V17.4287C13.731 17.5103 10.5551 20.7349 10.5551 24.7007C10.5551 26.6804 11.3461 28.475 12.6295 29.7863C13.7873 30.5633 15.1811 31.0165 16.6807 31.0165C20.6997 31.0165 23.9579 27.7601 23.9579 23.7429V15.7125Z"
        fill="black"
      />
      <path
        d="M29.4446 14.3698L29.4448 13.5322C28.4149 13.5337 27.4052 13.2456 26.5315 12.7005C27.305 13.5468 28.3233 14.1304 29.4446 14.3698ZM24.0183 8.9834C23.9921 8.83364 23.972 8.68284 23.9581 8.53153V8.02539H19.9979V23.7428C19.9916 25.5748 18.5039 27.0586 16.669 27.0586C16.1304 27.0586 15.622 26.9307 15.1715 26.7036C15.7798 27.5015 16.7398 28.0165 17.821 28.0165C19.6557 28.0165 21.1434 26.533 21.1499 24.7006V8.9834H24.0183ZM17.6794 17.4287L17.6795 16.5372C17.3486 16.492 17.015 16.4693 16.681 16.4695C12.6615 16.4694 9.40332 19.7259 9.40332 23.7428C9.40332 26.2611 10.6836 28.4807 12.6295 29.7863C11.3461 28.475 10.5551 26.6804 10.5551 24.7007C10.5551 20.7349 13.731 17.5103 17.6794 17.4287Z"
        fill="#00F2EA"
      />
    </svg>
  </span>
);

const SIDE_CARD: React.CSSProperties = {
  height: "62%",
  aspectRatio: "9 / 16",
  background: "rgba(128, 128, 128, 0.12)",
  border: "1px solid rgba(128, 128, 128, 0.15)",
};

// Empty-state stand-in for the 3 latest TikToks, shown on an unconnected
// block wherever the "add image" placeholder would otherwise sit. Sized off
// the container height rather than its width — the block is much wider than
// it is tall in some presets, and a width-based 9:16 card would overflow it.
export const TikTokVideosPlaceholder = ({
  onClick,
}: {
  onClick?: () => void;
}) => {
  // Interactive only in the editor, where it opens the connect dialog. On a
  // published page there's nothing to click, so it stays a plain element
  // rather than a button that does nothing.
  const Tag = onClick ? "button" : "div";
  return (
  <Tag
    {...(onClick
      ? {
          type: "button" as const,
          onClick,
          onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
        }
      : {})}
    className="absolute inset-0 flex items-center justify-center"
  >
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute rounded-lg overflow-hidden"
        style={{
          ...SIDE_CARD,
          left: "8%",
          top: "50%",
          transform: "translateY(-50%) rotate(-8deg)",
          zIndex: 1,
        }}
      />
      <div
        className="absolute rounded-lg overflow-hidden"
        style={{
          ...SIDE_CARD,
          right: "8%",
          top: "50%",
          transform: "translateY(-50%) rotate(8deg)",
          zIndex: 1,
        }}
      />
      <div
        className="relative flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          height: "78%",
          aspectRatio: "9 / 16",
          zIndex: 2,
          background: "rgb(245, 245, 245)",
          border: "1px solid rgb(235, 235, 235)",
          boxShadow: "rgba(0, 0, 0, 0.04) 0px 1px 3px",
        }}
      >
        <TikTokGlyph className="pointer-events-none w-2/3 opacity-40" />
      </div>
    </div>
  </Tag>
  );
};
