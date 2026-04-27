package com.example.smart_erp.catalog.response;

/**
 * Task039 success payload: {@code url} mirrors DB {@code image_url}.
 */
public record ProductImageData(int id, int productId, String url, int sortOrder, boolean isPrimary) {
}
