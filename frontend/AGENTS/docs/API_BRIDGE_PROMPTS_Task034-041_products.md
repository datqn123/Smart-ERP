# Prompt đủ cho 7 Task — Sản phẩm (Task034–039, 041)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task034-041_products-management.md`](../../../backend/docs/srs/SRS_Task034-041_products-management.md) — §8.1 bảng endpoint; §2 C1–C8 (list/read-model, POST+unit+price, detail units+images, PATCH giá, DELETE, ảnh JSON+multipart, bulk all-or-nothing); §6 RBAC: **`can_manage_products`** cho Task034–037 và **039**; **`DELETE` một + `bulk-delete`: chỉ Owner** (OQ-6(a)); §4 OQ-2(a) category không tồn tại **404**, category soft-delete **400** `INVALID_CATEGORY`; §4 OQ-3(a) bulk **409** không xóa gì nếu một id lỗi; §4.3 + §8.6 ảnh — cùng path **`POST …/images`**, hai `Content-Type`: **JSON URL** luôn; **multipart** → Cloudinary chỉ khi bật cấu hình (**400** nếu tắt). **Phụ lục §14–§15 (CR 27/04/2026):** POST tạo **multipart** `metadata` + nhiều `file` (OQ-7); form sửa ảnh **chỉ persist khi Lưu** (**BR-10** / OQ-8) — PATCH (nếu có) + Task039 trong một submit.

**Không có `API_Task040_*.md`** trong repo — không sinh phiên BRIDGE Task040.

**UI §1.1:** `/products/list` → [`ProductsPage`](../../mini-erp/src/features/product-management/pages/ProductsPage.tsx) (`ProductTable`, `ProductToolbar`, `ProductForm`, `ProductDetailDialog`). Tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) bảng 1–2 nhóm **product-management**.

**Quy ước API_BRIDGE:** đọc [`FE_API_CONNECTION_GUIDE.md`](./FE_API_CONNECTION_GUIDE.md) trước (Bước 0); **`Grep`** path `/api/v1/products` trong `frontend/mini-erp/src`, **không** `Glob` cả `features/`; output [`frontend/docs/api/bridge/`](../../docs/api/bridge/) `BRIDGE_TaskXXX_<slug>.md` đúng mục 5 (bảng doc | BE | FE | Khớp | Hành động).

---

## CR 27/04/2026 — Hai chức năng SRS §14–§15 (multipart tạo SP + lưu ảnh chỉ khi **Lưu** ở form sửa)

**Nguồn SRS:** [`backend/docs/srs/SRS_Task034-041_products-management.md`](../../../backend/docs/srs/SRS_Task034-041_products-management.md) — **§14** (OQ-7 multipart `metadata` + nhiều `file`, upload song song, rollback); **§14.5 OQ-8** (UX **BR-10**: form sửa không gọi API ảnh cho tới khi bấm Lưu; submit v1 = `PATCH` (nếu có) rồi Task039); **§14.6–§15.2** (GAP doc + lệnh `API_BRIDGE`).

**File bridge đã chỉnh lại theo CR:** `BRIDGE_Task035_products_post.md`, `BRIDGE_Task037_products_patch.md`, `BRIDGE_Task039_products_post_image.md`.

**Móc nối FE chính (grep `stagedImages` / `postProductCreateMultipart`):** [`ProductsPage.tsx`](../../mini-erp/src/features/product-management/pages/ProductsPage.tsx), [`ProductForm.tsx`](../../mini-erp/src/features/product-management/components/ProductForm.tsx), [`ProductImagePanel.tsx`](../../mini-erp/src/features/product-management/components/ProductImagePanel.tsx), [`productsApi.ts`](../../mini-erp/src/features/product-management/api/productsApi.ts).

### Prompt 1 — Task035: `POST /api/v1/products` (verify hoặc fix-doc sau drift BE)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task035 | Path=POST /api/v1/products | Mode=verify

