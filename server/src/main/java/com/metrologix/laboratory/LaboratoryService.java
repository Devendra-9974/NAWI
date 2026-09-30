package com.metrologix.laboratory;

import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;

    public List<Laboratory> getAllLaboratories() {
        return laboratoryRepository.findAll();
    }

    public Laboratory getLaboratoryById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory", "id", id));
    }

    @Transactional
    public Laboratory createLaboratory(Laboratory lab) {
        if (laboratoryRepository.existsByLabCode(lab.getLabCode())) {
            throw new BadRequestException("Laboratory code already exists: " + lab.getLabCode());
        }
        return laboratoryRepository.save(lab);
    }

    @Transactional
    public Laboratory updateLaboratory(Long id, Laboratory updated) {
        Laboratory lab = getLaboratoryById(id);
        lab.setLabName(updated.getLabName());
        lab.setAccreditationNumber(updated.getAccreditationNumber());
        lab.setAddress(updated.getAddress());
        lab.setContactEmail(updated.getContactEmail());
        lab.setContactPhone(updated.getContactPhone());
        lab.setActive(updated.isActive());
        return laboratoryRepository.save(lab);
    }
}
