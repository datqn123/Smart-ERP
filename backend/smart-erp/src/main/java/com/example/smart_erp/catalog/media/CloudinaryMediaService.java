package com.example.smart_erp.catalog.media;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.smart_erp.common.api.ApiErrorCode;
import com.example.smart_erp.common.exception.BusinessException;
import com.example.smart_erp.config.CloudinaryProperties;

/**
 * Validates image uploads and pushes bytes to Cloudinary; returns {@code secure_url}.
 */
@Service
public class CloudinaryMediaService {

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

	private final Optional<Cloudinary> cloudinary;
	private final CloudinaryProperties props;

	private static final String STORE_PROFILE_LOGO_FOLDER_PREFIX = "smart-erp/store-profiles";

	public CloudinaryMediaService(Optional<Cloudinary> cloudinary, CloudinaryProperties props) {
		this.cloudinary = cloudinary;
		this.props = props;
	}

	/**
	 * @param productId used only for folder organisation on Cloudinary
	 * @return HTTPS secure URL from Cloudinary
	 */
	public String uploadProductImage(MultipartFile file, int productId) {
		Objects.requireNonNull(file, "file");
		if (!props.isEnabled()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Upload file chưa bật: đặt app.cloudinary.enabled=true và biến môi trường CLOUDINARY_*.");
		}
		if (cloudinary.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Cloudinary chưa sẵn sàng: kiểm tra app.cloudinary.enabled và đủ cloud-name, api-key, api-secret.");
		}
		validateFile(file);

		String folder = props.getFolder().replaceAll("/+$", "") + "/" + productId;
		String publicId = UUID.randomUUID().toString();

		try {
			byte[] bytes = file.getBytes();
			@SuppressWarnings("unchecked")
			Map<String, Object> result = cloudinary.get().uploader().upload(bytes,
					ObjectUtils.asMap("folder", folder, "public_id", publicId, "resource_type", "image", "overwrite", false));
			Object url = result != null ? result.get("secure_url") : null;
			if (!(url instanceof String s) || s.isBlank()) {
				throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Phản hồi tải ảnh không hợp lệ");
			}
			return s;
		}
		catch (IOException e) {
			throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Không đọc được file tải lên");
		}
		catch (RuntimeException e) {
			throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR,
					"Không thể tải ảnh lên dịch vụ lưu trữ. Vui lòng thử lại sau.");
		}
	}

	/**
	 * Task073–075: upload logo cửa hàng (StoreProfiles.logo_url).
	 *
	 * @param ownerId dùng để phân tách folder theo tenant
	 * @return HTTPS secure URL từ Cloudinary
	 */
	public String uploadStoreProfileLogo(MultipartFile file, int ownerId) {
		Objects.requireNonNull(file, "file");
		if (!props.isEnabled()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Upload file chưa bật. Vui lòng liên hệ quản trị để cấu hình dịch vụ lưu trữ.");
		}
		if (cloudinary.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST,
					"Dịch vụ lưu trữ chưa sẵn sàng. Vui lòng thử lại sau hoặc liên hệ quản trị.");
		}
		validateFile(file);
		String folder = STORE_PROFILE_LOGO_FOLDER_PREFIX + "/" + ownerId;
		String publicId = UUID.randomUUID().toString();
		try {
			byte[] bytes = file.getBytes();
			@SuppressWarnings("unchecked")
			Map<String, Object> result = cloudinary.get().uploader().upload(bytes,
					ObjectUtils.asMap("folder", folder, "public_id", publicId, "resource_type", "image", "overwrite", false));
			Object url = result != null ? result.get("secure_url") : null;
			if (!(url instanceof String s) || s.isBlank()) {
				throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Phản hồi tải ảnh không hợp lệ");
			}
			return s;
		}
		catch (IOException e) {
			throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR, "Không đọc được file tải lên");
		}
		catch (RuntimeException e) {
			throw new BusinessException(ApiErrorCode.INTERNAL_SERVER_ERROR,
					"Không thể tải ảnh lên dịch vụ lưu trữ. Vui lòng thử lại sau.");
		}
	}

	public void validateFile(MultipartFile file) {
		if (file.isEmpty()) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "File rỗng", Map.of("file", "Bắt buộc có nội dung"));
		}
		long max = props.getMaxFileSizeBytes();
		if (file.getSize() > max) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "File vượt quá kích thước cho phép",
					Map.of("file", humanMaxFileLabel(max)));
		}
		String contentType = normalizeContentType(file.getContentType());
		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
			throw new BusinessException(ApiErrorCode.BAD_REQUEST, "Định dạng ảnh không được hỗ trợ",
					Map.of("file", "Chỉ chấp nhận JPEG, PNG, WebP"));
		}
	}

	/** Nhãn tiếng Việt cho giới hạn kích thước (ưu tiên MB/KB khi chia hết). */
	private static String humanMaxFileLabel(long maxBytes) {
		if (maxBytes <= 0) {
			return "0 byte";
		}
		long mib = 1024L * 1024L;
		if (maxBytes % mib == 0) {
			return "Tối đa " + (maxBytes / mib) + " MB";
		}
		long kib = 1024L;
		if (maxBytes % kib == 0) {
			return "Tối đa " + (maxBytes / kib) + " KB";
		}
		return "Tối đa " + maxBytes + " byte";
	}

	private static String normalizeContentType(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		String t = raw.trim().toLowerCase(Locale.ROOT);
		int semi = t.indexOf(';');
		if (semi > 0) {
			t = t.substring(0, semi).trim();
		}
		return t;
	}
}
