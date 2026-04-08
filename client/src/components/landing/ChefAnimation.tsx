export default function ChefAnimation() {
  return (
    <div className="relative w-60 h-72 sm:w-72 sm:h-80 mx-auto">
      <svg
        viewBox="0 0 400 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-hero-bounce"
      >
        {/* Ground shadow */}
        <ellipse cx="200" cy="425" rx="70" ry="10" fill="#D97706" opacity="0.1" />

        {/* ===== LEFT ARM + TRAY (behind body) ===== */}
        <g>
          {/* Arm connected from shoulder */}
          <path d="M140 230 C120 235 100 240 80 242 C65 244 50 242 42 238" stroke="#FDDCAB" strokeWidth="28" strokeLinecap="round" fill="none" />
          {/* Sleeve over shoulder joint */}
          <path d="M145 228 C130 232 118 236 108 238" stroke="#FF9F6B" strokeWidth="32" strokeLinecap="round" fill="none" />
          {/* Hand */}
          <circle cx="42" cy="237" r="15" fill="#FDDCAB" />
          {/* Fingers gripping tray */}
          <circle cx="34" cy="230" r="6" fill="#FDDCAB" />
          <circle cx="42" cy="226" r="6" fill="#FDDCAB" />
          <circle cx="50" cy="228" r="6" fill="#FDDCAB" />
          {/* Tray */}
          <rect x="8" y="222" width="82" height="9" rx="4.5" fill="#C9A96E" />
          <rect x="12" y="219" width="74" height="5" rx="2.5" fill="#E8D5A8" />
        </g>

        {/* ===== RIGHT ARM WAVING ===== */}
        <g className="chef-arm-right" style={{ transformOrigin: '260px 230px' }}>
          {/* Arm connected from shoulder */}
          <path d="M260 230 C280 220 305 200 325 180 C338 168 348 158 355 148" stroke="#FDDCAB" strokeWidth="28" strokeLinecap="round" fill="none" />
          {/* Sleeve over shoulder joint */}
          <path d="M255 232 C270 224 285 216 298 206" stroke="#FF9F6B" strokeWidth="32" strokeLinecap="round" fill="none" />
          {/* Hand */}
          <circle cx="355" cy="147" r="16" fill="#FDDCAB" />
          {/* Open fingers waving */}
          <circle cx="344" cy="132" r="7" fill="#FDDCAB" />
          <circle cx="354" cy="128" r="7" fill="#FDDCAB" />
          <circle cx="364" cy="132" r="7" fill="#FDDCAB" />
          <circle cx="370" cy="142" r="6" fill="#FDDCAB" />
        </g>

        {/* ===== BODY ===== */}
        <rect x="138" y="215" width="124" height="115" rx="22" fill="#FF9F6B" />
        {/* Rounded shoulders */}
        <circle cx="144" cy="230" r="22" fill="#FF9F6B" />
        <circle cx="256" cy="230" r="22" fill="#FF9F6B" />

        {/* Apron */}
        <path d="M155 228 L155 322 Q155 330 163 330 L237 330 Q245 330 245 322 L245 228 Q200 215 155 228Z" fill="white" stroke="#FBBF24" strokeWidth="2" />
        {/* Apron pocket */}
        <rect x="178" y="275" width="44" height="28" rx="8" fill="#FFF7ED" stroke="#FBBF24" strokeWidth="1.5" />
        {/* Apron strings */}
        <path d="M155 240 Q128 250 132 272" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M245 240 Q272 250 268 272" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Buttons */}
        <circle cx="200" cy="248" r="5" fill="#FBBF24" />
        <circle cx="200" cy="265" r="5" fill="#FBBF24" />

        {/* ===== NECK ===== */}
        <rect x="184" y="195" width="32" height="28" rx="14" fill="#FDDCAB" />

        {/* ===== HEAD ===== */}
        <circle cx="200" cy="148" r="58" fill="#FDDCAB" />

        {/* ===== EYES - big and friendly ===== */}
        {/* Left eye */}
        <ellipse cx="180" cy="145" rx="10" ry="12" fill="white" />
        <ellipse cx="182" cy="147" rx="6" ry="7" fill="#3B2314" />
        <circle cx="185" cy="143" r="3" fill="white" />

        {/* Right eye */}
        <ellipse cx="220" cy="145" rx="10" ry="12" fill="white" />
        <ellipse cx="218" cy="147" rx="6" ry="7" fill="#3B2314" />
        <circle cx="221" cy="143" r="3" fill="white" />

        {/* Rosy cheeks */}
        <ellipse cx="168" cy="162" rx="12" ry="7" fill="#FFB4B4" opacity="0.4" />
        <ellipse cx="232" cy="162" rx="12" ry="7" fill="#FFB4B4" opacity="0.4" />

        {/* Nose */}
        <circle cx="200" cy="155" r="4" fill="#F0B87A" />

        {/* Happy smile */}
        <path d="M184 170 Q200 186 216 170" stroke="#3B2314" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* ===== CHEF HAT ===== */}
        <rect x="152" y="92" width="96" height="18" rx="5" fill="white" stroke="#FBBF24" strokeWidth="2" />
        <rect x="156" y="97" width="88" height="6" rx="3" fill="#FBBF24" opacity="0.3" />
        <circle cx="172" cy="70" r="28" fill="white" stroke="#F3E8D0" strokeWidth="1.5" />
        <circle cx="200" cy="58" r="34" fill="white" stroke="#F3E8D0" strokeWidth="1.5" />
        <circle cx="228" cy="70" r="28" fill="white" stroke="#F3E8D0" strokeWidth="1.5" />

        {/* ===== LEGS ===== */}
        <rect x="166" y="326" width="28" height="55" rx="14" fill="#6B9BD2" />
        <rect x="206" y="326" width="28" height="55" rx="14" fill="#6B9BD2" />
        {/* Shoes */}
        <ellipse cx="180" cy="384" rx="20" ry="10" fill="#5B4130" />
        <ellipse cx="220" cy="384" rx="20" ry="10" fill="#5B4130" />

        {/* ===== BAKED GOODS ON TRAY ===== */}
        {/* Cupcake */}
        <g style={{ animation: 'pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.6s both' }}>
          <rect x="18" y="204" width="22" height="18" rx="4" fill="#D4A06A" />
          <path d="M16 204 Q29 185 42 204" fill="#FFB4C8" />
          <circle cx="29" cy="193" r="5" fill="#EF4444" />
          <circle cx="27" cy="191" r="1.5" fill="white" opacity="0.6" />
        </g>
        {/* Cookie */}
        <g style={{ animation: 'pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.9s both' }}>
          <circle cx="58" cy="212" r="13" fill="#E8B862" />
          <circle cx="53" cy="208" r="2.5" fill="#6B4423" />
          <circle cx="62" cy="214" r="2.5" fill="#6B4423" />
          <circle cx="54" cy="217" r="2" fill="#6B4423" />
        </g>
        {/* Bread */}
        <g style={{ animation: 'pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s both' }}>
          <ellipse cx="84" cy="214" rx="12" ry="9" fill="#DBA55A" />
          <path d="M74 212 Q84 206 94 212" stroke="#C9923E" strokeWidth="1.5" fill="none" />
        </g>
      </svg>

      {/* Steam from tray */}
      <div className="absolute left-[8%] top-[44%] flex gap-2">
        <span className="text-orange-300/40 text-sm animate-steam delay-1000">~</span>
        <span className="text-orange-300/40 text-sm animate-steam delay-1300">~</span>
      </div>

      {/* Sparkles */}
      <span className="absolute -top-2 left-[15%] text-lg animate-sparkle delay-800">✨</span>
      <span className="absolute top-[8%] right-[5%] text-base animate-sparkle delay-1200">✨</span>
      <span className="absolute top-[55%] -right-[5%] text-base animate-sparkle delay-1500">💛</span>
    </div>
  );
}
