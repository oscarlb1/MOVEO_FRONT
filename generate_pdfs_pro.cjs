const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

const deliveries = [
    {
        name: "Parque Grande",
        alias: "Parque_Grande",
        address: "Paseo Isabel La Católica, Zaragoza",
        orderRef: "ALB-2026-001",
        items: [
            { desc: "Material de Mantenimiento Parques", qty: 2, unit: "cajas", price: "245.00", total: "490.00" },
            { desc: "Herramientas de Jardinería", qty: 1, unit: "ud", price: "125.50", total: "125.50" }
        ],
        client: "Ayuntamiento de Zaragoza",
        contact: "Juan Pérez",
        phone: "600 123 456"
    },
    {
        name: "Bodegas Javier S.L",
        alias: "Bodegas_Javier",
        address: "Yonalda de Bar 12, Zaragoza",
        orderRef: "ALB-2026-002",
        items: [
            { desc: "Suministros Embotellado", qty: 5, unit: "cajas", price: "80.00", total: "400.00" },
            { desc: "Etiquetas Personalizadas", qty: 2000, unit: "uds", price: "0.15", total: "300.00" },
            { desc: "Tapones de Corcho", qty: 1, unit: "saco", price: "150.00", total: "150.00" }
        ],
        client: "Bodegas Javier S.L.",
        contact: "Javier Villanueva",
        phone: "611 222 333"
    },
    {
        name: "Centro San Valero",
        alias: "Centro_San_Valero",
        address: "Violeta Parra, 9 50015 Zaragoza",
        orderRef: "ALB-2026-003",
        items: [
            { desc: "Proyectores Epson", qty: 2, unit: "uds", price: "450.00", total: "900.00" },
            { desc: "Material de Papelería", qty: 10, unit: "cajas", price: "35.00", total: "350.00" },
            { desc: "Sillas Aulas", qty: 15, unit: "uds", price: "45.00", total: "675.00" }
        ],
        client: "Fundación San Valero",
        contact: "María López",
        phone: "622 333 444"
    },
    {
        name: "Basílica del Pilar",
        alias: "Basilica_Pilar",
        address: "Plaza del Pilar, Zaragoza",
        orderRef: "ALB-2026-004",
        items: [
            { desc: "Velas Ceremoniales Grandes", qty: 5, unit: "cajas", price: "120.00", total: "600.00" },
            { desc: "Flores Frescas Ornamentales", qty: 3, unit: "lotes", price: "250.00", total: "750.00" }
        ],
        client: "Cabildo Metropolitano",
        contact: "P. Antonio",
        phone: "633 444 555"
    }
];

const todayStr = new Date().toLocaleDateString('es-ES');
const primaryColor = '#ea580c'; // Corporate orange
const accentColor = '#f97316';  // Lighter orange
const textColor = '#334155';
const lightGray = '#fff7ed';    // Orange tinted light background
const borderColor = '#fdba74';  // Orange border

