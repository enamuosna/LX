import ServiceForm from "@/components/forms/ServiceForm"
import Container from "@/components/ui/Container"
import PageHeader from "@/components/ui/PageHeader"
export default function RegisterShop() {
  return (<><PageHeader title="Devenir boutique agréée">À fournir dès la souscription : vos catalogues et caractéristiques produits, vos prix et vos promotions (à saisir dans votre espace après validation).</PageHeader>
    <Container className="max-w-2xl py-8"><ServiceForm endpoint="/store/lx/shops/register" submitLabel="Envoyer ma demande" okMessage="Demande envoyée. Votre boutique sera activée après validation par Lx, vous pourrez alors vous connecter."
      fields={[{ name: "shop", label: "Nom de la boutique" }, { name: "owner", label: "Nom du gérant" }, { name: "phone", label: "Téléphone WhatsApp", hint: "Utilisé pour les alertes de commande." }, { name: "email", type: "email", label: "Email", hint: "Votre identifiant de connexion." }, { name: "address", label: "Adresse de la boutique", required: false }, { name: "password", type: "password", label: "Mot de passe", hint: "8 caractères minimum." }]} /></Container></>)
}
