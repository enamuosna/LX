import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import LxModule from "../modules/lx"

// Un produit appartient à une boutique ; une boutique a plusieurs produits.
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true }, // une boutique a plusieurs produits
  LxModule.linkable.shop // un produit a une seule boutique
)
