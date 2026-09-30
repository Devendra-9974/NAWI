package com.metrologix.instrument;

import com.metrologix.audit.AuditService;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.user.User;
import com.metrologix.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final UserService userService;
    private final AuditService auditService;

    public List<InstrumentDto> getAllInstruments() {
        return instrumentRepository.findAll().stream()
                .map(InstrumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<InstrumentDto> searchInstruments(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return instrumentRepository.findAll(pageable).map(InstrumentDto::fromEntity);
        }
        return instrumentRepository.searchInstruments(query.trim(), pageable).map(InstrumentDto::fromEntity);
    }

    public InstrumentDto getInstrumentById(Long id) {
        Instrument instr = instrumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "id", id));
        return InstrumentDto.fromEntity(instr);
    }

    public Instrument getEntityById(Long id) {
        return instrumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "id", id));
    }

    @Transactional
    public InstrumentDto createInstrument(CreateInstrumentRequest request, String username) {
        if (instrumentRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BadRequestException("Serial number already registered: " + request.getSerialNumber());
        }

        Manufacturer manufacturer = manufacturerRepository.findById(request.getManufacturerId())
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", request.getManufacturerId()));

        User user = userService.findByUsername(username);

        // Generate unique instrument ID: NAWI-YYYY-XXXX
        long count = instrumentRepository.count() + 1;
        String instrumentId = String.format("NAWI-%d-%04d", Year.now().getValue(), count);
        while (instrumentRepository.existsByInstrumentId(instrumentId)) {
            count++;
            instrumentId = String.format("NAWI-%d-%04d", Year.now().getValue(), count);
        }

        Instrument instrument = Instrument.builder()
                .instrumentId(instrumentId)
                .manufacturer(manufacturer)
                .modelName(request.getModelName())
                .modelNumber(request.getModelNumber())
                .serialNumber(request.getSerialNumber())
                .instrumentType(request.getInstrumentType())
                .accuracyClass(request.getAccuracyClass())
                .maxCapacity(request.getMaxCapacity())
                .minCapacity(request.getMinCapacity())
                .scaleIntervalE(request.getScaleIntervalE())
                .scaleIntervalD(request.getScaleIntervalD())
                .unit(request.getUnit() != null ? request.getUnit() : "kg")
                .numLoadCells(request.getNumLoadCells() != null ? request.getNumLoadCells() : 1)
                .indicatorInfo(request.getIndicatorInfo())
                .firmwareVersion(request.getFirmwareVersion())
                .technicalSpecifications(request.getTechnicalSpecifications())
                .photoPath(request.getPhotoPath())
                .createdBy(user)
                .build();

        Instrument saved = instrumentRepository.save(instrument);
        auditService.log(user.getId(), username, "INSTRUMENT_CREATED", "Instrument", saved.getId(),
                "Created instrument " + saved.getInstrumentId() + " (" + saved.getModelName() + ")", null);

        return InstrumentDto.fromEntity(saved);
    }

    public List<ManufacturerDto> getAllManufacturers() {
        return manufacturerRepository.findAll().stream()
                .map(ManufacturerDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ManufacturerDto createManufacturer(Manufacturer m) {
        if (manufacturerRepository.existsByCode(m.getCode())) {
            throw new BadRequestException("Manufacturer code already exists: " + m.getCode());
        }
        Manufacturer saved = manufacturerRepository.save(m);
        return ManufacturerDto.fromEntity(saved);
    }
}
