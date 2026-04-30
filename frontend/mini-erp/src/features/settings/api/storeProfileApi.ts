import { apiFormData, apiJson } from "@/lib/api/http"

export const STORE_PROFILE_QUERY_KEY = ["store-profile"] as const

export type StoreProfileData = {
  id: number
  name: string
  businessCategory: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  taxCode: string | null
  footerNote: string | null
  logoUrl: string | null
  facebookUrl: string | null
  instagramHandle: string | null
  defaultRetailLocationId: number | null
  updatedAt: string
}

/** Task073 — Bearer required */
export function getStoreProfile() {
  return apiJson<StoreProfileData>("/api/v1/store-profile", { method: "GET", auth: true })
}

export type StoreProfilePatchBody = Partial<{
  name: string
  businessCategory: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  taxCode: string | null
  footerNote: string | null
  logoUrl: string | null
  facebookUrl: string | null
  instagramHandle: string | null
  defaultRetailLocationId: number | null
}>

/** Task074 — Bearer required */
export function patchStoreProfile(body: StoreProfilePatchBody) {
  return apiJson<StoreProfileData>("/api/v1/store-profile", {
    method: "PATCH",
    body: JSON.stringify(body),
    auth: true,
  })
}

export type StoreLogoUploadData = {
  logoUrl: string
  updatedAt: string
}

/** Task075 — Bearer required; multipart field `file` */
export function uploadStoreLogo(file: File) {
  return apiFormData<StoreLogoUploadData>(
    "/api/v1/store-profile/logo",
    () => {
      const fd = new FormData()
      fd.append("file", file)
      return fd
    },
    { auth: true }
  )
}

