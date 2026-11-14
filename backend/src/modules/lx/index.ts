import { Module } from "@medusajs/framework/utils"
import LxModuleService from "./service"

export const LX_MODULE = "lx"
export default Module(LX_MODULE, { service: LxModuleService })
