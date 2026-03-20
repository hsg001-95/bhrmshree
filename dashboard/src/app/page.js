'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BhrmshreeDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const socket_io_client_1 = require("socket.io-client");
function BhrmshreeDashboard() {
    const [phase, setPhase] = (0, react_1.useState)('IDLE');
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [findings, setFindings] = (0, react_1.useState)([]);
    const [screenshot, setScreenshot] = (0, react_1.useState)(null);
    const [targetUrl, setTargetUrl] = (0, react_1.useState)('');
    const [discoveredCount, setDiscoveredCount] = (0, react_1.useState)(0);
    const terminalEndRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // Connect to the Bhrmshree Engine
        const socket = (0, socket_io_client_1.io)();
        socket.on('update', (data) => {
            if (data.phase)
                setPhase(data.phase);
            if (data.log) {
                setLogs(prev => [...prev, { ...data.log, time: new Date().toLocaleTimeString() }].slice(-50));
            }
            if (data.finding) {
                setFindings(prev => [data.finding, ...prev]);
            }
            if (data.screenshot) {
                setScreenshot(data.screenshot);
            }
            if (data.discoveredCount) {
                setDiscoveredCount(data.discoveredCount);
            }
        });
        return () => { socket.disconnect(); };
    }, []);
    (0, react_1.useEffect)(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);
    const startScan = async () => {
        if (!targetUrl)
            return;
        setLogs([{ msg: `🚀 Initializing Bhrmshree Engine for ${targetUrl}`, type: 'info', time: new Date().toLocaleTimeString() }]);
        setPhase('DISCOVERY');
        // Actual API call to engine
        await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUrl, id: `scan-${Date.now()}` })
        });
    };
    return ((0, jsx_runtime_1.jsxs)("main", { className: "flex h-screen bg-black text-gray-100 overflow-hidden font-sans", children: [(0, jsx_runtime_1.jsxs)("div", { className: "w-64 border-r border-gray-800 bg-zinc-950 p-6 flex flex-col gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 text-red-500 mb-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { size: 32 }), (0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold tracking-tighter", children: "Bhrmshree" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900/50 p-4 rounded-lg border border-gray-800", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs uppercase text-gray-500 font-semibold mb-1", children: "Current Phase" }), (0, jsx_runtime_1.jsxs)("p", { className: `text-sm font-bold flex items-center gap-2 ${phase === 'IDLE' ? 'text-gray-400' : 'text-blue-400'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { size: 14 }), " ", phase] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900/50 p-4 rounded-lg border border-gray-800", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs uppercase text-gray-500 font-semibold mb-1", children: "Discovered Routes" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-green-500", children: discoveredCount })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-zinc-900/50 p-4 rounded-lg border border-gray-800", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs uppercase text-gray-500 font-semibold mb-1", children: "Total Vulnerabilities" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold text-red-500", children: findings.length })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-auto", children: (0, jsx_runtime_1.jsxs)("button", { className: "w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-bold transition-all flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 16 }), " STOP ALL AGENTS"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "h-16 border-b border-gray-800 bg-zinc-950 flex items-center px-8 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", size: 18 }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Enter Target URL (e.g., https://example.com)", className: "w-full bg-zinc-900 border border-gray-800 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-red-500 transition-colors text-sm", value: targetUrl, onChange: (e) => setTargetUrl(e.target.value) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: startScan, className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold transition-all text-sm", children: "START SCAN" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "col-span-8 flex flex-col gap-6 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 bg-zinc-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-2xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-8 bg-zinc-900 border-b border-gray-800 flex items-center px-4 gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 14, className: "text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-mono text-gray-400 uppercase tracking-widest", children: "Live AI Browser Stream" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 bg-zinc-900 flex items-center justify-center relative", children: screenshot ? ((0, jsx_runtime_1.jsx)("img", { src: screenshot, alt: "AI View", className: "max-h-full max-w-full object-contain" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Globe, { size: 48, className: "text-zinc-800 mx-auto mb-4 animate-pulse" }), (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-600 font-mono text-sm", children: "Awaiting connection from Explorer Agent..." })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "h-64 bg-zinc-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-2xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-8 bg-zinc-900 border-b border-gray-800 flex items-center px-4 gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Terminal, { size: 14, className: "text-red-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-mono text-gray-400 uppercase tracking-widest", children: "Bhrmshree Kill-Chain Logs" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 p-4 font-mono text-xs overflow-y-auto terminal-scroll", children: [logs.map((log, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "mb-1 flex gap-3", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-zinc-600", children: ["[", log.time, "]"] }), (0, jsx_runtime_1.jsxs)("span", { className: log.type === 'qa' ? 'text-green-400' :
                                                                    log.type === 'sec' ? 'text-red-400' : 'text-blue-400', children: [log.type.toUpperCase(), ":"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-zinc-300", children: log.msg })] }, i))), (0, jsx_runtime_1.jsx)("div", { ref: terminalEndRef })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "col-span-4 flex flex-col bg-zinc-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-12 bg-zinc-900 border-b border-gray-800 flex items-center px-6 justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 18, className: "text-red-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-bold uppercase tracking-widest", children: "Critical Findings" })] }), (0, jsx_runtime_1.jsx)("span", { className: "bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold", children: "LIVE" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: findings.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col items-center justify-center text-zinc-700", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 40, className: "mb-4 opacity-20" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm italic", children: "No threats detected yet..." })] })) : (findings.map((f, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-4 rounded-lg border bg-zinc-900/50 transition-all ${f.severity === 'CRITICAL' ? 'border-red-900 glow-red' : 'border-gray-800'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsx)("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded ${f.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'}`, children: f.severity }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] text-zinc-500 uppercase", children: f.type })] }), (0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-bold text-zinc-100", children: f.title })] }, i)))) })] })] })] })] }));
}
//# sourceMappingURL=page.js.map