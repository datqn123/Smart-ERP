# SRS — Quản lý sản phẩm (list / CRUD / ảnh / xóa & bulk) — Task034–Task041

> **File (Spring / `smart-erp`):** `backend/docs/srs/SRS_Task034-041_products-management.md`  
> **Người soạn:** Agent BA + SQL (theo `BA_AGENT_INSTRUCTIONS.md`, `SQL_AGENT_INSTRUCTIONS.md`)  
> **Ngày:** 27/04/2026  
> **Đồng bộ sau trả lời PO (OQ):** 27/04/2026  
> **Trạng thái:** Approved *(OQ §4 đã điền đủ; quyết định kỹ thuật ghi tại §4.1)*  
> **PO duyệt (khi Approved):** PO — 27/04/2026 *(chữ ký PR/ticket theo quy trình team)*

---

## 0. Đầu vào & traceability

| Nguồn | Đường dẫn / ghi chú |
| :--- | :--- |
| API Task034 | [`../../../frontend/docs/api/API_Task034_products_get_list.md`](../../../frontend/docs/api/API_Task034_products_get_list.md) |
| API Task035 | [`../../../frontend/docs/api/API_Task035_products_post.md`](../../../frontend/docs/api/API_Task035_products_post.md) |
| API Task036 | [`../../../frontend/docs/api/API_Task036_products_get_by_id.md`](../../../frontend/docs/api/API_Task036_products_get_by_id.md) |
| API Task037 | [`../../../frontend/docs/api/API_Task037_products_patch.md`](../../../frontend/docs/api/API_Task037_products_patch.md) |
| API Task038 | [`../../../frontend/docs/api/API_Task038_products_delete.md`](../../../frontend/docs/api/API_Task038_products_delete.md) |
| API Task039 | [`../../../frontend/docs/api/API_Task039_products_post_image.md`](../../../frontend/docs/api/API_Task039_products_post_image.md) |
| API Task041 | [`../../../frontend/docs/api/API_Task041_products_bulk_delete.md`](../../../frontend/docs/api/API_Task041_products_bulk_delete.md) |
| Task040 | **Không có** file `API_Task040_*.md` trong repo — không nằm trong SRS này. |
| Khung API | [`../../../frontend/docs/api/API_PROJECT_DESIGN.md`](../../../frontend/docs/api/API_PROJECT_DESIGN.md) §4.9 |
| Envelope lỗi | [`../../../frontend/docs/api/API_RESPONSE_ENVELOPE.md`](../../../frontend/docs/api/API_RESPONSE_ENVELOPE.md) (tham chiếu) |
| UC / DB tham chiếu | [`../../../frontend/docs/UC/Database_Specification.md`](../../../frontend/docs/UC/Database_Specification.md) §7+ (đối chiếu Flyway; không phát minh tên bảng ngoài migration) |
| Flyway thực tế | [`../../smart-erp/src/main/resources/db/migration/V1__baseline_smart_inventory.sql`](../../smart-erp/src/main/resources/db/migration/V1__baseline_smart_inventory.sql) — `Products`, `ProductImages`, `ProductUnits`, `ProductPriceHistory`, `Inventory`, `StockReceiptDetails`, `OrderDetails`, FK/ON DELETE như §10 |
| Danh mục (FK / hiển thị) | [`SRS_Task029-033_categories-management.md`](SRS_Task029-033_categories-management.md) — `categories.deleted_at`, quyền `can_manage_products` / Owner |
| UI index | [`../../../frontend/mini-erp/src/features/FEATURES_UI_INDEX.md`](../../../frontend/mini-erp/src/features/FEATURES_UI_INDEX.md) |

### 0.1 Đồng bộ spec ↔ Flyway (đã chốt kỹ thuật trong SRS — không cần sửa API markdown)

