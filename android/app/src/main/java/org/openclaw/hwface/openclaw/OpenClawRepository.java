package org.openclaw.hwface.openclaw;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public final class OpenClawRepository {
    public interface Listener {
        void onChanged();
    }

    private final OpenClawTransport transport;
    private final OpenClawProtocol protocol;
    private final StringBuilder logs = new StringBuilder();

    private Listener listener;
    private OpenClawDevice connectedDevice;

    public OpenClawRepository(OpenClawTransport transport) {
        this(transport, new TextOpenClawProtocol());
    }

    public OpenClawRepository(OpenClawTransport transport, OpenClawProtocol protocol) {
        this.transport = transport;
        this.protocol = protocol;
    }

    public void setListener(Listener listener) {
        this.listener = listener;
    }

    public List<OpenClawDevice> scan() throws IOException {
        appendLog("Scanning for OpenClaw devices");
        List<OpenClawDevice> devices = transport.scan();
        appendLog("Found " + devices.size() + " device(s)");
        return devices;
    }

    public void connect(String deviceId) throws IOException {
        for (OpenClawDevice device : scan()) {
            if (device.id().equals(deviceId)) {
                transport.connect(device);
                connectedDevice = device;
                appendLog("Connected to " + device.name());
                notifyChanged();
                return;
            }
        }
        throw new IOException("Device not found: " + deviceId);
    }

    public void disconnect() throws IOException {
        transport.disconnect();
        connectedDevice = null;
        appendLog("Disconnected");
        notifyChanged();
    }

    public void send(OpenClawCommand command) throws IOException {
        byte[] frame = protocol.encode(command);
        transport.send(frame);
        appendLog("Sent " + new String(frame, StandardCharsets.UTF_8).trim());
        notifyChanged();
    }

    public ConnectionState connectionState() {
        return transport.connectionState();
    }

    public String connectedDeviceName() {
        return connectedDevice == null ? "None" : connectedDevice.name();
    }

    public String logs() {
        return logs.toString();
    }

    public void appendLog(String line) {
        logs.insert(0, timestamp() + "  " + line + "\n");
        notifyChanged();
    }

    private void notifyChanged() {
        if (listener != null) {
            listener.onChanged();
        }
    }

    private String timestamp() {
        return new SimpleDateFormat("HH:mm:ss", Locale.US).format(new Date());
    }
}
