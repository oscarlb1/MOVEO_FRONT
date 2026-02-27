import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportadorServicio = {
    /**
     * Exporta datos a un archivo PDF.
     * @param titulo Título principal del documento.
     * @param columnas Lista de nombres de las columnas.
     * @param filas Matriz de datos correspondiente a las columnas.
     * @param nombreArchivo Nombre del archivo a descargar (sin extensión).
     */
    exportarPDF: (titulo: string, columnas: string[], filas: any[][], nombreArchivo: string) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text(titulo, 14, 22);

        // Fecha de generación
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 14, 30);

        // Tabla
        autoTable(doc, {
            startY: 40,
            head: [columnas],
            body: filas,
            theme: 'grid',
            headStyles: { fillColor: [230, 126, 80] }, // Color #E67E50
            styles: { fontSize: 9 },
        });

        doc.save(`${nombreArchivo}.pdf`);
    },

    /**
     * Exporta datos a un archivo Excel (XLSX).
     * @param sheetName Nombre de la hoja de cálculo.
     * @param datos Array de objetos con clave-valor (las claves serán las columnas).
     * @param nombreArchivo Nombre del archivo a descargar (sin extensión).
     */
    exportarExcel: (sheetName: string, datos: any[], nombreArchivo: string) => {
        const worksheet = XLSX.utils.json_to_sheet(datos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
    }
};

export default exportadorServicio;
