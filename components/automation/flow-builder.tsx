'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
  BackgroundVariant,
  OnConnect
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, 
  Save, 
  Play, 
  X, 
  MessageSquare, 
  Split, 
  Clock, 
  Zap, 
  Webhook, 
  Code2, 
  UserRound, 
  Timer, 
  XOctagon, 
  MousePointer2,
  Terminal,
  Trash2,
  Settings,
  GripVertical,
  Copy,
  Image as ImageIcon,
  MousePointer,
  Search,
  Layers,
  Database,
  History,
  Info,
  Maximize2,
  Minus
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { CustomNode } from './custom-node';
import { motion, AnimatePresence } from 'motion/react';
import { FlowEngine } from '@/lib/automation-engine';
import Image from 'next/image';

const initialNodes: Node[] = [
  {
    id: 'start_1',
    type: 'start',
    position: { x: 50, y: 150 },
    data: { label: 'Início do Fluxo', description: 'Gatilho de entrada via Chat' },
  },
];

const nodeTypes = {
  start: CustomNode,
  message: CustomNode,
  condition: CustomNode,
  schedule: CustomNode,
  ai_nanda: CustomNode,
  webhook: CustomNode,
  code: CustomNode,
  transfer: CustomNode,
  delay: CustomNode,
  end: CustomNode,
};