| Điểm | API / ghi chú | Flyway / thực tế | Cách xử lý trong SRS |
| :--- | :--- | :--- | :--- |
| Bảng ảnh Task039 | Gợi ý DDL `product_images` + cột `url` | V1 đã có **`ProductImages`** với cột **`image_url`**, `sort_order`, `is_primary`, `id` **SERIAL** | **Không** tạo bảng trùng: map JSON **`url`** ↔ DB **`image_url`**; response trả **`url`** (camelCase) lấy từ `image_url`. |
| Unique một ảnh primary | Task039 đề xuất partial unique | V1 chỉ có index `idx_pi_primary` **không unique** | **Đã chốt OQ-4(a):** bổ sung **Flyway** partial unique `… WHERE is_primary = TRUE` (một `product_id` chỉ một primary); transaction INSERT/UPDATE vẫn bắt buộc. |
| Tên bảng trong SQL mẫu | API dùng `Products` (Pascal) | PostgreSQL chuẩn team: JDBC/SQL file thường dùng **chữ thường** (`products`, …) sau khi tạo không quote | §10 dùng identifier **thường** khớp repo JDBC hiện có (`products`, `categories`, …). |

---

## 1. Tóm tắt điều hành

- **Vấn đề:** UC8 cần API đầy đủ cho **danh sách phân trang**, **tạo** (sản phẩm + đơn vị cơ sở + giá khởi tạo), **chi tiết** (đơn vị + giá hiện tại + gallery), **PATCH** (meta + snapshot giá mới), **xóa một** / **xóa bulk** có kiểm tra chứng từ & tồn, **thêm ảnh** (URL / sau này multipart).
- **Mục tiêu nghiệp vụ:** Khớp envelope `success` / `data` / `message`; đọc/tạo/sửa/thêm ảnh URL: user có **`can_manage_products`**; **`DELETE` / `bulk-delete`: chỉ Owner** (đã chốt **OQ-6(a)**, nhất quán Task033).
- **Đối tượng:** User JWT; Staff / Owner / Admin theo quyền seed `Roles.permissions`.

### 1.1 Giao diện Mini-ERP

| Nhãn menu (Sidebar) | Route | Page (export) | Component / vùng chính | File (dưới `frontend/mini-erp/src/features/`) |
| :--- | :--- | :--- | :--- | :--- |
| *(theo Sidebar — nhóm sản phẩm)* | `/products/list` | `ProductsPage` | `ProductTable`, `ProductToolbar`, `ProductForm`, `ProductDetailDialog` | `product-management/pages/ProductsPage.tsx` |

---

## 2. Bóc tách nghiệp vụ (capabilities)

| # | Capability | Kích hoạt bởi | Kết quả mong đợi | Ghi chú |
| :---: | :--- | :--- | :--- | :--- |
| C1 | Phân trang + lọc SP | `GET /api/v1/products` | `200` + `items`, `page`, `limit`, `total` | `search`, `categoryId`, `status`, `sort` whitelist |
| C2 | Đọc read-model list | C1 | Mỗi item có `categoryName`, `currentStock`, `currentPrice` | Giá: latest `product_price_history` theo đơn vị cơ sở; `effective_date` ≤ **`CURRENT_DATE`** (DB server — **OQ-1(a)**) |
| C3 | Tạo SP + đơn vị cơ sở + giá | `POST /api/v1/products` | `201` + object (Task034-shape + `unitId` base) | **Một transaction** |
| C4 | Chi tiết SP | `GET /api/v1/products/{id}` | `200` + `units[]` + giá current mỗi unit + `images[]` | `images` từ `product_images` |
| C5 | PATCH meta + giá base | `PATCH /api/v1/products/{id}` | `200` | `FOR UPDATE`; đổi giá → **INSERT** `product_price_history`; **cặp** `salePrice`+`costPrice` khi đổi giá (theo Task037) |
| C6 | Xóa một SP | `DELETE /api/v1/products/{id}` | `200` + `{ id, deleted: true }` | Kiểm tra `stock_receipt_details`, `order_details`, tồn > 0 (policy §9) trước `DELETE` |
| C7 | Thêm ảnh (JSON URL) | `POST /api/v1/products/{id}/images` | `201` + metadata ảnh | **OQ-5:** chỉ URL; `isPrimary` → sync `products.image_url` + bỏ primary các ảnh khác (transaction); Flyway primary unique **OQ-4(a)** |
| C8 | Xóa nhiều SP | `POST /api/v1/products/bulk-delete` | `200` hoặc `409` | **All-or-nothing** — **OQ-3(a)** |

---

## 3. Phạm vi

### 3.1 In-scope

