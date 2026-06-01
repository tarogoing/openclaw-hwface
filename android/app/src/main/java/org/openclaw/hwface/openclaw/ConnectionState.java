package org.openclaw.hwface.openclaw;

public enum ConnectionState {
    IDLE("Idle"),
    SCANNING("Scanning"),
    CONNECTING("Connecting"),
    CONNECTED("Connected"),
    DISCONNECTING("Disconnecting"),
    DISCONNECTED("Disconnected"),
    FAILED("Failed");

    private final String displayName;

    ConnectionState(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }
}
