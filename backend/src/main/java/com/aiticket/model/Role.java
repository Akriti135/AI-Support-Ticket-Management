package com.aiticket.model;

public enum Role {
    ROLE_USER,
    ROLE_AGENT,
    ROLE_ADMIN;

    public static Role fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return ROLE_USER;
        }
        String clean = roleStr.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        for (Role r : values()) {
            if (r.name().equalsIgnoreCase(clean)) {
                return r;
            }
        }
        return ROLE_USER;
    }
}
