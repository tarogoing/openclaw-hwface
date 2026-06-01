package org.openclaw.hwface.openclaw;

public final class OpenClawEvent {
    public enum Type {
        ACK,
        TELEMETRY,
        ERROR
    }

    private final Type type;
    private final String message;

    public OpenClawEvent(Type type, String message) {
        this.type = type;
        this.message = message;
    }

    public Type type() {
        return type;
    }

    public String message() {
        return message;
    }
}