- Bảy endpoint: Task034, 035, 036, 037, 038, 039, 041.
- Validation, envelope, mã HTTP như §8.
- Transaction tạo SP; transaction PATCH giá; transaction ảnh primary; transaction xóa bulk **all-or-nothing** (**OQ-3(a)**).

### 3.2 Out-of-scope

- **Upload file / multipart / Cloudinary:** v1 chỉ **lưu & validate URL** (JSON) cho ảnh sản phẩm — **upload lên Cloudinary** xử lý **sau** SRS này (theo **OQ-5** PO). Không bắt buộc `multipart/form-data` trong phạm vi task 034–041.
- **Task040** (không có spec API trong repo).
- Đồng bộ giá đa đơn vị nâng cao, POS, đơn hàng.

---

## 4. Câu hỏi làm rõ cho PO (Open Questions) — **đã trả lời**

### 4.1 Quyết định PO (hành vi chốt cho Dev/Tester)

| ID | Chốt | Diễn giải triển khai |
| :--- | :--- | :--- |
| **OQ-1** | **(a)** | So sánh `effective_date` với **`CURRENT_DATE`** của PostgreSQL (múi giờ session/DB server). |
| **OQ-2** | **(a)** | **Cấm** `POST`/`PATCH` gán `categoryId` tới danh mục có `deleted_at IS NOT NULL` → **400**, `error` gợi ý `INVALID_CATEGORY` (hoặc tương đương trong envelope). Category **không tồn tại** (id không có row) → **404** (resource FK). |
| **OQ-3** | **(a)** | `POST /api/v1/products/bulk-delete`: **all-or-nothing** — một `id` không đủ điều kiện xóa → **409**, **không** xóa bản ghi nào. |
| **OQ-4** | **(a)** | Thêm **Flyway** partial unique đảm bảo **tối đa một** `is_primary = true` trên `product_images` theo `product_id` (bổ sung index, không thay thế transaction). |
| **OQ-5** | **PO (tự do)** | **V1:** chỉ lưu **link URL** ảnh (JSON như Task039). **Upload Cloudinary** — backlog **sau** SRS này (task/ SRS riêng). |
| **OQ-6** | **(a)** | **`DELETE /products/{id}`** và **`POST /products/bulk-delete`**: **chỉ Owner** (`Jwt` claim `role`); user khác có `can_manage_products` → **403**. |

### 4.2 Traceability (bảng gốc + cột trả lời PO)

**Trả lời PO:**

| ID | Quyết định PO | Ngày |
| :--- | :--- | :--- |
| OQ-1 | **(a)** — `CURRENT_DATE` DB | 27/04/2026 |
| OQ-2 | **(a)** — cấm category đã soft-delete | 27/04/2026 |
| OQ-3 | **(a)** — bulk all-or-nothing | 27/04/2026 |
| OQ-4 | **(a)** — Flyway partial unique primary | 27/04/2026 |
| OQ-5 | V1 URL only; Cloudinary sau SRS | 27/04/2026 |
| OQ-6 | **(a)** — chỉ Owner xóa / bulk-delete | 27/04/2026 |

| ID | Câu hỏi | Phương án (PO chọn một) | Ảnh hưởng nếu chưa chốt | Blocker? |
| :--- | :--- | :--- | :--- | :---: |
| **OQ-1** | So sánh `effective_date` (DATE) với “hôm nay” cho giá hiện hành | **(a)** Dùng **ngày theo timezone DB** (`CURRENT_DATE` — thường = server). **(b)** Dùng **UTC** cố định (`(now() AT TIME ZONE 'utc')::date`). **(c)** Truyền `X-Timezone-Offset` từ client (phức tạp hơn). | Lệch giá cuối ngày theo múi giờ | Không |
| **OQ-2** | `categoryId` trỏ tới danh mục đã **soft-delete** (`deleted_at NOT NULL`) | **(a)** **Cấm** gán mới / PATCH sang category đã xóa → **400** `INVALID_CATEGORY`. **(b)** Cho phép (giữ FK) — chỉ ảnh hưởng UI filter. | POST/PATCH validation | Không |
| **OQ-3** | `POST …/bulk-delete` | **(a)** **All-or-nothing:** một `id` conflict → **409**, không xóa cái nào (**khuyến nghị** đơn giản, dễ test). **(b)** **Partial:** trả `deletedIds` + `failed[]` như mẫu Task041. | Contract response & transaction | **Đã chốt (a)** — không còn blocker |
| **OQ-4** | Ràng buộc **một** `is_primary` trên `product_images` | **(a)** Thêm **Flyway** partial unique (khớp Task039). **(b)** Chỉ enforce trong **service transaction** (không thêm index). | Race concurrent upload | Không |
| **OQ-5** | Multipart upload ảnh | **(a)** **v1 chỉ JSON** `url` (đã upload ngoài). **(b)** v1 hỗ trợ cả `multipart/form-data` + giới hạn size/MIME. | Scope Dev + lưu file | Không |
| **OQ-6** | Ai được `DELETE` / `bulk-delete` | **(a)** **Chỉ Owner** (JWT `role` + nhất quán Task033). **(b)** Mọi user có `can_manage_products` (Staff được xóa nếu pass business checks). | 403 vs 200 | Không |

