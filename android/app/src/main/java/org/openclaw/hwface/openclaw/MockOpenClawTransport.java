package org.openclaw.hwface.openclaw;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

public final class MockOpenClawTransport implements OpenClawTransport {
    private final OpenClawDevice mockDevice = new OpenClawDevice(
            "mock-openclaw-001",
            "OpenClaw Mock",
            OpenClawDevice.TransportType.MOCK,
            "mock-0.1.0"
    );

    private ConnectionState state = ConnectionState.IDLE;

    @Override
    public ConnectionState connectionState() {
        return state;
    }

    @Override
    public List<OpenClawDevice> scan() {
        state = ConnectionState.SCANNING;
        sleep(250);
        state = ConnectionState.DISCONNECTED;
        return Collections.singletonList(mockDevice);
    }

    @Override
    public void connect(OpenClawDevice device) throws IOException {
        if (!mockDevice.id().equals(device.id())) {
            state = ConnectionState.FAILED;
            throw new IOException("Unknown OpenClaw device: " + device.id());
        }
        state = ConnectionState.CONNECTING;
        sleep(250);
        state = ConnectionState.CONNECTED;
    }

    @Override
    public void disconnect() {
        state = ConnectionState.DISCONNECTING;
        sleep(120);
        state = ConnectionState.DISCONNECTED;
    }

    @Override
    public void send(byte[] frame) throws IOException {
        if (state != ConnectionState.CONNECTED) {
            throw new IOException("OpenClaw is not connected");
        }
        String text = new String(frame, StandardCharsets.UTF_8).trim();
        if (text.isEmpty()) {
            throw new IOException("Cannot send an empty command");
        }
        sleep(80);
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }
}
