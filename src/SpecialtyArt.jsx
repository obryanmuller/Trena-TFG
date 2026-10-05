import React from 'react';
import { Hammer, Paintbrush, Zap, Droplets, Armchair, Building2 } from 'lucide-react';
import './specialties.css';
const icons = {
  Pintura: Paintbrush,
  Alvenaria: Hammer,
  Elétrica: Zap,
  Hidráulica: Droplets,
  Marcenaria: Armchair,
  'Reformas gerais': Building2,
};
export function SpecialtyBadge({ category }) {
  const Icon = icons[category] || Building2;
  return (
    <span className="specialty-badge">
      <Icon size={17} aria-hidden="true" />
      {category}
    </span>
  );
}
export default function SpecialtyArt({ category }) {
  const dark = ['Elétrica', 'Marcenaria', 'Reformas gerais'].includes(category);
  return (
    <svg className="specialty-art" viewBox="0 0 600 320" aria-hidden="true">
      <rect width="600" height="320" fill={dark ? '#061b36' : '#edf2f8'} />
      <circle cx="458" cy="116" r="158" fill={dark ? '#102c4e' : '#dce5f0'} />
      <circle cx="82" cy="304" r="108" fill={dark ? '#183453' : '#e3eaf3'} />
      {category === 'Pintura' && (
        <>
          <path
            d="M155 100h220v25H145v26h230v25H155v26h220v25H145v26h230"
            stroke="#ffbf00"
            strokeWidth="25"
            strokeLinecap="round"
          />
          <path
            d="M341 111h71v54h-55v43"
            fill="none"
            stroke="#061b36"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <rect x="217" y="86" width="157" height="51" rx="14" fill="#061b36" />
          <rect x="232" y="94" width="126" height="35" rx="9" fill="#24476c" />
          <rect x="343" y="197" width="28" height="80" rx="12" fill="#061b36" />
          <rect x="350" y="206" width="14" height="48" rx="7" fill="#ffbf00" />
          <path d="M430 215h80l-8 71h-64z" fill="#fff" stroke="#a8bbd0" strokeWidth="3" />
          <ellipse cx="470" cy="215" rx="40" ry="9" fill="#061b36" />
          <path d="M435 227q-25-80 58-8" fill="none" stroke="#647d98" strokeWidth="4" />
          <path d="M438 246h64v25h-62z" fill="#ffbf00" />
        </>
      )}
      {category === 'Alvenaria' && (
        <>
          <g stroke="#edf2f8" strokeWidth="7" fill="#234365">
            <rect x="108" y="231" width="113" height="51" rx="3" />
            <rect x="221" y="231" width="113" height="51" rx="3" />
            <rect x="334" y="231" width="113" height="51" rx="3" />
            <rect x="151" y="180" width="113" height="51" rx="3" />
            <rect x="264" y="180" width="113" height="51" rx="3" />
            <rect x="194" y="129" width="113" height="51" rx="3" fill="#ffbf00" />
          </g>
          <path
            d="M380 111l76 55-124 27z"
            fill="#90a7c0"
            stroke="#061b36"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M392 149l21-31 32 5 22-37"
            fill="none"
            stroke="#061b36"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <rect
            x="453"
            y="54"
            width="29"
            height="58"
            rx="9"
            fill="#ffbf00"
            transform="rotate(29 467 82)"
          />
          <rect x="82" y="287" width="399" height="7" rx="3" fill="#a5b6c9" />
        </>
      )}
      {category === 'Elétrica' && (
        <>
          <path d="M293 65l-75 126h58l-17 93 111-148h-66l28-71z" fill="#ffbf00" />
          <path
            d="M143 108v-20h-40v132q0 45 55 45h49"
            fill="none"
            stroke="#557393"
            strokeWidth="8"
          />
          <rect x="118" y="114" width="49" height="65" rx="13" fill="#f0f4fa" />
          <path d="M128 115V93m29 22V93" stroke="#f0f4fa" strokeWidth="8" />
          <rect x="411" y="130" width="101" height="125" rx="14" fill="#e9eff7" />
          <rect x="426" y="149" width="71" height="49" rx="8" fill="#bacbde" />
          <path d="M447 167v13m27-13v13" stroke="#061b36" strokeWidth="7" strokeLinecap="round" />
          <circle cx="462" cy="225" r="9" fill="#061b36" />
          <path
            d="M374 75l19-17m-8 49h27m-49-55V28"
            stroke="#ffcf4b"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {category === 'Hidráulica' && (
        <>
          <path d="M139 277v-91q0-46 48-46h175V96" fill="none" stroke="#839db8" strokeWidth="48" />
          <path d="M139 277v-91q0-46 48-46h175V96" fill="none" stroke="#c4d3e2" strokeWidth="31" />
          <rect x="202" y="112" width="22" height="56" rx="5" fill="#061b36" />
          <rect x="306" y="112" width="22" height="56" rx="5" fill="#061b36" />
          <path d="M265 134V88m-36 0h72" stroke="#061b36" strokeWidth="13" strokeLinecap="round" />
          <path d="M436 118c-13 33-48 60-48 92a48 48 0 0 0 96 0c0-32-35-59-48-92z" fill="#ffbf00" />
          <path
            d="M415 212q0 20 19 23"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}
      {category === 'Marcenaria' && (
        <>
          <path d="M145 236l255-65 95 48-255 69z" fill="#ffcf52" />
          <path d="M145 236v24l95 49v-21zm95 52v21l255-69v-21z" fill="#b57e0a" />
          <path
            d="M179 238l227-53m-196 67l228-54m-199 68l226-54"
            stroke="#dba121"
            strokeWidth="3"
          />
          <path d="M173 103l205 14-36 91-206-40z" fill="#d3deeb" />
          <path
            d="M144 169l13-11 10 16 15-10 10 16 15-11 10 16 15-10 10 16 15-10 10 15 15-10 10 16 15-10 10 15"
            fill="none"
            stroke="#8199b4"
            strokeWidth="5"
          />
          <path d="M374 108l66 7q19 4 10 25l-25 47q-8 15-27 9l-51-11z" fill="#ffbf00" />
          <path d="M390 129l35 6-19 36-28-6z" fill="#061b36" />
        </>
      )}
      {(!icons[category] || category === 'Reformas gerais') && (
        <>
          <path
            d="M147 175L295 66l148 109"
            fill="none"
            stroke="#ffbf00"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M179 169v110h230V169" fill="none" stroke="#a8bdd3" strokeWidth="11" />
          <rect x="271" y="206" width="49" height="73" rx="3" fill="#ffbf00" />
          <rect x="209" y="180" width="36" height="39" rx="3" fill="#4b6a8b" />
          <rect x="346" y="180" width="36" height="39" rx="3" fill="#4b6a8b" />
          <path d="M467 134v109m-25 0h50" stroke="#d5e1ee" strokeWidth="12" strokeLinecap="round" />
          <path d="M454 106l13-21 13 21v38h-26z" fill="#ffbf00" />
        </>
      )}
    </svg>
  );
}
