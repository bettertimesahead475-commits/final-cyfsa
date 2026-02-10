/*  CYFSA Analyzer Widget (single-file embed)
    File name: cyfsa-analyzer-widget.js

    What it does:
    - Injects a small UI into a target div (or creates a floating button)
    - Lets user pick .pdf/.docx/.txt
    - Sends files to your API endpoint as FormData
    - Renders the returned JSON (cyfsa_analyzer_response)

    REQUIRED: Your backend endpoint must accept multipart/form-data:
      POST {endpoint}
        - files[]  (File)
      Headers:
        - X-Site-Key: <your key>  (optional but recommended)

    Response must be JSON in the schema you defined.
*/
(() => {
  const DEFAULTS = {
    endpoint: null,
    siteKey: null,
    theme: "light",
    mode: "inline",
    mountId: "cyfsa-analyzer",
    title: "CYFSA Document Analyzer",
    subtitle: "Ontario CYFSA / family-court. Educational only. JSON output.",
    maxFiles: 5,
    maxFileMB: 20,
  };

  const el = (tag, props = {}, children = []) => {
    const n = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) n.setAttribute(k, String(v));
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c === null || c === undefined) return;
      if (typeof c === "string") n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  };

  const safeJsonParse = (text) => {
    try { return JSON.parse(text); } catch { return null; }
  };

  const pretty = (obj) => JSON.stringify(obj, null, 2);

  const STYLE_ID = "cyfsa-analyzer-widget-style";
  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
