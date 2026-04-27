# BRIDGE — Task039 — `POST /api/v1/products/{id}/images`

> **Task:** Task039 | **Path:** `POST /api/v1/products/{id}/images` | **Mode:** wire-fe | **Date:** 27/04/2026

**Đã đọc** [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../AGENTS/docs/FE_API_CONNECTION_GUIDE.md): Y

| Hạng mục | API doc ([`API_Task039_products_post_image.md`](../API_Task039_products_post_image.md) — §3, §5, §5.1, §6) | Backend | Frontend | Khớp | Hành động / ghi chú |
| :-- | :-- | :-- | :-- | :--: | :-- |
| Hai cách gửi cùng path | JSON **hoặc** multipart | [`ProductsController`](../../../../backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java) `consumes` JSON vs `MULTIPART` | `postProductImageJson` → `apiJson`; `postProductImageMultipart` → `apiFormData` trong [`productsApi.ts`](../../../mini-erp/src/features/product-management/api/productsApi.ts) | **Y** | `apiFormData` thêm tại [`http.ts`](../../../mini-erp/src/lib/api/http.ts) (factory `getFormData` + 401 refresh) |
| JSON body | `url`, `sortOrder`, `isPrimary` | `ProductImageCreateRequest` | `postProductImageJson` gửi camelCase | **Y** | — |
| Multipart | `file`, `sortOrder`, `isPrimary` | BE | `FormData` + part `file` | **Y** | — |
| Cloudinary tắt (400) | Gợi ý dùng URL | `CloudinaryMediaService` | `ProductImagePanel` toast lỗi + `toast.info` gợi ý JSON URL khi **400** và message giống upload/Cloudinary | **Y (UX)** | — |
| MIME / size (§4.3) | JPEG / PNG / WebP; size | `CloudinaryMediaService` | Client: `PRODUCT_IMAGE_ALLOWED_MIME`, `PRODUCT_IMAGE_MAX_BYTES` (6MB) | **Y (gating)** | BE vẫn validate cuối |
| **201** / primary | `ProductImageData` | — | `onImageAdded` → `invalidateQueries` list + cập nhật `imageUrl` khi `isPrimary` ([`ProductsPage`](../../../mini-erp/src/features/product-management/pages/ProductsPage.tsx)) | **Y** | — |
| UI | Gallery / URL / upload | — | [`ProductImagePanel`](../../../mini-erp/src/features/product-management/components/ProductImagePanel.tsx) trong [`ProductForm`](../../../mini-erp/src/features/product-management/components/ProductForm.tsx) + [`ProductDetailDialog`](../../../mini-erp/src/features/product-management/components/ProductDetailDialog.tsx) | **Y** | Tạo mới SP: chưa có `id` — panel hướng dẫn lưu trước |

**Kết luận:** Đã **wire-fe** Task039: API layer (`postProductImageJson` / `postProductImageMultipart` + `apiFormData`), panel ảnh (URL + file, sort, primary), đồng bộ list + ảnh đại diện khi primary, fallback messaging khi Cloudinary tắt. `npm run build` **OK**.
