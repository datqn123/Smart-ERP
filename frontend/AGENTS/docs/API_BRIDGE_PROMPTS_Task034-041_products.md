# Prompt đủ cho 7 Task — Sản phẩm (Task034–039, 041)

Tham chiếu workflow: [`backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md`](../../../backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md).

---

## Ngữ cảnh SRS (copy vào đầu phiên hoặc nhắc trong từng prompt)

[`backend/docs/srs/SRS_Task034-041_products-management.md`](../../../backend/docs/srs/SRS_Task034-041_products-management.md) — §8.1 bảng endpoint; §2 C1–C8 (list/read-model, POST+unit+price, detail units+images, PATCH giá, DELETE, ảnh JSON+multipart, bulk all-or-nothing); §6 RBAC: **`can_manage_products`** cho Task034–037 và **039**; **`DELETE` một + `bulk-delete`: chỉ Owner** (OQ-6(a)); §4 OQ-2(a) category không tồn tại **404**, category soft-delete **400** `INVALID_CATEGORY`; §4 OQ-3(a) bulk **409** không xóa gì nếu một id lỗi; §4.3 + §8.6 ảnh — cùng path **`POST …/images`**, hai `Content-Type`: **JSON URL** luôn; **multipart** → Cloudinary chỉ khi bật cấu hình (**400** nếu tắt).

**Không có `API_Task040_*.md`** trong repo — không sinh phiên BRIDGE Task040.

**UI §1.1:** `/products/list` → [`ProductsPage`](../../mini-erp/src/features/product-management/pages/ProductsPage.tsx) (`ProductTable`, `ProductToolbar`, `ProductForm`, `ProductDetailDialog`). Tra [`frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../mini-erp/src/features/FEATURES_UI_INDEX.md) bảng 1–2 nhóm **product-management**.

**Quy ước API_BRIDGE:** đọc [`FE_API_CONNECTION_GUIDE.md`](./FE_API_CONNECTION_GUIDE.md) trước (Bước 0); **`Grep`** path `/api/v1/products` trong `frontend/mini-erp/src`, **không** `Glob` cả `features/`; output [`frontend/docs/api/bridge/`](../../docs/api/bridge/) `BRIDGE_TaskXXX_<slug>.md` đúng mục 5 (bảng doc | BE | FE | Khớp | Hành động).

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

## Task035 — `POST /api/v1/products` (tạo SP + đơn vị base + giá)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task035 | Path=POST /api/v1/products | Mode=verify
Context SRS: §8.3 body (baseUnitName, costPrice, salePrice, priceEffectiveDate…), §4 OQ-2(a) category 404 vs 400 INVALID_CATEGORY, §2 C3.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task035_products_post.md (chỉ mục POST)
Grep POST "/api/v1/products" hoặc ProductsController create trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep /api/v1/products trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task035_products_post.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task035 | Path=POST /api/v1/products | Mode=wire-fe
Context UI: ProductForm / dialog tạo SP trên ProductsPage.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task035_products_post.md

Thực hiện:
1. postProduct (hoặc tên đồng bộ codebase) trong features/product-management/api/*.ts — body camelCase khớp BE; map 400 details → field form nếu có.
2. useMutation → invalidate list/detail; toast lỗi 409 SKU / 404 category / 400 INVALID_CATEGORY theo envelope.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

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

## Task037 — `PATCH /api/v1/products/{id}` (meta + cặp giá)

### Verify

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task037 | Path=PATCH /api/v1/products/{id} | Mode=verify
Context SRS: §8.5, §9 BR-3–BR-4 — đổi giá: gửi đủ salePrice+costPrice; PATCH categoryId null trong body = bỏ phân loại.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task037_products_patch.md
Grep PATCH "/products/" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog
Grep patchProduct hoặc PATCH products trong @frontend/mini-erp/src

Output: @frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task037 | Path=PATCH /api/v1/products/{id} | Mode=wire-fe
Context UI: ProductForm chỉnh sửa / ProductsPage.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task037_products_patch.md

Thực hiện:
1. patchProduct trong api/*.ts — partial body; không gửi field trống không đổi (theo spec).
2. useMutation sau submit; invalidate list + detail id; xử lý 409 SKU / category như Task035.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task037_products_patch.md
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
Context SRS: §4.3, §8.6 — hai mapping cùng path khác Content-Type; JSON `url` luôn; multipart + Cloudinary khi bật (**400** khi tắt); SRS §12 GAP doc — đối chiếu ProductsController consumes.

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/docs/api/API_Task039_products_post_image.md
Grep "/products/" và "images" trong @backend/smart-erp/src/main/java/com/example/smart_erp/catalog/controller/ProductsController.java
Grep images hoặc postImage trong @frontend/mini-erp/src/features/product-management

Output: @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
```

### Wire-fe

```text
Vai trò: API_BRIDGE. Tuân @backend/AGENTS/API_BRIDGE_AGENT_INSTRUCTIONS.md.

API_BRIDGE | Task=Task039 | Path=POST /api/v1/products/{id}/images | Mode=wire-fe
Context UI: ProductForm / ProductDetailDialog — thêm ảnh bằng URL hoặc upload file (multipart: fetch + Bearer + FormData; không dùng apiJson cho body JSON).

Đọc:
@frontend/AGENTS/docs/FE_API_CONNECTION_GUIDE.md
@frontend/mini-erp/src/features/FEATURES_UI_INDEX.md
@frontend/docs/api/API_Task039_products_post_image.md
@backend/docs/srs/SRS_Task034-041_products-management.md §4.3 (giới hạn MIME/size)

Thực hiện:
1. api/*.ts — postProductImageJson(url, …) qua apiJson; postProductImageMultipart(productId, file, …) qua fetch base URL + Bearer + FormData (part `file`, fields sortOrder, isPrimary).
2. Gắn UI gallery / nút upload; message 400 khi Cloudinary tắt — fallback gợi ý JSON URL.
3. Grep Path trong @frontend/mini-erp/src — không Glob cả features/.

Output: @frontend/docs/api/bridge/BRIDGE_Task039_products_post_image.md
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
