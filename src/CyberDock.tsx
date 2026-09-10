'use client';

import React, { useState, useEffect, useRef, useCallback, ChangeEvent, MouseEvent } from 'react';

// --- Type Definitions ---
interface AspectRatio {
  w: number;
  h: number;
}

interface TextMetricsState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LogEntry {
  id: string;
  time: string;
  msg: string;
  isError: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  text: string;
  posX: number;
  posY: number;
  fontSize: number;
  textColor: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  ratio: AspectRatio;
  imageDataUrl: string | null;
}

const BASE_WIDTH = 1080;

export const CyberDock: React.FC = () => {
  // --- SSR / Hydration Safety State ---
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // --- Core Canvas States ---
  const [text, setText] = useState<string>('수배: 위성 데이터 해킹범');
  const [posX, setPosX] = useState<number>(50);
  const [posY, setPosY] = useState<number>(50);
  const [fontSize, setFontSize] = useState<number>(32);
  const [textColor, setTextColor] = useState<string>('#00f3ff');

  // Shadow / Neon Effect States
  const [shadowColor, setShadowColor] = useState<string>('#00f3ff');
  const [shadowBlur, setShadowBlur] = useState<number>(15);
  const [shadowOffsetX, setShadowOffsetX] = useState<number>(0);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(0);
  const [shadowOpacity, setShadowOpacity] = useState<number>(100);

  // Layout & Image States
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>({ w: 1, h: 1 });
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);

  // Terminal Log State
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Template & Portability States
  const [tplName, setTplName] = useState<string>('');
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [jsonString, setJsonString] = useState<string>('');

  // Drag State
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const textMetricsRef = useRef<TextMetricsState>({ x: 0, y: 0, width: 0, height: 0 });

  // Logger Callback
  const addLog = useCallback((msg: string, isError: boolean = false) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { id: `${Date.now()}_${Math.random()}`, time, msg, isError }]);
  }, []);

  // Mount Hook: Initial Log
  useEffect(() => {
    setIsMounted(true);
    setLogs([
      { id: 'init', time: new Date().toLocaleTimeString(), msg: '[SYSTEM] CYBER_DOCK 터미널 모듈 초기화 완료.', isError: false }
    ]);
  }, []);

  // Auto-scroll Terminal Logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Load Saved Templates on Mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      const stored = localStorage.getItem('cyber_templates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('LocalStorage load failed', e);
    }
  }, [isMounted]);

  // Hex to RGBA Convert Helper
  const hexToRgba = (hex: string, opacityPercent: number): string => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const a = Math.max(0, Math.min(100, opacityPercent)) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // Canvas Auto Text Wrap Helper
  const getWrappedLines = (ctx: CanvasRenderingContext2D, textContent: string, maxWidth: number): string[] => {
    const words = textContent.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;

      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        
        if (ctx.measureText(word).width > maxWidth) {
          const chars = word.split('');
          let subLine = '';
          for (let j = 0; j < chars.length; j++) {
            if (ctx.measureText(subLine + chars[j]).width > maxWidth) {
              lines.push(subLine);
              subLine = chars[j];
            } else {
              subLine += chars[j];
            }
          }
          currentLine = subLine;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // 텍스트 수용 가능 여부 사전 검사 함수
  const checkTextFit = useCallback((targetText: string, currentFontSizeSetting: number): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const maxTextWidth = canvas.width * 0.85;
    const maxTextHeight = canvas.height * 0.85;
    let curSize = currentFontSizeSetting * (canvas.width / 500);
    const minSize = 12 * (canvas.width / 500);

    while (curSize >= minSize) {
      ctx.font = `bold ${curSize}px 'Courier New', monospace`;
      const lines = getWrappedLines(ctx, targetText, maxTextWidth);
      const lineHeight = curSize * 1.3;
      if (lines.length * lineHeight <= maxTextHeight) {
        return true;
      }
      curSize -= 2;
    }
    return false;
  }, []);

  // --- Main Canvas Render Loop ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = BASE_WIDTH;
    canvas.height = BASE_WIDTH * (aspectRatio.h / aspectRatio.w);

    // 1. Background Clear
    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Background Image
    if (currentImage) {
      const imgAspect = currentImage.width / currentImage.height;
      const canvasAspect = canvas.width / canvas.height;
      let drawW: number, drawH: number, drawX: number, drawY: number;

      if (imgAspect > canvasAspect) {
        drawH = canvas.height;
        drawW = canvas.height * imgAspect;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = canvas.width / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }
      ctx.drawImage(currentImage, drawX, drawY, drawW, drawH);
    } else {
      ctx.strokeStyle = '#1e2638';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    }

    // 3. Draw Dynamic Text
    if (text) {
      const maxTextWidth = canvas.width * 0.85;
      const maxTextHeight = canvas.height * 0.85;
      
      let currentFontSize = fontSize * (canvas.width / 500);
      const minFontSize = 12 * (canvas.width / 500);
      
      let lines: string[] = [];
      let lineHeight = currentFontSize * 1.3;
      let totalHeight = 0;

      while (currentFontSize >= minFontSize) {
        ctx.font = `bold ${currentFontSize}px 'Courier New', monospace`;
        lineHeight = currentFontSize * 1.3;
        lines = getWrappedLines(ctx, text, maxTextWidth);
        totalHeight = lines.length * lineHeight;

        if (totalHeight <= maxTextHeight) {
          break;
        }
        currentFontSize -= 2;
      }

      const pX = (posX / 100) * canvas.width;
      const pY = (posY / 100) * canvas.height;

      const halfHeight = totalHeight / 2;
      const minY = halfHeight + canvas.height * 0.05;
      const maxY = canvas.height - halfHeight - canvas.height * 0.05;
      const clampedY = Math.max(minY, Math.min(pY, maxY));

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';

      const scaleFactor = canvas.width / 500;
      ctx.shadowColor = hexToRgba(shadowColor, shadowOpacity);
      ctx.shadowBlur = shadowBlur * scaleFactor;
      ctx.shadowOffsetX = shadowOffsetX * scaleFactor;
      ctx.shadowOffsetY = shadowOffsetY * scaleFactor;

      const startY = clampedY - totalHeight / 2 + currentFontSize / 2;

      let maxLineWidth = 0;
      lines.forEach((line, index) => {
        const currentY = startY + index * lineHeight;
        ctx.fillText(line, pX, currentY);

        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
      });

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      textMetricsRef.current = {
        x: pX - maxLineWidth / 2,
        y: clampedY - totalHeight / 2,
        width: maxLineWidth,
        height: totalHeight,
      };
    }
  }, [
    text,
    posX,
    posY,
    fontSize,
    textColor,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    shadowOpacity,
    aspectRatio,
    currentImage,
  ]);

  useEffect(() => {
    if (isMounted) renderCanvas();
  }, [isMounted, renderCanvas]);

  // --- Handlers ---
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      addLog(`ERR_INVALID_FILE: '${file.name}'은(는) 지원되지 않는 형식을 포함합니다. (PNG/JPEG/WEBP 가능)`, true);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCurrentImageDataUrl(dataUrl);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCurrentImage(img);
        addLog(`SUCCESS: 이미지 '${file.name}' 정상 로드 완료 (${img.width}x${img.height})`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 텍스트 변경 이벤트 (단순화된 키 입력 로그 & 공간 초과 차단)
const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
  const newText = e.target.value;

  // 1. 글자 삭제 시
  if (newText.length < text.length) {
    setText(newText);
    addLog('INPUT_EVENT: 문자가 삭제되었습니다.');
    return;
  }

  // 2. 글자 입력 중 공간 초과 시
  if (!checkTextFit(newText, fontSize)) {
    addLog('[WARN] 입력 공간 초과 (작성 제한됨)', true);
    return; // 입력 차단
  }

  // 3. 정상 문자 추가 시
  setText(newText);
  addLog('INPUT_EVENT: 새로운 문자가 추가되었습니다.');
};

  const handleRatioChange = (w: number, h: number) => {
    setAspectRatio({ w, h });
    addLog(`GRID_CHANGED: 종횡비가 ${w}:${h}(으)로 변경되었습니다.`);
  };

  // Drag & Drop Helpers
  const getCanvasCoords = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pxX: 0, pxY: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pxX = (e.clientX - rect.left) * scaleX;
    const pxY = (e.clientY - rect.top) * scaleY;

    const percentX = Math.min(Math.max((pxX / canvas.width) * 100, 0), 100);
    const percentY = Math.min(Math.max((pxY / canvas.height) * 100, 0), 100);

    return { x: percentX, y: percentY, pxX, pxY };
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { pxX, pxY } = getCanvasCoords(e);
    const { x, y, width, height } = textMetricsRef.current;

    if (pxX >= x && pxX <= x + width && pxY >= y && pxY <= y + height) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y, pxX, pxY } = getCanvasCoords(e);
    const { x: tX, y: tY, width, height } = textMetricsRef.current;

    if (pxX >= tX && pxX <= tX + width && pxY >= tY && pxY <= tY + height) {
      canvas.style.cursor = 'move';
    } else if (!isDragging) {
      canvas.style.cursor = 'default';
    }

    if (isDragging) {
      setPosX(Math.round(x));
      setPosY(Math.round(y));
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    }
  };

  // Export Download
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          addLog('ERR_CORS: 보안 제약으로 이미지 생성에 실패했습니다.', true);
          return;
        }
        const link = document.createElement('a');
        link.download = `cyber_poster_${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        addLog('EXPORT_COMPLETE: 그래픽 출력이 완료되었습니다.');
      }, 'image/png');
    } catch (err) {
      addLog('ERR_SECURITY: 다운로드가 차단되었습니다.', true);
    }
  };

  // Template Actions
  const saveTemplate = () => {
    const name = tplName.trim();
    if (!name) return addLog('ERR_CRUD: 템플릿 명칭을 입력하십시오.', true);

    const newTpl: TemplateData = {
      id: 'TPL_' + Date.now(),
      name,
      text,
      posX,
      posY,
      fontSize,
      textColor,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      shadowOpacity,
      ratio: aspectRatio,
      imageDataUrl: currentImageDataUrl,
    };

    try {
      const updated = [...templates, newTpl];
      setTemplates(updated);
      localStorage.setItem('cyber_templates', JSON.stringify(updated));
      setTplName('');
      addLog(`DB_SAVE: 템플릿 '${name}' 동기화 완료.`);
    } catch (e) {
      addLog('ERR_STORAGE_FULL: 저장 용량 제한을 초과했습니다.', true);
    }
  };

  const loadTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;

    setText(target.text);
    setPosX(target.posX);
    setPosY(target.posY);
    setFontSize(target.fontSize);
    setTextColor(target.textColor);
    setShadowColor(target.shadowColor || '#00f3ff');
    setShadowBlur(target.shadowBlur ?? 15);
    setShadowOffsetX(target.shadowOffsetX ?? 0);
    setShadowOffsetY(target.shadowOffsetY ?? 0);
    setShadowOpacity(target.shadowOpacity ?? 100);
    setAspectRatio(target.ratio);

    if (target.imageDataUrl) {
      setCurrentImageDataUrl(target.imageDataUrl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCurrentImage(img);
        addLog(`DB_LOAD: '${target.name}' 및 이미지 복원 성공.`);
      };
      img.src = target.imageDataUrl;
    } else {
      setCurrentImage(null);
      setCurrentImageDataUrl(null);
      addLog(`DB_LOAD: '${target.name}' 불러오기 완료 (배경 이미지 없음).`);
    }
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('cyber_templates', JSON.stringify(updated));
    addLog('DB_DELETE: 템플릿 항목을 삭제했습니다.');
  };

  // JSON Import & Export
  const exportJSON = () => {
    const data = {
      text,
      posX,
      posY,
      fontSize,
      textColor,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      shadowOpacity,
      ratio: aspectRatio,
      imageDataUrl: currentImageDataUrl,
    };
    setJsonString(JSON.stringify(data, null, 2));
    addLog('JSON_EXPORT: 시스템 백업 스트링이 생성되었습니다.');
  };

  const importJSON = () => {
    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed.text || parsed.posX === undefined || !parsed.ratio) {
        throw new Error('MISSING_KEYS');
      }

      setText(parsed.text);
      setPosX(parsed.posX);
      setPosY(parsed.posY);
      setFontSize(parsed.fontSize);
      setTextColor(parsed.textColor);
      setShadowColor(parsed.shadowColor || '#00f3ff');
      setShadowBlur(parsed.shadowBlur ?? 15);
      setShadowOffsetX(parsed.shadowOffsetX ?? 0);
      setShadowOffsetY(parsed.shadowOffsetY ?? 0);
      setShadowOpacity(parsed.shadowOpacity ?? 100);
      setAspectRatio(parsed.ratio);

      if (parsed.imageDataUrl) {
        setCurrentImageDataUrl(parsed.imageDataUrl);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setCurrentImage(img);
          addLog('JSON_IMPORT: 데이터 및 배경 구조가 정상적으로 복원되었습니다.');
        };
        img.src = parsed.imageDataUrl;
      } else {
        setCurrentImage(null);
        setCurrentImageDataUrl(null);
        addLog('JSON_IMPORT: 설정을 복원하였습니다 (이미지 없음).');
      }
    } catch (err) {
      addLog('ERR_JSON_RESTORE: 구조가 유효하지 않은 JSON 문자열입니다.', true);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="cyber-dock-root">
      <style>{`
        .cyber-dock-root {
          background-color: #0b0e14;
          color: #a6b0c3;
          padding: 20px;
          font-family: 'Courier New', monospace;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .cyber-dock-header {
          border-bottom: 2px solid #00f3ff;
          padding-bottom: 10px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cyber-dock-header h1 {
          color: #00f3ff;
          margin: 0;
          font-size: 1.2rem;
          letter-spacing: 1px;
        }
        .status-tag {
          border: 1px solid #00f3ff;
          color: #00f3ff;
          padding: 2px 8px;
          font-size: 0.75rem;
          background: rgba(0, 243, 255, 0.1);
        }
        .cyber-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .cyber-container { grid-template-columns: 1fr; }
        }
        .cyber-panel {
          background: #111622;
          border: 1px solid #1e2638;
          padding: 16px;
          border-radius: 4px;
        }
        .full-width { grid-column: 1 / -1; }
        .panel-title {
          color: #fff;
          border-left: 3px solid #00f3ff;
          padding-left: 8px;
          margin-bottom: 16px;
          font-weight: bold;
          font-size: 0.95rem;
        }
        .section-subtitle {
          color: #00f3ff;
          font-size: 0.8rem;
          margin: 16px 0 8px 0;
          border-bottom: 1px dashed #1e2638;
          padding-bottom: 4px;
        }
        .control-group {
          margin-bottom: 12px;
        }
        .control-group label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 4px;
          color: #8a99ad;
        }
        .control-group label span { color: #00f3ff; }
        .control-group input[type="text"],
        .control-group textarea {
          width: 100%;
          background: #08090c;
          border: 1px solid #1e2638;
          color: #00f3ff;
          padding: 8px;
          box-sizing: border-box;
          font-family: inherit;
          border-radius: 2px;
        }
        .control-group input[type="range"] {
          width: 100%;
          accent-color: #00f3ff;
        }
        .control-group input[type="color"] {
          width: 100%;
          height: 32px;
          border: 1px solid #1e2638;
          background: #08090c;
          cursor: pointer;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ratio-btns {
          display: flex;
          gap: 8px;
        }
        .ratio-btns .cyber-btn { flex: 1; }
        .cyber-btn {
          background: #1a2332;
          color: #00f3ff;
          border: 1px solid #00f3ff;
          padding: 6px 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        .cyber-btn:hover {
          background: #00f3ff;
          color: #08090c;
        }
        .cyber-btn-danger {
          border-color: #ff0055;
          color: #ff0055;
        }
        .cyber-btn-danger:hover {
          background: #ff0055;
          color: #fff;
        }
        .preview-container {
          background: #08090c;
          padding: 12px;
          text-align: center;
          margin-bottom: 12px;
          border: 1px solid #1e2638;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .cyber-canvas {
          max-width: 100%;
          max-height: 380px;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.1);
        }
        .terminal-log {
          background: #050608;
          border: 1px solid #1e2638;
          padding: 8px;
          height: 110px;
          overflow-y: auto;
          font-size: 0.75rem;
          color: #00ff66;
        }
        .terminal-log .log-err { color: #ff0055; }
        .template-list {
          max-height: 120px;
          overflow-y: auto;
          border: 1px solid #1e2638;
          background: #08090c;
          padding: 4px;
        }
        .template-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          border-bottom: 1px solid #111622;
          font-size: 0.8rem;
        }
      `}</style>

      <header className="cyber-dock-header">
        <h1>SYSTEM // CYBER_DOCK_v3.20</h1>
        <span className="status-tag">SYSTEM_READY</span>
      </header>

      <div className="cyber-container">
        {/* Panel 1: Data Control */}
        <section className="cyber-panel">
          <div className="panel-title">1. 데이터 입력 &amp; 제어</div>

          <div className="control-group">
            <label>이미지 로드 (PNG, JPEG, WEBP)</label>
            <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} style={{ color: '#fff' }} />
          </div>

          <div className="control-group">
            <label>해킹/수배 문구 (한글 지원)</label>
            <input type="text" value={text} onChange={handleTextChange} />
          </div>

          <div className="grid-2">
            <div className="control-group">
              <label>X 좌표 <span>{posX}%</span></label>
              <input type="range" min="0" max="100" value={posX} onChange={(e) => setPosX(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Y 좌표 <span>{posY}%</span></label>
              <input type="range" min="0" max="100" value={posY} onChange={(e) => setPosY(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid-2">
            <div className="control-group">
              <label>폰트 크기 <span>{fontSize}</span></label>
              <input type="range" min="12" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>텍스트 색상</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>

          <div className="section-subtitle">텍스트 그림자 / 네온 이펙트 조절</div>

          <div className="grid-2">
            <div className="control-group">
              <label>그림자 색상</label>
              <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} />
            </div>
            <div className="control-group">
              <label>발광/번짐(Blur) <span>{shadowBlur}</span></label>
              <input type="range" min="0" max="50" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid-2">
            <div className="control-group">
              <label>X 위치(Offset) <span>{shadowOffsetX}</span></label>
              <input type="range" min="-30" max="30" value={shadowOffsetX} onChange={(e) => setShadowOffsetX(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Y 위치(Offset) <span>{shadowOffsetY}</span></label>
              <input type="range" min="-30" max="30" value={shadowOffsetY} onChange={(e) => setShadowOffsetY(Number(e.target.value))} />
            </div>
          </div>

          <div className="control-group">
            <label>그림자 투명도 <span>{shadowOpacity}%</span></label>
            <input type="range" min="0" max="100" value={shadowOpacity} onChange={(e) => setShadowOpacity(Number(e.target.value))} />
          </div>

          <div className="control-group">
            <label>출력 규격 (화면비)</label>
            <div className="ratio-btns">
              <button className="cyber-btn" onClick={() => handleRatioChange(1, 1)}>1:1</button>
              <button className="cyber-btn" onClick={() => handleRatioChange(4, 5)}>4:5</button>
              <button className="cyber-btn" onClick={() => handleRatioChange(9, 16)}>9:16</button>
            </div>
          </div>

          <button className="cyber-btn" onClick={downloadImage} style={{ padding: '10px', marginTop: '10px', width: '100%' }}>
            💾 완성 이미지 다운로드
          </button>
        </section>

        {/* Panel 2: Live Canvas Preview */}
        <section className="cyber-panel">
          <div className="panel-title">2. 실시간 홀로그램 미리보기 (글씨 드래그 가능)</div>

          <div className="preview-container">
            <canvas
              ref={canvasRef}
              className="cyber-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Terminal Notifications */}
          <div className="terminal-log" ref={logContainerRef}>
            {logs.map((log) => (
              <div key={log.id} className={log.isError ? 'log-err' : ''}>
                <span>[{log.time}]</span> {log.msg}
              </div>
            ))}
          </div>
        </section>

        {/* Panel 3 & 4: Template CRUD & JSON Sync */}
        <section className="cyber-panel full-width grid-2">
          <div>
            <div className="panel-title">3. 템플릿 데이터베이스 (CRUD)</div>
            <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
              <input
                type="text"
                placeholder="템플릿 이름 입력"
                style={{ flex: 1 }}
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
              />
              <button className="cyber-btn" onClick={saveTemplate}>저장</button>
            </div>
            <div className="template-list">
              {templates.length === 0 ? (
                <div style={{ padding: '8px', fontSize: '0.75rem', color: '#55657e' }}>저장된 템플릿이 없습니다.</div>
              ) : (
                templates.map((t) => (
                  <div key={t.id} className="template-item">
                    <span>{t.name} ({t.ratio.w}:{t.ratio.h})</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="cyber-btn" onClick={() => loadTemplate(t.id)}>로드</button>
                      <button className="cyber-btn cyber-btn-danger" onClick={() => deleteTemplate(t.id)}>삭제</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="panel-title">4. JSON 이식 &amp; 복원</div>
            <div className="control-group" style={{ marginTop: '10px' }}>
              <textarea
                rows={3}
                placeholder="JSON 데이터를 붙여넣거나 내보내세요."
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <button className="cyber-btn" style={{ flex: 1 }} onClick={exportJSON}>JSON 내보내기</button>
                <button className="cyber-btn" style={{ flex: 1 }} onClick={importJSON}>JSON 불러오기</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CyberDock;