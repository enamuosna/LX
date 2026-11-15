"use client"
import { Heart, LogOut, MapPin, Package } from "lucide-react"
import { useState } from "react"
import AddressesTab from "@/components/account/AddressesTab"
import AuthPanel from "@/components/account/AuthPanel"
import FavoritesTab from "@/components/account/FavoritesTab"
import OrdersTab from "@/components/account/OrdersTab"
import Button from "@/components/ui/Button"
import Container from "@/components/ui/Container"
import PageHeader from "@/components/ui/PageHeader"
import Skeleton from "@/components/ui/Skeleton"
import { useCustomer } from "@/lib/customer"
import { useFavorites } from "@/lib/favorites"
import { cn } from "@/lib/cn"

const TABS = [["orders", "Mes commandes", Package], ["addresses", "Mes adresses", MapPin], ["favorites", "Mes favoris", Heart]] as const

export default function AccountPage() {
  const { customer, ready, logout } = useCustomer(); const { ids } = useFavorites(); const [tab, setTab] = useState<(typeof TABS)[number][0]>("orders")
  if (!ready) return <Container className="py-16"><Skeleton className="h-64" /></Container>
  if (!customer) return (<><PageHeader title="Mon compte">Suivez vos commandes, gardez vos adresses et vos produits préférés.</PageHeader><Container className="py-10"><AuthPanel /></Container></>)
  return (<><PageHeader title={`Bonjour ${customer.first_name || ""}`.trim()}>{customer.email}</PageHeader>
    <Container className="py-8"><div className="mb-8 flex flex-wrap items-center gap-2" role="tablist">
      {TABS.map(([k, l, I]) => <button key={k} role="tab" aria-selected={tab === k} data-testid={`tab-${k}`} onClick={() => setTab(k)} className={cn("flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition", tab === k ? "bg-ink text-white" : "bg-surface text-slate-600 hover:text-ink")}><I className="size-4" />{l}{k === "favorites" && ids.length > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[11px] text-ink">{ids.length}</span>}</button>)}
      <Button variant="ghost" size="sm" className="ml-auto" onClick={logout} data-testid="logout"><LogOut className="size-4" />Me déconnecter</Button></div>
      {tab === "orders" && <OrdersTab />}{tab === "addresses" && <AddressesTab />}{tab === "favorites" && <FavoritesTab />}</Container></>)
}
