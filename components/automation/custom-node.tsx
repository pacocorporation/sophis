'use client';

import React, { useMemo } from 'react';
import { 
  Handle, 
  Position, 
  NodeProps, 
  Node,
  HandleProps
} from '@xyflow/react';
import { 
  MessageSquare, 
  Split, 
  Clock, 
  Zap, 
  Webhook, 
  Code2, 
  UserRound, 
  Timer, 
  XOctagon, 
  PlayCircle,
  GripVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

const nodeIcons: Record<string, React.ReactNode> = {
  start: <PlayCircle className="w-5 h-5 text-green-500" />,
  message: <MessageSquare className="w-5 h-5 text-blue-500" />,
  condition: <Split className="w-5 h-5 text-orange-500" />,
  schedule: <Clock className="w-5 h-5 text-purple-500" />,
  ai_nanda: <Zap className="w-5 h-5 text-brand-blue" />,
  webhook: <Webhook className="w-5 h-5 text-slate-500" />,
  code: <Code2 className="w-5 h-5 text-indigo-500" />,
  transfer: <UserRound className="w-5 h-5 text-brand-red" />,
  delay: <Timer className="w-5 h-5 text-yellow-600" />,
  end: <XOctagon className="w-5 h-5 text-slate-400" />,
};

const nodeTitles: Record<string, string> = {
  start: 'Início',
  message: 'Enviar Mensagem',
  condition: 'Condição (If/Else)',
  schedule: 'Tabela de Horários',
  ai_nanda: 'IA Nanda',
  webhook: 'Webhook',
  code: 'Código JS',
  transfer: 'Transferir',
  delay: 'Aguardar',
  end: 'Encerrar',
};

const BaseNode = ({ data, selected, dragging, type }: NodeProps & { type: string }) => {
  const nodeData = data as any;
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -2 }}
      className={`min-w-[240px] bg-white rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing ${
        dragging 
          ? 'shadow-2xl opacity-90 scale-[1.02] z-50 ' + (type === 'condition' ? 'border-orange-400 ring-4 ring-orange-400/10' : 'border-brand-blue ring-4 ring-brand-blue/10') 
          : 'shadow-sm'
      } ${
        selected ? 'border-brand-blue ring-4 ring-brand-blue/10' : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      <div className="p-4 border-b border-slate-50 flex items-center gap-3 relative group/node">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/node:opacity-100 transition-opacity bg-slate-50 p-1 rounded-md border border-slate-100 shadow-sm">
          <GripVertical className="w-3 h-3 text-slate-400" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {nodeIcons[type] || <Zap className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{nodeTitles[type]}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {nodeData.label}</p>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50/30 space-y-2">
        {type === 'message' && nodeData.images && nodeData.images.length > 0 && (
          <div className="flex gap-1 overflow-hidden rounded-lg">
            {nodeData.images.slice(0, 2).map((img: string, idx: number) => (
              <div key={idx} className="relative flex-1 aspect-square bg-slate-200">
                <Image src={img} alt="Preview" fill className="w-full h-full object-cover" referrerPolicy="no-referrer" unoptimized />
                {idx === 1 && nodeData.images.length > 2 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white">
                    +{nodeData.images.length - 2}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
          {type === 'message' && nodeData.message ? (
            <span className="line-clamp-2 text-slate-700 font-normal not-italic">&quot;{nodeData.message}&quot;</span>
          ) : type === 'delay' && nodeData.seconds ? (
            <span>Aguardar {nodeData.seconds} segundos</span>
          ) : type === 'webhook' && nodeData.url ? (
            <span className="truncate block">POST: {nodeData.url}</span>
          ) : (
            nodeData.description || 'Configurações do bloco...'
          )}
        </div>
      </div>

      {type !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-slate-300 border-2 border-white !left-[-7px]"
        />
      )}
      
      {type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 bg-green-400 border-2 border-white !top-1/3 !right-[-7px]"
          />
          <div className="absolute right-2 top-1/3 -translate-y-1/2 text-[9px] font-bold text-green-500 uppercase tracking-tighter">Sim</div>
          
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-3 h-3 bg-red-400 border-2 border-white !top-2/3 !right-[-7px]"
          />
          <div className="absolute right-2 top-2/3 -translate-y-1/2 text-[9px] font-bold text-red-500 uppercase tracking-tighter">Não</div>
        </>
      ) : type !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-brand-blue border-2 border-white !right-[-7px]"
        />
      )}
    </motion.div>
  );
};

export const CustomNode = (props: NodeProps) => <BaseNode {...props} type={props.type as string} />;
