package com.pulse.tracker;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();

            // 1. Prevents the WebView from zooming out to fit wide content (Desktop Mode)
            settings.setUseWideViewPort(false);
            settings.setLoadWithOverviewMode(false);

            // 2. Forces the WebView to ignore Android system font scaling
            // This prevents the "huge" text issue if system accessibility settings are high.
            settings.setTextZoom(100);

            // 3. Enables hardware acceleration for smoother animations in "Focus Mode"
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        }
    }
}
