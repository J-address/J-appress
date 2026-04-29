export const userTheme = {
  background: 'linear-gradient(180deg, #d8dadd 3%, #c0dfff 16%, #6aa2f0 36%, #0155c3 90%)',
  card: 'bg-white/10 border-white/25',
  text: 'text-white',
  subtext: 'text-white/80',
  input:
    'border-white/40 bg-white/10 text-white placeholder-white/60 focus:border-white focus:ring-white/70',
  button: 'bg-white/90 text-[#0C1B3D] hover:bg-white focus:ring-white/70',
  error: 'bg-red-500/20 text-red-100',
  link: 'text-white underline-offset-4 hover:underline',
};

export const adminTheme = {
  background: '#0f172a',
  card: 'bg-white/5 border-white/10',
  text: 'text-slate-100',
  subtext: 'text-slate-400',
  input:
    'border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-500',
  button: 'bg-slate-100 text-slate-900 hover:bg-white focus:ring-slate-400',
  error: 'bg-red-900/40 text-red-300',
  link: 'text-slate-400 underline-offset-4 hover:underline',
};

export type Theme = typeof userTheme;