async function generatePDFs() {
    for (const delivery of deliveries) {
        const doc = new PDFDocument({ margin: 0, size: 'A4' });
        const filePath = `c:/GitHub/MOVEO_FRONT/Albaran_${delivery.alias}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));

        // 1. Header Area with Background
        doc.rect(0, 0, 595.28, 120).fill(primaryColor);

        // Add corporate truck logo
        try {
            const logoPath = 'c:/GitHub/MOVEO_FRONT/src/assets/truck-anim.png';
            if (fs.existsSync(logoPath)) {
                // Background might be transparent, so it will show the orange primary color
                doc.image(logoPath, 45, 25, { width: 60 });
                // Typography next to the logo
                doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold').text('MOVEO', 115, 35, { letterSpacing: 2 });
                doc.fontSize(10).font('Helvetica').text('LOGÍSTICA', 115, 65, { letterSpacing: 1 });
            } else {
                doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('MOVEO', 50, 40, { letterSpacing: 2 });
                doc.fontSize(10).font('Helvetica').text('LOGÍSTICA', 50, 70, { letterSpacing: 1 });
            }
        } catch (e) {
            console.error('Error loading logo:', e);
            doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('MOVEO', 50, 40, { letterSpacing: 2 });
        }

        // Title and Ref top-right
        doc.fillColor('#ffffff');
        doc.fontSize(24).font('Helvetica-Bold').text('ALBARÁN', 300, 40, { align: 'right', width: 245 });
        doc.fontSize(12).font('Helvetica').text(`Nº Referencia: ${delivery.orderRef}`, 300, 70, { align: 'right', width: 245 });

        // Reset fill color to text color
        doc.fillColor(textColor);

        // 2. Info Boxes (Sender & Receiver)
        const topBoxesY = 150;
        doc.roundedRect(50, topBoxesY, 230, 115, 5).lineWidth(1).stroke(borderColor);
        doc.roundedRect(315, topBoxesY, 230, 115, 5).lineWidth(1).stroke(borderColor);

        // Box headers inside
        doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold');
        doc.text('DATOS DE EMISIÓN', 65, topBoxesY + 15);
        doc.text('DATOS DE ENTREGA', 330, topBoxesY + 15);

        // Draw a separator line inside boxes
        doc.moveTo(50, topBoxesY + 35).lineTo(280, topBoxesY + 35).stroke(borderColor);
        doc.moveTo(315, topBoxesY + 35).lineTo(545, topBoxesY + 35).stroke(borderColor);

        doc.fillColor(textColor).fontSize(10).font('Helvetica');
        // Sender Info
        doc.text('Moveo Logistics S.L.', 65, topBoxesY + 45, { font: 'Helvetica-Bold' });
        doc.text('Polígono Industrial Malpica, C/ F Oeste');
        doc.text('50016 Zaragoza (España)');
        doc.text('CIF: B-50123456');
        doc.text('Tel: +34 976 11 22 33');

        // Receiver Info
        doc.font('Helvetica-Bold').text(delivery.client, 330, topBoxesY + 45);
        doc.font('Helvetica');
        doc.text(`Destino: ${delivery.name}`);
        doc.text(`Dirección: ${delivery.address}`);
        doc.text(`Contacto: ${delivery.contact}`);
        doc.text(`Teléfono: ${delivery.phone}`);

        // 3. Document details banner
        const detailsY = 290;
        doc.rect(50, detailsY, 495, 25).fill(primaryColor);
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
        doc.text('FECHA DE EMISIÓN', 60, detailsY + 8);
        doc.text('FECHA DE ENTREGA', 220, detailsY + 8);
        doc.text('MÉTODO DE ENVÍO', 400, detailsY + 8);

        doc.rect(50, detailsY + 25, 495, 25).lineWidth(1).stroke(borderColor);
        doc.fillColor(textColor).font('Helvetica');
        doc.text(todayStr, 60, detailsY + 33);
        doc.text(todayStr, 220, detailsY + 33);
        doc.text('Transporte Terrestre', 400, detailsY + 33);

        // 4. Articles Table Header
        let tableY = 360;
        doc.rect(50, tableY, 495, 25).fill(lightGray);
        doc.moveTo(50, tableY).lineTo(545, tableY).stroke(borderColor);
        doc.moveTo(50, tableY + 25).lineTo(545, tableY + 25).stroke(borderColor);

        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10);
        doc.text('DESCRIPCIÓN', 60, tableY + 8);
        doc.text('CANTIDAD', 320, tableY + 8, { width: 70, align: 'center' });
        doc.text('UNIDAD', 400, tableY + 8, { width: 60, align: 'center' });
        doc.text('IMPORTE', 470, tableY + 8, { width: 70, align: 'right' });

        // 5. Articles Table Rows
        doc.font('Helvetica').fillColor(textColor);
        tableY += 25;
        let isAlt = false;

        let grandTotal = 0;
        delivery.items.forEach(item => {
            if (isAlt) {
                // Pale orange row
                doc.rect(50, tableY, 495, 25).fill('#fffbeb');
            }
            doc.fillColor(textColor);

            // Item text
            doc.text(item.desc, 60, tableY + 8);
            doc.text(item.qty.toString(), 320, tableY + 8, { width: 70, align: 'center' });
            doc.text(item.unit, 400, tableY + 8, { width: 60, align: 'center' });
            doc.text(`${item.total} €`, 470, tableY + 8, { width: 70, align: 'right' });

            // Bottom border for each row
            doc.moveTo(50, tableY + 25).lineTo(545, tableY + 25).lineWidth(0.5).stroke('#fed7aa');

            grandTotal += parseFloat(item.total);
            tableY += 25;
            isAlt = !isAlt;
        });

        // 6. Totals section
        tableY += 15;
        // background box for total
        doc.rect(340, tableY - 5, 205, 30).fill(lightGray);
        doc.rect(340, tableY - 5, 205, 30).stroke(borderColor);

        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
        doc.text('TOTAL:', 350, tableY);
        doc.text(`${grandTotal.toFixed(2)} €`, 470, tableY, { width: 65, align: 'right' });

        // 7. QR Code securely linking the reference and delivery info
        const qrContent = JSON.stringify({
            Ref: delivery.orderRef,
            Destino: delivery.name,
            Direccion: delivery.address
        });

        // Generate QR code focusing on matching primary colors
        let qrDataURI;
        try {
            // Black for the QR code
            qrDataURI = await QRCode.toDataURL(qrContent, {
                margin: 1,
                color: { dark: '#000000', light: '#ffffff' },
                width: 100
            });
        } catch (e) {
            qrDataURI = await QRCode.toDataURL(qrContent, { margin: 1, width: 100 });
        }

        const qrY = tableY + 50;
        // Give QR a rounded rect boundary
        doc.roundedRect(50, qrY, 110, 110, 5).stroke(borderColor);
        doc.image(qrDataURI, 55, qrY + 5, { fit: [100, 100] });

        doc.fillColor(textColor).font('Helvetica').fontSize(10);
        doc.text('Validación Electrónica', 175, qrY + 15, { font: 'Helvetica-Bold' });
        doc.text('Escanee el código QR usando la', 175, qrY + 35);
        doc.text('app corporativa para verificar la', 175, qrY + 50);
        doc.text('autenticidad y registrar el horario', 175, qrY + 65);
        doc.text('de la entrega telemáticamente.', 175, qrY + 80);

        // 8. Signatures area (Footer)
        const signY = 660;
        doc.rect(50, signY, 495, 100).fill(lightGray);
        doc.rect(50, signY, 495, 100).lineWidth(1).stroke(borderColor);

        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
        doc.text('CONFORMIDAD DE ENTREGA', 60, signY + 10);

        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text('La mercancía detallada en este documento ha sido recibida en las condiciones acordadas y aceptadas.', 60, signY + 25);

        // Underlines for signatures
        doc.moveTo(80, signY + 75).lineTo(250, signY + 75).stroke(textColor);
        doc.text('Firma Repartidor', 80, signY + 85, { width: 170, align: 'center' });

        doc.moveTo(340, signY + 75).lineTo(510, signY + 75).stroke(textColor);
        doc.text('Firma y Sello Cliente', 340, signY + 85, { width: 170, align: 'center' });

        // 9. Absolute Footer - tiny text
        doc.fontSize(8).fillColor('#9a3412');
        doc.text('Moveo Logistics S.L. - Documento generado automáticamente por MoveoApp. Confidencial.', 0, 800, { align: 'center', width: 595 });

        doc.end();
        console.log(`Generated profesional orange ${filePath}`);
    }
}

generatePDFs().catch(console.error);
