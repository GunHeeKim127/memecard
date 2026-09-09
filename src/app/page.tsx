"use client";

import { ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import "./palette.css";
import "./circuit.css";
import "./hardware.css";
import "./hardware-links.css";

type Ratio = "square" | "portrait" | "story";
type Template = { id: string; name: string; text: string; size: number; x: number; y: number; color: string; ratio: Ratio };
type LinkPaths = { input: string; text: string; color: string; output: string };
const ratioSizes: Record<Ratio, { width: number; height: number; label: string }> = { square: { width: 1080, height: 1080, label: "1:1" }, portrait: { width: 1080, height: 1350, label: "4:5" }, story: { width: 1080, height: 1920, label: "9:16" } };
const starters: Template[] = [
  { id: "starter-1", name: "오늘의 한 줄", text: "오늘도, 나답게\n가볍게 시작해요", size: 72, x: 50, y: 72, color: "#ffffff", ratio: "square" },
  { id: "starter-2", name: "작은 기록", text: "작은 장면도\n멋진 이야기가 돼", size: 68, x: 50, y: 78, color: "#fff5dc", ratio: "portrait" },
  { id: "starter-3", name: "주말의 온도", text: "느리게 가도\n괜찮은 날", size: 76, x: 50, y: 68, color: "#172038", ratio: "story" },
];

function HardwareLinks({ paths }: { paths: LinkPaths }) {
  return <svg className="hardware-links" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="packet-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path id="path-input" className="board-wire wire-input" d={paths.input} /><path id="path-text" className="board-wire wire-text" d={paths.text} /><path id="path-color" className="board-wire wire-color" d={paths.color} /><path id="path-output" className="board-wire wire-output" d={paths.output} /><circle className="idle-pulse" cx="500" cy="300" r="3" /><circle className="signal-packet packet-input" r="9" filter="url(#packet-glow)"><animateMotion dur="800ms" fill="freeze"><mpath href="#path-input" /></animateMotion></circle><circle className="signal-packet packet-text" r="9" filter="url(#packet-glow)"><animateMotion dur="620ms" fill="freeze"><mpath href="#path-text" /></animateMotion></circle><circle className="signal-packet packet-color" r="9" filter="url(#packet-glow)"><animateMotion dur="620ms" fill="freeze"><mpath href="#path-color" /></animateMotion></circle><circle className="signal-packet packet-output" r="9" filter="url(#packet-glow)"><animateMotion dur="720ms" fill="freeze"><mpath href="#path-output" /></animateMotion></circle></svg>;
}

function CatCourier() {
  return <svg className="character-art cat-art" viewBox="0 0 110 150" role="img" aria-label="이미지를 운반하는 고양이 캐릭터">
    <path className="char-tail" d="M78 104 C108 92 101 61 84 75" />
    <path className="char-body cat-body" d="M38 60 Q55 50 72 60 L78 111 Q55 124 32 111Z" />
    <path className="char-leg char-leg-a" d="M42 107 L37 139 L47 139 L52 111" /><path className="char-leg char-leg-b" d="M62 111 L69 139 L79 139 L72 105" />
    <path className="char-arm char-arm-a" d="M38 70 L19 92 L28 99 L47 82" /><path className="char-arm char-arm-b" d="M71 72 L89 91 L81 99 L63 83" />
    <rect className="char-package image-package" x="17" y="87" width="76" height="30" rx="3" /><path d="M55 87 V117 M17 99 H93" className="package-line" /><circle cx="30" cy="103" r="3" className="package-dot" />
    <path className="char-head cat-head" d="M31 62 L26 24 L42 35 Q55 28 68 35 L84 24 L79 63 Q55 78 31 62Z" /><circle cx="43" cy="49" r="3" className="char-eye" /><circle cx="67" cy="49" r="3" className="char-eye" /><path d="M52 57 Q55 61 59 57" className="char-mouth" />
  </svg>;
}

function DogCourier() {
  return <svg className="character-art dog-art" viewBox="0 0 110 150" role="img" aria-label="문구를 운반하는 강아지 캐릭터">
    <path className="char-tail" d="M78 105 C106 91 102 64 86 76" />
    <path className="char-body dog-body" d="M38 60 Q55 51 72 60 L78 111 Q55 124 32 111Z" />
    <path className="char-leg char-leg-a" d="M42 107 L37 139 L47 139 L52 111" /><path className="char-leg char-leg-b" d="M62 111 L69 139 L79 139 L72 105" />
    <path className="char-arm char-arm-a" d="M38 70 L18 90 L27 99 L47 82" /><path className="char-arm char-arm-b" d="M71 72 L91 90 L82 99 L63 83" />
    <rect className="char-package text-package" x="18" y="84" width="74" height="35" rx="3" /><path d="M27 95 H82 M27 103 H68 M27 111 H76" className="text-lines" />
    <path className="char-head dog-head" d="M31 61 Q25 31 39 26 Q55 19 71 27 Q85 31 79 62 Q55 76 31 61Z" /><path className="dog-ear" d="M36 35 Q16 29 24 60 Q29 70 39 58" /><path className="dog-ear" d="M74 35 Q94 29 86 60 Q81 70 71 58" /><circle cx="44" cy="49" r="3" className="char-eye" /><circle cx="66" cy="49" r="3" className="char-eye" /><ellipse cx="55" cy="58" rx="6" ry="4" className="dog-nose" />
  </svg>;
}

function ColorPainter() {
  return <svg className="character-art painter-art" viewBox="0 0 110 150" role="img" aria-label="색을 운반해 문구를 칠하는 동물 캐릭터">
    <path className="char-tail" d="M78 105 C104 91 101 67 86 76" />
    <path className="char-body painter-body" d="M38 60 Q55 51 72 60 L78 111 Q55 124 32 111Z" />
    <path className="char-leg char-leg-a" d="M42 107 L37 139 L47 139 L52 111" /><path className="char-leg char-leg-b" d="M62 111 L69 139 L79 139 L72 105" />
    <path className="char-arm char-arm-a" d="M39 72 L20 92 L28 99 L47 82" /><path className="char-arm char-arm-b" d="M70 72 L88 52 L94 59 L78 84" />
    <path className="paint-brush" d="M85 55 L101 35" /><path className="paint-brush-tip" d="M98 38 L105 29 L108 33 L101 42Z" />
    <ellipse className="paint-palette" cx="22" cy="98" rx="15" ry="10" /><circle cx="16" cy="96" r="3" fill="#ef8354" /><circle cx="24" cy="94" r="3" fill="#52d6df" /><circle cx="28" cy="101" r="3" fill="#f7c873" />
    <path className="char-head painter-head" d="M31 61 Q27 31 40 26 Q55 19 70 27 Q84 31 79 62 Q55 76 31 61Z" /><path className="painter-ear" d="M37 35 L25 22 L31 50" /><path className="painter-ear" d="M73 35 L85 22 L79 50" /><circle cx="44" cy="49" r="3" className="char-eye" /><circle cx="66" cy="49" r="3" className="char-eye" /><circle cx="55" cy="58" r="4" className="painter-nose" />
  </svg>;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const canvasAreaRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageSourceRef = useRef<string | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [text, setText] = useState("오늘도, 나답게\n가볍게 시작해요");
  const [renderText, setRenderText] = useState("오늘도, 나답게\n가볍게 시작해요");
  const [size, setSize] = useState(72); const [x, setX] = useState(50); const [y, setY] = useState(72); const [color, setColor] = useState("#ffffff"); const [renderColor, setRenderColor] = useState("#ffffff"); const [ratio, setRatio] = useState<Ratio>("square");
  const [notice, setNotice] = useState("이미지를 불러오면 이곳에서 편집할 수 있습니다."); const [templates, setTemplates] = useState<Template[]>(starters); const [templateName, setTemplateName] = useState("새 템플릿"); const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null); const [signal, setSignal] = useState({ kind: "idle", id: 0 });
  const [linkPaths, setLinkPaths] = useState<LinkPaths>({ input: "M 250 220 H 380", text: "M 750 290 H 620", color: "M 750 390 H 620", output: "M 620 460 H 750" });

  function fireSignal(kind: "upload" | "download" | "typing" | "color") { setSignal({ kind, id: Date.now() }); }
  function paintColor(nextColor: string) { fireSignal("color"); setColor(nextColor); window.setTimeout(() => setRenderColor(nextColor), 520); }

  useLayoutEffect(() => {
    function updateLinks() {
      const board = workspaceRef.current; const sidebar = sidebarRef.current; const canvas = canvasAreaRef.current; const controls = controlsRef.current;
      if (!board || !sidebar || !canvas || !controls) return;
      const boardBox = board.getBoundingClientRect(); const toSvg = (x: number, y: number) => ({ x: ((x - boardBox.left) / boardBox.width) * 1000, y: ((y - boardBox.top) / boardBox.height) * 600 });
      const left = sidebar.getBoundingClientRect(); const center = canvas.getBoundingClientRect(); const right = controls.getBoundingClientRect();
      const leftInput = toSvg(left.right, left.top + left.height * .28); const centerInput = toSvg(center.left, center.top + center.height * .28);
      const rightText = toSvg(right.left, right.top + right.height * .2); const centerText = toSvg(center.right, center.top + center.height * .42);
      const rightColor = toSvg(right.left, right.top + right.height * .48); const centerColor = toSvg(center.right, center.top + center.height * .58);
      const centerOutput = toSvg(center.right, center.top + center.height * .76); const rightOutput = toSvg(right.left, right.top + right.height * .76);
      const elbow = (from: { x: number; y: number }, to: { x: number; y: number }) => `M ${from.x} ${from.y} H ${(from.x + to.x) / 2} V ${to.y} H ${to.x}`;
      setLinkPaths({ input: elbow(leftInput, centerInput), text: elbow(rightText, centerText), color: elbow(rightColor, centerColor), output: elbow(centerOutput, rightOutput) });
    }
    updateLinks(); const observer = new ResizeObserver(updateLinks); [workspaceRef.current, sidebarRef.current, canvasAreaRef.current, controlsRef.current].forEach((element) => element && observer.observe(element)); window.addEventListener("resize", updateLinks); return () => { observer.disconnect(); window.removeEventListener("resize", updateLinks); };
  }, []);

  useEffect(() => { const saved = localStorage.getItem("memecard-templates"); if (saved) { try { setTemplates(JSON.parse(saved)); } catch { /* keep starters */ } } }, []);
  useEffect(() => { localStorage.setItem("memecard-templates", JSON.stringify(templates)); }, [templates]);
  useEffect(() => { const timer = window.setTimeout(() => setRenderText(text), 140); return () => window.clearTimeout(timer); }, [text]);
  useEffect(() => { const timer = window.setTimeout(() => setRenderColor(color), 520); return () => window.clearTimeout(timer); }, [color]);
  function drawCanvas() {
    const canvas = canvasRef.current; if (!canvas) return; const target = ratioSizes[ratio]; if (canvas.width !== target.width || canvas.height !== target.height) { canvas.width = target.width; canvas.height = target.height; } const context = canvas.getContext("2d"); if (!context) return;
    context.clearRect(0, 0, target.width, target.height);
    if (!imageSrc || !imageRef.current) { context.fillStyle = "#dedbd3"; context.fillRect(0, 0, target.width, target.height); context.fillStyle = "#8d897f"; context.textAlign = "center"; context.textBaseline = "middle"; context.font = "700 30px Arial, sans-serif"; context.fillText("이미지를 불러오세요", target.width / 2, target.height / 2 - 20); context.font = "400 22px Arial, sans-serif"; context.fillText(`${target.label} · PNG / JPEG`, target.width / 2, target.height / 2 + 28); return; }
    const image = imageRef.current; const scale = Math.max(target.width / image.width, target.height / image.height); const drawWidth = image.width * scale; const drawHeight = image.height * scale; context.drawImage(image, (target.width - drawWidth) / 2, (target.height - drawHeight) / 2, drawWidth, drawHeight); context.fillStyle = renderColor; context.textAlign = "center"; context.textBaseline = "middle"; context.font = `700 ${size}px Arial, sans-serif`; renderText.split("\n").forEach((line, index, lines) => context.fillText(line, target.width * x / 100, target.height * y / 100 + (index - (lines.length - 1) / 2) * size * 1.18));
  }

  useEffect(() => {
    if (!imageSrc) { imageRef.current = null; imageSourceRef.current = null; drawCanvas(); return; }
    if (imageSourceRef.current === imageSrc && imageRef.current) { drawCanvas(); return; }
    const image = new Image(); image.onload = () => { imageRef.current = image; imageSourceRef.current = imageSrc; drawCanvas(); }; image.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => { drawCanvas(); }, [renderText, size, x, y, renderColor, ratio]);

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return { x: ((event.clientX - bounds.left) / bounds.width) * canvas.width, y: ((event.clientY - bounds.top) / bounds.height) * canvas.height };
  }

  function startTextDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event);
    const target = ratioSizes[ratio];
    const textY = target.height * y / 100;
    const lineHeight = size * 1.18;
    const lineCount = text.split("\n").length;
    const textHeight = Math.max(size, lineCount * lineHeight);
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    context.font = `700 ${size}px Arial, sans-serif`;
    const textWidth = Math.max(...text.split("\n").map((line) => context.measureText(line).width));
    if (Math.abs(point.x - target.width * x / 100) > textWidth / 2 + 24 || Math.abs(point.y - textY) > textHeight / 2 + 24) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { offsetX: point.x - target.width * x / 100, offsetY: point.y - textY };
    setNotice("문구를 드래그하는 중입니다.");
  }

  function moveTextDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const point = canvasPoint(event);
    const target = ratioSizes[ratio];
    setX(Math.max(10, Math.min(90, ((point.x - dragRef.current.offsetX) / target.width) * 100)));
    setY(Math.max(10, Math.min(90, ((point.y - dragRef.current.offsetY) / target.height) * 100)));
  }

  function endTextDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setNotice("문구 위치를 업데이트했습니다.");
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; fireSignal("upload"); if (!/image\/(png|jpeg)/.test(file.type)) { setNotice(`불러오지 않았습니다. PNG 또는 JPEG만 지원합니다. (현재: ${file.type || "알 수 없는 형식"})`); event.target.value = ""; return; } const reader = new FileReader(); reader.onload = () => { setNotice("고양이가 이미지를 캔버스로 옮기는 중입니다..."); window.setTimeout(() => { setImageSrc(String(reader.result)); setNotice(`${file.name}을(를) 캔버스에 배치했습니다.`); }, 700); }; reader.readAsDataURL(file); }
  function loadTemplate(template: Template) { setSelectedTemplateId(template.id); setTemplateName(template.name); setText(template.text); setSize(template.size); setX(template.x); setY(template.y); setColor(template.color); setRatio(template.ratio); setNotice(`${template.name} 템플릿을 불러왔습니다.`); }
  function saveTemplate() { const item: Template = { id: selectedTemplateId || crypto.randomUUID(), name: templateName.trim() || "새 템플릿", text, size, x, y, color, ratio }; setTemplates((current) => selectedTemplateId ? current.map((template) => template.id === selectedTemplateId ? item : template) : [item, ...current]); setSelectedTemplateId(item.id); setNotice(`${item.name} 템플릿을 ${selectedTemplateId ? "수정" : "저장"}했습니다.`); }
  function deleteTemplate() { if (!selectedTemplateId) { setNotice("삭제할 템플릿을 먼저 불러오세요."); return; } setTemplates((current) => current.filter((template) => template.id !== selectedTemplateId)); setSelectedTemplateId(null); setTemplateName("새 템플릿"); setNotice("템플릿을 삭제했습니다."); }
  function download() { fireSignal("download"); const link = document.createElement("a"); link.download = `memecard-${ratio}.png`; link.href = canvasRef.current?.toDataURL("image/png") || ""; setNotice("고양이가 완성 카드를 다운로드 위치로 옮기는 중입니다..."); window.setTimeout(() => { link.click(); setNotice("메타데이터 없이 PNG를 내려받았습니다."); }, 700); }
  function exportJson() { const blob = new Blob([JSON.stringify(templates, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.download = "memecard-templates.json"; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href); }
  function importJson(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); if (!Array.isArray(parsed) || parsed.some((item) => !item.id || !item.name || !item.text || !ratioSizes[item.ratio as Ratio])) throw new Error("필수 항목 누락"); setTemplates(parsed); setNotice(`${parsed.length}개 템플릿을 복원했습니다.`); } catch { setNotice("JSON을 저장하지 않았습니다. 문법과 id, name, text, ratio를 확인하세요."); } event.target.value = ""; }; reader.readAsText(file); }

  return <main className={`${styles.app} hw-shell`} data-signal={signal.kind} onChangeCapture={(event) => { if ((event.target as HTMLInputElement).type === "color") window.setTimeout(() => fireSignal("color"), 0); }}>
    <header className={`${styles.header} hw-header`}><div className={styles.brand}><span className={styles.brandMark}>M</span><div><strong>짤카드</strong><span>STUDIO</span></div></div><div className={styles.headerMeta}><span className={styles.liveDot}></span> 로컬 작업 중 <button className={styles.downloadTop} onClick={download}>내려받기 <span>↓</span></button></div></header>
    <section className={`${styles.workspace} hw-board`}><svg className="hardware-links" key={signal.id} viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="packet-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path id="path-input" className="board-wire wire-input" d="M 20 145 H 23 V 205 H 29" /><path id="path-text" className="board-wire wire-text" d="M 80 255 H 77 V 275 H 71" /><path id="path-color" className="board-wire wire-color" d="M 80 350 H 77 V 325 H 71" /><path id="path-output" className="board-wire wire-output" d="M 71 430 H 77 V 395 H 80" /><path className="board-bus" d="M 20 145 V 430 M 80 255 V 430" /><circle className="board-node" cx="20" cy="145" r="6" /><circle className="board-node" cx="29" cy="205" r="6" /><circle className="board-node" cx="80" cy="255" r="6" /><circle className="board-node" cx="80" cy="350" r="6" /><circle className="board-node" cx="80" cy="395" r="6" /><circle className="board-node" cx="71" cy="430" r="6" /><circle className="idle-pulse" cx="50" cy="300" r="3" /><circle className="signal-packet packet-input" r="9" filter="url(#packet-glow)"><animateMotion dur="800ms" fill="freeze"><mpath href="#path-input" /></animateMotion></circle><circle className="signal-packet packet-text" r="9" filter="url(#packet-glow)"><animateMotion dur="620ms" fill="freeze"><mpath href="#path-text" /></animateMotion></circle><circle className="signal-packet packet-color" r="9" filter="url(#packet-glow)"><animateMotion dur="620ms" fill="freeze"><mpath href="#path-color" /></animateMotion></circle><circle className="signal-packet packet-output" r="9" filter="url(#packet-glow)"><animateMotion dur="720ms" fill="freeze"><mpath href="#path-output" /></animateMotion></circle></svg>
      <aside className={styles.sidebar}><div className={styles.eyebrow}>01 / CREATE</div><h1>한 장의 이미지에<br /><em>마음</em>을 얹어요.</h1><p className={styles.intro}>이미지를 고르고, 문구를 다듬고,<br />나만의 카드로 완성하세요.</p><label className={styles.upload}><span className={styles.uploadIcon}>↥</span><span><b>이미지 불러오기</b><small>PNG, JPEG · 최대 10MB</small></span><input type="file" accept="image/png,image/jpeg" onChange={handleFile} /></label><div className={styles.notice}><span>i</span><p>{notice}</p></div><div className={styles.sidebarRule}></div><div className={styles.eyebrow}>02 / TEMPLATES</div><div className={styles.templateList}>{templates.slice(0, 4).map((template) => <button className={styles.templateItem} key={template.id} onClick={() => loadTemplate(template)}><span className={styles.templateSwatch} style={{ background: template.color }}></span><span>{template.name}<small>{ratioSizes[template.ratio].label} · {template.text.split("\n")[0]}</small></span><b>›</b></button>)}</div></aside>
      <section className={styles.canvasArea}><div className={styles.canvasTop}><div><span className={styles.sectionKicker}>LIVE PREVIEW</span><h2>편집 화면</h2></div><div className={styles.ratios}>{(Object.keys(ratioSizes) as Ratio[]).map((key) => <button className={ratio === key ? styles.activeRatio : ""} key={key} onClick={() => setRatio(key)}>{ratioSizes[key].label}</button>)}</div></div><div className={styles.previewShell}><div className={styles.previewFrame} style={{ aspectRatio: `${ratioSizes[ratio].width} / ${ratioSizes[ratio].height}`, width: ratio === "square" ? "min(100%, min(570px, 65vh))" : ratio === "portrait" ? "min(100%, calc(65vh * .8))" : "min(100%, calc(65vh * .5625))" }}><canvas ref={canvasRef} onPointerDown={startTextDrag} onPointerMove={moveTextDrag} onPointerUp={endTextDrag} onPointerCancel={endTextDrag} style={{ cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }} /></div></div><div className={styles.canvasFooter}><span>문구를 마우스로 끌어 위치를 바꿀 수 있습니다.</span><button onClick={download}>PNG 저장 <span>↗</span></button></div></section>
      <aside className={styles.controls}><div className={styles.controlHeader}><span className={styles.sectionKicker}>03 / DETAILS</span><h2>문구 다듬기</h2><span className={styles.saved}>자동 저장됨</span></div><label className={styles.fieldLabel}>문구 <span>줄바꿈 가능</span></label><textarea value={text} onChange={(event) => { fireSignal("typing"); setText(event.target.value); }} rows={3} className={styles.textarea} /><div className={styles.controlBlock}><label className={styles.fieldLabel}>위치 <output>{Math.round(x)}% / {Math.round(y)}%</output></label><div className={styles.dualRange}><input type="range" min="10" max="90" value={x} onChange={(event) => { fireSignal("typing"); setX(Number(event.target.value)); }} /><input type="range" min="10" max="90" value={y} onChange={(event) => { fireSignal("typing"); setY(Number(event.target.value)); }} /></div><div className={styles.rangeLabels}><span>가로</span><span>세로</span></div></div><div className={styles.controlBlock}><label className={styles.fieldLabel}>크기 <output>{size}px</output></label><input className={styles.fullRange} type="range" min="28" max="160" value={size} onChange={(event) => { fireSignal("typing"); setSize(Number(event.target.value)); }} /></div><div className={styles.controlBlock}><label className={styles.fieldLabel}>색상 <output>{color}</output></label><div className={styles.colorRow}><input type="color" value={color} onChange={(event) => { fireSignal("typing"); setColor(event.target.value); }} /><div className={styles.colorPresets}>{["#ffffff", "#172038", "#f7c873", "#ef8354"].map((preset) => <button aria-label={`${preset} 색상`} key={preset} style={{ background: preset }} onClick={() => setColor(preset)}></button>)}</div></div></div><div className={styles.saveTemplate}><input value={templateName} onChange={(event) => { fireSignal("typing"); setTemplateName(event.target.value); }} aria-label="템플릿 이름" /><button onClick={saveTemplate}>{selectedTemplateId ? "템플릿 수정" : "템플릿 저장"}</button></div><div className={styles.dataActions}><button onClick={deleteTemplate}>선택 삭제</button><button onClick={exportJson}>JSON 내보내기</button><label>JSON 가져오기<input type="file" accept="application/json,.json" onChange={importJson} /></label></div></aside>
    </section><footer className={styles.footer}><span><b>PRIVATE BY DEFAULT</b> 브라우저에서만 작업하며 업로드하지 않습니다.</span><span>원본 출처와 사용 권한을 확인한 이미지를 사용하세요.</span></footer>
  </main>;
}
