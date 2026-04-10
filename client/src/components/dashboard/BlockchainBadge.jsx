import React from 'react';

export default function BlockchainBadge({ status }) {
  const normStatus = status?.toUpperCase() || 'PENDING';
  
  if (normStatus === 'VERIFIED' || normStatus === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 w-max">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]"></span>
        Verified
      </span>
    );
  }
  
  if (normStatus === 'TAMPERED' || normStatus === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 w-max">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] shadow-[0_0_8px_#f87171]"></span>
        Tampered
      </span>
    );
  }

  // Default Pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20 w-max">
      <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308] animate-pulse"></span>
      Pending
    </span>
  );
}
