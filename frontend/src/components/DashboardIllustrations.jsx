import React from 'react';

// Smooth SVG Sparkline Wave for Stat Cards
export const Sparkline = ({ color = '#4F46E5', className = 'w-24 h-10' }) => {
  return (
    <svg className={className} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 30 C 20 32, 35 15, 50 25 C 65 35, 80 8, 98 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="98" cy="12" r="3" fill={color} />
    </svg>
  );
};

// Modern Empty State Illustration: Clipboard with Checklist (Matches Reference Image)
export const TaskEmptyIllustration = ({ className = 'w-24 h-24' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    <div className="absolute inset-0 rounded-full bg-blue-50 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard base */}
      <rect x="25" y="22" width="50" height="64" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
      {/* Clip top */}
      <rect x="38" y="16" width="24" height="12" rx="4" fill="#3B82F6" />
      <circle cx="50" cy="22" r="2.5" fill="#FFFFFF" />
      {/* Check lines */}
      <path d="M34 38 L38 42 L46 34" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="52" y1="38" x2="68" y2="38" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
      
      <path d="M34 52 L38 56 L46 48" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="52" y1="52" x2="68" y2="52" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />

      <path d="M34 66 L38 70 L46 62" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="52" y1="66" x2="64" y2="66" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
      
      {/* Subtle floating dots */}
      <circle cx="16" cy="40" r="2.5" fill="#BFDBFE" />
      <circle cx="82" cy="30" r="3" fill="#93C5FD" />
      <circle cx="85" cy="65" r="2" fill="#DBEAFE" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Mail & Paper Plane (Matches Reference Image)
export const InvitationEmptyIllustration = ({ className = 'w-24 h-24' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    <div className="absolute inset-0 rounded-full bg-blue-50 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Envelope base */}
      <rect x="22" y="32" width="56" height="42" rx="7" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
      {/* Envelope flap folds */}
      <path d="M24 35 L50 55 L76 35" stroke="#3B82F6" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Heart or shield stamp in center */}
      <rect x="44" y="48" width="12" height="12" rx="3" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M48 54 L50 56 L53 52" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Paper airplane flying */}
      <g transform="translate(62, 14)">
        <path d="M0 12 L18 0 L14 16 L6 13 Z" fill="#3B82F6" />
        <path d="M6 13 L18 0 L10 11 Z" fill="#60A5FA" />
      </g>
      {/* Trail dash */}
      <path d="M52 24 Q 56 22 62 26" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />

      {/* Floating accent dots */}
      <circle cx="18" cy="50" r="2.5" fill="#BFDBFE" />
      <circle cx="82" cy="60" r="2" fill="#93C5FD" />
    </svg>
  </div>
);

// Team Collaboration Banner Illustration
export const TeamBannerIllustration = ({ className = 'w-full h-28' }) => (
  <div className={`${className} flex items-center justify-center overflow-hidden relative`}>
    <svg viewBox="0 0 240 100" fill="none" className="w-48 h-24" xmlns="http://www.w3.org/2000/svg">
      {/* Central avatar */}
      <circle cx="120" cy="40" r="18" fill="#4F46E5" />
      <path d="M102 78 C102 65 110 58 120 58 C130 58 138 65 138 78 Z" fill="#4F46E5" />
      {/* Laptop / Screen */}
      <rect x="100" y="68" width="40" height="24" rx="3" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" />
      <line x1="108" y1="78" x2="132" y2="78" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
      <line x1="112" y1="84" x2="128" y2="84" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />

      {/* Left team member */}
      <circle cx="70" cy="48" r="14" fill="#3B82F6" />
      <path d="M54 82 C54 70 61 64 70 64 C79 64 86 70 86 82 Z" fill="#3B82F6" />

      {/* Right team member */}
      <circle cx="170" cy="48" r="14" fill="#6366F1" />
      <path d="M154 82 C154 70 161 64 170 64 C179 64 186 70 186 82 Z" fill="#6366F1" />

      {/* Floating decorative nodes & links */}
      <circle cx="45" cy="30" r="4" fill="#93C5FD" />
      <circle cx="195" cy="32" r="5" fill="#C7D2FE" />
      <path d="M48 33 L62 42" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M178 44 L191 36" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Folder with Document & Plus (Matches Reference Image)
export const ProjectEmptyIllustration = ({ className = 'w-32 h-32' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    {/* Soft blue cloud backdrop */}
    <div className="absolute inset-0 rounded-full bg-blue-50/80 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Background folder back flap */}
      <path
        d="M26 38 C26 33.5 29.5 30 34 30 L52 30 C54.5 30 56.8 31.2 58.2 33.2 L62 38 L88 38 C92.5 38 96 41.5 96 46 L96 82 C96 86.5 92.5 90 88 90 L34 90 C29.5 90 26 86.5 26 82 Z"
        fill="#EEF2FF"
        stroke="#4F46E5"
        strokeWidth="2.5"
      />
      {/* Paper document peaking out */}
      <rect x="36" y="24" width="46" height="56" rx="4" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2" />
      <line x1="44" y1="36" x2="74" y2="36" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="44" x2="68" y2="44" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="52" x2="60" y2="52" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />

      {/* Folder front flap */}
      <path
        d="M24 48 C24 44 27 41 31 41 L89 41 C93 41 96 44 96 48 L93 84 C93 88 89.5 91 85.5 91 L31.5 91 C27.5 91 24 88 24 84 Z"
        fill="#FFFFFF"
        stroke="#4F46E5"
        strokeWidth="2.5"
      />

      {/* Round Plus Button Badge on lower-right */}
      <g transform="translate(74, 68)">
        <circle cx="14" cy="14" r="13" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M14 9 L14 19 M9 14 L19 14" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* Floating sparkle dots */}
      <path d="M22 28 Q23 31 26 31 Q23 31 22 34 Q22 31 19 31 Q22 31 22 28 Z" fill="#818CF8" />
      <path d="M102 34 Q103 36 105 36 Q103 36 102 38 Q102 36 100 36 Q102 36 102 34 Z" fill="#93C5FD" />
      <circle cx="16" cy="62" r="2" fill="#C7D2FE" />
      <circle cx="106" cy="64" r="2.5" fill="#818CF8" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Two Students / Users (Matches Reference Image)
export const StudentEmptyIllustration = ({ className = 'w-32 h-32' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    {/* Soft blue cloud backdrop */}
    <div className="absolute inset-0 rounded-full bg-blue-50/80 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Primary Left User Silhouette */}
      <circle cx="52" cy="42" r="12" stroke="#4F46E5" strokeWidth="3" fill="#FFFFFF" />
      <path
        d="M32 78 C32 66 41 62 52 62 C63 62 72 66 72 78"
        stroke="#4F46E5"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Secondary Right User Silhouette */}
      <circle cx="78" cy="50" r="9" stroke="#818CF8" strokeWidth="2.6" fill="#FFFFFF" />
      <path
        d="M66 80 C66 71 72 67 80 67 C87 67 92 71 92 80"
        stroke="#818CF8"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Floating sparkle dots */}
      <path d="M22 36 Q23 38 25 38 Q23 38 22 40 Q22 38 20 38 Q22 38 22 36 Z" fill="#818CF8" />
      <path d="M96 38 Q97 40 99 40 Q97 40 96 42 Q96 40 94 40 Q96 40 96 38 Z" fill="#93C5FD" />
      <line x1="88" y1="30" x2="92" y2="26" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="94" y1="34" x2="98" y2="34" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="28" cy="68" r="2" fill="#C7D2FE" />
      <circle cx="102" cy="62" r="2.5" fill="#818CF8" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Invitations Mail with Letter & Confetti (Matches Reference Image)
export const InvitationsPageEmptyIllustration = ({ className = 'w-36 h-36' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    {/* Soft blue cloud backdrop */}
    <div className="absolute inset-0 rounded-full bg-blue-50/80 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 140 140" fill="none" className="w-28 h-28 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Envelope back flap (open triangular flap) */}
      <path
        d="M34 68 L70 42 L106 68"
        stroke="#4F46E5"
        strokeWidth="2.5"
        fill="#EEF2FF"
      />

      {/* Letter sheet sticking out */}
      <rect x="42" y="38" width="56" height="58" rx="5" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2.5" />
      {/* Horizontal text lines on letter */}
      <line x1="52" y1="50" x2="88" y2="50" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="52" y1="58" x2="84" y2="58" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="52" y1="66" x2="76" y2="66" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="52" y1="74" x2="82" y2="74" stroke="#C7D2FE" strokeWidth="2.2" strokeLinecap="round" />

      {/* Envelope front pouch base */}
      <path
        d="M30 65 L70 94 L110 65 L110 102 C110 106 106.5 109 102 109 L38 109 C33.5 109 30 106 30 102 Z"
        fill="#4F46E5"
      />
      {/* Envelope front shadow fold */}
      <path
        d="M30 65 L66 91 C68.5 93 71.5 93 74 91 L110 65 L70 94 Z"
        fill="#4338CA"
        opacity="0.6"
      />

      {/* Floating confetti & celebration sparkles */}
      <rect x="110" y="44" width="7" height="3" rx="1.5" transform="rotate(35 110 44)" fill="#F43F5E" />
      <rect x="116" y="58" width="6" height="2.5" rx="1.2" transform="rotate(-25 116 58)" fill="#818CF8" />
      <rect x="24" y="52" width="6" height="2.5" rx="1.2" transform="rotate(-40 24 52)" fill="#818CF8" />
      
      {/* Floating cross / star sparkles */}
      <path d="M108 76 Q109 78 111 78 Q109 78 108 80 Q108 78 106 78 Q108 78 108 76 Z" fill="#93C5FD" />
      <path d="M26 70 Q27 72 29 72 Q27 72 26 74 Q26 72 24 72 Q26 72 26 70 Z" fill="#F43F5E" />
      <circle cx="28" cy="40" r="2.5" fill="#C7D2FE" />
      <circle cx="118" cy="88" r="2" fill="#818CF8" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Folder with Document & Compass Badge (Matches Recommendations Reference Image)
export const RecommendationsEmptyIllustration = ({ className = 'w-36 h-36' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    {/* Soft blue cloud backdrop */}
    <div className="absolute inset-0 rounded-full bg-blue-50/80 dark:bg-blue-950/40 animate-pulse" />
    <svg viewBox="0 0 140 140" fill="none" className="w-28 h-28 relative z-10" xmlns="http://www.w3.org/2000/svg">
      {/* Background folder back flap */}
      <path
        d="M32 46 C32 41 36 37 41 37 L62 37 C65 37 67.5 38.5 69 41 L73 46 L104 46 C109 46 113 50 113 55 L113 96 C113 101 109 105 104 105 L41 105 C36 105 32 101 32 96 Z"
        fill="#EEF2FF"
        stroke="#4F46E5"
        strokeWidth="2.5"
      />
      {/* Paper document peaking out */}
      <rect x="44" y="30" width="54" height="66" rx="4" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2.2" />
      <line x1="54" y1="44" x2="88" y2="44" stroke="#C7D2FE" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="54" y1="52" x2="82" y2="52" stroke="#C7D2FE" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="54" y1="60" x2="72" y2="60" stroke="#C7D2FE" strokeWidth="2.2" strokeLinecap="round" />

      {/* Folder front flap */}
      <path
        d="M30 58 C30 53 34 49 39 49 L105 49 C110 49 114 53 114 58 L111 98 C111 103 107 106 102 106 L38 106 C33 106 30 103 30 98 Z"
        fill="#FFFFFF"
        stroke="#4F46E5"
        strokeWidth="2.5"
      />

      {/* Round Compass Badge on lower-right */}
      <g transform="translate(86, 78)">
        <circle cx="16" cy="16" r="16" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.8" />
        {/* Compass needle */}
        <polygon points="16,8 20,16 16,14 12,16" fill="#FFFFFF" />
        <polygon points="16,24 20,16 16,18 12,16" fill="#C7D2FE" />
        <circle cx="16" cy="16" r="2" fill="#4F46E5" />
      </g>

      {/* Floating sparkles and pluses */}
      <path d="M120 44 L120 50 M117 47 L123 47" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 36 Q27 38 29 38 Q27 38 26 40 Q26 38 24 38 Q26 38 26 36 Z" fill="#818CF8" />
      <path d="M124 74 Q125 76 127 76 Q125 76 124 78 Q124 76 122 76 Q124 76 124 74 Z" fill="#93C5FD" />
      <circle cx="22" cy="74" r="2.2" fill="#C7D2FE" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Checklist Squircle (Matches Todo Reference Image)
export const TodoEmptyIllustration = ({ className = 'w-24 h-24' }) => (
  <div className={`${className} mx-auto rounded-3xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center`}>
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
      {/* Check 1 */}
      <path d="M12 15 L15 18 L20 12" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="15" x2="36" y2="15" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Check 2 */}
      <path d="M12 24 L15 27 L20 21" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="24" x2="36" y2="24" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Check 3 */}
      <path d="M12 33 L15 36 L20 30" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="33" x2="36" y2="33" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

// Modern Empty State Illustration: Bell with Cloud Backdrop & Sparkles (Matches Notifications Reference Image)
export const NotificationsEmptyIllustration = ({ className = 'w-36 h-28' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center`}>
    <svg viewBox="0 0 160 110" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Soft cloudy background blobs */}
      <path
        d="M38 72 C32 72 28 67 29 62 C29 57 33 53 38 53 C39 45 45 40 53 40 C58 40 63 43 65 47 C68 43 73 41 78 43 C84 45 88 51 87 57 C92 58 96 63 95 68 C95 72 90 72 87 72 Z"
        fill="#F1F5F9"
        className="dark:fill-slate-800/40"
      />
      <path
        d="M74 72 C69 72 65 68 66 63 C67 58 71 55 76 55 C77 48 83 43 90 43 C94 43 98 45 101 49 C104 45 109 43 114 45 C120 47 123 52 123 58 C128 59 132 63 131 68 C131 72 127 72 124 72 Z"
        fill="#F8FAFC"
        className="dark:fill-slate-800/25"
      />

      {/* Floating Sparkles & Pluses */}
      <path d="M48 38 L48 44 M45 41 L51 41" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M112 36 L112 42 M109 39 L115 39" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M126 60 L126 66 M123 63 L129 63" stroke="#C7D2FE" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="34" cy="48" r="2" fill="#C7D2FE" />
      
      {/* Central Bell Squircle Container */}
      <g transform="translate(56, 26)">
        <rect
          x="0"
          y="0"
          width="48"
          height="48"
          rx="18"
          fill="#EEF2FF"
          className="dark:fill-indigo-950/70"
          stroke="#E0E7FF"
          strokeWidth="1.5"
        />
        {/* Bell Icon inside badge */}
        <path
          d="M24 13 C22.34 13 21 14.34 21 16 C21 16.35 21.06 16.68 21.17 17 C18.8 18.25 17 21 17 25 C17 29.5 15.5 31.5 14 32.5 L34 32.5 C32.5 31.5 31 29.5 31 25 C31 21 29.2 18.25 26.83 17 C26.94 16.68 27 16.35 27 16 C27 14.34 25.66 13 24 13 Z"
          fill="none"
          stroke="#4F46E5"
          className="dark:stroke-[#818CF8]"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Clapper */}
        <path
          d="M21.5 33 C21.5 34.38 22.62 35.5 24 35.5 C25.38 35.5 26.5 34.38 26.5 33"
          stroke="#4F46E5"
          className="dark:stroke-[#818CF8]"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  </div>
);

// Modern Empty State Illustration: Holographic Glowing Project Cards with Graduation Cap (Matches Join Requests Reference Image)
export const JoinRequestsEmptyIllustration = ({ className = 'w-72 sm:w-80 h-64' }) => (
  <div className={`${className} mx-auto relative flex items-center justify-center select-none`}>
    <svg viewBox="0 0 300 250" fill="none" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Glows */}
        <radialGradient id="capRadialGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="platformShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#4338CA" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>

        {/* Card Gradients */}
        <linearGradient id="centralCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#253265" />
          <stop offset="40%" stopColor="#1A244D" />
          <stop offset="100%" stopColor="#0E1635" />
        </linearGradient>

        <linearGradient id="bgCardLeftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C2754" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0A1028" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="bgCardRightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C2754" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0A1028" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="avatarCentralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Cap 3D Gradients */}
        <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>

        {/* Filters */}
        <filter id="capGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="cardGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Atmospheric radial glow behind the top cap */}
      <circle cx="150" cy="55" r="95" fill="url(#capRadialGlow)" />

      {/* Ground platform glow & shadow */}
      <ellipse cx="150" cy="224" rx="105" ry="12" fill="url(#platformShadow)" />

      {/* Layer 1: Left Rotated Card */}
      <g transform="translate(48, 88) rotate(-14 42.5 55)">
        <rect
          x="0"
          y="0"
          width="85"
          height="115"
          rx="14"
          fill="url(#bgCardLeftGrad)"
          stroke="#4F46E5"
          strokeOpacity="0.3"
          strokeWidth="1.2"
        />
        {/* Subtle avatar silhouette */}
        <circle cx="42.5" cy="42" r="16" fill="#312E81" fillOpacity="0.6" />
        <circle cx="42.5" cy="38" r="6.5" fill="#6366F1" fillOpacity="0.65" />
        <path d="M29 52 C29 46 35 44 42.5 44 C50 44 56 46 56 52 Z" fill="#6366F1" fillOpacity="0.65" />
        {/* Subtle lines */}
        <rect x="25" y="70" width="35" height="4" rx="2" fill="#4338CA" fillOpacity="0.4" />
        <rect x="28" y="78" width="28" height="3" rx="1.5" fill="#4338CA" fillOpacity="0.25" />
      </g>

      {/* Layer 2: Right Rotated Card */}
      <g transform="translate(166, 88) rotate(14 42.5 55)">
        <rect
          x="0"
          y="0"
          width="85"
          height="115"
          rx="14"
          fill="url(#bgCardRightGrad)"
          stroke="#4F46E5"
          strokeOpacity="0.3"
          strokeWidth="1.2"
        />
        {/* Subtle avatar silhouette */}
        <circle cx="42.5" cy="42" r="16" fill="#312E81" fillOpacity="0.6" />
        <circle cx="42.5" cy="38" r="6.5" fill="#6366F1" fillOpacity="0.65" />
        <path d="M29 52 C29 46 35 44 42.5 44 C50 44 56 46 56 52 Z" fill="#6366F1" fillOpacity="0.65" />
        {/* Subtle lines */}
        <rect x="25" y="70" width="35" height="4" rx="2" fill="#4338CA" fillOpacity="0.4" />
        <rect x="28" y="78" width="28" height="3" rx="1.5" fill="#4338CA" fillOpacity="0.25" />
      </g>

      {/* Layer 3: Central Large Card */}
      <g filter="url(#cardGlowFilter)">
        <rect
          x="98"
          y="68"
          width="104"
          height="138"
          rx="18"
          fill="url(#centralCardGrad)"
          stroke="#60A5FA"
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />
        {/* Card Top Inner Glass Rim Highlight */}
        <path
          d="M102 86 C102 76 109 70 118 70 L182 70 C191 70 198 76 198 86"
          stroke="#FFFFFF"
          strokeOpacity="0.2"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Central Avatar Circle */}
        <circle cx="150" cy="110" r="22" fill="url(#avatarCentralGrad)" />
        {/* Avatar Silhouette */}
        <circle cx="150" cy="104" r="8.5" fill="#FFFFFF" />
        <path d="M133 124 C133 116 140 114 150 114 C160 114 167 116 167 124 Z" fill="#FFFFFF" />

        {/* Profile info pill lines */}
        <rect x="126" y="145" width="48" height="5.5" rx="2.75" fill="#A5B4FC" fillOpacity="0.85" />
        <rect x="126" y="156" width="32" height="4.5" rx="2.25" fill="#818CF8" fillOpacity="0.4" />

        {/* Circular Verification Check Badge on lower right */}
        <g transform="translate(186, 186)">
          <circle cx="0" cy="0" r="14" fill="url(#badgeGrad)" stroke="#0E1635" strokeWidth="2.8" />
          <path
            d="M-5 0.5 L-1.5 4 L5 -3"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </g>

      {/* Layer 4: Floating 3D Graduation Cap with Glow */}
      <g transform="translate(150, 42)">
        {/* Subtle cap aura */}
        <circle cx="0" cy="-5" r="32" fill="#818CF8" fillOpacity="0.25" filter="blur(8px)" />

        {/* Cap skullcap bottom */}
        <path
          d="M-22 4 C-22 14 -12 20 0 20 C12 20 22 14 22 4 Z"
          fill="#312E81"
          stroke="#6366F1"
          strokeWidth="1.4"
        />

        {/* Mortarboard rhombic top */}
        <polygon
          points="0,-18 42,-3 0,11 -42,-3"
          fill="url(#capTopGrad)"
          stroke="#A5B4FC"
          strokeWidth="1.8"
        />

        {/* 3D bevel edge */}
        <polygon
          points="0,11 42,-3 42,0 0,14 -42,0 -42,-3"
          fill="#1E1B4B"
        />

        {/* Center button */}
        <circle cx="0" cy="-4" r="3" fill="#E0E7FF" />

        {/* Tassel line & brush */}
        <path
          d="M0 -4 C16 -2 30 5 32 16"
          stroke="#C7D2FE"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="32" cy="18" r="1.8" fill="#FFFFFF" />
      </g>

      {/* Floating Sparkles & Stars */}
      <path d="M82 48 L82 56 M78 52 L86 52" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M222 52 L222 60 M218 56 L226 56" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M128 16 L128 22 M125 19 L131 19" stroke="#C7D2FE" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="74" cy="78" r="2" fill="#93C5FD" fillOpacity="0.8" />
      <circle cx="230" cy="88" r="2" fill="#A5B4FC" fillOpacity="0.8" />
    </svg>
  </div>
);