---

## 5. Phân tích scope tệp & bằng chứng

### 5.1 Tài liệu đã đối chiếu (read)

- 7 file API Task034–039, 041; `API_PROJECT_DESIGN.md`; `SRS_Task029-033`; `FEATURES_UI_INDEX.md`; Flyway **V1** (Products, ProductImages, ProductUnits, ProductPriceHistory, Inventory, StockReceiptDetails, OrderDetails).

### 5.2 Mã / migration dự kiến (write / verify)

- Module mới hoặc mở rộng **`catalog`** / **`product`** (package team chốt): `*Controller`, `*Service`, `*Repository` / JDBC template, DTO response camelCase.
- Flyway **bắt buộc** (đã chốt **OQ-4(a)**): `V{n}__product_images_one_primary.sql` (tên gợi ý) — partial unique một ảnh primary / `product_id`.
- Test: slice controller + repository (list pagination, create transaction, delete conflict, bulk 409).

### 5.3 Rủi ro phát hiện sớm

- Sản phẩm **không** có `product_units` `is_base_unit = true` → list Task034 (JOIN inner) **loại** khỏi kết quả — dữ liệu cũ cần data fix hoặc đổi LEFT JOIN + `currentPrice` null (**không** khuyến nghị LEFT nếu UC8 yêu cầu mỗi SP có base unit — giữ INNER + seed repair).
- `DELETE Products`: `stock_receipt_details` / `order_details` là **ON DELETE RESTRICT** — bắt buộc kiểm tra app trước DELETE (Task038 đã mô tả).

---

## 6. Persona & RBAC

| Vai trò / quyền | Điều kiện | Task034–037, 039 | Task038, 041 |
| :--- | :--- | :--- | :--- |
| Có `can_manage_products` | JWT + permission | **Được** đọc / tạo / sửa / thêm ảnh URL (**OQ-5**) | **403** trên `DELETE` / `bulk-delete` (chỉ Owner được gọi — **OQ-6(a)**) |
| Thiếu permission | | **403** | **403** |
| Owner | `role` = Owner + `can_manage_products` | Giống hàng Staff (cột read/write) | **Được** `DELETE` / `bulk-delete` khi đủ điều kiện nghiệp vụ (không tồn/chứng từ) |

*(Chi tiết assert method đặt tên theo convention module `catalog` — `*AccessPolicy`.)*

---

## 7. Actor & luồng nghiệp vụ

### 7.1 Actor

| Actor | Mô tả |
| :--- | :--- |
| User | Nhân viên / chủ cửa hàng trên Mini-ERP |
| Client | SPA `mini-erp` |
| API | `smart-erp` |
| DB | PostgreSQL |

### 7.2 Luồng chính (tạo SP — tóm tắt)

1. Client `POST /products` + Bearer.  
2. API validate → kiểm tra `sku_code` unique, `category_id` tồn tại và **chưa** soft-delete (**OQ-2(a)**).  
3. Transaction: INSERT `products` → INSERT `product_units` (base) → INSERT `product_price_history`.  
4. `201` + body.

### 7.3 Sơ đồ

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant A as API
  participant D as DB
  U->>C: Điền form tạo SP
  C->>A: POST /api/v1/products
  A->>D: BEGIN; INSERT products, units, price_history
  D-->>A: OK
  A-->>C: 201 + data