.cya-root{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.35}
.cya-root *{box-sizing:border-box}
.cya-card{border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:14px}
.cya-dark .cya-card{border-color:rgba(255,255,255,.16)}
.cya-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.cya-title{font-weight:800;font-size:16px;margin:0 0 4px}
.cya-sub{opacity:.8;font-size:12px;margin:0 0 10px}
.cya-btn{padding:10px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.2);background:#fff;cursor:pointer}
.cya-dark .cya-btn{background:#121212;border-color:rgba(255,255,255,.2);color:#fff}
.cya-btn:disabled{opacity:.5;cursor:not-allowed}
.cya-pill{display:inline-flex;gap:6px;align-items:center;border:1px solid rgba(0,0,0,.12);padding:5px 8px;border-radius:999px;font-size:12px}
.cya-dark .cya-pill{border-color:rgba(255,255,255,.16)}
.cya-err{color:#b00020;white-space:pre-wrap;font-size:12px;margin-top:10px}
.cya-dark .cya-err{color:#ff6b6b}
.cya-pre{white-space:pre-wrap;font-size:12px;border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:10px;max-height:320px;overflow:auto}
.cya-dark .cya-pre{border-color:rgba(255,255,255,.16)}
.cya-grid{display:grid;gap:12px}
.cya-section h3{margin:0 0 8px;font-size:14px}
.cya-flag{border:1px solid rgba(0,0,0,.10);border-radius:12px;padding:10px}
.cya-dark .cya-flag{border-color:rgba(255,255,255,.14)}
.cya-kv{font-size:12px;opacity:.85;margin-top:6px}
.cya-topbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
.cya-close{border:none;background:transparent;font-size:18px;cursor:pointer;line-height:1}
.cya-modalMask{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:999999}
.cya-modal{width:min(980px,96vw);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;padding:14px}
.cya-dark .cya-modal{background:#0f0f0f;color:#fff}
.cya-floatBtn{position:fixed;right:18px;bottom:18px;z-index:999998}
    `.trim();
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const buildWidget = (cfg) => {
    injectStyles();

    const state = {
      busy: false,
      files: [],
      result: null,
      error: null,
    };

    const root = el("div", { class: `cya-root ${cfg.theme === "dark" ? "cya-dark" : ""}` });

    const fileInput = el("input", {
      type: "file",
      multiple: "true",
      accept: ".pdf,.docx,.txt",
      onchange: () => {
        state.error = null;
        state.result = null;
        const list = Array.from(fileInput.files || []);
        if (list.length > cfg.maxFiles) {
          state.files = list.slice(0, cfg.maxFiles);
          render();
          state.error = `Too many files. Max ${cfg.maxFiles}.`;
          render();
          return;
        }
        for (const f of list) {
          const mb = f.size / (1024 * 1024);
          if (mb > cfg.maxFileMB) {
            state.files = [];
            render();
            state.error = `File too large: ${f.name} (${mb.toFixed(1)}MB). Max ${cfg.maxFileMB}MB.`;
            render();
            return;
          }
        }
        state.files = list;
        render();
      },
    });

    const btnAnalyze = el("button", {
      class: "cya-btn",
      onclick: async () => {
        if (!cfg.endpoint) {
          state.error = "Widget misconfigured: missing endpoint.";
          render();
          return;
        }
        if (!state.files.length) return;

        state.busy = true;
        state.error = null;
        state.result = null;
        render();

        try {
          const fd = new FormData();
          state.files.forEach((f) => fd.append("files", f, f.name));

          const headers = {};
          if (cfg.siteKey) headers["X-Site-Key"] = cfg.siteKey;

          const res = await fetch(cfg.endpoint, {
            method: "POST",
            headers,
            body: fd,
          });

          const text = await res.text();
          if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

          const parsed = safeJsonParse(text) ?? (() => { try { return JSON.parse(text); } catch { return null; } })();
          if (!parsed) throw new Error("Server did not return JSON.");

          if (!parsed.meta || !Array.isArray(parsed.flags)) {
            throw new Error("JSON missing expected fields (meta, flags).");
          }

          state.result = parsed;
        } catch (e) {
          state.error = String(e?.message || e);
        } finally {
          state.busy = false;
          render();
        }
      },
      disabled: "true",
    }, "Analyze");

    const btnCopyJson = el("button", {
      class: "cya-btn",
      onclick: async () => {
        if (!state.result) return;
        await navigator.clipboard.writeText(pretty(state.result));
      },
      disabled: "true",
    }, "Copy JSON");

    const btnDownloadJson = el("button", {
      class: "cya-btn",
      onclick: () => {
        if (!state.result) return;
        const blob = new Blob([pretty(state.result)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "cyfsa_analyzer_result.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
      disabled: "true",
    }, "Download JSON");

    const summaryBox = el("div");
    const flagsBox = el("div");
    const timelineBox = el("div");
    const rawBox = el("pre", { class: "cya-pre" });

    const card = el("div", { class: "cya-card" }, [
      el("div", { class: "cya-topbar" }, [
        el("div", {}, [
          el("div", { class: "cya-title" }, cfg.title),
          el("div", { class: "cya-sub" }, cfg.subtitle),
        ]),
        cfg.mode === "modal"
          ? el("button", {
              class: "cya-close",
              title: "Close",
              onclick: () => closeModal(),
            }, "\u00d7")
          : null,
      ]),
      el("div", { class: "cya-row" }, [
        fileInput,
        btnAnalyze,
        btnCopyJson,
        btnDownloadJson,
        el("span", { class: "cya-pill" }, `Max ${cfg.maxFiles} files / ${cfg.maxFileMB}MB`),
      ]),
      el("div", { class: "cya-grid", style: "margin-top:12px" }, [
        el("div", { class: "cya-section" }, [el("h3", {}, "Summary"), summaryBox]),
        el("div", { class: "cya-section" }, [el("h3", {}, "Flags"), flagsBox]),
        el("div", { class: "cya-section" }, [el("h3", {}, "Timeline"), timelineBox]),
        el("div", { class: "cya-section" }, [el("h3", {}, "Raw JSON"), rawBox]),
      ]),
      el("div", { class: "cya-err" }),
    ]);

    root.appendChild(card);

    let modalMask = null;
    let floatBtn = null;

    const openModal = () => {
      if (modalMask) return;
      modalMask = el("div", { class: "cya-modalMask", onclick: (e) => {
        if (e.target === modalMask) closeModal();
      } }, [
        el("div", { class: `cya-modal ${cfg.theme === "dark" ? "cya-dark" : ""}` }, [root])
      ]);
      document.body.appendChild(modalMask);
    };

    const closeModal = () => {
      if (!modalMask) return;
      modalMask.remove();
      modalMask = null;
      mount();
    };

    const mount = () => {
      root.replaceWith(root.cloneNode(true));
    };

    const render = () => {
      btnAnalyze.disabled = !(state.files.length && !state.busy);
      btnAnalyze.textContent = state.busy ? "Analyzing..." : "Analyze";

      const hasResult = !!state.result;
      btnCopyJson.disabled = !hasResult;
      btnDownloadJson.disabled = !hasResult;

      summaryBox.innerHTML = "";
      if (hasResult) {
        const s = state.result.summary || {};
        summaryBox.appendChild(el("div", {}, s.plain_language || "(no summary)"));
      } else {
        summaryBox.appendChild(el("div", { style: "opacity:.75;font-size:12px" }, "Upload files and click Analyze."));
      }

      flagsBox.innerHTML = "";
      if (hasResult) {
        const flags = Array.isArray(state.result.flags) ? state.result.flags : [];
        if (!flags.length) {
          flagsBox.appendChild(el("div", { style: "opacity:.75;font-size:12px" }, "(no flags)"));
        } else {
          flags.forEach((f) => {
            const quote = f?.evidence_quotes?.[0]?.quote || "(no quote)";
            const loc = f?.evidence_quotes?.[0]?.location || {};
            const locText = `p:${loc.page ?? "?"} para:${loc.paragraph ?? "?"} line:${loc.line ?? "?"}`;
            flagsBox.appendChild(
              el("div", { class: "cya-flag" }, [
                el("div", { style: "font-weight:800" }, `[${f.severity}] ${f.title} \u2014 ${f.category}`),
                el("div", { style: "font-size:13px;margin-top:6px" }, f.why_flagged || ""),
                el("div", { class: "cya-kv" }, `Location: ${locText}`),
                el("div", { class: "cya-kv" }, `Quote: ${quote}`),
              ])
            );
          });
        }
      } else {
        flagsBox.appendChild(el("div", { style: "opacity:.75;font-size:12px" }, "Results will appear here."));
      }

      timelineBox.innerHTML = "";
      if (hasResult) {
        const tl = Array.isArray(state.result.timeline) ? state.result.timeline : [];
        if (!tl.length) {
          timelineBox.appendChild(el("div", { style: "opacity:.75;font-size:12px" }, "(no timeline items)"));
        } else {
          const ul = el("ul", { style: "margin:0;padding-left:18px" });
          tl.forEach((t) => ul.appendChild(el("li", { style: "margin-bottom:6px" }, `${t.date}: ${t.event}`)));
          timelineBox.appendChild(ul);
        }
      } else {
        timelineBox.appendChild(el("div", { style: "opacity:.75;font-size:12px" }, "Timeline will appear here."));
      }

      rawBox.textContent = hasResult ? pretty(state.result) : "";

      const errEl = card.querySelector(".cya-err");
      errEl.textContent = state.error || "";
    };

    if (cfg.mode === "modal") {
      floatBtn = el("button", { class: "cya-btn cya-floatBtn", onclick: openModal }, "Open Analyzer");
      document.body.appendChild(floatBtn);
      render();
      return { mount: () => {}, render };
    }

    const mountPoint =
      document.getElementById(cfg.mountId) ||
      (() => {
        const d = el("div", { id: cfg.mountId });
        document.body.appendChild(d);
        return d;
      })();

    mountPoint.appendChild(root);
    render();
    return { mount: () => {}, render };
  };

  const script = document.currentScript || (() => {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  const cfg = { ...DEFAULTS };
  const get = (k) => script?.getAttribute?.(`data-${k}`);
  cfg.endpoint = get("endpoint") || cfg.endpoint;
  cfg.siteKey = get("siteKey") || cfg.siteKey;
  cfg.theme = get("theme") || cfg.theme;
  cfg.mode = get("mode") || cfg.mode;
  cfg.mountId = get("mount") || cfg.mountId;
  cfg.title = get("title") || cfg.title;
  cfg.subtitle = get("subtitle") || cfg.subtitle;

  buildWidget(cfg);
})();
