export default function StatsCard({ label, value, sub, color = 'brand', icon }) {
  const colorMap = {
    brand:   'from-brand-600/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber:   'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red:     'from-red-600/20 to-red-600/5 border-red-500/20 text-red-400',
    blue:    'from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    slate:   'from-slate-700/40 to-slate-700/10 border-slate-600/20 text-slate-400',
  }
  const cls = colorMap[color] || colorMap.brand

  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-display font-bold ${cls.split(' ').find(c => c.startsWith('text-'))}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${cls.split(' ').find(c => c.startsWith('text-'))}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