```

---

## 8. Hợp đồng HTTP & ví dụ JSON

### 8.1 Tổng quan endpoint

| Task | Method + path | Auth | Ghi chú |
| :--- | :--- | :--- | :--- |
| 034 | `GET /api/v1/products` | Bearer | Query §8.2 |
| 035 | `POST /api/v1/products` | Bearer | Body §8.3 |
| 036 | `GET /api/v1/products/{id}` | Bearer | |
| 037 | `PATCH /api/v1/products/{id}` | Bearer | Partial body |
| 038 | `DELETE /api/v1/products/{id}` | Bearer | **Chỉ Owner** — **OQ-6(a)** |
| 039 | `POST /api/v1/products/{id}/images` | Bearer | JSON body §8.6 |
| 041 | `POST /api/v1/products/bulk-delete` | Bearer | Body `{ "ids": [] }` — **chỉ Owner** — **OQ-6(a)** |

### 8.2 `GET /api/v1/products` — query

| Param | Kiểu | Mặc định | Validation |
| :--- | :--- | :--- | :--- |
| `search` | string | — | `ILIKE` trên `name`, `sku_code`, `barcode` |
| `categoryId` | int | — | `> 0`, filter `products.category_id` |
| `status` | string | `all` | `all` \| `Active` \| `Inactive` |
| `page` | int | `1` | ≥ 1 |
| `limit` | int | `20` | 1–100 |
| `sort` | string | `updatedAt:desc` | **Whitelist:** `name:asc`, `name:desc`, `skuCode:asc`, `skuCode:desc`, `updatedAt:asc`, `updatedAt:desc`, `createdAt:asc`, `createdAt:desc` — khác → **400** |

**Ví dụ response 200 (rút gọn):** tham [`API_Task034_products_get_list.md`](../../../frontend/docs/api/API_Task034_products_get_list.md) §6.

**Quy ước — `currentPrice` khi chưa có lịch sử giá:** trả **`null`** (không dùng `0`) để tránh nhầm “miễn phí”.

### 8.3 `POST /api/v1/products` — body (đầy đủ)

```json
{
  "skuCode": "SP0001",
  "barcode": "8934563123456",
  "name": "Nước suối 500ml",
  "categoryId": 2,
  "description": null,
  "weight": 500,
  "status": "Active",
  "imageUrl": null,
  "baseUnitName": "Chai",
  "costPrice": 4000,
  "salePrice": 6000,
  "priceEffectiveDate": "2026-04-23"
}
```

**201 — ví dụ (shape tối thiểu):**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "skuCode": "SP0001",
    "barcode": "8934563123456",
    "name": "Nước suối 500ml",
    "categoryId": 2,
    "categoryName": "Đồ khô",
    "imageUrl": null,
    "status": "Active",
    "currentStock": 0,
    "currentPrice": 6000,
    "createdAt": "2026-04-27T10:00:00Z",
    "updatedAt": "2026-04-27T10:00:00Z",
    "unitId": 101
  },
  "message": "Đã tạo sản phẩm"
}
```

**Lỗi (mỗi mã một ví dụ):**

**400 — validation**

```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Dữ liệu không hợp lệ",
  "details": { "skuCode": "Bắt buộc" }
}
```

**404 — `categoryId` không tồn tại** *(không có row `categories.id`)*

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Danh mục không tồn tại",
  "details": { "categoryId": 99999 }
}
```

**400 — `categoryId` trỏ tới danh mục đã soft-delete** *(**OQ-2(a)**)*

```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Danh mục không còn hiệu lực",
  "details": { "categoryId": 2, "code": "INVALID_CATEGORY" }
}
```

**409 — SKU trùng**

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Mã SKU đã tồn tại",
  "details": { "skuCode": "SP0001" }
}
```

**401 / 403 / 500** — cùng envelope chuẩn dự án.

### 8.4 `GET /api/v1/products/{id}` — 200

Tham chiếu Task036 §4 (đủ `units`, `images`).

