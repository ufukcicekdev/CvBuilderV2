// html2pdf'yi doğrudan import etmek yerine, dinamik olarak yüklüyoruz
// import html2pdf from 'html2pdf.js';

interface GeneratePdfOptions {
  element: HTMLElement;
  filename: string;
  margin?: number[];
  orientation?: 'portrait' | 'landscape';
  scale?: number; 
  singlePage?: boolean;
}

export const pdfService = {
  /**
   * HTML elementinden PDF oluşturur ve indirir
   * @param options Seçenekler: element, filename, margin vb.
   * @returns Promise<boolean> - işlem başarılı oldu mu?
   */
  generatePdf: async (options: GeneratePdfOptions): Promise<boolean> => {
    try {
      // html2pdf'yi dinamik olarak yükle (sadece istemci tarafında)
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      const {
        element,
        filename,
        margin = [10, 10, 10, 10], // top, left, bottom, right - daha küçük marjlar
        orientation = 'portrait',
        scale = 2, // Daha düşük ölçek, daha küçük dosya boyutu ve daha iyi ölçekleme
        singlePage = true // Varsayılan olarak tek sayfa aktif
      } = options;

      // Sayfa kırılımını önlemek için, tek sayfaya sığdırmak istiyorsak
      const pagebreak = singlePage 
        ? { mode: 'avoid-all', before: '#page-break' } // Sayfa sonlarını önle
        : { mode: 'css', before: '#page-break' }; // Normal sayfa sonu davranışı

      const pdfOptions = {
        margin,
        filename,
        image: { type: 'jpeg', quality: 0.98 }, // Kaliteyi biraz arttırdık
        html2canvas: { 
          scale,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: element.offsetWidth || 1200,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation, 
          compress: true,
          hotfixes: ["px_scaling"],
        },
        pagebreak
      };

      // Sayfa boyutuna göre ölçekleme yapılması için
      if (singlePage) {
        // Ekstra çözüm: İçerik büyükse element'i dönüştürmeden önce ölçeklendir
        const contentWidth = element.offsetWidth;
        const contentHeight = element.offsetHeight;
        const a4Width = 210; // mm cinsinden A4 genişliği
        const a4Height = 297; // mm cinsinden A4 yüksekliği (portrait için)
        
        // İçerik oranına göre daha iyi bir ölçek faktörü hesapla
        const widthScale = (a4Width - 2 * margin[1]) / (contentWidth / 3.779527559); // mm cinsine dönüştür (1mm = 3.779527559px)
        const heightScale = (a4Height - 2 * margin[0]) / (contentHeight / 3.779527559);
        
        // En küçük ölçeği seç (sığdırma için)
        const fitScale = Math.min(widthScale, heightScale, 1); // 1'den büyük olmayacak şekilde
        
        // Element'in transform stilini güncelle (bu tüm sayfanın tek sayfaya sığması için yardımcı olur)
        element.style.transformOrigin = 'top left';
        element.style.transform = `scale(${fitScale})`;
      }

      const result = await html2pdf()
        .set(pdfOptions)
        .from(element)
        .outputPdf('blob');
      
      // PDF oluşturulduktan sonra varsa ölçekleme dönüşümlerini temizle
      if (singlePage) {
        element.style.transform = '';
      }
      
      // Blob'u indirmek için
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      return false;
    }
  }
}; 