const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

const deliveries = [
    {
        name: "Parque Grande",
        alias: "Parque_Grande",
        address: "Paseo Isabel La Católica, Zaragoza",
        orderRef: "ALB-2026-001",
        items: ["Material de Mantenimiento Parques: 2 cajas", "Herramientas de Jardinería: 1 ud"],
        client: "Ayuntamiento de Zaragoza"
    },
    {
        name: "Bodegas Javier S.L",
        alias: "Bodegas_Javier",
        address: "Yonalda de Bar 12, Zaragoza",
        orderRef: "ALB-2026-002",
        items: ["Suministros Embotellado: 5 cajas", "Etiquetas Personalizadas: 2.000 uds", "Tapones de Corcho: 1 saco"],
        client: "Bodegas Javier S.L."
    },
    {
        name: "Centro San Valero",
        alias: "Centro_San_Valero",
        address: "Violeta Parra, 9 50015 Zaragoza",
        orderRef: "ALB-2026-003",
        items: ["Proyectores Epson: 2 uds", "Material de Papelería: 10 cajas", "Sillas Aulas: 15 uds"],
        client: "Fundación San Valero"
    },
    {
        name: "Basílica del Pilar",
        alias: "Basilica_Pilar",
        address: "Plaza del Pilar, Zaragoza",
        orderRef: "ALB-2026-004",
        items: ["Velas Ceremoniales Grandes: 5 cajas", "Flores Frescas Ornamentales: 3 lotes"],
        client: "Cabildo Metropolitano"
    }
];

const todayStr = new Date().toLocaleDateString('es-ES');

async function generatePDFs() {
    for (const delivery of deliveries) {
        const doc = new PDFDocument({ margin: 50 });
        const filePath = `c:/GitHub/MOVEO_FRONT/Albaran_${delivery.alias}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));

        // Header Title
        doc.fontSize(22).font('Helvetica-Bold').text('ALBARÁN DE ENTREGA', { align: 'center' });
        doc.moveDown(2);

        // Header Layout (Sender info left, logo right)
        doc.fontSize(12).font('Helvetica-Bold').text('Moveo Logistics S.L.');
        doc.font('Helvetica').fontSize(10).text('Polígono Industrial Malpica, Calle F Oeste');
        doc.text('50016 Zaragoza, España');
        doc.text('CIF: B-50123456');
        doc.text('Teléf: +34 976 11 22 33');
        doc.text('Email: info@moveologistics.es');

        doc.moveDown(2);

        // Divider
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Client and delivery info
        const startY = doc.y;
        doc.fontSize(12).font('Helvetica-Bold').text('Datos del Destinatario:');
        doc.font('Helvetica').fontSize(10).text(`Cliente: ${delivery.client}`);
        doc.text(`Destino: ${delivery.name}`);
        doc.text(`Dirección: ${delivery.address}`);
        doc.moveDown(1.5);

        doc.fontSize(12).font('Helvetica-Bold').text('Detalles del Albarán:');
        doc.font('Helvetica').fontSize(10).text(`Referencia: ${delivery.orderRef}`);
        doc.text(`Fecha: ${todayStr}`);
        doc.moveDown();

        // Articles table
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Artículos y Detalles de la Entrega:');
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10);
        delivery.items.forEach(item => {
            doc.text(` • ${item}`);
        });
        doc.moveDown(2);

        // Generating QR code dynamically
        const qrContent = JSON.stringify({
            Ref: delivery.orderRef,
            Destino: delivery.name,
            Direccion: delivery.address
        });
        const qrDataURI = await QRCode.toDataURL(qrContent, { margin: 1 });
        doc.image(qrDataURI, 400, startY, { fit: [100, 100] });
        doc.font('Helvetica').fontSize(8).text('Escanee para trazabilidad', 400, startY + 105, { align: 'center', width: 100 });

        doc.moveDown(5);

        // Footer (Signatures)
        const currentY = doc.y;
        doc.fontSize(10).font('Helvetica');
        doc.text('Firma del Transportista', 100, currentY);
        doc.text('Firma y Sello del Destinatario', 350, currentY);

        // Signature lines
        doc.moveTo(50, currentY + 40).lineTo(250, currentY + 40).stroke();
        doc.moveTo(320, currentY + 40).lineTo(520, currentY + 40).stroke();

        doc.end();
        console.log(`Generated ${filePath}`);
    }
}

generatePDFs().catch(console.error);