**404:**

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Không tìm thấy sản phẩm",
  "details": {}
}
```

### 8.5 `PATCH /api/v1/products/{id}` — body ví dụ

Task037 mẫu §4 — ít nhất một field; nếu đổi giá phải có **đủ** `salePrice` và `costPrice`.

**200:** trả object chi tiết gọn như Task036 hoặc item Task034 (team chốt một shape — khuyến nghị **Task036 gọn**).

**409** SKU trùng bản ghi khác.

### 8.6 `POST /api/v1/products/{id}/images` — JSON (v1)

```json
{
  "url": "https://cdn.example/p/12/b.jpg",
  "sortOrder": 1,
  "isPrimary": false
}
```

**201:**

```json
{
  "success": true,
  "data": {
    "id": 9,
    "productId": 12,
    "url": "https://cdn.example/p/12/b.jpg",
    "sortOrder": 1,
    "isPrimary": false
  },
  "message": "Đã thêm ảnh"
}
```

### 8.7 `DELETE /api/v1/products/{id}` — 200

```json
{
  "success": true,
  "data": { "id": 12, "deleted": true },
  "message": "Đã xóa sản phẩm"
}
```

**409** (tổng hợp một trong các lý do — message cụ thể theo ưu tiên Dev, **không** đổi mã):

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa sản phẩm đã xuất hiện trên phiếu nhập hoặc đơn hàng hoặc còn tồn kho",
  "details": { "reason": "HAS_ORDER_LINES" }
}
```

### 8.8 `POST /api/v1/products/bulk-delete` — body

```json
{
  "ids": [12, 15, 18]
}
```

**200 — bulk-delete all-or-nothing (đã xóa hết — **OQ-3(a)**):**

```json
{
  "success": true,
  "data": { "deletedIds": [12, 15, 18], "deletedCount": 3 },
  "message": "Đã xóa các sản phẩm"
}
```

**409 — một `id` lỗi → không xóa cái nào (**OQ-3(a)**):**

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Không thể xóa toàn bộ: ít nhất một sản phẩm không đủ điều kiện",
  "details": { "failedId": 18, "reason": "HAS_STOCK" }
}
```

### 8.9 Ghi chú envelope

- Bám `success`, `data`, `message`, `error`, `details` như các SRS trước; field `details.reason` là **gợi ý** để FE map.

---

## 9. Quy tắc nghiệp vụ

| Mã | Điều kiện | Hành động / kết quả |
| :--- | :--- | :--- |
| BR-1 | Mỗi `products` sau create | Đúng **một** `product_units` với `is_base_unit = TRUE`, `conversion_rate = 1` |
| BR-2 | Giá “hiện hành” | `effective_date` ≤ **`CURRENT_DATE`** (**OQ-1(a)**); order `effective_date DESC, id DESC`; áp dụng **per unit** (list chỉ base; detail mọi unit) |
| BR-3 | PATCH đổi `salePrice` hoặc `costPrice` | Luôn **INSERT** dòng `product_price_history` mới; không UPDATE dòng cũ |
| BR-4 | PATCH có `categoryId: null` (key có trong body) | `UPDATE products SET category_id = NULL` — SP “chưa phân loại” |
| BR-5 | Xóa SP | Chặn nếu tồn tại dòng `stock_receipt_details` hoặc `order_details` với `product_id`; chặn nếu `SUM(inventory.quantity) > 0` (an toàn Task038) |
| BR-6 | `bulk-delete` | **OQ-3(a):** validate **tất cả** `id` trước → nếu OK mới `DELETE … WHERE id = ANY(:ids)` trong **một** transaction; một lỗi → **409**, không xóa dòng nào |

---

## 10. Dữ liệu & SQL tham chiếu (Agent SQL)

### 10.1 Bảng / quan hệ (Flyway V1 — tên logic)

| Bảng | Read / Write | Ghi chú |
| :--- | :--- | :--- |
| `products` | R/W | `sku_code` UNIQUE |
| `categories` | R | JOIN tên; POST/PATCH: chỉ chấp nhận `category_id` có `deleted_at IS NULL` — nếu soft-deleted → **400** (**OQ-2(a)**) |
| `product_units` | R/W | FK `product_id` CASCADE DELETE |
| `product_price_history` | R/W | FK product, unit |
| `product_images` | R/W | FK `product_id` CASCADE |
| `inventory` | R | SUM quantity; CASCADE delete khi xóa product |
| `stock_receipt_details` | R | `product_id` **RESTRICT** |
| `order_details` | R | `product_id` **RESTRICT** |

### 10.2 SQL gợi ý — list (đếm total tách query hoặc window — tối thiểu)

```sql
-- Đếm total (filter giống list)
SELECT COUNT(*)::bigint
FROM products p
JOIN product_units pu ON pu.product_id = p.id AND pu.is_base_unit = TRUE
WHERE (:search IS NULL OR p.name ILIKE '%' || :search || '%' OR p.sku_code ILIKE '%' || :search || '%' OR p.barcode ILIKE '%' || :search || '%')
  AND (:category_id IS NULL OR p.category_id = :category_id)
  AND (:status = 'all' OR p.status = :status);

