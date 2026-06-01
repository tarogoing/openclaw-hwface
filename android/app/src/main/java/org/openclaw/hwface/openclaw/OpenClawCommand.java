package org.openclaw.hwface.openclaw;

import java.util.Locale;

public final class OpenClawCommand {
    public enum Type {
        OPEN,
        CLOSE,
        STOP,
        RESET,
        SET_GRIP_FORCE,
        SET_SPEED
    }

    private final Type type;
    private final int value;

    private OpenClawCommand(Type type, int value) {
        this.type = type;
        this.value = value;
    }

    public static OpenClawCommand open() {
        return new OpenClawCommand(Type.OPEN, 0);
    }

    public static OpenClawCommand close() {
        return new OpenClawCommand(Type.CLOSE, 0);
    }

    public static OpenClawCommand stop() {
        return new OpenClawCommand(Type.STOP, 0);
    }

    public static OpenClawCommand reset() {
        return new OpenClawCommand(Type.RESET, 0);
    }

    public static OpenClawCommand setGripForce(int percent) {
        return new OpenClawCommand(Type.SET_GRIP_FORCE, clampPercent(percent));
    }

    public static OpenClawCommand setSpeed(int percent) {
        return new OpenClawCommand(Type.SET_SPEED, clampPercent(percent));
    }

    public Type type() {
        return type;
    }

    public int value() {
        return value;
    }

    public String wireName() {
        return type.name().toLowerCase(Locale.US);
    }

    private static int clampPercent(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
