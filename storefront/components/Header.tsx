"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/lib/cart"

const NAV: [string, string][] = [["/", "Accueil"], ["/#services", "Services"], ["/store", "Boutiques & produits"], ["/#commande", "Comment ça marche"], ["/outiko", "OUTIKO / JEULIKO"], ["/register-shop", "Devenir boutique agréée"], ["/track", "Suivre ma commande"]]
export default function Header({ phone, email }: { phone: string; email: string }) {
  const { count } = useCart(); const router = useRouter(); const [q, setQ] = useState(""); const [open, setOpen] = useState(false)
  return (<>
    <header>
      <div id="top-header"><div className="container">
        <ul className="header-links pull-left">
          <li><a href={`tel:${phone.replace(/\D/g, "")}`}><i className="fa fa-phone" /> {phone}</a></li>
          <li><a href={`mailto:${email}`}><i className="fa fa-envelope-o" /> {email}</a></li>
          <li><a href="#"><i className="fa fa-map-marker" /> Dakar, Sénégal</a></li></ul>
        <ul className="header-links pull-right"><li><Link href="/vendor"><i className="fa fa-user-o" /> Espace boutique</Link></li></ul>
      </div></div>
      <div id="header"><div className="container"><div className="row">
        <div className="col-md-3"><div className="header-logo"><Link href="/" className="logo"><span className="lx-logo">L<span>x</span><small>Lo Soxla ?</small></span></Link></div></div>
        <div className="col-md-6"><div className="header-search"><form onSubmit={(e) => { e.preventDefault(); router.push(`/store?q=${encodeURIComponent(q)}`) }}>
          <input className="input" style={{ borderRadius: "40px 0 0 40px", width: "calc(100% - 110px)" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qu'avez-vous besoin ?" />
          <button className="search-btn" style={{ width: 110, padding: 0 }}>Chercher</button></form></div></div>
        <div className="col-md-3 clearfix"><div className="header-ctn">
          <div><Link href="/cart"><i className="fa fa-shopping-cart" /><span>Ma commande</span>{count > 0 && <div className="qty">{count}</div>}</Link></div>
          <div className="menu-toggle"><a href="#" onClick={(e) => { e.preventDefault(); setOpen(!open) }}><i className="fa fa-bars" /><span>Menu</span></a></div>
        </div></div>
      </div></div></div>
    </header>
    <nav id="navigation"><div className="container"><div id="responsive-nav" className={open ? "active" : ""}><ul className="main-nav nav navbar-nav">
      {NAV.map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)}>{l}</Link></li>)}</ul></div></div></nav>
  </>)
}
