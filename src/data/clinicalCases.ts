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
}

// Fetches cases from the JSON file — no static data
export async function fetchClinicalCases(): Promise<ClinicalCase[]> {
  const response = await fetch('/cases.json');
  if (!response.ok) {
    throw new Error('Erro ao carregar banco de dados de casos');
  }
  const data: ClinicalCase[] = await response.json();
  console.log('Casos carregados:', data);
  return data;
}
