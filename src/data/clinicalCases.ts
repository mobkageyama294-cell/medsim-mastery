export interface ClinicalCase {
  id: string;
  title: string;
  organ: string;
  specialty: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  chiefComplaint: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  vitalSigns: {
    pa: string;
    fc: number;
    sao2: number;
    temp: number;
    fr: number;
  };
  history: string;
  physicalExam: Record<string, string>;
  labResults: Record<string, string>;
  correctDiagnosis: string;
  differentialDiagnoses: string[];
  unnecessaryExams: string[];
  patientPersonality: string;
  personalityTraits?: string;
  colloquialDiagnosis?: string[];
}

type RawClinicalCase = Partial<ClinicalCase> & {
  description?: string;
  vitalSigns?: Partial<ClinicalCase['vitalSigns']>;
  baseVitals?: {
    bp?: string;
    hr?: number;
    ox?: number;
  };
};

const CASES_URL = '/cases.json';

function parseDescription(description: string) {
  const normalized = description.trim();
  const [header = '', ...rest] = normalized.split('.').map((part) => part.trim()).filter(Boolean);
  const patientMatch = header.match(/^([^,]+),\s*(\d+)a/i);

  return {
    patientName: patientMatch?.[1]?.trim() || 'Paciente',
    patientAge: patientMatch ? Number(patientMatch[2]) : 0,
    chiefComplaint: rest.join('. ').trim() || normalized || 'Queixa não informada.',
  };
}

function normalizeClinicalCase(raw: RawClinicalCase): ClinicalCase {
  const description = raw.description?.trim() || '';
  const parsed = parseDescription(description);

  return {
    id: raw.id || 'sem-id',
    title: raw.title || parsed.chiefComplaint,
    organ: raw.organ || raw.specialty || 'Clínica Médica',
    specialty: raw.specialty || 'Clínica Médica',
    difficulty: raw.difficulty || 'Iniciante',
    chiefComplaint: raw.chiefComplaint || parsed.chiefComplaint,
    patientName: raw.patientName || parsed.patientName,
    patientAge: raw.patientAge ?? parsed.patientAge,
    patientSex: raw.patientSex || 'M',
    vitalSigns: {
      pa: raw.vitalSigns?.pa || raw.baseVitals?.bp || '0/0',
      fc: raw.vitalSigns?.fc ?? raw.baseVitals?.hr ?? 0,
      sao2: raw.vitalSigns?.sao2 ?? raw.baseVitals?.ox ?? 0,
      temp: raw.vitalSigns?.temp ?? 36.5,
      fr: raw.vitalSigns?.fr ?? 18,
    },
    history: raw.history || description || 'Histórico indisponível.',
    physicalExam: raw.physicalExam || {},
    labResults: raw.labResults || {},
    correctDiagnosis: raw.correctDiagnosis || 'Diagnóstico não informado',
    differentialDiagnoses: raw.differentialDiagnoses || [],
    unnecessaryExams: raw.unnecessaryExams || [],
    patientPersonality: raw.patientPersonality || 'colaborativo',
    personalityTraits: (raw as any).personalityTraits || '',
    colloquialDiagnosis: (raw as any).colloquialDiagnosis || [],
  };
}

export async function fetchClinicalCases(): Promise<ClinicalCase[]> {
  try {
    const response = await fetch(CASES_URL, { cache: 'no-store' });

    if (!response.ok) {
      console.error('Erro ao carregar banco de dados do GitHub:', response.status, response.statusText);
      return [];
    }

    const payload: unknown = await response.json();
    const data = Array.isArray(payload) ? payload : [];

    console.log('Dados carregados do GitHub:', data);

    if (data.length === 0) {
      return [];
    }

    return data.map((item) => normalizeClinicalCase(item as RawClinicalCase));
  } catch (error) {
    console.error('Erro ao carregar banco de dados do GitHub:', error);
    return [];
  }
}
