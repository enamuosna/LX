import Link from "next/link"
export default function Footer({ phone, email }: { phone: string; email: string }) {
  return (<footer id="footer"><div className="section"><div className="container"><div className="row">
    <div className="col-md-4"><div className="footer"><h3 className="footer-title">À propos</h3><p>« Lo Soxla ? » (Lx) : conciergerie de courses et livraison à la demande au Sénégal. <em>Sa Soxla, Sunu Soxla.</em></p></div></div>
    <div className="col-md-4"><div className="footer"><h3 className="footer-title">Services</h3><ul className="footer-links"><li><Link href="/store">LINK</Link></li><li><Link href="/outiko?type=outiko">OUTIKO</Link></li><li><Link href="/outiko?type=jeuliko">JEULIKO</Link></li></ul></div></div>
    <div className="col-md-4"><div className="footer"><h3 className="footer-title">Contact</h3><ul className="footer-links"><li><a href="#"><i className="fa fa-phone" />{phone}</a></li><li><a href="#"><i className="fa fa-envelope-o" />{email}</a></li><li><Link href="/track">Suivre ma commande</Link></li></ul></div></div>
  </div></div></div>
  <div id="bottom-footer" className="section"><div className="container"><div className="row"><div className="col-md-12 text-center"><span className="copyright">© {new Date().getFullYear()} Lo Soxla ? / Lx — Par nous &amp; pour vous | Template <a href="https://colorlib.com" target="_blank" rel="noreferrer">Electro</a> par Colorlib (CC BY 3.0)</span></div></div></div></div></footer>)
}
