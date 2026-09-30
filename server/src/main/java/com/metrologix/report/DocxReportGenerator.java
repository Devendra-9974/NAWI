package com.metrologix.report;

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
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DocxReportGenerator {

    private final AttachmentRepository attachmentRepository;
    private final DigitalSignatureRepository digitalSignatureRepository;

    public void generateDocx(TestCase testCase, String reportNumber, OutputStream out) throws IOException {
        try (XWPFDocument document = new XWPFDocument()) {
            Instrument instr = testCase.getInstrument();
            LaboratoryCondition cond = testCase.getLaboratoryCondition();

            String labName = (testCase.getLaboratory() != null && testCase.getLaboratory().getLabName() != null)
                    ? testCase.getLaboratory().getLabName().toUpperCase() : "NATIONAL LEGAL METROLOGY EVALUATION CENTRE";

            // Header
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText(labName);
            titleRun.setBold(true);
            titleRun.setFontSize(15);
            titleRun.setColor("1E3A8A");

            XWPFParagraph subPara = document.createParagraph();
            subPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun subRun = subPara.createRun();
            subRun.setText("OIML R 76 NON-AUTOMATIC WEIGHING INSTRUMENT TEST REPORT");
            subRun.setBold(true);
            subRun.setFontSize(11);

            String resultStr = testCase.getOverallResult() != null ? testCase.getOverallResult().name() : "PENDING";
            XWPFParagraph metaPara = document.createParagraph();
            metaPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun metaRun = metaPara.createRun();
            metaRun.setText("Report No: " + reportNumber + " | Test ID: " + testCase.getTestId() +
                    " | Overall Result: " + resultStr);
            metaRun.setFontSize(9);
            metaRun.setItalic(true);

            document.createParagraph().createRun().addBreak();

            // 1. Instrument Specs
            addSectionHeading(document, "1. Instrument Under Evaluation");
            XWPFTable instrTable = document.createTable(5, 2);

            String mfgName = (instr != null && instr.getManufacturer() != null) ? instr.getManufacturer().getName() : "N/A";
            String modelName = instr != null && instr.getModelName() != null ? instr.getModelName() : "N/A";
            String serialNumber = instr != null && instr.getSerialNumber() != null ? instr.getSerialNumber() : "N/A";
            String accClass = instr != null && instr.getAccuracyClass() != null ? instr.getAccuracyClass().getDisplayName() : "Class III";

            setTableRow(instrTable.getRow(0), "Manufacturer", mfgName);
            setTableRow(instrTable.getRow(1), "Model Name", modelName);
            setTableRow(instrTable.getRow(2), "Serial Number", serialNumber);
            setTableRow(instrTable.getRow(3), "Accuracy Class", accClass);

            String unit = instr != null ? instr.getUnit() : "kg";
            String capacity = (instr != null && instr.getMaxCapacity() != null) ?
                    "Max: " + instr.getMaxCapacity() + " " + unit + ", e: " + instr.getScaleIntervalE() + " " + unit : "N/A";
            setTableRow(instrTable.getRow(4), "Capacity & Scale Interval", capacity);

            // 2. Conditions
            if (cond != null) {
                document.createParagraph().createRun().addBreak();
                addSectionHeading(document, "2. Environmental Conditions");
                XWPFTable condTable = document.createTable(3, 2);
                setTableRow(condTable.getRow(0), "Temperature", (cond.getTemperatureCelsius() != null ? cond.getTemperatureCelsius() + " °C" : "N/A"));
                setTableRow(condTable.getRow(1), "Relative Humidity", (cond.getRelativeHumidityPct() != null ? cond.getRelativeHumidityPct() + " %" : "N/A"));
                setTableRow(condTable.getRow(2), "Atmospheric Pressure", (cond.getAtmosphericPressureHpa() != null ? cond.getAtmosphericPressureHpa() + " hPa" : "N/A"));
            }

            // 3. Observations
            List<TestExecution> executions = testCase.getTestExecutions();
            if (executions != null && !executions.isEmpty()) {
                document.createParagraph().createRun().addBreak();
                addSectionHeading(document, "3. Test Observations & Evaluation");

                for (TestExecution exec : executions) {
                    XWPFParagraph execTitle = document.createParagraph();
                    XWPFRun etRun = execTitle.createRun();
                    String tName = exec.getTestDefinition() != null ? exec.getTestDefinition().getTestName() : "Evaluation";
                    etRun.setText("Procedure: " + tName + " (Status: " + exec.getStatus() + ")");
                    etRun.setBold(true);
                    etRun.setFontSize(10);

                    List<TestObservation> observations = exec.getObservations();
                    if (observations != null && !observations.isEmpty()) {
                        XWPFTable obsTable = document.createTable(observations.size() + 1, 6);
                        XWPFTableRow header = obsTable.getRow(0);
                        header.getCell(0).setText("Pt #");
                        header.getCell(1).setText("Applied (" + unit + ")");
                        header.getCell(2).setText("Indicated (" + unit + ")");
                        header.getCell(3).setText("Error (" + unit + ")");
                        header.getCell(4).setText("MPE (" + unit + ")");
                        header.getCell(5).setText("Verdict");

                        for (int i = 0; i < observations.size(); i++) {
                            TestObservation obs = observations.get(i);
                            XWPFTableRow row = obsTable.getRow(i + 1);
                            row.getCell(0).setText(String.valueOf(obs.getPointIndex()));

                            String loadStr = obs.getAppliedLoad() != null ? obs.getAppliedLoad().stripTrailingZeros().toPlainString() + " " + unit : "-";
                            row.getCell(1).setText(loadStr);

                            String indStr = obs.getIndicatedValue() != null ? obs.getIndicatedValue().stripTrailingZeros().toPlainString() + " " + unit : "-";
                            row.getCell(2).setText(indStr);

                            String errStr = "-";
                            if (obs.getCorrectedError() != null) {
                                errStr = obs.getCorrectedError().stripTrailingZeros().toPlainString() + " " + unit;
                            } else if (obs.getErrorValue() != null) {
                                errStr = obs.getErrorValue().stripTrailingZeros().toPlainString() + " " + unit;
                            }
                            row.getCell(3).setText(errStr);

                            String mpeStr = obs.getMpeValue() != null ? "±" + obs.getMpeValue().stripTrailingZeros().toPlainString() + " " + unit : "-";
                            row.getCell(4).setText(mpeStr);

                            String compStr = obs.getPointCompliance() != null ? obs.getPointCompliance().name() : "-";
                            row.getCell(5).setText(compStr);
                        }
                    }
                }
            }

            // 4. Attachments Evidence
            List<Attachment> attachments = attachmentRepository.findByTestCaseIdAndIncludeInReportTrue(testCase.getId());
            if (attachments != null && !attachments.isEmpty()) {
                document.createParagraph().createRun().addBreak();
                addSectionHeading(document, "4. Photographs & Attached Supporting Evidence");
                XWPFTable attTable = document.createTable(attachments.size() + 1, 4);
                XWPFTableRow attHeader = attTable.getRow(0);
                attHeader.getCell(0).setText("Category");
                attHeader.getCell(1).setText("Original File Name");
                attHeader.getCell(2).setText("File Size");
                attHeader.getCell(3).setText("Uploaded By");

                for (int i = 0; i < attachments.size(); i++) {
                    Attachment att = attachments.get(i);
                    XWPFTableRow r = attTable.getRow(i + 1);
                    r.getCell(0).setText(att.getCategory().name().replace("_", " "));
                    r.getCell(1).setText(att.getOriginalFileName());
                    r.getCell(2).setText((att.getFileSize() / 1024) + " KB");
                    r.getCell(3).setText(att.getUploadedBy() != null ? att.getUploadedBy().getFullName() : "-");
                }
            }

            // 5. Official Digital Signature Block
            document.createParagraph().createRun().addBreak();
            addSectionHeading(document, "5. Official Metrological Verification & Digital Signature");

            DigitalSignature digitalSignature = digitalSignatureRepository.findByTestCaseId(testCase.getId()).orElse(null);
            if (digitalSignature != null) {
                XWPFTable dsTable = document.createTable(5, 2);
                setTableRow(dsTable.getRow(0), "Digitally Signed By", digitalSignature.getSigner().getFullName() + " (" + digitalSignature.getSignerRole() + ")");
                setTableRow(dsTable.getRow(1), "Certificate Serial / Reference", digitalSignature.getCertificateSerialNumber() + " [" + digitalSignature.getSignatureReference() + "]");
                setTableRow(dsTable.getRow(2), "Signing Timestamp", digitalSignature.getSignedAt().toString().replace("T", " ") + " IST");
                setTableRow(dsTable.getRow(3), "Cryptographic SHA-256 Seal", digitalSignature.getSignatureDigest());
                setTableRow(dsTable.getRow(4), "Legal Metrology Declaration", digitalSignature.getDeclaration());
            } else {
                XWPFTable signTable = document.createTable(2, 2);
                String techName = testCase.getTechnician() != null ? testCase.getTechnician().getFullName() : "Metrology Officer";
                String startDate = testCase.getStartDate() != null ? testCase.getStartDate().toString() : "-";
                String revName = testCase.getReviewer() != null ? testCase.getReviewer().getFullName() : "Pending Technical Reviewer Sign-Off";
                String compDate = testCase.getCompletionDate() != null ? testCase.getCompletionDate().toString() : "-";

                setTableRow(signTable.getRow(0), "Technician Verification", techName + "\nDate: " + startDate);
                setTableRow(signTable.getRow(1), "Reviewer Verification", revName + "\nDate: " + compDate);
            }

            document.write(out);
        }
    }

    private void addSectionHeading(XWPFDocument doc, String title) {
        XWPFParagraph p = doc.createParagraph();
        XWPFRun r = p.createRun();
        r.setText(title);
        r.setBold(true);
        r.setFontSize(11);
        r.setColor("1E3A8A");
    }

    private void setTableRow(XWPFTableRow row, String label, String value) {
        row.getCell(0).setText(label);
        row.getCell(1).setText(value != null ? value : "-");
    }
}
