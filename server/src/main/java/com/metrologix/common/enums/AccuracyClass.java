package com.metrologix.common.enums;

public enum AccuracyClass {
    CLASS_I("Class I (Special)", "Special accuracy balance"),
    CLASS_II("Class II (High)", "High accuracy instrument"),
    CLASS_III("Class III (Medium)", "Medium accuracy industrial / commercial instrument"),
    CLASS_IIII("Class IIII (Ordinary)", "Ordinary accuracy instrument");

    private final String displayName;
    private final String description;

    AccuracyClass(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
