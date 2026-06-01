package org.openclaw.hwface.openclaw;

import java.io.IOException;
import java.util.List;

public interface OpenClawTransport {
    ConnectionState connectionState();

    List<OpenClawDevice> scan() throws IOException;

    void connect(OpenClawDevice device) throws IOException;

    void disconnect() throws IOException;

    void send(byte[] frame) throws IOException;
}
