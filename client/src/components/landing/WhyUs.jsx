export default function WhyUs() {
  const points = [
    {
      num: '01',
      title: 'Real-time collaboration',
      desc: 'Sellers and buyers work on the same invoice simultaneously. No version confusion, no email threads.'
    },
    {
      num: '02',
      title: 'Built for Indian GST',
      desc: 'CGST, SGST, IGST handled automatically. No manual calculations, no errors.'
    },
    {
      num: '03',
      title: 'Full audit trail',
      desc: 'Every status change, every action - logged, timestamped, and searchable.'
    }
  ];

  const stats = [
    { val: '10,000+', label: 'Invoices Processed' },
    { val: '98%',     label: 'Acceptance Rate'   },
    { val: '< 2min',  label: 'Avg. Validation'   },
    { val: 'Zero',    label: 'GST Calc Errors'   }
  ];

  return (
    <section id="whyus" className="bg-dark relative overflow-hidden" style={{ fontFamily: 'Plus Jakarta Sans' }}>

      {/* subtle top border */}
      <div className="w-full h-px bg-linear-to-r from-transparent via-[#047857]/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-8 sm:px-12 md:px-16 py-32">

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#047857]/20 bg-[#047857]/8 text-[#047857] rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
              Why InvoiceSync
            </div>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold text-text leading-[1.1] tracking-tight">
              Stop chasing invoices.{' '}
              <span className="text-[#047857]">Start closing deals.</span>
            </h2>
          </div>
          <p className="text-muted text-sm leading-relaxed max-w-xs lg:text-right">
            Most invoice tools are built for accountants. InvoiceSync is built for the people who actually send and receive invoices every day.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left: Points */}
          <div className="flex flex-col gap-0 border border-text rounded-3xl overflow-hidden">
            {points.map((pt, i) => (
              <div
                key={i}
                className="group flex gap-6 p-8 border-b border-text last:border-b-0 hover:bg-surface transition-all duration-300 cursor-default"
              >
                <span className="text-[11px] font-black text-muted-2 pt-1 tracking-widest shrink-0 group-hover:text-[#047857] transition-colors duration-300">
                  {pt.num}
                </span>
                <div>
                  <h4 className="text-text font-bold text-base mb-2 group-hover:text-[#047857] transition-colors duration-300">
                    {pt.title}
                  </h4>
                  <p className="text-muted text-sm leading-relaxed">{pt.desc}</p>
                </div>
                <span className="ml-auto text-border group-hover:text-[#047857]/40 transition-all duration-300 self-start text-lg shrink-0">
                  -&gt;
                </span>
              </div>
            ))}

            {/* Trust strip inside left card */}
            <div className="p-8 bg-surface">
              <p className="text-[10px] text-muted-2 uppercase tracking-[0.22em] font-bold mb-4">Secured by</p>
              <div className="flex flex-wrap gap-2">
                {['256-bit SSL', 'GSTN Compliant', 'ISO Ready', 'Data Encrypted'].map((badge, i) => (
                  <span
                    key={i}
                    className="border border-text text-muted-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((st, i) => (
              <div
                key={i}
                className="group border border-text rounded-3xl p-8 flex flex-col justify-between hover:border-[#047857]/25 hover:bg-surface transition-all duration-300 cursor-default relative overflow-hidden"
              >
                {/* corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#047857]/3 rounded-bl-3xl group-hover:bg-[#047857]/8 transition-all duration-300" />

                <div className="text-muted-2 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
                  {st.label}
                </div>
                <div className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-text leading-none tracking-tight group-hover:text-[#047857] transition-colors duration-500">
                  {st.val}
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div className="col-span-2 bg-[#047857] rounded-3xl p-8 flex items-center justify-between gap-4 group cursor-pointer hover:bg-[#065F46] transition-colors duration-300">
              <div>
                <p className="text-dark font-extrabold text-lg leading-tight mb-1">
                  Ready to switch?
                </p>
                <p className="text-bg-light-2 text-sm font-medium">
                  Get started free - no credit card needed.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark/10 flex items-center justify-center shrink-0 group-hover:bg-dark/20 transition-all duration-300">
                <span className="text-dark text-xl font-black group-hover:translate-x-0.5 transition-transform duration-200 inline-block">-&gt;</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full h-px bg-linear-to-r from-transparent via-[#047857]/20 to-transparent" />
    </section>
  );
}