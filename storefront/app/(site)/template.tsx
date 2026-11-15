// Chaque navigation rejoue une entrée douce : le contenu glisse de quelques pixels et apparaît.
export default function Template({ children }: { children: React.ReactNode }) { return <div className="animate-page-in">{children}</div> }