-- Trang dữ liệu (JOIN category, inv aggregate, lateral price) — pattern Task034 §7.1, đổi tên bảng thường
```

Transaction **POST product** (pseudo):

```sql
BEGIN;
INSERT INTO products (category_id, sku_code, barcode, name, image_url, description, weight, status)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;
INSERT INTO product_units (product_id, unit_name, conversion_rate, is_base_unit)
VALUES ($pid, $uname, 1, TRUE) RETURNING id;
INSERT INTO product_price_history (product_id, unit_id, cost_price, sale_price, effective_date)
VALUES ($pid, $uid, $cost, $sale, $eff);
COMMIT;
```

### 10.3 Index

- Đã có: `idx_products_sku`, `idx_products_name`, `idx_price_lookup`, `idx_pi_product`.
- Cân nhắc: composite `(category_id, status)` nếu list theo danh mục lớn — đo `EXPLAIN` sau triển khai.

### 10.4 Kiểm chứng Tester

- Tạo SP → list có `currentStock=0`, `currentPrice` khớp insert.
- PATCH giá → 2 dòng `product_price_history` cho cùng unit.
- Xóa SP có tồn → 409; xóa SP có dòng order_details (seed) → 409.
- Primary image: sau Flyway **OQ-4(a)**, DB từ chối hai primary; + transaction vẫn reset `is_primary` khi đổi primary.

---

## 11. Acceptance criteria (Given / When / Then)

```text
Given user có can_manage_products và có categories + products seed
When GET /api/v1/products?page=1&limit=20&status=Active
Then 200 và data.total khớp COUNT filter và items.length <= 20

Given SKU mới hợp lệ
When POST /api/v1/products (đủ body Task035)
Then 201 và DB có 1 products + 1 product_units base + 1 product_price_history

Given product tồn tại
When PATCH /api/v1/products/{id} chỉ { "name": "X" }
Then 200 và name đổi, giá history không thêm dòng

Given product tồn tại
When PATCH với salePrice+costPrice khác latest
Then 200 và thêm đúng 1 dòng product_price_history

Given product có inventory.quantity tổng > 0
When DELETE /api/v1/products/{id}
Then 409 và product vẫn tồn tại

Given ba id đều xóa được
When POST /api/v1/products/bulk-delete (all-or-nothing)
Then 200 và cả ba bị xóa

Given một trong ba không xóa được
When POST bulk-delete (all-or-nothing)
Then 409 và không id nào bị xóa
```

---

## 12. GAP & giả định

| GAP / Giả định | Tác động | Hành động đề xuất |
| :--- | :--- | :--- |
| Task039 DDL trùng `product_images` | Tránh migration sai | Dùng bảng V1 + map `url` ↔ `image_url` (§0.1) — **giữ** |
| Phân nhánh lỗi `categoryId` | FE map message | **Đã chốt:** không tồn tại → **404**; soft-deleted → **400** + `INVALID_CATEGORY` (§8.3) |
| RBAC Admin đọc list | Task034 ghi Admin | Giả định Admin có `can_manage_products` seed — nếu không → bổ sung seed hoặc GAP |
| Upload Cloudinary | Không trong v1 products API | Theo **OQ-5** — SRS/task follow-up sau khi chốt thiết kế upload |

---

## 13. PO sign-off (Approved)

- [x] Đã trả lời / đóng các **OQ** §4.2 (OQ-1 … OQ-6)
- [x] JSON / status codes (§8) và RBAC (§6) khớp quyết định PO
- [x] In/Out scope §3 đã đồng ý (v1 URL ảnh; Cloudinary backlog **OQ-5**)

**Chữ ký / nhãn PR:** PO — 27/04/2026 *(cập nhật nhãn ticket/PR theo quy trình team)*
