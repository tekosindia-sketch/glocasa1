'use client';
import { motion } from 'framer-motion';

/**
 * STRNGTH's coach mascot — a friendly blue elephant with a green headband
 * holding a clipboard and pencil. Pure SVG so it scales crisply on the dark UI.
 */
export default function Mascot({ size = 150 }: { size?: number }) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="el-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74aee0" />
            <stop offset="100%" stopColor="#5a91cf" />
          </linearGradient>
          <linearGradient id="el-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67c267" />
            <stop offset="100%" stopColor="#4aa64a" />
          </linearGradient>
          <linearGradient id="el-pencil" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f6c84c" />
            <stop offset="100%" stopColor="#e3ad36" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="60" cy="112" rx="30" ry="4.5" fill="#000" opacity="0.22" />

        {/* Pencil (behind body, right) */}
        <g transform="rotate(22 92 80)">
          <rect x="88" y="60" width="7" height="26" fill="url(#el-pencil)" />
          <rect x="88" y="56" width="7" height="5" rx="1.5" fill="#f2a0ad" />
          <rect x="88" y="54" width="7" height="2.5" rx="1" fill="#cfcfdd" />
          <path d="M88 86 L95 86 L91.5 94 Z" fill="#e7c79a" />
          <path d="M90 90.5 L93 90.5 L91.5 94 Z" fill="#3a3a45" />
        </g>

        {/* Ears */}
        <ellipse cx="29" cy="50" rx="13" ry="17" fill="#5a91cf" />
        <ellipse cx="91" cy="50" rx="13" ry="17" fill="#5a91cf" />
        <ellipse cx="31" cy="51" rx="7" ry="10" fill="#4d82bd" />
        <ellipse cx="89" cy="51" rx="7" ry="10" fill="#4d82bd" />

        {/* Lower body */}
        <rect x="39" y="68" width="42" height="42" rx="19" fill="url(#el-body)" />
        <ellipse cx="60" cy="90" rx="14" ry="15" fill="#a9cef0" />
        {/* Feet + toes */}
        <rect x="45" y="103" width="13" height="9" rx="4" fill="#5a91cf" />
        <rect x="62" y="103" width="13" height="9" rx="4" fill="#5a91cf" />
        {[48.5, 51.5, 54.5, 65.5, 68.5, 71.5].map((x, i) => (
          <circle key={i} cx={x} cy="109" r="0.9" fill="#3f6ea6" />
        ))}

        {/* Hands (holding clipboard + pencil) */}
        <circle cx="47" cy="86" r="6.5" fill="#6aa3d8" />
        <circle cx="79" cy="84" r="6" fill="#6aa3d8" />

        {/* Head tuft */}
        <circle cx="53" cy="27" r="5" fill="#6aa3d8" />
        <circle cx="60" cy="24.5" r="5.5" fill="#6aa3d8" />
        <circle cx="67" cy="27" r="5" fill="#6aa3d8" />

        {/* Head */}
        <rect x="31" y="26" width="58" height="50" rx="25" fill="url(#el-body)" />

        {/* Headband */}
        <path d="M33 40 Q60 33 87 40 L87 47 Q60 41 33 47 Z" fill="url(#el-band)" />
        <path d="M33 46.5 Q60 40.5 87 46.5" stroke="#3d8c3d" strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* Eyes */}
        <circle cx="50" cy="53" r="9" fill="#ffffff" />
        <circle cx="70" cy="53" r="9" fill="#ffffff" />
        <circle cx="51.5" cy="54" r="5" fill="#1f2c3d" />
        <circle cx="71.5" cy="54" r="5" fill="#1f2c3d" />
        <circle cx="49.5" cy="51.5" r="2" fill="#ffffff" />
        <circle cx="69.5" cy="51.5" r="2" fill="#ffffff" />
        <circle cx="53" cy="56" r="1" fill="#ffffff" opacity="0.8" />
        <circle cx="73" cy="56" r="1" fill="#ffffff" opacity="0.8" />

        {/* Cheeks */}
        <ellipse cx="41" cy="62" rx="4" ry="3" fill="#f3a3b1" opacity="0.75" />
        <ellipse cx="79" cy="62" rx="4" ry="3" fill="#f3a3b1" opacity="0.75" />

        {/* Trunk */}
        <path d="M56 60 Q56 70 60 70 Q64 70 64 60 Z" fill="#67a0d6" />
        <path d="M57.5 67 Q60 69 62.5 67" stroke="#4d82bd" strokeWidth="1" fill="none" />

        {/* Smile */}
        <path d="M52 65 Q60 71 68 65" stroke="#3a5f8a" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Clipboard (front, left) */}
        <rect x="25" y="73" width="22" height="30" rx="3" fill="#7a4a2e" />
        <rect x="28" y="78" width="16" height="22" rx="1.5" fill="#f4eeda" />
        <rect x="31.5" y="71.5" width="9" height="5" rx="2" fill="#cda63f" />
        {[82, 86, 90, 94].map((y, i) => (
          <rect key={i} x="31" y={y} width={i === 3 ? 8 : 11} height="1.4" rx="0.7" fill="#c9bfa0" />
        ))}
      </svg>
    </motion.div>
  );
}