Context SRS: @backend/docs/srs/SRS_Task034-041_products-management.md §14.2 (multipart metadata + file×N, primaryImageIndex, tối đa 10 file), §14.4 all-or-nothing upload, §8.3 JSON-only vẫn hợp lệ.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
→ @frontend/docs/api/API_Task035_products_post.md
→ @frontend/docs/api/bridge/BRIDGE_Task035_products_post.md (cập nhật bảng nếu drift)
→ Grep POST "/api/v1/products" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
→ Grep postProductCreateMultipart | buildProductCreateBody trong @frontend/mini-erp/src/features/product-management

Output: cập nhật @frontend/docs/api/bridge/BRIDGE_Task035_products_post.md; nếu Owner yêu cầu contract/mock: Mode=fix-doc + samples Task035 theo §15.2.
```

### Prompt 2 — Task037 + Task039 (form sửa): PATCH + ảnh cùng lần **Lưu** (wire-fe hoặc verify)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task037 | Path=PATCH /api/v1/products/{id} | Mode=verify

Context SRS: @backend/docs/srs/SRS_Task034-041_products-management.md §14.5 OQ-8, §9 BR-8 (chỉ đổi ảnh vẫn 200 phía BE khi có endpoint/payload), BR-10 (FE không POST ảnh khi đang soạn form sửa).

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
→ @frontend/docs/api/API_Task037_products_patch.md
→ @frontend/docs/api/API_Task039_products_post_image.md (thứ tự submit kèm PATCH)
→ @frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md
→ @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
→ @frontend/mini-erp/src/features/product-management/pages/ProductsPage.tsx (onSubmit nhánh edit: patchMutation + postProductImageMultipart/postProductImageJson với stagedImages)

Mode=wire-fe nếu cần sửa code: chỉ dưới frontend/mini-erp/src; bám BR-10 (staged trong ProductImagePanel khi có productId + form).

Output: BRIDGE_Task037 + BRIDGE_Task039; regression Task039 cho ProductDetailDialog (POST ngay — ghi rõ trong bridge nếu giữ nguyên).
```

### Prompt 3 — Task039 regression (tách phiên một Path)

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task039 | Path=POST /api/v1/products/{id}/images | Mode=verify

Context: sau §14, đảm bảo JSON vs multipart + Cloudinary tắt 400 vẫn khớp UI toast.

Đọc: @frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md → @frontend/docs/api/API_Task039_products_post_image.md
→ grep postProductImage trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
```

---

**Map API doc ↔ file bridge (đặt tên khớp repo):**

| Task | Spec FE | Bridge output |
| :--- | :--- | :--- |
| 034 | `API_Task034_products_get_list.md` | `BRIDGE_Task034_products_get_list.md` |
| 035 | `API_Task035_products_post.md` | `BRIDGE_Task035_products_post.md` |
| 036 | `API_Task036_products_get_by_id.md` | `BRIDGE_Task036_products_get_by_id.md` |
| 037 | `API_Task037_products_patch.md` | `BRIDGE_Task037_products_patch.md` |
| 038 | `API_Task038_products_delete.md` | `BRIDGE_Task038_products_delete.md` |
| 039 | `API_Task039_products_post_image.md` | `BRIDGE_Task039_products_post_image.md` |
| 041 | `API_Task041_products_bulk_delete.md` | `BRIDGE_Task041_products_bulk_delete.md` |

---

## Task034 — `GET /api/v1/products` (list + phân trang)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task034 | Path=GET /api/v1/products | Mode=verify
Context SRS: @backend/docs/srs/SRS_Task034-041_products-management.md §8.2 (query search, categoryId, status, page, limit, sort whitelist), §2 C1–C2 (categoryName, currentStock, currentPrice theo CURRENT_DATE).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task034_products_get_list.md (chỉ mục GET list + response shape)
Grep GET "/api/v1/products" hoặc ProductsController list trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/products trong @frontend/mini-erp/src (ưu tiên features/product-management/api)

Output: @frontend/docs/api/bridge/BRIDGE_Task034_products_get_list.md. Không sửa code trừ khi Owner yêu cầu wire-fe.
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task034 | Path=GET /api/v1/products | Mode=wire-fe
Context UI: `/products/list` — ProductsPage — ProductTable + ProductToolbar (@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task034_products_get_list.md

Thực hiện:
1. features/product-management/api/*.ts — hàm list (query: page, limit, search, categoryId, status, sort đúng whitelist).
2. useQuery / phân trang / filter trên ProductsPage hoặc hook đã có; map items → bảng.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task034_products_get_list.md
```

