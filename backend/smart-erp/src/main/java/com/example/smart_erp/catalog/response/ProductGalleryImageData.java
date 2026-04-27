package com.example.smart_erp.catalog.response;

/** Task036 gallery line (maps DB image_url → JSON url) */
public record ProductGalleryImageData(int id, String url, int sortOrder, boolean isPrimary) {
}
