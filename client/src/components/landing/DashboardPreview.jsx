import { useState } from 'react';

export default function DashboardPreview() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="py-6 px-0 text-center relative overflow-hidden" id="preview">
      {/* bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#047857]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Browser Shell */}
        <div className="relative rounded-[1.75rem] border border-[#E5E2D9] bg-[#FFFFFF] p-1.5 shadow-[0_0_80px_rgba(74,222,128,0.07)] hover:shadow-[0_0_120px_rgba(74,222,128,0.12)] transition-shadow duration-500">

          {/* Glow ring */}
          <div className="absolute inset-0 rounded-[1.75rem] border border-[#047857]/10 pointer-events-none" />

          {/* Browser top bar */}
          <div className="flex items-center gap-2 px-5 py-3.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="flex-1 max-w-xs mx-auto h-6 rounded-full bg-[#0A2518]/5 border border-[#0A2518]/5 flex items-center px-3">
              <span className="text-[10px] text-[#728279] font-mono select-none">app.invoicesync.in/seller/dashboard</span>
            </div>
            <div className="w-[52px]" />
          </div>

          {/* Viewport */}
          <div className="relative rounded-[1.25rem] overflow-hidden bg-[#0f1a12] aspect-video w-full flex items-center justify-center">
            {!imgError ? (
              <img
                src="/dashboard-preview.png"
                alt="InvoiceSync Dashboard Screenshot"
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                {/* Fake dashboard skeleton */}
                <div className="w-full px-6 max-w-2xl">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-[#F4F1EA] border border-[#E5E2D9] animate-pulse" />
                    ))}
                  </div>
                  <div className="h-40 rounded-xl bg-[#F4F1EA] border border-[#E5E2D9] animate-pulse" />
                </div>
                <p className="text-[#728279] text-xs font-medium mt-2">Dashboard Preview Coming Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
