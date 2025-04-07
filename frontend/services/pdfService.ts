// html2pdf'yi doğrudan import etmek yerine, dinamik olarak yüklüyoruz
// import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';

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
      // console.log('PDF oluşturma başladı...');
      
      const {
        element,
        filename,
        margin = [0, 0, 0, 0], // Varsayılan marjinleri 0 olarak ayarla
        orientation = 'portrait',
        scale = 3, // Ölçeği artır
        singlePage = true // Varsayılan olarak tek sayfa
      } = options;

      // Element kontrolü
      if (!element) {
        // console.error('PDF oluşturma hatası: Element bulunamadı');
        return false;
      }

      try {
        // Dinamik olarak html2canvas ve jsPDF modüllerini import et
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        
        // Geçici bir klonlama konteyneri oluştur
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        document.body.appendChild(tempContainer);
        
        // Elementi klonla ve tam boyutlu ayarla
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Stili sıfırla
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.width = '210mm'; // A4 genişliği
        clone.style.maxWidth = '210mm';
        clone.style.height = 'auto';
        clone.style.boxSizing = 'border-box';
        clone.style.boxShadow = 'none';
        
        // Klonu konteynere ekle
        tempContainer.appendChild(clone);
        
        // Canvas oluştur - yüksek çözünürlük için ölçeği artır
        const canvas = await html2canvas(clone, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          windowWidth: clone.scrollWidth,
          windowHeight: clone.scrollHeight
        });
        
        // Geçici elemanları temizle
        tempContainer.removeChild(clone);
        document.body.removeChild(tempContainer);
        
        // console.log(`Canvas oluşturuldu, boyutlar: ${canvas.width}x${canvas.height}px`);
        
        // PDF dökümanı oluştur - marjinsiz tam sayfa olarak
        const pdf = new jsPDF({
          orientation: orientation, 
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        // PDF A4 boyutları
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Kenar boşluğu olmadan kullanılabilir alan
        const contentWidth = pdfWidth;
        
        // Canvas'ı JPEG'e dönüştür - yüksek kalite
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Canvas oranını hesapla
        const canvasRatio = canvas.height / canvas.width;
        
        // Tek sayfa modu - içeriği sayfaya tam sığdır
        if (singlePage) {
          // İçeriği tam sayfaya sığdır
          const imgWidth = contentWidth;
          const imgHeight = contentWidth * canvasRatio;
          
          // İçerik sayfaya sığıyor mu kontrol et
          if (imgHeight <= pdfHeight) {
            // İçerik sayfaya sığıyor - sayfayı ortalama
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          } else {
            // İçerik tek sayfadan büyük - içeriği ölçeklendirerek sığdır
            const scaleFactor = pdfHeight / imgHeight;
            const scaledWidth = imgWidth * scaleFactor;
            const xOffset = (pdfWidth - scaledWidth) / 2;
            
            pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
          }
        } else {
          // Çoklu sayfa - şu an kullanılmıyor ama opsiyonel olarak bulunuyor
          const imgWidth = contentWidth;
          const imgHeight = contentWidth * canvasRatio;
          
          if (imgHeight <= pdfHeight) {
            // İçerik tek sayfaya sığıyor
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          } else {
            // A4 sayfası oranında bir scale faktörü hesapla
            const pageRatio = pdfHeight / pdfWidth;
            
            // İçerik genişliğini sayfaya sığdır ve kağıdı doldur
            const scaledWidth = pdfWidth;
            const scaledHeight = pdfWidth * canvasRatio;
            
            // Sayfa sayısını hesapla
            const pageCount = Math.ceil(scaledHeight / pdfHeight);
            
            for (let i = 0; i < pageCount; i++) {
              if (i > 0) {
                pdf.addPage();
              }
              
              // Geçerli sayfa için görüntü konumu
              const position = (pdfHeight * i) / scaledHeight;
              const height = Math.min(pdfHeight / scaledHeight, 1 - position);
              
              // Görüntüyü sayfaya ekle, tüm sayfayı kapla
              // addImage için alternatif bir yöntem kullan - clip kullanarak
              const clipY = position * scaledHeight;
              const clipHeight = height * scaledHeight;
              
              // Tek parça olarak işlenecek alan
              pdf.addImage(
                imgData, 
                'JPEG', 
                0, 
                -clipY, 
                pdfWidth, 
                scaledHeight
              );
            }
          }
        }
        
        // PDF'i indir
        pdf.save(filename);
        // console.log('PDF indirme işlemi tamamlandı');
        
        return true;
        
      } catch (renderError) {
        console.error('PDF render hatası:', renderError);
        throw renderError;
      }
    } catch (error) {
      console.error('PDF servis hatası:', error);
      toast.error(`PDF oluşturma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      return false;
    }
  }
}; 