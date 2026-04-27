# BRIDGE — Task035 — `POST /api/v1/products`

> **Task:** Task035 | **Path:** `POST /api/v1/products` | **Mode:** wire-fe | **Date:** 27/04/2026

**Đã đọc** [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../AGENTS/docs/FE_API_CONNECTION_GUIDE.md): Y

| Hạng mục | API doc (`API_Task035_products_post.md`) + SRS §8.3 / **OQ-2(a)** / **C3** | Backend | Frontend | Khớp | Hành động / ghi chú |
| :-- | :-- | :-- | :-- | :--: | :-- |
| Body camelCase | §4 | [`ProductCreateRequest`](../../../../backend/smart-erp/src/main/java/com/example/smart_erp/catalog/dto/ProductCreateRequest.java) | [`buildProductCreateBody`](../../../mini-erp/src/features/product-management/api/productsApi.ts) + [`postProduct`](../../../mini-erp/src/features/product-management/api/productsApi.ts) | Y | `categoryId` 0 / thiếu → `null`; `weight` 0 → `null`; `priceEffectiveDate` rỗng → không gửi key. |
| **201** + invalidate | List sau tạo | [`ProductsController.create`](../../../../backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java) | [`ProductForm`](../../../mini-erp/src/features/product-management/components/ProductForm.tsx) `useMutation` → `invalidateQueries` `["product-management","products","list"]` | Y | Toast success trong `onSuccess` mutation. |
| **400** `details` → field | Envelope | Bean validation / `BusinessException` | `applyCreateApiFieldErrors` — map key ∈ whitelist form; **INVALID_CATEGORY** → `setError("categoryId", …)` | **Partial** | Key `code` trong `details` không map field; MethodArgumentNotValid có thể trả path lạ — đã strip suffix `.`. |
| **409** SKU / **404** category / **400** INVALID_CATEGORY | Toast theo prompt | Như BE | `toastCreateProductError` — 409 / 404 / INVALID_CATEGORY toast `body.message`; 400 có field map → không toast trùng (trừ INVALID_CATEGORY vẫn toast) | Y | — |
| UI tạo mới | `ProductForm` dialog | — | Trường **Đơn vị cơ sở**, **Giá vốn**, **Giá bán**, **Ngày hiệu lực giá** (optional); danh mục **Chưa phân loại** = `0` → `null` API | Y | — |
| Sửa SP (Task037) | — | — | `onSubmitEdit` từ [`ProductsPage`](../../../mini-erp/src/features/product-management/pages/ProductsPage.tsx) — toast chưa nối PATCH | N | `key={edit-${id}|create}` để đổi resolver Zod tạo/sửa. |

**Kết luận:** Đã **`wire-fe`** Task035: `postProduct` + form tạo gọi API, invalidate danh sách, xử lý lỗi envelope + `setError` theo `details`. Sửa sản phẩm vẫn chờ **Task037**.
