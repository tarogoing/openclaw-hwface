package org.openclaw.hwface.openclaw;

public final class OpenClawDevice {
    public enum TransportType {
        MOCK,
        BLE,
        USB_SERIAL,
        WIFI
    }

    private final String id;
    private final String name;
    private final TransportType transportType;
    private final String firmwareVersion;

    public OpenClawDevice(String id, String name, TransportType transportType, String firmwareVersion) {
        this.id = id;
        this.name = name;
        this.transportType = transportType;
        this.firmwareVersion = firmwareVersion;
    }

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }

    public TransportType transportType() {
        return transportType;
    }

    public String firmwareVersion() {
        return firmwareVersion;
    }
}
