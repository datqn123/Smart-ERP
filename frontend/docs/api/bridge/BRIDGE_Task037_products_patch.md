# BRIDGE — Task037 — `PATCH /api/v1/products/{id}`

> **Task:** Task037 | **Path:** `PATCH /api/v1/products/{id}` | **Mode:** wire-fe | **Date:** 27/04/2026

**Đã đọc** [`frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md`](../../AGENTS/docs/FE_API_CONNECTION_GUIDE.md): Y

| Hạng mục | API doc (`API_Task037_products_patch.md`) + SRS §8.5, BR-3–BR-4 | Backend | Frontend | Khớp | Ghi chú |
| :-- | :-- | :-- | :-- | :--: | :-- |
| `PATCH` + Bearer | §2–3 | [`ProductsController.patch`](../../../../backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java) | [`patchProduct`](../../../mini-erp/src/features/product-management/api/productsApi.ts) + [`ProductsPage`](../../../mini-erp/src/features/product-management/pages/ProductsPage.tsx) `patchMutation` | **Y** | `apiJson`, `auth: true`. |
| Partial body | Chỉ field đổi | `JsonNode` | [`buildProductPatchBody`](../../../mini-erp/src/features/product-management/api/productsApi.ts) so với [`productDetailToEditSnapshot`](../../../mini-erp/src/features/product-management/api/productsApi.ts) | **Y** | Không gửi key nếu giá trị trùng snapshot. |
| `categoryId: null` | Bỏ phân loại | `ProductService.patch` | Select **Không phân loại** (`0`) → body `categoryId: null` khi khác snapshot | **Y** | |
| Cặp giá | Đủ `salePrice` + `costPrice` khi đổi giá | BE validate cặp | Form luôn có 2 field; `buildProductPatchBody` gửi cả hai nếu một trong hai đổi | **Y** | |
| `priceEffectiveDate` | Tuỳ chọn | BE parse | Input `type="date"` (chỉ edit), chỉ gửi khi có chuỗi và đã đổi giá | **Y** | |
| Invalidate | List + detail | — | `invalidateQueries` `["product-management","products","list"]` + `["detail", id]` | **Y** | Kèm `getProductById` (Task036) khi mở form sửa. |
| 409 / 400 `details` | Task032-style | — | [`toastProductMutationEnvelope`](../../../mini-erp/src/features/product-management/pages/ProductsPage.tsx); [`ProductForm`](../../../mini-erp/src/features/product-management/components/ProductForm.tsx) `setError` khi **400** + `details` | **Y** | Giống pattern CategoriesPage. |
| UI | `ProductForm` / `ProductsPage` | — | [`ProductForm`](../../../mini-erp/src/features/product-management/components/ProductForm.tsx) + [`ProductsPage`](../../../mini-erp/src/features/product-management/pages/ProductsPage.tsx) | **Y** | Task039 [`ProductImagePanel`](../../../mini-erp/src/features/product-management/components/ProductImagePanel.tsx) giữ trong form. |

**Kết luận:**

- Đã **`wire-fe`**: `getProductById`, `patchProduct`, snapshot + `buildProductPatchBody`, `useMutation` + invalidate list/detail, xử lý lỗi 409 / 400 `details` như Task032/Task035.
- Snapshot cập nhật khi `GET` chi tiết thành công; PATCH rỗng hoặc thiếu snapshot → toast + `ProductFormSubmitAborted` (không đóng dialog nhầm).
- Tạo mới (Task035) vẫn placeholder toast — ngoài scope Task037.