const blockTypes = [
  { type: 'message', icon: <MessageSquare className="w-4 h-4" />, label: 'Enviar Mensagem', desc: 'Enviar texto ou media' },
  { type: 'condition', icon: <Split className="w-4 h-4" />, label: 'Condição', desc: 'Fluxo lógico (If/Else)' },
  { type: 'ai_nanda', icon: <Zap className="w-4 h-4" />, label: 'IA Nanda', desc: 'Processamento inteligente' },
  { type: 'schedule', icon: <Clock className="w-4 h-4" />, label: 'Horários', desc: 'Verificar disponibilidade' },
  { type: 'webhook', icon: <Webhook className="w-4 h-4" />, label: 'Webhook', desc: 'Integração externa' },
  { type: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Código JS', desc: 'Script personalizado' },
  { type: 'transfer', icon: <UserRound className="w-4 h-4" />, label: 'Transferir', desc: 'Para humano no CRM' },
  { type: 'delay', icon: <Timer className="w-4 h-4" />, label: 'Delay', desc: 'Aguardar tempo' },
  { type: 'end', icon: <XOctagon className="w-4 h-4" />, label: 'Encerrar', desc: 'Finalizar atendimento' },
];

interface FlowBuilderProps {
  onClose: () => void;
  onSave: (flow: any) => void;
  initialData?: any;
}

function FlowBuilderContent({ onClose, onSave, initialData }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.data?.nodes || initialData?.nodes || initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.data?.edges || initialData?.edges || []
  );
  const [flowName, setFlowName] = useState(initialData?.name || 'Untitled Flow');
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'logs'>('blocks');
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = (type: string) => {
    const id = `${type}_${nodes.length + 1}`;
    const newNode: Node = {
      id,
      type,
      position: { x: (nodes.length * 100) % 500 + 400, y: 150 + (nodes.length * 50) % 300 },
      data: { 
        label: id, 
        description: type === 'ai_nanda' ? 'Análise automática da Nanda' : `Configuração do bloco ${type}`,
        message: type === 'message' ? 'Olá! Como posso ajudar?' : '',
        images: [],
        seconds: type === 'delay' ? 3 : 0,
        url: type === 'webhook' ? 'https://api.maxcloud.com.br/webhook' : '',
        code: type === 'code' ? '// Initializing...\nconst data = context.lastMessage;\nreturn true;' : ''
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    onSave({ name: flowName, nodes, edges });
  };

  const handleCopy = () => {
    onSave({ name: `${flowName} (Copy)`, nodes, edges });
  };

  const handleTestFlow = async () => {
    setIsRunning(true);
    setExecutionLogs([]);
    setActiveTab('logs');
    
    try {
      const engine = new FlowEngine(
        { nodes: nodes as any, edges: edges as any }, 
        { userPhone: '5511988776655', lastMessage: 'Queria ver o preço de um paracetamol e se precisa de receita' }
      );
      
      // Update logs in real-timeish
      const runner = engine.run();
      const logInterval = setInterval(() => {
        setExecutionLogs([...engine.getLogs()]);
      }, 500);

      await runner;
      clearInterval(logInterval);
      setExecutionLogs([...engine.getLogs()]);
    } catch (error: any) {
      setExecutionLogs(prev => [...prev, `[ERRO] ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    setActiveTab('settings');
  };

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...newData } });
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    setActiveTab('blocks');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedNode) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const currentImages = (selectedNode.data.images as string[]) || [];
        updateNodeData({ images: [...currentImages, imageUrl] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    if (selectedNode) {
      const currentImages = (selectedNode.data.images as string[]) || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      updateNodeData({ images: newImages });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-[32px] overflow-hidden shadow-2xl">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:block">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-slate-800">Visual Flow Builder</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-widest">v2.0 Beta</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor de Automação & IA</p>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-100 hidden lg:block" />

            <div className="flex flex-col">
              <label htmlFor="flow-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Flow Name</label>
              <input 
                id="flow-name"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Ex: WhatsApp Lead Nurturing"
                className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all w-64"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={isRunning}
            onClick={handleTestFlow}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:shadow-lg disabled:opacity-50 transition-all group"
          >
            {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Play className="w-4 h-4 fill-white group-hover:scale-110" />}
            Testar Fluxo
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Salvar Fluxo
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all"
          >
            <Copy className="w-4 h-4" /> Duplicar
          </button>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-100 flex flex-col z-10 shadow-xl shadow-slate-200/20">
          <div className="p-6 border-b border-slate-50">
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'blocks' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'
                }`}
              >
                <Plus className="w-3 h-3" /> Blocos
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'settings' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'
                }`}
              >
                <Settings className="w-3 h-3" /> Config
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'logs' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-400'
                }`}
              >
                <Terminal className="w-3 h-3" /> Logs
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'blocks' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-4"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Arrastar ou Clicar</p>
                  <div className="grid grid-cols-1 gap-3">
                    {blockTypes.map((block) => (
                      <button
                        key={block.type}
                        onClick={() => onAddNode(block.type)}
                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-md rounded-2xl text-left transition-all group cursor-grab active:scale-[0.98] active:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors" />
                          <div className="w-10 h-10 bg-white group-hover:bg-blue-50 text-slate-400 group-hover:text-brand-blue rounded-xl flex items-center justify-center border border-slate-100 transition-all">
                            {block.icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{block.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{block.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  {selectedNode ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuração do Bloco</p>
                        <button onClick={deleteNode} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Título</label>
                          <input 
                            value={selectedNode.data.label as string}
                            onChange={(e) => updateNodeData({ label: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Descrição</label>
                          <textarea 
                            value={selectedNode.data.description as string}
                            onChange={(e) => updateNodeData({ description: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium h-24 resize-none"
                          />
                        </div>

                        {selectedNode.type === 'message' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <MessageSquare className="w-3 h-3 text-blue-500" /> Corpo da Mensagem
                              </label>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">WhatsApp</span>
                            </div>
                            <div className="relative group/msg">
                              <textarea 
                                value={selectedNode.data.message as string}
                                onChange={(e) => updateNodeData({ message: e.target.value })}
                                placeholder="Digite sua mensagem aqui..."
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium h-48 resize-none transition-all focus:bg-white shadow-inner"
                              />
                              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-400">
                                {(selectedNode.data.message as string || '').length} caracteres
                              </div>
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                              <p className="text-[10px] text-blue-600 font-medium">Use <code className="bg-blue-100 px-1 rounded">{"{{nome}}"}</code> para personalizar com o nome do lead.</p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700">Anexar Imagens</label>
                                <label className="cursor-pointer p-1.5 bg-blue-50 text-brand-blue rounded-lg hover:bg-blue-100 transition-all">
                                  <Plus className="w-3 h-3" />
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {(selectedNode.data.images as string[] || []).map((img, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-slate-100">
                                    <Image src={img} alt="Attachment" fill className="object-cover" referrerPolicy="no-referrer" />
                                    <button 
                                      onClick={() => removeImage(idx)}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                                {(selectedNode.data.images as string[] || []).length === 0 && (
                                  <div className="col-span-3 border-2 border-dashed border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-slate-300">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nenhuma imagem</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedNode.type === 'delay' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Tempo de Espera (segundos)</label>
                            <input 
                              type="number"
                              value={selectedNode.data.seconds as number}
                              onChange={(e) => updateNodeData({ seconds: parseInt(e.target.value) })}
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                            />
                          </div>
                        )}

                        {selectedNode.type === 'webhook' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">URL do Webhook</label>
                            <input 
                              value={selectedNode.data.url as string}
                              onChange={(e) => updateNodeData({ url: e.target.value })}
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                            />
                          </div>
                        )}

                        {selectedNode.type === 'code' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700">Script JavaScript</label>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Node.js ES6+</span>
                            </div>
                            <div className="relative group/code border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                              <Editor
                                value={selectedNode.data.code as string}
                                onValueChange={(code) => updateNodeData({ code })}
                                highlight={(code) => highlight(code, languages.js, 'javascript')}
                                padding={16}
                                className="font-mono text-[11px] h-64 overflow-y-auto no-scrollbar focus-within:ring-2 focus-within:ring-brand-blue outline-none"
                                textareaClassName="focus:outline-none"
                                style={{
                                  fontFamily: '"Fira code", "Fira Mono", monospace',
                                  fontSize: 11,
                                  minHeight: '256px',
                                  backgroundColor: 'transparent',
                                  color: '#4ade80', // green-400
                                }}
                              />
                              <div className="absolute right-3 top-3 opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none">
                                <Code2 className="w-4 h-4 text-slate-700" />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic mt-1">Dica: Use `context` para acessar dados do fluxo e `return` para passar dados ao próximo bloco.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <MousePointer2 className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Selecione um bloco para configurar</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 h-full flex flex-col"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">Console de Execução</p>
                  <div className="flex-1 bg-slate-900 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto space-y-2 text-green-400 shadow-inner border border-slate-800">
                    {executionLogs.length === 0 ? (
                      <p className="text-slate-600 italic">Aguardando execução...</p>
                    ) : (
                      executionLogs.map((log, i) => (
                        <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                          <span className="text-slate-600 shrink-0 select-none">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))
                    )}
                  </div>
                  {isRunning && (
                    <div className="mt-4 flex items-center gap-2 text-brand-blue text-[10px] font-bold uppercase animate-pulse">
                      <div className="w-2 h-2 bg-brand-blue rounded-full" />
                      Processando Node atual...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#f8fafc]/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background color="#cbd5e1" variant={BackgroundVariant.Dots} gap={20} />
            
            <Panel position="top-center" className="bg-[#1e293b] p-1 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-1 m-6 scale-90 origin-top">
              <div className="flex items-center px-2 py-1 gap-1 border-r border-slate-700 mr-1">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Selecionar">
                  <MousePointer className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Buscar">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 px-1">
                {blockTypes.slice(0, 7).map((block) => (
                  <button 
                    key={block.type}
                    onClick={() => onAddNode(block.type)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center gap-1"
                    title={`Adicionar ${block.label}`}
                  >
                    {block.icon}
                  </button>
                ))}
              </div>

              <div className="flex items-center px-2 py-1 gap-1 border-l border-slate-700 ml-1">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Layers">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Database">
                  <Database className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center px-2 py-1 gap-1 border-l border-slate-700">
                <button className="p-2 text-orange-400 hover:text-orange-300 hover:bg-slate-800 rounded-xl transition-all" title="Ajuda">
                  <Info className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Histórico">
                  <History className="w-4 h-4" />
                </button>
              </div>
            </Panel>

            <Controls className="!bg-white !rounded-xl !border-none !shadow-xl !m-6" />
            <MiniMap 
              nodeStrokeColor={(n) => {
                if (n.type === 'start') return '#22c55e';
                if (n.type === 'end') return '#94a3b8';
                return '#3b82f6';
              }}
              nodeColor={(n) => '#f8fafc'}
              className="!bg-white !rounded-3xl !border-slate-100 !shadow-2xl overflow-hidden !m-6"
              maskColor="rgb(248, 250, 252, 0.7)"
            />
            
            <Panel position="top-right" className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg flex items-center gap-4 m-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Mock Engine Ready</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent {...props} />
    </ReactFlowProvider>
  );
}
