export default function ComingSoon({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-800 text-accent-gold">
        <Icon size={26} />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink-50">{title}</h1>
      <p className="max-w-sm text-sm text-ink-400">{description}</p>
    </div>
  );
}
