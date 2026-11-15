export default function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (<div className="bg-surface"><div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6"><h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-5xl">{title}</h1>{children && <div className="mt-4 max-w-2xl text-lg text-slate-600">{children}</div>}</div></div>)
}
