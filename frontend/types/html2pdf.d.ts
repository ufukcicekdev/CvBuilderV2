declare module 'html2pdf.js' {
  function html2pdf(): any;
  namespace html2pdf {
    function from(element: HTMLElement): any;
    function set(options: any): any;
    function save(): any;
    function outputPdf(type: string): Promise<Blob>;
  }
  export = html2pdf;
} 