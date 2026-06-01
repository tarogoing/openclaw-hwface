package org.openclaw.hwface;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.openclaw.hwface.openclaw.ConnectionState;
import org.openclaw.hwface.openclaw.MockOpenClawTransport;
import org.openclaw.hwface.openclaw.OpenClawCommand;
import org.openclaw.hwface.openclaw.OpenClawDevice;
import org.openclaw.hwface.openclaw.OpenClawRepository;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final OpenClawRepository repository = new OpenClawRepository(new MockOpenClawTransport());

    private TextView statusText;
    private TextView logText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(createContentView());
        repository.setListener(this::renderState);
        renderState();
    }

    @Override
    protected void onDestroy() {
        executor.shutdownNow();
        super.onDestroy();
    }

    private View createContentView() {
        int padding = dp(20);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(padding, padding, padding, padding);

        TextView title = new TextView(this);
        title.setText("OpenClaw HWFace");
        title.setTextSize(28);
        title.setGravity(Gravity.START);
        root.addView(title, matchWidthWrapHeight());

        statusText = new TextView(this);
        statusText.setTextSize(16);
        statusText.setPadding(0, dp(12), 0, dp(12));
        root.addView(statusText, matchWidthWrapHeight());

        LinearLayout controls = new LinearLayout(this);
        controls.setOrientation(LinearLayout.VERTICAL);
        root.addView(controls, matchWidthWrapHeight());

        controls.addView(button("Scan Mock Device", () -> runDeviceAction(() -> {
            List<OpenClawDevice> devices = repository.scan();
            if (!devices.isEmpty()) {
                repository.connect(devices.get(0).id());
            }
        })));
        controls.addView(button("Open", () -> runDeviceAction(() -> repository.send(OpenClawCommand.open()))));
        controls.addView(button("Close", () -> runDeviceAction(() -> repository.send(OpenClawCommand.close()))));
        controls.addView(button("Stop", () -> runDeviceAction(() -> repository.send(OpenClawCommand.stop()))));
        controls.addView(button("Reset", () -> runDeviceAction(() -> repository.send(OpenClawCommand.reset()))));
        controls.addView(button("Disconnect", () -> runDeviceAction(repository::disconnect)));

        logText = new TextView(this);
        logText.setTextSize(14);
        logText.setPadding(0, dp(16), 0, 0);

        ScrollView scrollView = new ScrollView(this);
        scrollView.addView(logText);
        root.addView(scrollView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1
        ));

        return root;
    }

    private Button button(String label, Runnable action) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setOnClickListener(view -> action.run());
        return button;
    }

    private void runDeviceAction(DeviceAction action) {
        executor.execute(() -> {
            try {
                action.run();
            } catch (Exception error) {
                repository.appendLog("Error: " + error.getMessage());
                renderState();
            }
        });
    }

    private void renderState() {
        runOnUiThread(() -> {
            ConnectionState state = repository.connectionState();
            statusText.setText("State: " + state.displayName() + "\nDevice: " + repository.connectedDeviceName());
            logText.setText(repository.logs());
        });
    }

    private LinearLayout.LayoutParams matchWidthWrapHeight() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density);
    }

    private interface DeviceAction {
        void run() throws Exception;
    }
}
