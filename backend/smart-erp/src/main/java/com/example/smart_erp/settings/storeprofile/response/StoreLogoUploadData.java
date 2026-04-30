package com.example.smart_erp.settings.storeprofile.response;

import java.time.Instant;

/**
 * Task075 — response data for logo upload.
 */
public record StoreLogoUploadData(String logoUrl, Instant updatedAt) {
}

