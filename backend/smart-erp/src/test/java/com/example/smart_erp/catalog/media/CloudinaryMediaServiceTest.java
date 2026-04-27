package com.example.smart_erp.catalog.media;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.config.CloudinaryProperties;

class CloudinaryMediaServiceTest {

	@Test
	void validateFile_acceptsSmallPng() {
		CloudinaryProperties props = new CloudinaryProperties();
		props.setMaxFileSizeBytes(1024);
		var svc = new CloudinaryMediaService(Optional.empty(), props);
		var file = new MockMultipartFile("file", "x.png", "image/png", new byte[] { 1, 2, 3 });
		assertDoesNotThrow(() -> svc.validateFile(file));
	}

	@Test
	void validateFile_rejectsEmpty() {
		CloudinaryProperties props = new CloudinaryProperties();
		var svc = new CloudinaryMediaService(Optional.empty(), props);
		var file = new MockMultipartFile("file", "x.png", "image/png", new byte[0]);
		assertThrows(BusinessException.class, () -> svc.validateFile(file));
	}

	@Test
	void validateFile_rejectsOversize() {
		CloudinaryProperties props = new CloudinaryProperties();
		props.setMaxFileSizeBytes(2);
		var svc = new CloudinaryMediaService(Optional.empty(), props);
		var file = new MockMultipartFile("file", "x.png", "image/png", new byte[] { 1, 2, 3 });
		assertThrows(BusinessException.class, () -> svc.validateFile(file));
	}

	@Test
	void validateFile_rejectsBadMime() {
		CloudinaryProperties props = new CloudinaryProperties();
		var svc = new CloudinaryMediaService(Optional.empty(), props);
		var file = new MockMultipartFile("file", "x.gif", "image/gif", new byte[] { 1 });
		assertThrows(BusinessException.class, () -> svc.validateFile(file));
	}

	@Test
	void uploadProductImage_rejectsWhenDisabled() {
		CloudinaryProperties props = new CloudinaryProperties();
		props.setEnabled(false);
		var svc = new CloudinaryMediaService(Optional.empty(), props);
		var file = new MockMultipartFile("file", "x.png", "image/png", new byte[] { 1 });
		assertThrows(BusinessException.class, () -> svc.uploadProductImage(file, 1));
	}
}
