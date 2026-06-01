package org.openclaw.hwface.openclaw;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

public final class TextOpenClawProtocol implements OpenClawProtocol {
    @Override
    public byte[] encode(OpenClawCommand command) {
        String payload = command.wireName();
        if (command.type() == OpenClawCommand.Type.SET_GRIP_FORCE
                || command.type() == OpenClawCommand.Type.SET_SPEED) {
            payload += ":" + command.value();
        }
        return (payload + "\n").getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public OpenClawEvent decode(byte[] frame) {
        String text = new String(frame, StandardCharsets.UTF_8).trim();
        if (text.toUpperCase(Locale.US).startsWith("ERR")) {
            return new OpenClawEvent(OpenClawEvent.Type.ERROR, text);
        }
        if (text.toUpperCase(Locale.US).startsWith("TEL")) {
            return new OpenClawEvent(OpenClawEvent.Type.TELEMETRY, text);
        }
        return new OpenClawEvent(OpenClawEvent.Type.ACK, text);
    }
}
