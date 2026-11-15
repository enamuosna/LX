export default function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (<div className="border-b border-line bg-surface"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{children && <div className="mt-2 text-slate-600">{children}</div>}</div></div>)
}
