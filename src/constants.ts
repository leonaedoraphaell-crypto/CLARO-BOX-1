import { EquipmentCategory } from './types';

export const CATEGORIES = [
  EquipmentCategory.BOX,
  EquipmentCategory.BOX_SOUND,
  EquipmentCategory.CONTROLE,
  EquipmentCategory.CAMERA,
  EquipmentCategory.CHIP
];

export interface HolidayEvent {
  name: string;
  icon: string;
  color: string;
  type: 'holiday' | 'event';
  description: string;
}

export const HOLIDAYS_SP: Record<string, HolidayEvent[]> = {
  "01-01": [{ name: "Ano Novo", icon: "🎆", color: "bg-orange-500", type: "holiday", description: "Confraternização Universal" }],
  "25-01": [{ name: "Aniversário de SP", icon: "🏙️", color: "bg-blue-500", type: "holiday", description: "Fundação da cidade de São Paulo" }],
  "30-01": [{ name: "Dia do Quadrinho Nacional", icon: "🎨", color: "bg-purple-500", type: "event", description: "Homenagem à arte sequencial brasileira" }],
  "08-03": [{ name: "Dia da Mulher", icon: "🌹", color: "bg-pink-500", type: "event", description: "Dia Internacional da Mulher" }],
  "19-04": [{ name: "Dia dos Povos Indígenas", icon: "🏹", color: "bg-amber-600", type: "event", description: "Homenagem à cultura indígena" }],
  "21-04": [{ name: "Tiradentes", icon: "⚖️", color: "bg-slate-600", type: "holiday", description: "Inconfidência Mineira" }],
  "01-05": [{ name: "Dia do Trabalho", icon: "🛠️", color: "bg-red-500", type: "holiday", description: "Homenagem aos trabalhadores" }],
  "12-05": [{ name: "Dia da Enfermagem", icon: "🩺", color: "bg-cyan-500", type: "event", description: "Homenagem aos enfermeiros" }],
  "13-05": [{ name: "Abolição da Escravidão", icon: "⛓️", color: "bg-amber-700", type: "event", description: "Assinatura da Lei Áurea" }],
  "12-06": [{ name: "Dia dos Namorados", icon: "❤️", color: "bg-red-400", type: "event", description: "Dia de São Valentim no Brasil" }],
  "24-06": [{ name: "Dia de São João", icon: "🔥", color: "bg-orange-600", type: "event", description: "Festa Junina" }],
  "09-07": [{ name: "Rev. Constitucionalista", icon: "⚔️", color: "bg-slate-700", type: "holiday", description: "Movimento armado de 1932" }],
  "26-07": [{ name: "Dia dos Avós", icon: "👵", color: "bg-stone-400", type: "event", description: "Homenagem aos avós" }],
  "11-08": [{ name: "Dia do Estudante", icon: "📚", color: "bg-indigo-500", type: "event", description: "Homenagem aos estudantes" }],
  "07-09": [{ name: "Independência", icon: "🇧🇷", color: "bg-green-600", type: "holiday", description: "Independência do Brasil" }],
  "12-10": [
    { name: "Nossa Sra. Aparecida", icon: "⛪", color: "bg-blue-600", type: "holiday", description: "Padroeira do Brasil" },
    { name: "Dia das Crianças", icon: "🧸", color: "bg-pink-400", type: "event", description: "Homenagem à infância" }
  ],
  "15-10": [{ name: "Dia do Professor", icon: "🍎", color: "bg-lime-600", type: "event", description: "Homenagem aos educadores" }],
  "18-10": [{ name: "Dia do Médico", icon: "🏥", color: "bg-emerald-500", type: "event", description: "Homenagem aos médicos" }],
  "25-10": [{ name: "Dia do Sapateiro", icon: "👞", color: "bg-amber-900", type: "event", description: "Homenagem aos sapateiros" }],
  "28-10": [{ name: "Dia do Servidor Público", icon: "🏢", color: "bg-slate-400", type: "event", description: "Homenagem aos funcionários públicos" }],
  "31-10": [
    { name: "Dia do Açougueiro", icon: "🥩", color: "bg-red-700", type: "event", description: "Homenagem aos açougueiros" },
    { name: "Halloween", icon: "🎃", color: "bg-orange-700", type: "event", description: "Dia das Bruxas" }
  ],
  "02-11": [{ name: "Finados", icon: "🕯️", color: "bg-slate-500", type: "holiday", description: "Dia de memória aos falecidos" }],
  "15-11": [{ name: "Proclamação da República", icon: "🏛️", color: "bg-emerald-600", type: "holiday", description: "Início do regime republicano" }],
  "20-11": [{ name: "Consciência Negra", icon: "✊🏾", color: "bg-amber-800", type: "holiday", description: "Dia de Zumbi dos Palmares" }],
  "08-12": [{ name: "Dia da Justiça", icon: "⚖️", color: "bg-blue-700", type: "event", description: "Homenagem ao Poder Judiciário" }],
  "25-12": [{ name: "Natal", icon: "🎄", color: "bg-red-600", type: "holiday", description: "Nascimento de Jesus" }]
};
