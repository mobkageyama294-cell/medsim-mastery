export interface ClinicalCase {
  id: string;
  title: string;
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

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-001',
    title: 'Dor Torácica Aguda',
    difficulty: 'Intermediário',
    chiefComplaint: 'Dor no peito há 2 horas, com irradiação para o braço esquerdo.',
    patientName: 'Carlos Alberto',
    patientAge: 58,
    patientSex: 'M',
    vitalSigns: {
      pa: '160/100',
      fc: 102,
      sao2: 94,
      temp: 36.8,
      fr: 22,
    },
    history: 'Hipertenso há 15 anos, diabético tipo 2, tabagista (30 maços/ano). Pai faleceu de IAM aos 52 anos. Sedentário, obeso (IMC 32).',
    physicalExam: {
      'Geral': 'Paciente ansioso, sudoreico, pálido. Aceitando posição sentado inclinado para frente.',
      'Cardiovascular': 'Bulhas rítmicas, hipofonéticas. Sem sopros. Pulsos periféricos simétricos. PA igual em ambos os braços.',
      'Respiratório': 'Murmúrio vesicular presente bilateralmente, com estertores crepitantes em bases.',
      'Abdome': 'Globoso, flácido, indolor à palpação.',
      'Extremidades': 'Sem edema. Perfusão periférica lenta (>3s).',
    },
    labResults: {
      'ECG': 'Supradesnivelamento de ST em DII, DIII e aVF. Infradesnivelamento recíproco em DI e aVL.',
      'Troponina I': '2.8 ng/mL (VR: <0.04 ng/mL) — ELEVADA',
      'CK-MB': '45 U/L (VR: <25 U/L) — ELEVADA',
      'Hemograma': 'Leucócitos 12.500/mm³, Hb 14.2 g/dL, Plaquetas 220.000/mm³',
      'Glicemia': '280 mg/dL — ELEVADA',
      'Creatinina': '1.1 mg/dL',
      'Raio-X Tórax': 'Área cardíaca no limite superior da normalidade. Congestão hilar bilateral discreta.',
    },
    correctDiagnosis: 'Infarto Agudo do Miocárdio com Supradesnivelamento de ST (IAMCSST) de parede inferior',
    differentialDiagnoses: ['Dissecção aórtica', 'Pericardite aguda', 'Embolia pulmonar', 'Pneumotórax'],
    unnecessaryExams: ['Ressonância magnética cardíaca', 'Colonoscopia', 'Eletroencefalograma', 'Cintilografia renal', 'Ultrassom de tireoide'],
    patientPersonality: 'Paciente ansioso e assustado. Fala com frases curtas por causa da dor. Às vezes geme. Tem medo de morrer. Pergunta se vai ficar bem.',
  },
  {
    id: 'case-002',
    title: 'Cefaleia Súbita Intensa',
    difficulty: 'Avançado',
    chiefComplaint: 'Dor de cabeça fortíssima que começou de repente, "a pior da minha vida".',
    patientName: 'Maria Souza',
    patientAge: 42,
    patientSex: 'F',
    vitalSigns: {
      pa: '180/110',
      fc: 88,
      sao2: 97,
      temp: 37.5,
      fr: 18,
    },
    history: 'Saudável previamente. Sem comorbidades conhecidas. Estava no trabalho quando sentiu a dor de início súbito. Vomitou 2 vezes. Nega trauma.',
    physicalExam: {
      'Geral': 'Paciente em sofrimento intenso, fotofobia, preferindo ambiente escuro.',
      'Neurológico': 'Glasgow 14 (O4 V4 M6). Rigidez de nuca presente. Kernig e Brudzinski positivos. Pupilas isocóricas e fotorreagentes. Sem déficit focal motor.',
      'Cardiovascular': 'Bulhas rítmicas, normofonéticas, sem sopros.',
      'Fundo de olho': 'Hemorragias sub-hialoideas bilaterais.',
    },
    labResults: {
      'TC Crânio sem contraste': 'Hiperdensidade em cisternas basais e fissura silviana bilateral — compatível com hemorragia subaracnoidea (Fisher III).',
      'Hemograma': 'Normal',
      'Coagulograma': 'TP e TTPA normais',
      'Glicemia': '110 mg/dL',
      'Eletrólitos': 'Na+ 138, K+ 4.0 mEq/L',
    },
    correctDiagnosis: 'Hemorragia Subaracnoidea por ruptura de aneurisma cerebral',
    differentialDiagnoses: ['Meningite bacteriana', 'Enxaqueca com aura', 'Trombose venosa cerebral', 'Crise hipertensiva'],
    unnecessaryExams: ['Raio-X de coluna lombar', 'Endoscopia digestiva', 'Ecocardiograma', 'Ultrassom abdominal'],
    patientPersonality: 'Paciente irritada com a luz e barulho. Fala pouco por causa da dor. Pede para apagar a luz. Agitada.',
  },
];
