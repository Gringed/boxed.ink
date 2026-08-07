export const SignInIllustration = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 420 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <filter id="signinCard" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="4"
          floodColor="#0A0C12"
          floodOpacity="0.08"
        />
      </filter>
    </defs>

    {/* left column: profile info, like the sidebar in the app */}
    <circle cx="55" cy="46" r="24" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
    <circle cx="55" cy="46" r="24" fill="none" stroke="#2FBF71" strokeWidth="2.5" />
    <rect x="20" y="86" width="70" height="9" rx="4.5" fill="#181B23" />
    <rect x="20" y="102" width="62" height="6" rx="3" fill="#9CA3AF" />
    <rect x="20" y="114" width="46" height="6" rx="3" fill="#9CA3AF" />
    <path
      d="M26 138c0-5 4.5-8.5 9-8.5s9 3.5 9 8.5c0 6-9 13-9 13s-9-7-9-13Z"
      fill="none"
      stroke="#2FBF71"
      strokeWidth="2"
    />
    <circle cx="35" cy="137.5" r="2.5" fill="#2FBF71" />
    <rect x="52" y="134" width="38" height="6" rx="3" fill="#D1D5DB" />

    {/* right area: block grid, like the editor canvas */}

    {/* text block */}
    <rect
      x="130"
      y="20"
      width="120"
      height="100"
      rx="18"
      fill="white"
      stroke="#E5E7EB"
      strokeWidth="1.5"
      filter="url(#signinCard)"
    />
    <rect x="146" y="48" width="84" height="7" rx="3.5" fill="#181B23" />
    <rect x="146" y="64" width="72" height="6" rx="3" fill="#D1D5DB" />
    <rect x="146" y="76" width="60" height="6" rx="3" fill="#D1D5DB" />
    <rect x="146" y="88" width="68" height="6" rx="3" fill="#D1D5DB" />

    {/* image block */}
    <rect
      x="266"
      y="20"
      width="120"
      height="100"
      rx="18"
      fill="#F3F4F6"
      stroke="#E5E7EB"
      strokeWidth="1.5"
      filter="url(#signinCard)"
    />
    <circle cx="304" cy="56" r="9" fill="#D1D5DB" />
    <path d="M280 96l20-22 16 14 18-20 22 28z" fill="#D1D5DB" />

    {/* twitch card */}
    <rect
      x="130"
      y="136"
      width="120"
      height="100"
      rx="18"
      fill="white"
      stroke="#E5E7EB"
      strokeWidth="1.5"
      filter="url(#signinCard)"
    />
    <circle cx="154" cy="162" r="12" fill="#F3F4F6" stroke="#E5E7EB" />
    <rect x="174" y="155" width="60" height="7" rx="3.5" fill="#181B23" />
    <circle cx="174" cy="172" r="3" fill="#EB0400" />
    <rect x="182" y="169" width="34" height="6" rx="3" fill="#9CA3AF" />
    <rect
      x="146"
      y="196"
      width="88"
      height="24"
      rx="12"
      fill="white"
      stroke="#9146FF"
      strokeWidth="1.5"
    />
    <rect x="162" y="205" width="56" height="6" rx="3" fill="#9146FF" />

    {/* youtube card, with a cursor showing you can drag it */}
    <g filter="url(#signinCard)">
      <rect
        x="266"
        y="136"
        width="120"
        height="100"
        rx="18"
        fill="white"
        stroke="#E5E7EB"
        strokeWidth="1.5"
      />
      <circle cx="290" cy="162" r="12" fill="#F3F4F6" stroke="#E5E7EB" />
      <rect x="310" y="155" width="60" height="7" rx="3.5" fill="#181B23" />
      <rect x="310" y="169" width="66" height="6" rx="3" fill="#9CA3AF" />
      <rect
        x="282"
        y="196"
        width="88"
        height="24"
        rx="12"
        fill="white"
        stroke="#FF0000"
        strokeWidth="1.5"
      />
      <rect x="298" y="205" width="56" height="6" rx="3" fill="#FF0000" />
    </g>
    <g transform="translate(354 128)" filter="url(#signinCard)">
      <path
        d="M0 0 L0 20 L5 15.8 L8.2 23.4 L12.2 21.6 L9 14 L15.3 14 Z"
        fill="#181B23"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </g>

    {/* add-a-block affordance, matching the outline "+" button in the editor */}
    <circle
      cx="396"
      cy="246"
      r="16"
      fill="white"
      stroke="#D1D5DB"
      strokeWidth="1.5"
      filter="url(#signinCard)"
    />
    <rect x="389.5" y="245" width="13" height="2.5" rx="1.25" fill="#181B23" />
    <rect x="395" y="239.5" width="2.5" height="13" rx="1.25" fill="#181B23" />
  </svg>
);
