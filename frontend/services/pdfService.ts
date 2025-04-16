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
        
        // Render edilmesi için gerekli tüm stilleri uygula
        clone.style.margin = '0';
        clone.style.padding = '20px'; // Padding arttır
        clone.style.width = '210mm'; // A4 genişliği
        clone.style.maxWidth = '210mm';
        clone.style.height = 'auto';
        clone.style.boxSizing = 'border-box';
        clone.style.boxShadow = 'none';
        clone.style.backgroundColor = '#ffffff';
        clone.style.overflow = 'hidden';
        
        // Yazı tipi için stil ekle
        const fontStyle = document.createElement('style');
        fontStyle.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          #pdf-container * {
            font-family: 'Roboto', Arial, sans-serif;
          }
        `;
        document.head.appendChild(fontStyle);
        
        // Klonu konteynere ekle
        tempContainer.appendChild(clone);
        
        // Elementin tam olarak render edilmesi için bir süre bekle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Canvas oluştur - yüksek çözünürlük için ölçeği artır
        const canvas = await html2canvas(clone, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          windowWidth: clone.scrollWidth,
          windowHeight: clone.scrollHeight,
          imageTimeout: 15000, // Resim yükleme zaman aşımını arttır
          foreignObjectRendering: false, // SVG ve diğer yabancı objeleri canvas olarak render et
          ignoreElements: (element) => {
            // Görünmez elementleri atlayarak performansı artır
            const style = window.getComputedStyle(element);
            return style.display === 'none' || style.visibility === 'hidden';
          },
          onclone: (document, clonedDoc) => {
            // Klonlanmış dokümanda ek stil düzenlemeleri yapılabilir
            const clonedElement = clonedDoc.querySelector('#pdf-container');
            if (clonedElement) {
              // Image elementleri için düzeltmeler
              const images = clonedElement.querySelectorAll('img');
              images.forEach((img: HTMLImageElement) => {
                img.style.maxWidth = '100%';
                if (!img.hasAttribute('crossorigin')) {
                  img.crossOrigin = 'anonymous';
                }
                
                // Base64 veya data URL resimleri için özel işlem gerekmez
                if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
                  // Resmin yüklenmesini bekleyip render etme sorunlarını önle
                  img.setAttribute('loading', 'eager');
                  
                  // Resimlerin oranlarını koru
                  img.style.objectFit = 'cover';
                }
              });
            }
          }
        });
        
        // Stilleri temizle
        document.head.removeChild(fontStyle);
        
        // Geçici elemanları temizle
        tempContainer.removeChild(clone);
        document.body.removeChild(tempContainer);
        
        // console.log(`Canvas oluşturuldu, boyutlar: ${canvas.width}x${canvas.height}px`);
        
        // PDF dökümanı oluştur - marjinsiz tam sayfa olarak
        const pdf = new jsPDF({
          orientation: orientation, 
          unit: 'mm',
          format: 'a4',
          compress: true,
          hotfixes: ['px_scaling'] // Piksel ölçekleme sorunlarını çöz
        });
        
        // PDF A4 boyutları
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Kenar boşluğu olmadan kullanılabilir alan
        const contentWidth = pdfWidth - (margin[0] + margin[2]);
        
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
          if (imgHeight <= pdfHeight - (margin[1] + margin[3])) {
            // İçerik sayfaya sığıyor - sayfayı ortalama
            pdf.addImage(imgData, 'JPEG', margin[0], margin[1], imgWidth, imgHeight);
          } else {
            // İçerik tek sayfadan büyük - içeriği ölçeklendirerek sığdır
            const scaleFactor = (pdfHeight - (margin[1] + margin[3])) / imgHeight;
            const scaledWidth = imgWidth * scaleFactor;
            const xOffset = margin[0] + (contentWidth - scaledWidth) / 2;
            
            pdf.addImage(imgData, 'JPEG', xOffset, margin[1], scaledWidth, pdfHeight - (margin[1] + margin[3]));
          }
        } else {
          // Çoklu sayfa modu - içeriği sayfalar halinde böl
          const imgWidth = contentWidth;
          const imgHeight = contentWidth * canvasRatio;
          
          if (imgHeight <= pdfHeight - (margin[1] + margin[3])) {
            // İçerik tek sayfaya sığıyor
            pdf.addImage(imgData, 'JPEG', margin[0], margin[1], imgWidth, imgHeight);
          } else {
            // Her sayfada ne kadar içerik gösterileceğini hesapla
            const pageHeight = pdfHeight - (margin[1] + margin[3]);
            const contentHeight = imgHeight;
            const pageCount = Math.ceil(contentHeight / pageHeight);
            
            // Her sayfa için işlem yap
            for (let i = 0; i < pageCount; i++) {
              if (i > 0) {
                pdf.addPage();
              }
              
              // Sayfada gösterilecek içeriğin pozisyonunu ve yüksekliğini hesapla
              const sourceY = pageHeight * i;
              const sourceHeight = Math.min(pageHeight, contentHeight - sourceY);
              
              // Kaynak ve hedef boyutlarını belirle
              const sx = 0;
              const sy = (sourceY / imgHeight) * canvas.height;
              const sWidth = canvas.width;
              const sHeight = (sourceHeight / imgHeight) * canvas.height;
              
              // Hedef konumu ve boyutları belirle
              const dx = margin[0];
              const dy = margin[1];
              const dWidth = imgWidth;
              const dHeight = sourceHeight;
              
              // Görüntüyü sayfaya ekle
              pdf.addImage(
                imgData, 
                'JPEG', 
                dx, 
                dy, 
                dWidth, 
                dHeight, 
                undefined, 
                'FAST'
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