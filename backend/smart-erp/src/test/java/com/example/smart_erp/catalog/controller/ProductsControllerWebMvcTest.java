package com.example.smart_erp.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Objects;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.smart_erp.catalog.response.ProductCreatedData;
import com.example.smart_erp.catalog.response.ProductImageData;
import com.example.smart_erp.catalog.service.ProductImageService;
import com.example.smart_erp.catalog.service.ProductService;
import com.example.smart_erp.common.exception.GlobalExceptionHandler;
import com.example.smart_erp.common.exception.MaxUploadSizeExceededAdvice;
import com.example.smart_erp.config.MethodSecurityTestConfiguration;
import com.example.smart_erp.config.PermitAllWebSecurityConfiguration;
import com.example.smart_erp.config.SecurityBeansConfiguration;

@WebMvcTest(controllers = ProductsController.class)
@Import({ GlobalExceptionHandler.class, MaxUploadSizeExceededAdvice.class, SecurityBeansConfiguration.class,
		PermitAllWebSecurityConfiguration.class, MethodSecurityTestConfiguration.class })
class ProductsControllerWebMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private ProductImageService productImageService;

	@MockitoBean
	private ProductService productService;

	@Test
	void createMultipart_returns201() throws Exception {
		Instant t = Instant.parse("2026-01-01T00:00:00Z");
		when(productService.createWithImageFiles(any(), any(), any()))
				.thenReturn(new ProductCreatedData(1, "SKU1", null, "N", null, null, null, "Active", 0, BigDecimal.ZERO, t, t, 2));
		String meta = """
				{"skuCode":"SKU1","name":"N","barcode":null,"categoryId":null,"description":null,"weight":null,"status":"Active","imageUrl":null,"baseUnitName":"Cái","costPrice":0,"salePrice":0}
				""";
		MockMultipartFile mpart = new MockMultipartFile("metadata", "", "application/json", meta.getBytes(StandardCharsets.UTF_8));
		MockMultipartFile f = new MockMultipartFile("file", "a.png", "image/png", new byte[] { 0x50, 0x4E, 0x47 });
		mockMvc.perform(multipart("/api/v1/products").file(mpart).file(f).param("primaryImageIndex", "0")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(1));
	}

	@Test
	void addImageJson_returns201() throws Exception {
		when(productImageService.addImageFromJson(anyInt(), any())).thenReturn(new ProductImageData(9, 12,
				"https://cdn.example/p/12/b.jpg", 1, false));

		String json = """
				{"url":"https://cdn.example/p/12/b.jpg","sortOrder":1,"isPrimary":false}
				""";
		mockMvc.perform(post("/api/v1/products/12/images").contentType(APPLICATION_JSON).content(json)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.url").value("https://cdn.example/p/12/b.jpg"))
				.andExpect(jsonPath("$.data.id").value(9));
		verify(productImageService).addImageFromJson(eq(12), any());
	}

	@Test
	void addImageMultipart_returns201() throws Exception {
		when(productImageService.addImageFromMultipart(eq(12), any(), eq(0), eq(false)))
				.thenReturn(new ProductImageData(10, 12, "https://res.cloudinary.com/x/image/upload/v1/a.png", 0, false));

		MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[] { 0x50, 0x4E, 0x47 });
		mockMvc.perform(multipart("/api/v1/products/12/images").file(file)
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isCreated()).andExpect(jsonPath("$.data.url").exists());
		verify(productImageService).addImageFromMultipart(eq(12), any(), eq(0), eq(false));
	}

	@Test
	void addImageMultipart_returns400WhenFileMissing() throws Exception {
		mockMvc.perform(multipart("/api/v1/products/12/images")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_manage_products")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isBadRequest());
	}

	@Test
	void addImageJson_returns403WithoutPermission() throws Exception {
		mockMvc.perform(post("/api/v1/products/12/images").contentType(APPLICATION_JSON)
				.content("{\"url\":\"https://example.com/a.jpg\"}")
				.with(Objects.requireNonNull(jwt().authorities(new SimpleGrantedAuthority("can_view_dashboard")))
						.jwt(j -> j.subject("1"))))
				.andExpect(status().isForbidden());
	}
}
