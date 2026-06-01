package org.openclaw.hwface.openclaw;

public interface OpenClawProtocol {
    byte[] encode(OpenClawCommand command);

    OpenClawEvent decode(byte[] frame);
}
