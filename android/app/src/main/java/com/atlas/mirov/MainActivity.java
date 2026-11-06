package com.atlas.mirov;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final int IMPORT_FILE = 2101;
    private static final int EXPORT_FILE = 2102;
    private WebView webView;
    private android.webkit.ValueCallback<Uri[]> importCallback;
    private byte[] pendingBytes;

    // Forward browser Blob exports to the Android document picker.
    private static final String EXPORT_HOOK =
        "(function(){if(window.__atlasNativeReady)return;" +
        "window.__atlasNativeReady=true;" +
        "window.downloadUrl=function(url,name){" +
        "fetch(url).then(function(res){return res.blob()}).then(function(blob){" +
        "var reader=new FileReader();" +
        "reader.onload=function(){var data=String(reader.result||'');" +
        "var comma=data.indexOf(',');if(comma>-1){" +
        "AtlasNative.save(String(name),blob.type||'application/octet-stream',data.slice(comma+1))}};" +
        "reader.readAsDataURL(blob)" +
        "}).catch(function(){alert('Ошибка при подготовке файла')})" +
        "};})();";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        getWindow().setStatusBarColor(Color.rgb(9, 18, 27));
        getWindow().setNavigationBarColor(Color.rgb(9, 18, 27));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(9, 18, 27));
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        } else {
            root.setFitsSystemWindows(true);
        }
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setBlockNetworkLoads(true);
        settings.setDefaultTextEncodingName("UTF-8");

        // Only an application-bundled, offline HTML page is loaded in this WebView.
        webView.addJavascriptInterface(new NativeExport(), "AtlasNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("atlas.local".equals(uri.getHost()) && "https".equals(uri.getScheme())) {
                    return false;
                }
                if ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                }
                return true;
            }

            @Override public void onPageFinished(WebView view, String url) {
                view.evaluateJavascript(EXPORT_HOOK, null);
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(
                    WebView view,
                    android.webkit.ValueCallback<Uri[]> callback,
                    WebChromeClient.FileChooserParams params) {
                if (importCallback != null) {
                    importCallback.onReceiveValue(null);
                }
                importCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), IMPORT_FILE);
                    return true;
                } catch (ActivityNotFoundException error) {
                    importCallback = null;
                    Toast.makeText(MainActivity.this, "Нет приложения для выбора файлов", Toast.LENGTH_LONG).show();
                    return false;
                }
            }
        });

        try (InputStream input = getAssets().open("index.html");
             ByteArrayOutputStream result = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) {
                result.write(buffer, 0, count);
            }
            String html = new String(result.toByteArray(), StandardCharsets.UTF_8);
            // v0.5.2 renders anatomy entirely as editable offline SVG; no image bundle is loaded.
            // The fixed HTTPS origin lets localStorage persist across application restarts.
            webView.loadDataWithBaseURL("https://atlas.local/", html, "text/html", "UTF-8", null);
        } catch (Exception error) {
            Toast.makeText(this, "Не удалось открыть приложение", Toast.LENGTH_LONG).show();
        }
    }

    private final class NativeExport {
        @JavascriptInterface public void save(String fileName, String mime, String base64Data) {
            try {
                byte[] data = Base64.decode(base64Data, Base64.DEFAULT);
                runOnUiThread(() -> openSaveDialog(fileName, mime, data));
            } catch (Exception error) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this,
                    "Не удалось экспортировать файл", Toast.LENGTH_LONG).show());
            }
        }
    }

    private void openSaveDialog(String fileName, String mime, byte[] data) {
        pendingBytes = data;
        String name = fileName == null ? "atlas" :
            fileName.replaceAll("[^\\p{L}\\p{N}._() -]", "_");
        if (name.isEmpty()) name = "atlas";
        if (name.length() > 100) name = name.substring(0, 100);
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime != null && mime.contains("/") ? mime : "application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        try {
            startActivityForResult(intent, EXPORT_FILE);
        } catch (ActivityNotFoundException error) {
            pendingBytes = null;
            Toast.makeText(this, "Нет приложения для сохранения файлов", Toast.LENGTH_LONG).show();
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == IMPORT_FILE) {
            if (importCallback != null) {
                importCallback.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                importCallback = null;
            }
        } else if (requestCode == EXPORT_FILE) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingBytes != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(data.getData())) {
                    if (stream == null) throw new IllegalStateException("No output stream");
                    stream.write(pendingBytes);
                    Toast.makeText(this, "Файл сохранён", Toast.LENGTH_SHORT).show();
                } catch (Exception error) {
                    Toast.makeText(this, "Ошибка сохранения", Toast.LENGTH_LONG).show();
                }
            }
            pendingBytes = null;
        }
    }

    @Override @SuppressWarnings("deprecation") public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
