import SimpleForm from "@/components/SimpleForm"
export default function RegisterShop() {
  return (<><div className="lx-page-title"><div className="container"><h2 style={{ margin: 0 }}>Devenir boutique agréée</h2><p style={{ margin: "5px 0 0" }}>À fournir dès la souscription : vos catalogues et caractéristiques produits, vos prix et vos promotions (à saisir dans votre espace après validation).</p></div></div>
    <div className="section"><div className="container"><div className="row"><div className="col-md-6">
      <SimpleForm endpoint="/store/lx/shops/register" submitLabel="Envoyer ma demande" okMessage="Demande envoyée. Votre boutique sera activée après validation par Lx, vous pourrez alors vous connecter."
        fields={[{ name: "shop", placeholder: "Nom de la boutique" }, { name: "owner", placeholder: "Nom du gérant" }, { name: "phone", placeholder: "Téléphone WhatsApp (alertes de commande)" }, { name: "email", type: "email", placeholder: "Email (identifiant de connexion)" }, { name: "address", placeholder: "Adresse de la boutique", required: false }, { name: "password", type: "password", placeholder: "Mot de passe (8 caractères min.)" }]} /></div></div></div></div></>)
}
