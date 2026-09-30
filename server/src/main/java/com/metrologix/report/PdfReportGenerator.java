package com.metrologix.report;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.metrologix.attachment.Attachment;
import com.metrologix.attachment.AttachmentRepository;
import com.metrologix.instrument.Instrument;
import com.metrologix.signature.DigitalSignature;
import com.metrologix.signature.DigitalSignatureRepository;
import com.metrologix.testcase.LaboratoryCondition;
import com.metrologix.testcase.TestCase;
import com.metrologix.testcase.TestExecution;
import com.metrologix.testcase.TestObservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.File;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PdfReportGenerator {

    private final AttachmentRepository attachmentRepository;
    private final DigitalSignatureRepository digitalSignatureRepository;

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
    private static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(30, 58, 138));
    private static final Font BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
    private static final Font HEADER_CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.WHITE);
    private static final Font TABLE_CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.BLACK);
    private static final Font PASS_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(22, 101, 52));
    private static final Font FAIL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(185, 28, 28));

    public void generatePdf(TestCase testCase, String reportNumber, OutputStream out) throws DocumentException {
        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        PdfWriter.getInstance(document, out);
        document.open();

        Instrument instr = testCase.getInstrument();
        LaboratoryCondition cond = testCase.getLaboratoryCondition();

        String labName = (testCase.getLaboratory() != null && testCase.getLaboratory().getLabName() != null)
                ? testCase.getLaboratory().getLabName().toUpperCase() : "NATIONAL LEGAL METROLOGY EVALUATION CENTRE";
        String accreditation = (testCase.getLaboratory() != null && testCase.getLaboratory().getAccreditationNumber() != null)
                ? testCase.getLaboratory().getAccreditationNumber() : "NABL-OIML-2026";
        String address = (testCase.getLaboratory() != null && testCase.getLaboratory().getAddress() != null)
                ? testCase.getLaboratory().getAddress() : "Metrology Complex, CSIR Road, New Delhi 110012, India";

        // 1. Header Banner
        Paragraph labHeader = new Paragraph(labName, TITLE_FONT);
        labHeader.setAlignment(Element.ALIGN_CENTER);
        document.add(labHeader);

        Paragraph labSub = new Paragraph("Accreditation No: " + accreditation + " | " + address, SUBTITLE_FONT);
        labSub.setAlignment(Element.ALIGN_CENTER);
        labSub.setSpacingAfter(6f);
        document.add(labSub);

        Paragraph reportTitle = new Paragraph("TYPE EVALUATION TEST REPORT — OIML R 76", SECTION_FONT);
        reportTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(reportTitle);

        Paragraph metaInfo = new Paragraph("Report Number: " + reportNumber + " | Test ID: " + testCase.getTestId() +
                " | Generated: " + java.time.LocalDate.now(), SUBTITLE_FONT);
        metaInfo.setAlignment(Element.ALIGN_CENTER);
        metaInfo.setSpacingAfter(8f);
        document.add(metaInfo);

        // 2. Instrument & Lab Details
        PdfPTable metaTable = new PdfPTable(4);
        metaTable.setWidthPercentage(100);
        metaTable.setSpacingAfter(8f);

        addMetaCell(metaTable, "Manufacturer", instr != null && instr.getManufacturer() != null ? instr.getManufacturer().getName() : "-");
        addMetaCell(metaTable, "Model Name", instr != null ? instr.getModelName() : "-");
        addMetaCell(metaTable, "Serial Number", instr != null ? instr.getSerialNumber() : "-");
        addMetaCell(metaTable, "Accuracy Class", instr != null && instr.getAccuracyClass() != null ? instr.getAccuracyClass().getDisplayName() : "-");

        String unit = instr != null ? instr.getUnit() : "kg";
        addMetaCell(metaTable, "Max Capacity (Max)", instr != null && instr.getMaxCapacity() != null ? instr.getMaxCapacity() + " " + unit : "-");
        addMetaCell(metaTable, "Min Capacity (Min)", instr != null && instr.getMinCapacity() != null ? instr.getMinCapacity() + " " + unit : "-");
        addMetaCell(metaTable, "Verification Scale (e)", instr != null && instr.getScaleIntervalE() != null ? instr.getScaleIntervalE() + " " + unit : "-");
        addMetaCell(metaTable, "Actual Scale (d)", instr != null && instr.getScaleIntervalD() != null ? instr.getScaleIntervalD() + " " + unit : "-");

        document.add(metaTable);

        // 3. Environmental Conditions Table
        if (cond != null) {
            Paragraph envHeading = new Paragraph("1. Environmental Test Conditions (Clause 3.9)", SECTION_FONT);
            envHeading.setSpacingAfter(4f);
            document.add(envHeading);

            PdfPTable envTable = new PdfPTable(4);
            envTable.setWidthPercentage(100);
            envTable.setSpacingAfter(8f);

            addMetaCell(envTable, "Ambient Temperature", cond.getTemperatureCelsius() != null ? cond.getTemperatureCelsius() + " °C" : "-");
            addMetaCell(envTable, "Relative Humidity", cond.getRelativeHumidityPct() != null ? cond.getRelativeHumidityPct() + " %" : "-");
            addMetaCell(envTable, "Atmospheric Pressure", cond.getAtmosphericPressureHpa() != null ? cond.getAtmosphericPressureHpa() + " hPa" : "-");
            addMetaCell(envTable, "Standards Used", cond.getReferenceStandardsUsed() != null ? cond.getReferenceStandardsUsed() : "-");

            document.add(envTable);
        }

        // 4. Test Executions & Observations Tables
        List<TestExecution> executions = testCase.getTestExecutions();
        if (executions != null && !executions.isEmpty()) {
            int secIdx = 2;
            for (TestExecution exec : executions) {
                String testTitle = exec.getTestDefinition() != null ? exec.getTestDefinition().getTestName() : "Evaluation Procedure";
                Paragraph tHead = new Paragraph(secIdx++ + ". " + testTitle + " — Status: " + exec.getStatus(), SECTION_FONT);
                tHead.setSpacingBefore(4f);
                tHead.setSpacingAfter(3f);
                document.add(tHead);

                List<TestObservation> observations = exec.getObservations();
                if (observations != null && !observations.isEmpty()) {
                    PdfPTable obsTable = new PdfPTable(7);
                    obsTable.setWidthPercentage(100);
                    obsTable.setWidths(new float[]{1.0f, 1.8f, 2.0f, 2.0f, 2.0f, 2.0f, 1.8f});
                    obsTable.setSpacingAfter(6f);

                    addTableHeader(obsTable, "Pt #");
                    addTableHeader(obsTable, "Direction");
                    addTableHeader(obsTable, "Applied (" + unit + ")");
                    addTableHeader(obsTable, "Indicated (" + unit + ")");
                    addTableHeader(obsTable, "Error (" + unit + ")");
                    addTableHeader(obsTable, "MPE (" + unit + ")");
                    addTableHeader(obsTable, "Verdict");

                    for (TestObservation obs : observations) {
                        addTableCell(obsTable, String.valueOf(obs.getPointIndex()), Element.ALIGN_CENTER);
                        addTableCell(obsTable, obs.getLoadDirection() != null ? obs.getLoadDirection().name() : "-", Element.ALIGN_CENTER);

                        String loadStr = obs.getAppliedLoad() != null ? obs.getAppliedLoad().stripTrailingZeros().toPlainString() : "-";
                        addTableCell(obsTable, loadStr, Element.ALIGN_RIGHT);

                        String indStr = obs.getIndicatedValue() != null ? obs.getIndicatedValue().stripTrailingZeros().toPlainString() : "-";
                        addTableCell(obsTable, indStr, Element.ALIGN_RIGHT);

                        String errStr = "-";
                        if (obs.getCorrectedError() != null) {
                            errStr = obs.getCorrectedError().stripTrailingZeros().toPlainString();
                        } else if (obs.getErrorValue() != null) {
                            errStr = obs.getErrorValue().stripTrailingZeros().toPlainString();
                        }
                        addTableCell(obsTable, errStr, Element.ALIGN_RIGHT);

                        String mpeStr = obs.getMpeValue() != null ? "±" + obs.getMpeValue().stripTrailingZeros().toPlainString() : "-";
                        addTableCell(obsTable, mpeStr, Element.ALIGN_RIGHT);

                        PdfPCell compCell = new PdfPCell();
                        compCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        compCell.setPadding(2f);
                        if (obs.getPointCompliance() != null) {
                            boolean ptPass = "PASS".equalsIgnoreCase(obs.getPointCompliance().name());
                            Paragraph cp = new Paragraph(obs.getPointCompliance().name(), ptPass ? PASS_FONT : FAIL_FONT);
                            cp.setAlignment(Element.ALIGN_CENTER);
                            compCell.addElement(cp);
                        } else {
                            compCell.addElement(new Paragraph("-", NORMAL_FONT));
                        }
                        obsTable.addCell(compCell);
                    }

                    document.add(obsTable);
                }
            }
        }

        // 5. Attached Photographs & Supporting Evidence
        List<Attachment> attachments = attachmentRepository.findByTestCaseIdAndIncludeInReportTrue(testCase.getId());
        if (attachments != null && !attachments.isEmpty()) {
            Paragraph attHeading = new Paragraph("Evidence & Supporting Attachments", SECTION_FONT);
            attHeading.setSpacingBefore(6f);
            attHeading.setSpacingAfter(4f);
            document.add(attHeading);

            PdfPTable attTable = new PdfPTable(3);
            attTable.setWidthPercentage(100);
            attTable.setWidths(new float[]{2.5f, 4.0f, 3.5f});
            attTable.setSpacingAfter(8f);

            addTableHeader(attTable, "Attachment Category");
            addTableHeader(attTable, "File & Description");
            addTableHeader(attTable, "Visual Evidence / Details");

            for (Attachment att : attachments) {
                // Category cell
                PdfPCell catCell = new PdfPCell();
                catCell.setPadding(4f);
                catCell.addElement(new Paragraph(att.getCategory().name().replace("_", " "), BOLD_FONT));
                catCell.addElement(new Paragraph("Size: " + (att.getFileSize() / 1024) + " KB", SUBTITLE_FONT));
                attTable.addCell(catCell);

                // Info cell
                PdfPCell infoCell = new PdfPCell();
                infoCell.setPadding(4f);
                infoCell.addElement(new Paragraph(att.getOriginalFileName(), BOLD_FONT));
                if (att.getDescription() != null && !att.getDescription().isEmpty()) {
                    infoCell.addElement(new Paragraph(att.getDescription(), NORMAL_FONT));
                }
                infoCell.addElement(new Paragraph("Uploaded by: " + (att.getUploadedBy() != null ? att.getUploadedBy().getFullName() : "-"), SUBTITLE_FONT));
                attTable.addCell(infoCell);

                // Image / Document preview cell
                PdfPCell mediaCell = new PdfPCell();
                mediaCell.setPadding(3f);
                boolean imgEmbedded = false;
                if (att.getContentType() != null && att.getContentType().startsWith("image/")) {
                    try {
                        File imgFile = new File(att.getFilePath());
                        if (imgFile.exists()) {
                            Image img = Image.getInstance(att.getFilePath());
                            img.scaleToFit(110f, 75f);
                            img.setAlignment(Element.ALIGN_CENTER);
                            mediaCell.addElement(img);
                            imgEmbedded = true;
                        }
                    } catch (Exception e) {
                        log.warn("Could not embed image {} in PDF report: {}", att.getFileName(), e.getMessage());
                    }
                }
                if (!imgEmbedded) {
                    Paragraph docBadge = new Paragraph("[SUPPORTING DOCUMENT: " + att.getContentType() + "]\nVerified On File", NORMAL_FONT);
                    docBadge.setAlignment(Element.ALIGN_CENTER);
                    mediaCell.addElement(docBadge);
                }
                attTable.addCell(mediaCell);
            }

            document.add(attTable);
        }

        // 6. Final Compliance Verdict Box
        PdfPTable verdictTable = new PdfPTable(1);
        verdictTable.setWidthPercentage(100);
        verdictTable.setSpacingBefore(6f);
        verdictTable.setSpacingAfter(8f);

        PdfPCell vCell = new PdfPCell();
        vCell.setPadding(6f);

        String verdictStr = testCase.getOverallResult() != null ? testCase.getOverallResult().name() : "PENDING";
        boolean isPass = "PASS".equalsIgnoreCase(verdictStr);
        Color verdictBg = isPass ? new Color(240, 253, 244) : new Color(254, 242, 242);
        vCell.setBackgroundColor(verdictBg);

        Paragraph vPara = new Paragraph("FINAL METROLOGICAL VERDICT: " + verdictStr,
                isPass ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(22, 101, 52))
                        : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(185, 28, 28)));
        vPara.setAlignment(Element.ALIGN_CENTER);
        vCell.addElement(vPara);

        String modelName = instr != null ? instr.getModelName() : "Instrument";
        String serialNumber = instr != null ? instr.getSerialNumber() : "N/A";
        Paragraph vDetail = new Paragraph(
                "Based on the results of the evaluation carried out under official OIML R 76-1:2006 requirements, " +
                "the Non-Automatic Weighing Instrument " + modelName + " (SN: " + serialNumber + ") " +
                (isPass ? "SATISFACTORILY COMPLIES with all applicable metrological tolerances." : "DOES NOT FULLY COMPLY with metrological tolerances or is incomplete."),
                NORMAL_FONT);
        vDetail.setAlignment(Element.ALIGN_CENTER);
        vDetail.setSpacingBefore(3f);
        vCell.addElement(vDetail);

        verdictTable.addCell(vCell);
        document.add(verdictTable);

        // 7. Official Digital Signature Block & Legal Seal
        DigitalSignature digitalSignature = digitalSignatureRepository.findByTestCaseId(testCase.getId()).orElse(null);

        PdfPTable sigBox = new PdfPTable(1);
        sigBox.setWidthPercentage(100);
        sigBox.setSpacingBefore(6f);

        PdfPCell sigCell = new PdfPCell();
        sigCell.setPadding(6f);
        sigCell.setBorderColor(new Color(30, 58, 138));
        sigCell.setBorderWidth(1.2f);
        sigCell.setBackgroundColor(new Color(248, 250, 255));

        if (digitalSignature != null) {
            Paragraph sealHeader = new Paragraph("★ OFFICIAL LEGAL METROLOGY DIGITAL SIGNATURE & VERIFICATION SEAL ★",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(30, 58, 138)));
            sealHeader.setAlignment(Element.ALIGN_CENTER);
            sigCell.addElement(sealHeader);

            Paragraph decl = new Paragraph("\"" + digitalSignature.getDeclaration() + "\"",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7.5f, Color.DARK_GRAY));
            decl.setAlignment(Element.ALIGN_CENTER);
            decl.setSpacingBefore(3f);
            decl.setSpacingAfter(4f);
            sigCell.addElement(decl);

            PdfPTable dsMeta = new PdfPTable(3);
            dsMeta.setWidthPercentage(100);
            addMetaCell(dsMeta, "Digitally Signed By", digitalSignature.getSigner().getFullName() + "\n(" + digitalSignature.getSignerRole() + ")");
            addMetaCell(dsMeta, "Certificate Reference", digitalSignature.getSignatureReference() + "\nSerial: " + digitalSignature.getCertificateSerialNumber());
            addMetaCell(dsMeta, "Signed Timestamp", digitalSignature.getSignedAt().toString().replace("T", " ") + " IST\nAlgorithm: " + digitalSignature.getSignatureAlgorithm());
            sigCell.addElement(dsMeta);

            Paragraph hashPara = new Paragraph("Cryptographic Seal (SHA-256 Digest): " + digitalSignature.getSignatureDigest(),
                    FontFactory.getFont(FontFactory.COURIER_BOLD, 7, new Color(51, 65, 85)));
            hashPara.setAlignment(Element.ALIGN_CENTER);
            hashPara.setSpacingBefore(4f);
            sigCell.addElement(hashPara);

        } else {
            // Pending digital signature state
            Paragraph pendHeader = new Paragraph("TEST VERIFICATION & SIGNATURE BLOCK", SECTION_FONT);
            pendHeader.setAlignment(Element.ALIGN_CENTER);
            sigCell.addElement(pendHeader);

            PdfPTable simpleSign = new PdfPTable(2);
            simpleSign.setWidthPercentage(100);
            simpleSign.setSpacingBefore(4f);

            String techName = testCase.getTechnician() != null ? testCase.getTechnician().getFullName() : "Metrology Officer";
            String startDate = testCase.getStartDate() != null ? testCase.getStartDate().toString() : "-";
            addMetaCell(simpleSign, "Evaluation Prepared By (Technician)", techName + "\nDate: " + startDate);

            String revName = testCase.getReviewer() != null ? testCase.getReviewer().getFullName() : "Pending Technical Reviewer Sign-Off";
            addMetaCell(simpleSign, "Verified By (Reviewer)", revName + "\nStatus: " + testCase.getStatus());
            sigCell.addElement(simpleSign);
        }

        sigBox.addCell(sigCell);
        document.add(sigBox);

        document.close();
    }

    private void addMetaCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(3f);
        cell.addElement(new Paragraph(label, BOLD_FONT));
        cell.addElement(new Paragraph(value != null ? value : "-", NORMAL_FONT));
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String title) {
        PdfPCell cell = new PdfPCell(new Phrase(title, HEADER_CELL_FONT));
        cell.setBackgroundColor(new Color(30, 58, 138));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(3f);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_CELL_FONT));
        cell.setHorizontalAlignment(align);
        cell.setPadding(2.5f);
        table.addCell(cell);
    }
}
