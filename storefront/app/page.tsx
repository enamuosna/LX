import Link from "next/link"
import Grid from "@/components/Grid"
import { listProducts } from "@/lib/medusa"
export const dynamic = "force-dynamic"

export default async function Home() {
  const products = await listProducts({ limit: 4 }).catch(() => [])
  return (<>
    <section className="lx-hero"><div className="container"><div className="row">
      <div className="col-md-7"><span className="credo">« Sa Soxla, Sunu Soxla » — Par nous &amp; pour vous</span>
        <h1>Lo Soxla ? <br />Qu&apos;avez-vous besoin ?</h1>
        <p>Lx met en relation les consommateurs et les boutiques agréées, puis livre votre commande à la demande, avec suivi et fiabilité. Fini les retards et les colis abîmés du « Tiak Tiak » informel.</p>
        <form className="lx-search" action="/store"><input name="q" placeholder="Quel produit cherchez-vous ?" /><button type="submit">Chercher</button></form></div>
      <div className="col-md-5"><div className="lx-box"><ul>
        <li><i className="fa fa-search" /> Trouvez un produit, son prix et sa disponibilité</li>
        <li><i className="fa fa-whatsapp" /> La boutique est alertée instantanément</li>
        <li><i className="fa fa-lock" /> Transaction suivie : validation, paiement, livraison</li>
        <li><i className="fa fa-truck" /> Un livreur Lx récupère le colis scellé</li></ul></div></div>
    </div></div></section>

    <div className="section" id="services"><div className="container">
      <div className="row"><div className="col-md-12"><div className="section-title"><h3 className="title">Nos services</h3></div></div></div>
      <div className="row">
        <div className="col-md-4"><div className="lx-card"><div className="ico"><i className="fa fa-link" /></div><h3>LINK</h3><div className="tag">Mise en relation</div><p>Cherchez un produit : la plateforme affiche le produit ou un similaire avec photo, prix et disponibilité.</p><Link href="/store">Chercher un produit →</Link></div></div>
        <div className="col-md-4"><div className="lx-card"><div className="ico"><i className="fa fa-search-plus" /></div><h3>OUTIKO</h3><div className="tag">Recherche du produit et mise en relation</div><p>Recherche infructueuse ? L&apos;équipe Lx se charge de trouver le produit pour vous.</p><Link href="/outiko?type=outiko">Demander une recherche →</Link></div></div>
        <div className="col-md-4"><div className="lx-card"><div className="ico"><i className="fa fa-motorcycle" /></div><h3>JEULIKO</h3><div className="tag">Récupération &amp; envoi simple</div><p>Produit déjà acheté ou réservé chez le vendeur ? Lx le récupère et vous le livre.</p><Link href="/outiko?type=jeuliko">Demander une récupération →</Link></div></div>
      </div></div></div>

    <div className="section" style={{ paddingTop: 0 }}><div className="container">
      <div className="row"><div className="col-md-12"><div className="section-title"><h3 className="title">Disponible chez nos boutiques agréées</h3></div></div></div>
      <Grid products={products} />
      <div className="row"><div className="col-md-12 text-center"><Link href="/store" className="primary-btn" style={{ display: "inline-block", lineHeight: "40px", padding: "0 30px", borderRadius: 40 }}>Voir tous les produits</Link></div></div>
    </div></div>

    <div className="section" id="commande" style={{ background: "#F6F7FA" }}><div className="container">
      <div className="row"><div className="col-md-12"><div className="section-title"><h3 className="title">Comment passer commande</h3></div></div></div>
      <div className="row">
        {[["Je cherche", "Je saisis le produit recherché sur le portail."], ["Je choisis", "Je sélectionne le produit (prix, disponibilité, boutique)."], ["La boutique valide", "La boutique est notifiée. Sans réponse sous 30 min, Lx prend le relais."], ["Je suis livré", "Le livreur récupère le colis scellé. Je suis ma commande avec son numéro."]].map(([t, d], i) =>
          <div key={t} className="col-md-3 col-xs-6"><div className="lx-step"><div className="n">{i + 1}</div><h4>{t}</h4><p>{d}</p></div></div>)}
      </div>
      <div className="lx-notice"><strong>À savoir :</strong> Lx n&apos;effectue aucune inspection ni contrôle qualité. La conformité relève de la boutique agréée (garantie légale : réparation ou remplacement, service après-vente pour les matériels).</div>
    </div></div>

    <div className="lx-band"><div className="container"><h2 className="text-center" style={{ marginBottom: 30 }}>Commandez par le canal qui vous convient</h2>
      <div className="row">{[["globe", "Portail web"], ["mobile", "Application mobile"], ["phone", "Centre d'appels & SMS"], ["whatsapp", "WhatsApp"]].map(([i, l]) => <div key={l} className="col-md-3 col-xs-6 lx-chan"><i className={`fa fa-${i}`} /><strong>{l}</strong></div>)}</div></div></div>
  </>)
}
