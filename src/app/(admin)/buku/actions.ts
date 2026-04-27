// src/app/(admin)/buku/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fungsi 1: Mencari metadata buku dari Google Books API
export async function fetchBookMetadata(isbn: string) {
  if (!isbn) return { success: false, error: "ISBN tidak boleh kosong." };

  try {
    // Memanggil API publik Google Books
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const volumeInfo = data.items[0].volumeInfo;
      
      // Kembalikan data yang berhasil diekstrak
      return {
        success: true,
        data: {
          title: volumeInfo.title || "",
          author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "",
          publisher: volumeInfo.publisher || "",
          category: volumeInfo.categories ? volumeInfo.categories[0] : "Umum",
          coverUrl: volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        }
      };
    }
    
    return { success: false, error: "Buku tidak ditemukan di database online. Silakan isi manual." };
  } catch (error) {
    return { success: false, error: "Gagal terhubung ke server pencarian." };
  }
}

// Fungsi 2: Menyimpan buku ke Database (Supabase)
export async function createBook(formData: {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  coverUrl: string;
  stock: number;
}) {
  try {
    // Cek apakah buku dengan ISBN tersebut sudah ada di perpustakaan
    const existingBook = await prisma.book.findUnique({
      where: { isbn: formData.isbn }
    });

    if (existingBook) {
      // Jika sudah ada, cukup tambahkan stoknya
      await prisma.book.update({
        where: { isbn: formData.isbn },
        data: {
          stock: existingBook.stock + formData.stock,
          stockTotal: existingBook.stockTotal + formData.stock
        }
      });
    } else {
      // Jika belum ada, buat record buku baru
      await prisma.book.create({
        data: {
          isbn: formData.isbn,
          title: formData.title,
          author: formData.author,
          publisher: formData.publisher,
          category: formData.category,
          coverUrl: formData.coverUrl,
          stock: formData.stock,
          stockTotal: formData.stock
        }
      });
    }

    // Perbarui tampilan tabel buku secara instan
    revalidatePath("/buku");
    return { success: true };
  } catch (error) {
    console.error("Error saving book:", error);
    return { success: false, error: "Gagal menyimpan buku ke database." };
  }
}