---

## Task035 — `POST /api/v1/products` (tạo SP + đơn vị base + giá; **§14** multipart kèm nhiều ảnh)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task035 | Path=POST /api/v1/products | Mode=verify
Context SRS: §8.3 body (baseUnitName, costPrice, salePrice, priceEffectiveDate…), §4 OQ-2(a) category 404 vs 400 INVALID_CATEGORY, §2 C3; **§14.2 OQ-7** multipart (`metadata` + nhiều `file` + `primaryImageIndex`), **§14.4** rollback nếu upload lỗi.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task035_products_post.md (chỉ mục POST + multipart nếu doc đã có §6b)
@frontend/docs/api/bridge/BRIDGE_Task035_products_post.md (đối chiếu bảng; cập nhật nếu drift)
Grep POST "/api/v1/products" hoặc createMultipart|create trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep postProduct|postProductCreateMultipart|StagedProductImages trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task035_products_post.md (bảng mục 5 API_BRIDGE_AGENT_INSTRUCTIONS)
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task035 | Path=POST /api/v1/products | Mode=wire-fe
Context UI: ProductForm / dialog tạo SP trên ProductsPage (`/products/list`).
Context SRS: §14 — ảnh trên form = `staged` (`files` + `urlAdds`); khi **Lưu**: nếu `staged.files.length > 0` → `postProductCreateMultipart(body, files, { primaryImageIndex })`; ngược lại → `postProduct(body)`; sau **201** luôn (khi có) lần lượt `postProductImageJson(created.id, …)` cho **mỗi** mục `staged.urlAdds` (URL bổ sung, kể cả sau multipart).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task035_products_post.md
@backend/docs/srs/SRS_Task034-041_products-management.md §14.2 (contract multipart)

Thực hiện:
1. features/product-management/api/productsApi.ts — `postProduct`, `postProductCreateMultipart` (FormData: part `metadata` blob JSON §8.3, lặp part `file`, field `primaryImageIndex` khớp BE).
2. ProductsPage: `createProductMutation` với `{ body, staged }`; nhánh file vs JSON-only + vòng `urlAdds` sau 201 như trên.
3. ProductImagePanel + ProductForm: `staged` / `onStagedImagesChange` khi tạo — không `POST …/images` trước Lưu.
4. useMutation → invalidate list; 400 + `details` → `ProductForm.setError`; 409/404/toast envelope qua helper trên ProductsPage (đồng bộ Task032-style).
5. Grep `"/api/v1/products"` trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task035_products_post.md
```

---

## Task036 — `GET /api/v1/products/{id}` (chi tiết: units, giá, images)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task036 | Path=GET /api/v1/products/{id} | Mode=verify
Context SRS: §2 C4, §8.4 — units[], images[] (productimages), giá current per unit.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task036_products_get_by_id.md (chỉ mục GET by id)
Grep GET "/products/" hoặc getById trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep getProduct hoặc /products/ trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task036_products_get_by_id.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task036 | Path=GET /api/v1/products/{id} | Mode=wire-fe
Context UI: ProductDetailDialog hoặc panel chi tiết trên ProductsPage.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task036_products_get_by_id.md

Thực hiện:
1. getProductById trong api/*.ts.
2. useQuery khi mở chi tiết / chọn dòng; hiển thị units, gallery images, giá — đúng shape Task036.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task036_products_get_by_id.md
```

---

