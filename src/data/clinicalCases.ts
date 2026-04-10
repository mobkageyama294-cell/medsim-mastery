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

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-001',
    title: 'Dor Torácica Aguda',
    organ: 'Coração',
    specialty: 'Cardiologia',
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
    organ: 'Cérebro',
    specialty: 'Neurologia',
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
  {
    id: 'case-003',
    title: 'Dor Abdominal Aguda',
    organ: 'Vesícula Biliar',
    specialty: 'Cirurgia Geral',
    difficulty: 'Intermediário',
    chiefComplaint: 'Dor forte na barriga do lado direito depois de comer uma feijoada.',
    patientName: 'Mercedes Oliveira',
    patientAge: 55,
    patientSex: 'F',
    vitalSigns: { pa: '135/85', fc: 92, sao2: 96, temp: 37.8, fr: 20 },
    history: 'Obesa (IMC 34), multípara (4 filhos), relata episódios prévios de dor semelhante após alimentação gordurosa. Usa omeprazol por conta própria. Nega cirurgias prévias.',
    physicalExam: {
      'Geral': 'Paciente em regular estado geral, fácies de dor, posição antálgica.',
      'Abdome': 'Globoso, flácido, doloroso à palpação profunda em hipocôndrio direito. Sinal de Murphy positivo. Sem sinais de peritonite generalizada.',
      'Cardiovascular': 'Bulhas rítmicas, normofonéticas, sem sopros.',
      'Respiratório': 'Murmúrio vesicular presente, sem ruídos adventícios.',
    },
    labResults: {
      'Sinal de Murphy': 'Positivo (Interrupção súbita da inspiração à palpação profunda do ponto cístico)',
      'Hemograma': 'Leucocitose (14.200/mm³) com desvio à esquerda',
      'Ultrassom de Abdome': 'Vesícula biliar com paredes espessadas (>4mm) e cálculos impactados no infundíbulo. Líquido perivesicular presente.',
      'PCR': '48 mg/L (VR: <5 mg/L) — ELEVADA',
      'Bilirrubinas': 'Total 1.8 mg/dL, Direta 1.2 mg/dL — discretamente elevadas',
    },
    correctDiagnosis: 'Colecistite Aguda Calculosa',
    differentialDiagnoses: ['Úlcera péptica perfurada', 'Pancreatite aguda', 'Hepatite aguda', 'Apendicite aguda'],
    unnecessaryExams: ['Troponina', 'Endoscopia Digestiva Alta', 'Amilase', 'Eletroencefalograma'],
    patientPersonality: 'Paciente comunicativa mas queixosa. Reclama muito da dor. Fala sobre a comida que comeu. Pergunta se vai precisar operar.',
  },
  {
    id: 'case-004',
    title: 'Dispneia e Edema de Membros Inferiores',
    organ: 'Coração',
    specialty: 'Cardiologia',
    difficulty: 'Avançado',
    chiefComplaint: 'Falta de ar que piora quando deita e pernas muito inchadas há 2 semanas.',
    patientName: 'Waldir Ferreira',
    patientAge: 68,
    patientSex: 'M',
    vitalSigns: { pa: '160/100', fc: 110, sao2: 89, temp: 36.5, fr: 28 },
    history: 'Hipertenso há 25 anos com baixa adesão ao tratamento. Ex-etilista pesado (parou há 5 anos). Diabetes tipo 2. Relata ortopneia e dispneia paroxística noturna. Ganhou 6kg no último mês.',
    physicalExam: {
      'Geral': 'Paciente dispneico em repouso, usando musculatura acessória. Turgência jugular patológica a 45°.',
      'Cardiovascular': 'Ictus desviado para 6º EIC, LAA. Bulhas hipofonéticas. Terceira bulha (B3) presente. Sopro sistólico em foco mitral.',
      'Respiratório': 'Estertores crepitantes bilaterais até terço médio. Redução de MV em bases.',
      'Abdome': 'Hepatomegalia dolorosa a 4cm do RCD. Refluxo hepatojugular positivo.',
      'Extremidades': 'Edema bilateral de MMII ++++/4, frio, com cacifo.',
    },
    labResults: {
      'Ictus Cordis': 'Desviado para o 6º espaço intercostal esquerdo, linha axilar anterior',
      'Ausculta Cardíaca': 'Presença de Terceira Bulha (B3), sugerindo sobrecarga de volume',
      'BNP': '1.850 pg/mL (VR: <100 pg/mL) — MUITO ELEVADO',
      'Raio-X de Tórax': 'Cardiomegalia (índice cardiotorácico >0.6). Congestão hilar bilateral. Derrame pleural bilateral.',
      'Ecocardiograma': 'FE 28%. Dilatação de câmaras esquerdas. Insuficiência mitral moderada.',
      'Creatinina': '1.8 mg/dL',
    },
    correctDiagnosis: 'Insuficiência Cardíaca Congestiva Descompensada (NYHA IV)',
    differentialDiagnoses: ['Embolia pulmonar', 'DPOC exacerbado', 'Síndrome nefrótica', 'Cirrose hepática descompensada'],
    unnecessaryExams: ['D-Dímero', 'Cintilografia Óssea', 'Colonoscopia', 'Espirometria'],
    patientPersonality: 'Paciente cansado, fala com pausas para respirar. Ansioso. Pergunta se o coração está fraco. Colaborativo mas exausto.',
  },
  {
    id: 'case-005',
    title: 'Febre Alta e Rigidez de Nuca',
    organ: 'Cérebro',
    specialty: 'Neurologia / Infectologia',
    difficulty: 'Avançado',
    chiefComplaint: 'Febre alta, dor de cabeça muito forte e pescoço duro desde ontem.',
    patientName: 'Lucas Mendes',
    patientAge: 19,
    patientSex: 'M',
    vitalSigns: { pa: '110/70', fc: 118, sao2: 95, temp: 39.2, fr: 22 },
    history: 'Estudante universitário, mora em república. Há 2 dias com febre, cefaleia progressiva e vômitos. Hoje a mãe notou manchas vermelhas no corpo. Sem comorbidades. Vacinação incompleta.',
    physicalExam: {
      'Geral': 'Paciente toxêmico, febril, irritável, fotofóbico. Petéquias em tronco e membros.',
      'Neurológico': 'Glasgow 13 (O3 V4 M6). Rigidez de nuca presente. Kernig positivo. Brudzinski positivo. Sem déficit focal.',
      'Cardiovascular': 'Taquicárdico, bulhas rítmicas, sem sopros.',
      'Pele': 'Petéquias disseminadas em tronco, membros superiores e inferiores. Algumas purpúricas.',
      'Fundo de olho': 'Sem papiledema.',
    },
    labResults: {
      'Sinal de Kernig': 'Positivo (Resistência e dor à extensão da perna com a coxa flexionada)',
      'Sinal de Brudzinski': 'Positivo (Flexão involuntária das pernas ao flexionar o pescoço)',
      'Líquor': 'Aspecto turvo. Celularidade 2.800/mm³ (predomínio neutrofílico 92%). Glicose 18 mg/dL (sangue 95). Proteína 380 mg/dL. Gram: diplococos Gram-negativos.',
      'Hemograma': 'Leucócitos 22.000/mm³ com desvio à esquerda. Plaquetas 95.000/mm³.',
      'PCR': '280 mg/L — MUITO ELEVADA',
      'Hemocultura': 'Colhida (resultado pendente)',
    },
    correctDiagnosis: 'Meningite Bacteriana (provável Neisseria meningitidis)',
    differentialDiagnoses: ['Encefalite viral', 'Hemorragia subaracnoidea', 'Meningite viral', 'Abscesso cerebral'],
    unnecessaryExams: ['Eletroencefalograma', 'Ressonância Magnética de Crânio', 'Ecocardiograma', 'Raio-X de coluna'],
    patientPersonality: 'Paciente sonolento e irritável. Responde com monossílabos. Geme com a luz. A mãe está presente e responde por ele quando ele não consegue.',
  },
  {
    id: 'case-006',
    title: 'Dor Lombar Aguda Irradiada',
    organ: 'Rim',
    specialty: 'Nefrologia / Urologia',
    difficulty: 'Iniciante',
    chiefComplaint: 'Dor insuportável nas costas do lado direito que vai até a virilha.',
    patientName: 'Ricardo Santos',
    patientAge: 35,
    patientSex: 'M',
    vitalSigns: { pa: '150/90', fc: 105, sao2: 98, temp: 36.6, fr: 20 },
    history: 'Saudável previamente. Bebedor de pouca água ("tomo no máximo 2 copos por dia"). Dieta rica em proteínas. Episódio semelhante há 1 ano que passou espontaneamente. Sem uso de medicações.',
    physicalExam: {
      'Geral': 'Paciente agitado, não consegue ficar parado. Sudoreico. Fácies de dor intensa.',
      'Abdome': 'Plano, sem sinais de peritonismo. Sem massas palpáveis.',
      'Lombar': 'Punho-percussão (Giordano) positivo à direita. Sem abaulamentos.',
      'Genitourinário': 'Testículos sem alterações à palpação. Sem sinais de torção.',
    },
    labResults: {
      'Punho-Percussão (Sinal de Giordano)': 'Positivo à direita — dor intensa à percussão lombar',
      'EAS (Urina tipo 1)': 'Hematúria microscópica intensa (>100 hemácias/campo). pH 5.5. Cristais de oxalato de cálcio.',
      'Creatinina': '1.0 mg/dL — Normal',
      'Tomografia (Protocolo Stone)': 'Cálculo de 6mm em ureter proximal direito com hidronefrose leve a montante.',
    },
    correctDiagnosis: 'Litíase Renal (Cólica Nefrética) por cálculo ureteral obstrutivo',
    differentialDiagnoses: ['Pielonefrite aguda', 'Apendicite retrocecal', 'Aneurisma de aorta abdominal', 'Lombalgia mecânica'],
    unnecessaryExams: ['Amilase', 'Raio-X de Tórax', 'D-Dímero', 'Troponina'],
    patientPersonality: 'Paciente muito agitado e impaciente. Não para de andar. Pede analgesia repetidamente. Quer saber se vai precisar de cirurgia.',
  },
  {
    id: 'case-007',
    title: 'Febre e Tosse Produtiva',
    organ: 'Pulmão',
    specialty: 'Pneumologia',
    difficulty: 'Iniciante',
    chiefComplaint: 'Tosse com catarro amarelado, febre alta e dor no peito ao respirar há 4 dias.',
    patientName: 'Camila Rodrigues',
    patientAge: 28,
    patientSex: 'F',
    vitalSigns: { pa: '115/75', fc: 102, sao2: 91, temp: 38.9, fr: 26 },
    history: 'Previamente saudável. Há 1 semana com quadro gripal que piorou progressivamente. Há 4 dias com febre persistente (38-39°C), tosse produtiva e dor pleurítica à direita. Nega tabagismo. Sem viagens recentes.',
    physicalExam: {
      'Geral': 'Paciente febril, taquipneica, corada, hidratada.',
      'Respiratório': 'FTV aumentado em base direita. Macicez à percussão em base direita. Sopro tubário e estertores crepitantes em base pulmonar direita. Pectorilóquia fônica presente.',
      'Cardiovascular': 'Taquicárdica, bulhas rítmicas, sem sopros.',
      'Abdome': 'Sem alterações.',
    },
    labResults: {
      'Frêmito Toraco-Vocal (FTV)': 'Aumentado em terço inferior do hemitórax direito',
      'Percussão': 'Macicez em base pulmonar direita',
      'Ausculta': 'Sopro tubário e estertores crepitantes em base direita. Pectorilóquia fônica.',
      'Raio-X de Tórax': 'Consolidação alveolar com broncogramas aéreos em lobo inferior direito.',
      'Hemograma': 'Leucócitos 18.500/mm³ com desvio à esquerda. PCR 95 mg/L.',
    },
    correctDiagnosis: 'Pneumonia Lobar Adquirida na Comunidade',
    differentialDiagnoses: ['Derrame pleural', 'Tuberculose pulmonar', 'Embolia pulmonar', 'Bronquite aguda'],
    unnecessaryExams: ['Espirometria', 'Ecocardiograma', 'Troponina', 'Colonoscopia'],
    patientPersonality: 'Paciente colaborativa mas abatida. Tosse frequentemente durante a conversa. Preocupada em faltar ao trabalho. Pergunta se é grave.',
  },
];
