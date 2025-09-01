import { 
	ref, 
	uploadBytes, 
	getDownloadURL, 
	deleteObject,
	type UploadMetadata 
} from "firebase/storage";
import { storage } from "../lib/firebaseconfig";
import type { Attachment } from "../types/nonConformities";

// Upload de arquivo
export const uploadAttachment = async (
	file: File,
	userId: string,
	category: Attachment["category"] = "other",
	description?: string
): Promise<Attachment> => {
	try {
		// Validar tipo e tamanho do arquivo
		if (!validateFile(file)) {
			throw new Error("Arquivo inválido");
		}

		// Criar nome único para o arquivo
		const timestamp = Date.now();
		const fileName = `${timestamp}_${file.name}`;
		const filePath = `attachments/${category}/${fileName}`;

		// Referência no storage
		const storageRef = ref(storage, filePath);

		// Metadata do arquivo
		const metadata: UploadMetadata = {
			contentType: file.type,
			customMetadata: {
				uploadedBy: userId,
				originalName: file.name,
				description: description || "",
				category: category,
			},
		};

		// Upload do arquivo
		const snapshot = await uploadBytes(storageRef, file, metadata);
		
		// Obter URL de download
		const downloadURL = await getDownloadURL(snapshot.ref);

		// Criar objeto de anexo
		const attachment: Attachment = {
			id: snapshot.ref.name,
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
			uploadedAt: new Date().toISOString(),
			uploadedBy: userId,
			url: downloadURL,
			description: description,
			category: category,
		};

		// Gerar thumbnail para imagens
		if (file.type.startsWith("image/")) {
			try {
				const thumbnailURL = await generateThumbnail(file, storageRef);
				attachment.thumbnailUrl = thumbnailURL;
			} catch (error) {
				console.warn("Erro ao gerar thumbnail:", error);
			}
		}

		return attachment;
	} catch (error) {
		console.error("Erro no upload do anexo:", error);
		throw new Error(`Falha no upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
	}
};

// Gerar thumbnail para imagens
const generateThumbnail = async (file: File, storageRef: any): Promise<string> => {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			// Calcular dimensões do thumbnail (máximo 200x200)
			const maxSize = 200;
			let { width, height } = img;
			
			if (width > height) {
				if (width > maxSize) {
					height = (height * maxSize) / width;
					width = maxSize;
				}
			} else {
				if (height > maxSize) {
					width = (width * maxSize) / height;
					height = maxSize;
				}
			}

			canvas.width = width;
			canvas.height = height;

			// Desenhar imagem redimensionada
			ctx?.drawImage(img, 0, 0, width, height);

			// Converter para blob
			canvas.toBlob(async (blob) => {
				if (!blob) {
					reject(new Error("Falha ao gerar thumbnail"));
					return;
				}

				try {
					// Upload do thumbnail
					const thumbnailRef = ref(storage, `${storageRef.fullPath}_thumb`);
					await uploadBytes(thumbnailRef, blob, {
						contentType: "image/jpeg",
					});
					
					const thumbnailURL = await getDownloadURL(thumbnailRef);
					resolve(thumbnailURL);
				} catch (error) {
					reject(error);
				}
			}, "image/jpeg", 0.8);
		};

		img.onerror = () => reject(new Error("Falha ao carregar imagem"));
		img.src = URL.createObjectURL(file);
	});
};

// Validar arquivo
const validateFile = (file: File): boolean => {
	// Tipos permitidos
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"text/plain",
		"video/mp4",
		"video/avi",
		"audio/mpeg",
		"audio/wav",
	];

	// Tamanho máximo (10MB)
	const maxSize = 10 * 1024 * 1024;

	if (!allowedTypes.includes(file.type)) {
		throw new Error("Tipo de arquivo não suportado");
	}

	if (file.size > maxSize) {
		throw new Error("Arquivo muito grande (máximo 10MB)");
	}

	return true;
};

// Excluir anexo
export const deleteAttachment = async (attachment: Attachment): Promise<void> => {
	try {
		// Excluir arquivo principal
		const fileRef = ref(storage, attachment.url);
		await deleteObject(fileRef);

		// Excluir thumbnail se existir
		if (attachment.thumbnailUrl) {
			const thumbRef = ref(storage, attachment.thumbnailUrl);
			await deleteObject(thumbRef);
		}
	} catch (error) {
		console.error("Erro ao excluir anexo:", error);
		throw new Error(`Falha ao excluir anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
	}
};

// Obter anexos por categoria
export const getAttachmentsByCategory = async (): Promise<Attachment[]> => {
	// Esta função seria implementada se você tivesse um banco de dados
	// para armazenar metadados dos anexos
	// Por enquanto, retorna array vazio
	return [];
};

// Validar múltiplos arquivos
export const validateMultipleFiles = (files: File[]): { valid: File[]; invalid: string[] } => {
	const valid: File[] = [];
	const invalid: string[] = [];

	files.forEach((file) => {
		try {
			if (validateFile(file)) {
				valid.push(file);
			}
		} catch (error) {
			invalid.push(`${file.name}: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
		}
	});

	return { valid, invalid };
};

// Upload de múltiplos arquivos
export const uploadMultipleAttachments = async (
	files: File[],
	userId: string,
	category: Attachment["category"] = "other"
): Promise<Attachment[]> => {
	const { valid, invalid } = validateMultipleFiles(files);
	
	if (invalid.length > 0) {
		console.warn("Arquivos inválidos:", invalid);
	}

	const uploadPromises = valid.map(file => uploadAttachment(file, userId, category));
	
	try {
		const attachments = await Promise.all(uploadPromises);
		return attachments;
	} catch (error) {
		console.error("Erro no upload de múltiplos anexos:", error);
		throw new Error(`Falha no upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
	}
};