## Task037 — `PATCH /api/v1/products/{id}` (meta + cặp giá; **§14** ảnh + submit cùng Lưu với Task039)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task037 | Path=PATCH /api/v1/products/{id} | Mode=verify
Context SRS: §8.5, §9 BR-3–BR-4 — đổi giá: gửi đủ salePrice+costPrice; PATCH categoryId null trong body = bỏ phân loại; **§14.1 BR-8**, **§14.5 OQ-8** (chỉ ảnh đổi vẫn hợp lệ phía BE khi có contract; phía FE: PATCH rỗng được phép nếu chỉ có `stagedImages`, rồi Task039 trong một lần Lưu).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task037_products_patch.md (chỉ mục PATCH + partial body)
@frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md (đối chiếu bảng; cập nhật nếu drift)
@frontend/docs/api/API_Task039_products_post_image.md (mục liên quan: thứ tự gọi sau PATCH khi form sửa — BR-10)
Grep patch|Patch trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java
Grep patchProduct|buildProductPatchBody|productDetailToEditSnapshot|stagedImages|postProductImage trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md (bảng mục 5 API_BRIDGE_AGENT_INSTRUCTIONS)
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task037 | Path=PATCH /api/v1/products/{id} | Mode=wire-fe
Context UI: `/products/list` — ProductsPage + ProductForm chỉnh sửa (FEATURES_UI_INDEX).
Context SRS: **BR-10** — ProductImagePanel với `staged` + `onStagedChange` (ProductForm: `stagedImages` / `onStagedImagesChange`): không `POST …/images` khi user chỉ chọn ảnh. **Khi Lưu** (ProductsPage `onSubmit` nhánh edit): (1) `patchProduct(id, body)` chỉ khi `Object.keys(buildProductPatchBody(…)).length > 0`; (2) lần lượt `postProductImageMultipart(id, file, { sortOrder: i, isPrimary: i === 0 })` cho `stagedImages.files`; (3) `postProductImageJson` cho từng `stagedImages.urlAdds`. Nếu không có patch và không có staged → toast “không có thay đổi” + `ProductFormSubmitAborted`.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task037_products_patch.md
@frontend/docs/api/API_Task039_products_post_image.md
@frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md
@frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
@backend/docs/srs/SRS_Task034-041_products-management.md §14.5 OQ-8 (thứ tự submit)

Thực hiện:
1. features/product-management/api/productsApi.ts — `patchProduct`, `buildProductPatchBody`, `productDetailToEditSnapshot`; Task039 `postProductImageMultipart` / `postProductImageJson` (đã có thì chỉ đối chiếu).
2. ProductsPage: `patchMutation`, `editSnapshotRef`, nhánh submit sửa (PATCH tuỳ chọn + vòng ảnh staged); `invalidateQueries` list + `["detail", id]` sau PATCH và sau block ảnh nếu có staged; `toastProductMutationEnvelope` + ProductForm `setError` cho 400 `details`.
3. ProductForm / ProductImagePanel: đủ props staged khi edit; không POST ảnh trước Lưu.
4. Grep `patchProduct|buildProductPatchBody|stagedImages|postProductImage` trong @frontend/mini-erp/src/features/product-management — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md; cập nhật @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md nếu đổi hành vi Task039 (form vs ProductDetailDialog).
```

---

## Task038 — `DELETE /api/v1/products/{id}`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task038 | Path=DELETE /api/v1/products/{id} | Mode=verify
Context SRS: §6 — **chỉ Owner** OQ-6(a); §8.7, §9 BR-5 — 409 nếu có chứng từ / tồn.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task038_products_delete.md
Grep DELETE "/products/" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep deleteProduct hoặc DELETE products trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task038_products_delete.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task038 | Path=DELETE /api/v1/products/{id} | Mode=wire-fe
Context UI: nút xóa trên ProductTable / dialog xác nhận — ẩn hoặc disable cho non-Owner nếu JWT không phải Owner (khớp §6).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task038_products_delete.md

Thực hiện:
1. deleteProduct trong api/*.ts.
2. Confirm + useMutation; invalidate list; hiển thị 403/409 theo envelope.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task038_products_delete.md
```

---

