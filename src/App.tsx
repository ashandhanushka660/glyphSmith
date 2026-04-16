import React, { useState, useRef, useEffect } from "react";
import { Pane } from "tweakpane";
import { motion } from "motion/react";
import cloud from "d3-cloud";
import { 
  Type, 
  Upload, 
  Download, 
  Maximize2
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface WordItem {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
}

interface GlyphSettings {
  text: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  jitter: number;
  color: string;
  bgColor: string;
  weight: number;
  italic: boolean;
  uppercase: boolean;
  mode: "standard" | "abstract" | "modular" | "wordcloud" | "sampler";
  // Effect specific
  density: number;
  shapeSize: number;
  spread: number;
  pixelate: boolean;
  lineGap: number;
  // Wordcloud specific
  cloudRotate: boolean;
  cloudScale: number;
  // Sampler specific
  sampleThreshold: number;
  sampleResolution: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"properties" | "effects">("properties");
  const [wordPositions, setWordPositions] = useState<WordItem[]>([]);
  const [samplePoints, setSamplePoints] = useState<{x: number, y: number}[]>([]);
  const [settings, setSettings] = useState<GlyphSettings>({
    text: "GLYPHLAB",
    fontSize: 180,
    letterSpacing: -0.05,
    lineHeight: 0.9,
    rotation: 0,
    jitter: 0,
    color: "#111827",
    bgColor: "#f4f5f7",
    weight: 900,
    italic: false,
    uppercase: true,
    mode: "standard",
    density: 20,
    shapeSize: 8,
    spread: 0,
    pixelate: false,
    lineGap: 32,
    cloudRotate: true,
    cloudScale: 1,
    sampleThreshold: 128,
    sampleResolution: 10,
  });

  const [customFont, setCustomFont] = useState<string | null>(null);
  const [fontName, setFontName] = useState<string>("Inter");
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paneRef.current) return;

    const pane = new Pane({
      container: paneRef.current,
      title: activeTab === "properties" ? "GLYPH PROPERTIES" : "GENERATIVE EFFECTS",
    }) as any;

    if (activeTab === "properties") {
      pane.addBinding(settings, "text", { label: "Input Text" }).on("change", (ev: any) => {
        setSettings(s => ({ ...s, text: ev.value }));
      });

      const f1 = pane.addFolder({ title: "Typography" });
      f1.addBinding(settings, "fontSize", { min: 10, max: 800, step: 1, label: "Size" }).on("change", (ev: any) => setSettings(s => ({ ...s, fontSize: ev.value })));
      f1.addBinding(settings, "weight", { min: 100, max: 900, step: 100, label: "Weight" }).on("change", (ev: any) => setSettings(s => ({ ...s, weight: ev.value })));
      f1.addBinding(settings, "letterSpacing", { min: -1, max: 2, step: 0.01, label: "Spacing" }).on("change", (ev: any) => setSettings(s => ({ ...s, letterSpacing: ev.value })));
      f1.addBinding(settings, "lineGap", { min: 0, max: 400, step: 1, label: "Line Gap" }).on("change", (ev: any) => setSettings(s => ({ ...s, lineGap: ev.value })));
      f1.addBinding(settings, "lineHeight", { min: 0.1, max: 3, step: 0.1, label: "Vertical H" }).on("change", (ev: any) => setSettings(s => ({ ...s, lineHeight: ev.value })));
      f1.addBinding(settings, "uppercase", { label: "All Caps" }).on("change", (ev: any) => setSettings(s => ({ ...s, uppercase: ev.value })));
      
      const fontParams = { family: fontName };
      f1.addBinding(fontParams, "family", {
        options: {
          Inter: "Inter",
          Space: "Space Grotesk",
          Mono: "JetBrains Mono",
          Bebas: "Bebas Neue",
          Garamond: "Cormorant Garamond",
          Outfit: "Outfit"
        },
        label: "Font Family"
      }).on("change", (ev: any) => setFontName(ev.value));

      const f2 = pane.addFolder({ title: "Chaos & Noise" });
      f2.addBinding(settings, "rotation", { min: -180, max: 180, step: 1, label: "Rotation" }).on("change", (ev: any) => setSettings(s => ({ ...s, rotation: ev.value })));
      f2.addBinding(settings, "jitter", { min: 0, max: 200, step: 1, label: "Intensity" }).on("change", (ev: any) => setSettings(s => ({ ...s, jitter: ev.value })));

      const f3 = pane.addFolder({ title: "Environment" });
      f3.addBinding(settings, "color", { label: "Ink" }).on("change", (ev: any) => setSettings(s => ({ ...s, color: ev.value })));
      f3.addBinding(settings, "bgColor", { label: "Paper" }).on("change", (ev: any) => setSettings(s => ({ ...s, bgColor: ev.value })));
      f3.addBinding(settings, "mode", {
        options: { Typography: "standard", Modular: "abstract", Generative: "modular", "Word Cloud": "wordcloud", "ASCII Sampler": "sampler" },
        label: "Engine"
      }).on("change", (ev: any) => setSettings(s => ({ ...s, mode: ev.value })));
    } else {
      const g1 = pane.addFolder({ title: "Module Configuration" });
      g1.addBinding(settings, "density", { min: 5, max: 100, step: 1, label: "Grid Density" }).on("change", (ev: any) => setSettings(s => ({ ...s, density: ev.value })));
      g1.addBinding(settings, "shapeSize", { min: 1, max: 100, step: 1, label: "Shape Size" }).on("change", (ev: any) => setSettings(s => ({ ...s, shapeSize: ev.value })));
      g1.addBinding(settings, "spread", { min: 0, max: 50, step: 1, label: "Random Spread" }).on("change", (ev: any) => setSettings(s => ({ ...s, spread: ev.value })));
      g1.addBinding(settings, "pixelate", { label: "Strict Grid" }).on("change", (ev: any) => setSettings(s => ({ ...s, pixelate: ev.value })));

      const g2 = pane.addFolder({ title: "Word Cloud Settings" });
      g2.addBinding(settings, "cloudRotate", { label: "Allow Rotation" }).on("change", (ev: any) => setSettings(s => ({ ...s, cloudRotate: ev.value })));
      g2.addBinding(settings, "cloudScale", { min: 0.1, max: 5, step: 0.1, label: "Overall Scale" }).on("change", (ev: any) => setSettings(s => ({ ...s, cloudScale: ev.value })));

      const g_sampler = pane.addFolder({ title: "Sampler Config" });
      g_sampler.addBinding(settings, "sampleResolution", { min: 4, max: 30, step: 1, label: "Detail" }).on("change", (ev: any) => setSettings(s => ({ ...s, sampleResolution: ev.value })));
      g_sampler.addBinding(settings, "sampleThreshold", { min: 1, max: 255, step: 1, label: "Threshold" }).on("change", (ev: any) => setSettings(s => ({ ...s, sampleThreshold: ev.value })));

      const g3 = pane.addFolder({ title: "Module Type" });
      pane.addButton({ title: "Switch to Sampler Engine" }).on("click", () => {
        setSettings(s => ({ ...s, mode: "sampler" }));
      });
      pane.addButton({ title: "Switch to Word Cloud" }).on("click", () => {
        setSettings(s => ({ ...s, mode: "wordcloud" }));
      });
    }

    pane.addButton({ title: "Randomize" }).on("click", () => {
      setSettings(s => ({
        ...s,
        rotation: Math.random() * 360 - 180,
        jitter: Math.random() * 50,
        fontSize: 50 + Math.random() * 300,
        letterSpacing: Math.random() * 0.5 - 0.1,
        density: 10 + Math.random() * 40
      }));
    });

    pane.addButton({ title: "Reset" }).on("click", () => {
      setSettings({
        text: "GLYPHLAB",
        fontSize: 120,
        letterSpacing: -0.05,
        lineHeight: 0.9,
        rotation: 0,
        jitter: 0,
        color: "#111827",
        bgColor: "#f4f5f7",
        weight: 900,
        italic: false,
        uppercase: true,
        mode: "standard",
        density: 20,
        shapeSize: 8,
        spread: 0,
        pixelate: false
      });
      setFontName("Inter");
    });

    return () => {
      pane.dispose();
    };
  }, [activeTab]);

  useEffect(() => {
    if (settings.mode !== "wordcloud") return;

    const words = settings.text.split(/\s+/).filter(w => w.length > 0);
    const mappedWords = words.map(w => ({
      text: w,
      size: 10 + Math.random() * (settings.fontSize / 2)
    }));

    const layout = cloud()
      .size([800, 600])
      .words(mappedWords)
      .padding(5)
      .rotate(() => settings.cloudRotate ? (Math.random() > 0.5 ? 90 : 0) : 0)
      .font(fontName)
      .fontSize(d => d.size!)
      .on("end", (computedWords) => {
        setWordPositions(computedWords as WordItem[]);
      });

    layout.start();
  }, [settings.text, settings.mode, settings.fontSize, settings.cloudRotate, fontName]);

  useEffect(() => {
    if (settings.mode !== "sampler") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.font = `${settings.weight} ${settings.fontSize}px ${fontName}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(settings.uppercase ? settings.text.toUpperCase() : settings.text, width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const points = [];
    const step = settings.sampleResolution;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        const brightness = imageData[i]; // Since we drew white on black, R channel is enough
        if (brightness > settings.sampleThreshold) {
          points.push({ x, y });
        }
      }
    }
    setSamplePoints(points);
  }, [settings.text, settings.mode, settings.fontSize, settings.sampleResolution, settings.sampleThreshold, settings.weight, fontName, settings.uppercase]);

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newFontName = `custom-${file.name.split(".")[0]}`;
      const fontFace = new FontFace(newFontName, `url(${base64})`);
      
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        setCustomFont(base64);
        setFontName(newFontName);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen grid grid-cols-[240px_1fr_280px] grid-rows-[56px_1fr] bg-[var(--bg-main)]">
      {/* Header */}
      <header className="col-span-3 bg-white border-b border-[var(--border-color)] flex items-center px-4 justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="size-6 bg-[var(--accent)] rounded flex items-center justify-center">
            <Type className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">GlyphSmith</span>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
          <input 
            type="text" 
            value={settings.text}
            onChange={(e) => setSettings(s => ({ ...s, text: e.target.value }))}
            placeholder="Enter characters..."
            className="w-full px-3 py-1.5 border border-[var(--border-color)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-[var(--border-color)] rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="size-3.5" />
            Export SVG
          </button>
          <button className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-md text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors">
            Save Glyph
          </button>
        </div>
      </header>

      {/* Sidebar - Font Library */}
      <aside className="bg-white border-r border-[var(--border-color)] p-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Font Library</h2>
          <nav className="flex flex-col gap-1">
            {["Geometric Sans", "Inter Display", "Meno Modern", "Custom Script", "Brutalist Mono"].map((f, i) => (
              <button 
                key={f}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-all text-left",
                  i === 0 ? "bg-blue-50 text-[var(--accent)] font-medium" : "hover:bg-gray-50"
                )}
              >
                {f}
                {i === 0 && <span className="size-1.5 bg-[var(--accent)] rounded-full" />}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">History</h2>
          <nav className="flex flex-col gap-1 opacity-60">
            {["Draft-204", "Logo-Concept-A"].map(h => (
              <button key={h} className="px-2.5 py-1.5 text-sm hover:underline text-left">{h}</button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-2 border-dashed border-[var(--border-color)] rounded-lg p-5 text-center transition-colors group relative hover:border-[var(--accent)]/50">
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFontUpload}
            className="absolute inset-0 size-full opacity-0 cursor-pointer z-10"
          />
          <strong className="text-xs block mb-1">Add Custom Font</strong>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-medium">Drop .OTF or .TTF</span>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="bg-[#e5e7eb] relative flex items-center justify-center overflow-hidden border-r border-[var(--border-color)]">
        {/* Guide Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-0 w-full border-t border-dashed border-[var(--accent)]" />
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[var(--accent)]" />
          <div className="absolute top-3/4 left-0 w-full border-t border-dashed border-[var(--accent)]" />
        </div>
        
        {/* Dot Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40" 
          style={{ backgroundImage: `radial-gradient(var(--border-color) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
        />

        <div className="z-10 text-center flex flex-wrap justify-center items-center"
          style={{ 
            fontFamily: fontName,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}em`,
            fontWeight: settings.weight,
            fontStyle: settings.italic ? 'italic' : 'normal',
            textTransform: settings.uppercase ? 'uppercase' : 'none',
            rotate: `${settings.rotation}deg`,
            color: '#1f2937',
            textShadow: settings.mode === 'standard' ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
            gap: `1rem ${settings.lineGap}px`
          }}
        >
          {settings.mode === "wordcloud" ? (
            <div className="relative w-[800px] h-[600px] overflow-visible" style={{ scale: settings.cloudScale }}>
              {wordPositions.map((word, i) => (
                <motion.div
                  key={`${word.text}-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: word.x,
                    y: word.y,
                    rotate: word.rotate
                  }}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    fontSize: word.size,
                    transform: `translate(-50%, -50%)`,
                    color: i % 3 === 0 ? 'var(--accent)' : 'inherit',
                    opacity: i % 2 === 0 ? 1 : 0.7
                  }}
                >
                  {word.text}
                </motion.div>
              ))}
            </div>
          ) : settings.mode === "sampler" ? (
            <div className="relative w-[800px] h-[400px] overflow-hidden">
              {samplePoints.map((pt, i) => (
                <div
                  key={`${pt.x}-${pt.y}-${i}`}
                  className="absolute"
                  style={{
                    left: pt.x,
                    top: pt.y,
                    transform: `translate(-50%, -50%)`,
                    fontSize: settings.shapeSize,
                    color: settings.color,
                    fontFamily: 'monospace',
                    lineHeight: 1,
                    opacity: 0.8
                  }}
                >
                  {["+", "-", "|", ".", ",", "x", "a", "o"][ (pt.x + pt.y) % 8]}
                </div>
              ))}
            </div>
          ) : settings.text.split("").map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: Math.sin(i * 10) * settings.jitter,
                rotate: Math.sin(i * 5) * (settings.jitter * 2)
              }}
              className={cn(
                "inline-block transition-all duration-500",
                settings.mode === "abstract" && "opacity-80"
              )}
            >
              {settings.mode === "abstract" ? renderAbstractGlyph(char) : 
               settings.mode === "modular" ? renderModularGlyph(char, settings) : char}
            </motion.span>
          ))}
        </div>
      </main>

      {/* Tweakpane Side Container */}
      <aside className="bg-white p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="flex gap-4 border-b border-[var(--border-color)] mb-2">
          <button 
            onClick={() => setActiveTab("properties")}
            className={cn(
              "text-xs font-semibold pb-2 transition-all",
              activeTab === "properties" ? "border-b-2 border-[var(--accent)]" : "text-[var(--text-secondary)] opacity-50"
            )}
          >
            Properties
          </button>
          <button 
            onClick={() => setActiveTab("effects")}
            className={cn(
              "text-xs font-semibold pb-2 transition-all",
              activeTab === "effects" ? "border-b-2 border-[var(--accent)]" : "text-[var(--text-secondary)] opacity-50"
            )}
          >
            Effects
          </button>
        </div>

        <div ref={paneRef} className="tp-custom-container flex-1" />

        <div className="mt-auto space-y-3">
          <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Engine Status</label>
          <div className="bg-[#111] text-[#0f0] p-3 rounded font-mono text-[10px] leading-relaxed">
            Nodes: 4,120<br />
            Calculation: 12ms<br />
            Engine: WebGL-v2
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tp-base-background-color: transparent ;
          --tp-base-shadow-color: rgba(0, 0, 0, 0);
          --tp-button-background-color: var(--accent);
          --tp-button-background-color-active: var(--accent-hover);
          --tp-button-background-color-focus: var(--accent);
          --tp-button-background-color-hover: var(--accent-hover);
          --tp-button-foreground-color: white;
          --tp-container-background-color: #f9fafb;
          --tp-container-background-color-active: #f3f4f6;
          --tp-container-background-color-focus: #f3f4f6;
          --tp-container-background-color-hover: #f3f4f6;
          --tp-container-foreground-color: var(--text-primary);
          --tp-input-background-color: #ffffff;
          --tp-input-background-color-active: #ffffff;
          --tp-input-background-color-focus: #ffffff;
          --tp-input-background-color-hover: #ffffff;
          --tp-input-foreground-color: var(--text-primary);
          --tp-label-foreground-color: var(--text-secondary);
        }
        .tp-custom-container .tp-dfv { width: 100% !important; border-bottom: 1px solid #e5e7eb !important; border-top: none !important; border-left: none !important; border-right: none !important; }
        .tp-custom-container .tp-brv { border: none !important; margin-bottom: 4px !important; margin-top: 4px !important; border-radius: 6px !important; overflow: hidden; }
        .tp-custom-container .tp-v { padding: 4px !important; }
        .tp-custom-container .tp-lblv_l { width: 45% !important; font-size: 11px !important; font-weight: 500 !important; color: #374151 !important; }
        .tp-custom-container .tp-lblv_v { width: 55% !important; }
        .tp-custom-container .tp-btnv_t { font-size: 11px !important; font-weight: 600 !important; height: 32px !important; border-radius: 6px !important; margin-top: 8px !important; }
        .tp-rotv { background: #e5e7eb !important; height: 4px !important; border-radius: 2px !important; }
        .tp-rotv_knob { width: 12px !important; height: 12px !important; background: var(--accent) !important; border-radius: 50% !important; top: -4px !important; }
        
        @media print {
          header, aside { display: none !important; }
          main { display: block !important; width: 100% !important; height: 100vh !important; border: none !important; margin: 0 !important; }
        }
      `}} />
    </div>
  );
}

function renderModularGlyph(char: string, settings: GlyphSettings) {
  if (char === " " || char === "\n") return char;
  
  // Create a grid of components to form the character "vibe"
  // Since we don't have direct path sampling here, we create a stylized modular representation
  const modules = [];
  const count = Math.floor(settings.density / 2);
  
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      const isVisible = (i + j + char.charCodeAt(0)) % 2 === 0;
      if (!isVisible) continue;

      const noiseX = (Math.random() - 0.5) * settings.spread;
      const noiseY = (Math.random() - 0.5) * settings.spread;

      modules.push(
        <motion.div
          key={`${i}-${j}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1, x: noiseX, y: noiseY }}
          className="absolute"
          style={{
            width: settings.shapeSize,
            height: settings.shapeSize,
            left: `${(i / count) * 100}%`,
            top: `${(j / count) * 100}%`,
            backgroundColor: settings.color,
            borderRadius: settings.pixelate ? '0' : '50%',
            opacity: 0.6 + Math.random() * 0.4
          }}
        />
      );
    }
  }

  return (
    <div className="relative inline-block overflow-visible" style={{ width: '1em', height: '1em' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        {char}
      </div>
      {modules}
    </div>
  );
}

function renderAbstractGlyph(char: string) {
  // Map characters to geometric forms for "Abstract" mode
  const code = char.charCodeAt(0);
  if (char === " " || char === "\n") return char;
  
  const forms = [
    "■", "▲", "●", "◆", "▼", "◀", "▶", "○", "□", "△", "◊", "◎", "⊕", "⊗", "⊘", "⊚", "⊛", "⊜", "⊝",
    "◰", "◱", "◲", "◳", "◴", "◵", "◶", "◷", "◸", "◹", "◺", "◻", "◼", "◽", "◾", "◿"
  ];
  
  return forms[code % forms.length];
}
