import React from 'react';

// Ilustrações de categoria, usadas apenas quando não há fotos reais no portfólio.
export default function InteriorArt({ category = 'Alvenaria', hero = false }) {
  const paint = category === 'Pintura';
  const electric = category === 'Elétrica';
  const wall = paint ? '#c3cedb' : electric ? '#b6c5d8' : '#d6dee9';
  return (
    <svg viewBox="0 0 600 400" className="interior-art" aria-hidden="true">
      <rect width="600" height="400" fill={wall} />
      <path d="M0 0h112v288L0 400z" fill="#f0f3f8" />
      <path d="M0 400l112-112h488v112z" fill="#bca88f" />
      <path d="M112 288h488" stroke="#9d8a74" strokeWidth="4" />
      <path
        d="M40 400l91-111m34 111l50-111m80 111l20-111m111 111l-20-111m128 111l-55-111"
        stroke="#a9957f"
        strokeWidth="2"
        opacity=".5"
      />
      <rect x="151" y="48" width="136" height="148" fill="#f6f1e8" />
      <rect x="159" y="56" width="120" height="132" fill="#b8d0cf" />
      <path d="M219 56v132m-60-65h120" stroke="#fff9ed" strokeWidth="7" />
      <path d="M162 182l117-61v61z" fill="#92b5a7" />
      <rect x="340" y="62" width="80" height="100" fill="#f4eee3" />
      <rect x="348" y="70" width="64" height="84" fill="#ebd298" />
      <circle cx="380" cy="96" r="15" fill="#a87553" />
      <path d="M349 152q29-80 62 0" fill="#536d8e" />
      <ellipse cx="332" cy="340" rx="164" ry="30" fill="#e1d5c4" />
      <rect x="245" y="210" width="231" height="84" rx="17" fill={paint ? '#f9cf58' : '#ffbf00'} />
      <rect x="237" y="249" width="248" height="64" rx="10" fill={paint ? '#efbc31' : '#e6a900'} />
      <rect x="228" y="239" width="30" height="66" rx="9" fill={paint ? '#cfa122' : '#c08d00'} />
      <rect x="462" y="239" width="30" height="66" rx="9" fill={paint ? '#cfa122' : '#c08d00'} />
      <path d="M257 313v15m206-15v15" stroke="#68523b" strokeWidth="8" />
      <rect
        x="277"
        y="224"
        width="53"
        height="42"
        rx="7"
        fill="#faf4e8"
        transform="rotate(-8 304 244)"
      />
      <rect
        x="402"
        y="224"
        width="40"
        height="42"
        rx="7"
        fill="#233c5a"
        transform="rotate(9 424 244)"
      />
      <ellipse cx="327" cy="339" rx="62" ry="15" fill="#69563f" />
      <path d="M290 340l-5 35m74-35l5 35" stroke="#69563f" strokeWidth="6" />
      <rect x="308" y="319" width="27" height="12" rx="2" fill="#efe7d8" />
      <path d="M529 254v-104" stroke="#82785a" strokeWidth="5" />
      <path
        d="M529 207q-53-70-39-70 52 11 39 70m0-26q8-80 34-65 15 36-34 65m0 49q31-70 53-44-5 40-53 44"
        fill="#647b56"
      />
      <path d="M507 249h45l-8 48h-28z" fill="#e9ddca" />
      {(electric || hero) && (
        <>
          <path d="M465 0v53" stroke="#554835" strokeWidth="3" />
          <path d="M432 83q33-65 66 0z" fill="#061b36" />
          <ellipse cx="465" cy="83" rx="33" ry="6" fill="#f5ce75" />
        </>
      )}
      {hero && (
        <>
          <path d="M55 288v-115m-31 78h61m-61-35h61" stroke="#a38152" strokeWidth="7" />
          <rect x="48" y="266" width="33" height="36" rx="3" fill="#fff2d6" />
          <rect x="48" y="277" width="33" height="12" fill="#ffbf00" />
        </>
      )}
    </svg>
  );
}