## Task039 — `POST /api/v1/products/{id}/images` (JSON URL **hoặc** multipart)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task039 | Path=POST /api/v1/products/{id}/images | Mode=verify
Context SRS: §4.3, §8.6 — cùng path, hai `consumes`: **JSON** (`url`, `sortOrder`, `isPrimary`) luôn; **multipart** (`file` + sort/isPrimary) → Cloudinary khi bật (**400** khi tắt). §14 / **BR-10**: trên **ProductForm** (tạo/sửa) không gọi endpoint này cho tới khi **Lưu** (ProductsPage gọi `postProductImage*`); **ProductDetailDialog** có thể gọi ngay (không staged) — ghi trong bảng BRIDGE nếu giữ.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task039_products_post_image.md (JSON + multipart + mã lỗi)
@frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md (đối chiếu bảng; cập nhật nếu drift)
@frontend/docs/api/samples/Task039/ (nếu có — mock request/response)
Grep images|Image|MULTIPART|APPLICATION_JSON trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java
Grep postProductImageJson|postProductImageMultipart|ProductImagePanel|apiFormData trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md (bảng mục 5 API_BRIDGE_AGENT_INSTRUCTIONS)
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task039 | Path=POST /api/v1/products/{id}/images | Mode=wire-fe
Context UI: `/products/list` — **ProductForm** + **ProductsPage** (`stagedImages` / `onStagedImagesChange` → `postProductImage*` chỉ trong `onSubmit` tạo/sửa); **ProductDetailDialog** — `ProductImagePanel` **không** `staged` → gọi `postProductImageJson` / `postProductImageMultipart` ngay sau thao tác user.
Context SRS: §4.3, §8.6, **BR-10** (chỉ áp “chỉ Lưu” cho form tạo/sửa); MIME/size client: `PRODUCT_IMAGE_ALLOWED_MIME`, `PRODUCT_IMAGE_MAX_BYTES`.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task039_products_post_image.md
@frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
@backend/docs/srs/SRS_Task034-041_products-management.md §4.3, §8.6

Thực hiện:
1. features/product-management/api/productsApi.ts — `postProductImageJson` (`apiJson`); `postProductImageMultipart` (`apiFormData`, part `file`, fields `sortOrder`, `isPrimary`); hằng `PRODUCT_IMAGE_*` khớp BE.
2. ProductImagePanel — khi có `staged` + `onStagedChange`: file/URL chỉ đẩy vào `StagedProductImages`, preview cục bộ, toast gợi ý lưu khi bấm **Lưu**; khi không staged: giữ luồng POST ngay + `onImageAdded` → invalidate list/detail trên ProductsPage.
3. ProductsPage (tạo): sau `postProduct` / `postProductCreateMultipart`, vòng `postProductImageJson` cho `urlAdds`. (Sửa): sau PATCH tuỳ chọn, vòng multipart/JSON cho `stagedImages` — đồng bộ Task037 wire-fe.
4. `ApiRequestError` **400** (Cloudinary tắt / upload): toast + `toast.info` gợi ý dán URL (JSON) nếu message khớp §4.3.
5. Grep `postProductImage|ProductImagePanel|apiFormData` trong @frontend/mini-erp/src/features/product-management — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md (bảng mục 5; ghi rõ hai UI: form staged vs dialog không staged).
```

---

## Task041 — `POST /api/v1/products/bulk-delete`

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task041 | Path=POST /api/v1/products/bulk-delete | Mode=verify
Context SRS: §8.8, §9 BR-6 — **all-or-nothing** 409; §6 **chỉ Owner** xóa bulk.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task041_products_bulk_delete.md
Grep bulk-delete trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep bulk hoặc bulk-delete trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task041_products_bulk_delete.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task041 | Path=POST /api/v1/products/bulk-delete | Mode=wire-fe
Context UI: ProductToolbar chọn nhiều + hành động xóa (theo FEATURES_UI_INDEX).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task041_products_bulk_delete.md

Thực hiện:
1. postProductsBulkDelete(ids) trong api/*.ts — body `{ ids: number[] }`.
2. useMutation; invalidate list; toast 409 với details.failedId/reason nếu có.
3. Chỉ hiện/thực thi bulk delete cho Owner (đồng bộ §6).
4. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task041_products_bulk_delete.md
```

---

## Một dòng (Mode verify — khi đã thuộc thứ tự API_BRIDGE_AGENT_INSTRUCTIONS)

```text
API_BRIDGE | Task=Task036 | Path=GET /api/v1/products/{id} | Mode=verify
```
