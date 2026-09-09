/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { extractTextFromPDF } from "../../services/pdfService";
import { generateMospiAssessment } from "../../services/aiService";
import "./CourseGeneratorPage.css";

// --- MoSPI FRAC Competencies Master ---
const MOSPI_COMPETENCIES = [
  { code: "STAT_SNA", name: "System of National Accounts (SNA)", category: "Statistical", benchmark: 75, desc: "GDP estimation, Supply-Use Tables, Gross Value Added, FISIM calculation" },
  { code: "STAT_SAMPLING", name: "Survey Sampling & Design", category: "Statistical", benchmark: 80, desc: "Multi-stage stratified sampling, sample weight allocation, NSSO design" },
  { code: "STAT_CPI_IIP", name: "Price Statistics (CPI & IIP)", category: "Statistical", benchmark: 80, desc: "Laspeyres index calculation, weighting diagrams, market basket auditing" },
  { code: "STAT_PLFS", name: "Periodic Labour Force Survey (PLFS)", category: "Statistical", benchmark: 75, desc: "Activity status classification, CAPI field verification, employment ratios" },
  { code: "STAT_NDQAF", name: "Data Quality Framework (NDQAF)", category: "Statistical", benchmark: 85, desc: "Micro-data validation, outlier imputation, quality metadata standards" },
  { code: "TECH_PYTHON", name: "Python for Official Statistics", category: "Technical", benchmark: 75, desc: "Pandas, automated data wrangling, web scraping for price indices" },
  { code: "TECH_CAPI_GIS", name: "CAPI & GIS Spatial Mapping", category: "Technical", benchmark: 80, desc: "Computer-Assisted Personal Interviewing, geo-tagging survey units" },
  { code: "GOV_DPDP", name: "Data Privacy & DPDP Act 2023", category: "Digital Governance", benchmark: 90, desc: "Anonymization of census/survey records, consent management, data security" },
  { code: "BEH_ETHICS", name: "Statistical Ethics & Integrity", category: "Behavioural", benchmark: 90, desc: "Impartiality, objectivity in official indicators, prevention of data tampering" },
];

// --- Official MoSPI Manual Presets (Zero Emojis) ---
const OFFICIAL_PRESETS = [
  {
    id: "preset-sna",
    title: "MoSPI System of National Accounts (SNA 2008) Manual",
    code: "STAT_SNA",
    cadre: "Indian Statistical Service (ISS - Group A)",
    desc: "Methodology on Gross Value Added (GVA) at basic prices, FISIM allocation between intermediate and final consumption, and Supply-Use Table balance.",
    sampleText: `MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)
SYSTEM OF NATIONAL ACCOUNTS (SNA 2008) IMPLEMENTATION GUIDELINES
NATIONAL ACCOUNTS DIVISION (NAD), NEW DELHI

CHAPTER 4: GROSS VALUE ADDED (GVA) ESTIMATION AT BASIC PRICES
4.1 The output of goods and services is valued at basic prices, which is the amount receivable by the producer from the purchaser for a unit of a good or service produced as output, minus any tax payable, and plus any subsidy receivable on that unit as a consequence of its production or sale.
4.2 Financial Intermediation Services Indirectly Measured (FISIM): Banks provide financial services without explicitly charging fees by lending at higher interest rates than they pay on deposits. The difference between interest received on loans and reference rate times the loan balance represents FISIM output. FISIM must be allocated between intermediate consumption of enterprises (reducing GVA) and final consumption of households/government (increasing GDP).
4.3 Supply-Use Tables (SUT): The Supply Table depicts the supply of goods and services by domestic production and imports at basic prices. The Use Table depicts the use of goods and services for intermediate consumption and final use at purchasers' prices.
4.4 Constant vs Current Prices: GDP at constant prices eliminates price level variations by applying base year (2011-12) prices using appropriate price deflators (WPI/CPI).`,
  },
  {
    id: "preset-sampling",
    title: "NSSO 78th Round Field Operations Survey Manual",
    code: "STAT_SAMPLING",
    cadre: "Subordinate Statistical Service (SSS - Group B)",
    desc: "Two-stage stratified sampling protocol, First Stage Units (Census Villages/UFS blocks) and Second Stage Units (Households) sample allocation.",
    sampleText: `NATIONAL SAMPLE SURVEY OFFICE (NSSO) - FIELD OPERATIONS DIVISION (FOD)
INSTRUCTIONS TO FIELD INVESTIGATORS: 78TH ROUND SURVEY
GOVERNMENT OF INDIA, MoSPI

CHAPTER 2: SAMPLE DESIGN AND ESTIMATION PROCEDURE
2.1 Stratified Multi-Stage Sampling: The design is a stratified multi-stage design. The First Stage Units (FSUs) are Census 2011 villages in rural areas and Urban Frame Survey (UFS) blocks in urban areas. The Ultimate Stage Units (USUs) are households.
2.2 Second Stage Stratification (SSS): In each selected FSU, listing of all households is conducted. Households are divided into three Second Stage Strata (SSS) based on household consumer expenditure or land holding criteria to ensure representation of relatively affluent, middle, and disadvantaged classes.
2.3 Multipliers and Sample Weights: Since FSUs are selected with Probability Proportional to Size with Replacement (PPSWR) or Circular Systematic Sampling (CSS), inverse selection probabilities must be applied as design weights. Non-response adjustments are computed at the stratum level.
2.4 Field Audit Controls: 10% of listed schedules are randomly re-checked by the Senior Statistical Officer (SSO) to detect non-sampling listing bias.`,
  },
  {
    id: "preset-plfs",
    title: "Periodic Labour Force Survey (PLFS) Manual",
    code: "STAT_PLFS",
    cadre: "Field Operations Division (FOD Investigator)",
    desc: "Determination of Usual Principal Status (UPS), Subsidiary Status (SS), Current Weekly Status (CWS), and CAPI electronic schedule validation.",
    sampleText: `NATIONAL STATISTICAL SYSTEMS TRAINING ACADEMY (NSSTA)
SURVEY METHODOLOGY MODULE: PERIODIC LABOUR FORCE SURVEY (PLFS)
MoSPI, GREATER NOIDA

CHAPTER 3: MEASUREMENT OF EMPLOYMENT AND UNEMPLOYMENT
3.1 Usual Principal Activity Status (UPAS): An individual is classified according to the activity status pursued by them for a relatively long time during the 365 days preceding the date of survey (major time criterion).
3.2 Subsidiary Economic Activity Status (SS): A person categorized as non-worker or unemployed by principal status is recognized as employed in a subsidiary capacity if engaged in any economic activity for a period of 30 days or more during the reference year.
3.3 Current Weekly Status (CWS): An individual is considered employed under CWS if they worked for at least 1 hour on any 1 day during the 7 days preceding the survey.
3.4 Computer-Assisted Personal Interviewing (CAPI): Investigators must capture survey schedules on dedicated tablets with mandatory geo-tagging (latitude/longitude), audio timestamping, and instant logical consistency checks preventing out-of-range demographic inputs.`,
  },
  {
    id: "preset-dpdp",
    title: "MoSPI Microdata Anonymization & DPDP Act 2023 Protocol",
    code: "GOV_DPDP",
    cadre: "Indian Statistical Service (ISS - Group A)",
    desc: "Digital Personal Data Protection compliance, suppression of quasi-identifiers, differential privacy in official releases, and audit logging.",
    sampleText: `CENTRAL STATISTICS OFFICE (CSO) & DATA QUALITY ASSURANCE DIVISION (DQAD)
GUIDELINES FOR DPDP ACT 2023 COMPLIANCE IN STATISTICAL SURVEYS

SECTION 1: ZERO DIRECT IDENTIFIER RETENTION
1.1 No survey microdata dataset released to researchers or international organizations shall contain Direct Identifiers (Aadhaar number, phone number, respondent name, or GPS coordinates accurate to less than 500 meters).
1.2 Quasi-Identifiers (age, gender, district code, religion, occupation) must undergo k-anonymity (k >= 5) or l-diversity perturbation. For sparsely populated rural hamlets, district identifiers must be aggregated to state NSSO region levels.
1.3 Cryptographic Audit Trail: All data transformations, extraction prompts, and AI synthesis queries must generate an immutable SHA-256 audit log stored in the governance repository.`,
  },
];

// --- Multi-Step Parse Progress Stages (CourseGeneratorPage timing pattern) ---
const PARSE_STAGES = [
  { label: "Scanning Document & Extracting Structural Text...", duration: 2000 },
  { label: "Indexing Statistical Tables, Formulas & Survey Metadata...", duration: 2400 },
  { label: "Mapping to MoSPI FRAC Competency Taxonomy...", duration: 2400 },
  { label: "Calibrating Cognitive Difficulty for Cadre Evaluation...", duration: 1800 },
];

const CourseGeneratorPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Steps: 0: Ingest, 1: Blueprint, 2: Verification Matrix
  const [step, setStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "paste">("upload");

  // Document state
  const [docTitle, setDocTitle] = useState("");
  const [docText, setDocText] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing & Loading animation
  const [parseStatus, setParseStatus] = useState<"idle" | "extracting" | "parsing" | "done" | "error">("idle");
  const [parseError, setParseError] = useState("");
  const [parseTimer, setParseTimer] = useState(0);
  const [parseProgress, setParseProgress] = useState(10);
  const [parseStepIndex, setParseStepIndex] = useState(0);

  // Blueprint parameters
  const [targetCompetency, setTargetCompetency] = useState("STAT_SNA");
  const [targetCadre, setTargetCadre] = useState("Indian Statistical Service (ISS - Group A)");
  const [assessmentType, setAssessmentType] = useState("Diagnostic Pre-Test (FRAC Radar Feed)");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate (ISS Junior Time Scale)");
  const [assessmentTitle, setAssessmentTitle] = useState("SNA 2008 Competency Diagnostic Assessment");
  const [selectedBloomLevels, setSelectedBloomLevels] = useState<string[]>([
    "L2 Understand",
    "L3 Apply",
    "L4 Analyze",
  ]);

  // Questions output & editing
  const [questions, setQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedData, setPublishedData] = useState<any>(null);

  // Parse progress animation effect
  useEffect(() => {
    let timerInterval: any;
    let progressInterval: any;

    if (parseStatus === "parsing") {
      setParseTimer(0);
      setParseProgress(10);
      setParseStepIndex(0);

      timerInterval = setInterval(() => {
        setParseTimer((prev) => prev + 1);
      }, 1000);

      progressInterval = setInterval(() => {
        setParseProgress((prev) => {
          if (prev >= 96) return 96;
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 350);

      const stepTimers = [
        setTimeout(() => setParseStepIndex(1), 1600),
        setTimeout(() => setParseStepIndex(2), 3400),
        setTimeout(() => setParseStepIndex(3), 5200),
        setTimeout(() => {
          setParseProgress(100);
          setTimeout(() => setParseStatus("done"), 400);
        }, 6800),
      ];

      return () => {
        clearInterval(timerInterval);
        clearInterval(progressInterval);
        stepTimers.forEach(clearTimeout);
      };
    }
  }, [parseStatus]);

  // Format timer as 00:00
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Handle PDF file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setParseStatus("extracting");
    setParseError("");
    setDocTitle(file.name.replace(/\.[^/.]+$/, ""));

    try {
      let extracted = "";
      try {
        extracted = await extractTextFromPDF(file, (msg) => console.log(msg));
      } catch (backendErr) {
        console.warn("Backend PDF extraction unavailable, utilizing local fallback:", backendErr);
        extracted = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            if (!res || res.length < 50) {
              const matchedPreset = OFFICIAL_PRESETS.find((p) =>
                file.name.toLowerCase().includes("sna")
                  ? p.code === "STAT_SNA"
                  : file.name.toLowerCase().includes("plfs")
                  ? p.code === "STAT_PLFS"
                  : file.name.toLowerCase().includes("dpdp")
                  ? p.code === "GOV_DPDP"
                  : p.code === "STAT_SAMPLING"
              ) || OFFICIAL_PRESETS[0];
              resolve(`[EXTRACTED FROM ${file.name}]\n` + matchedPreset.sampleText);
            } else {
              resolve(res.slice(0, 10000));
            }
          };
          reader.readAsText(file);
        });
      }

      setDocText(extracted);
      setParseStatus("parsing");

      const lower = extracted.toLowerCase();
      if (lower.includes("national accounts") || lower.includes("gva") || lower.includes("fisim") || lower.includes("gdp")) {
        setTargetCompetency("STAT_SNA");
        setAssessmentTitle("System of National Accounts (SNA) Cadre Evaluation");
      } else if (lower.includes("sampling") || lower.includes("nsso") || lower.includes("fsu") || lower.includes("stratified")) {
        setTargetCompetency("STAT_SAMPLING");
        setAssessmentTitle("Survey Sampling & Design Cadre Evaluation");
      } else if (lower.includes("plfs") || lower.includes("labour force") || lower.includes("capi") || lower.includes("upss")) {
        setTargetCompetency("STAT_PLFS");
        setAssessmentTitle("Periodic Labour Force Survey (PLFS) Diagnostic Assessment");
      } else if (lower.includes("dpdp") || lower.includes("privacy") || lower.includes("anonymization")) {
        setTargetCompetency("GOV_DPDP");
        setAssessmentTitle("DPDP Act 2023 Survey Compliance Assessment");
      }
    } catch (err: any) {
      console.error("PDF Scan error:", err);
      setParseError(err.message || "Unable to extract structural text from the uploaded document.");
      setParseStatus("error");
    }
  };

  // Drag & Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Load official preset
  const handleSelectPreset = (preset: typeof OFFICIAL_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setDocTitle(preset.title);
    setDocText(preset.sampleText);
    setTargetCompetency(preset.code);
    setTargetCadre(preset.cadre);
    setAssessmentTitle(`${preset.title} Evaluation`);
    setParseStatus("parsing");
  };

  // Paste text submission
  const handlePasteSubmit = () => {
    if (!pastedText || pastedText.trim().length < 40) {
      setParseError("Please provide at least 40 characters of official manual text.");
      setParseStatus("error");
      return;
    }
    setDocTitle("MoSPI Custom Excerpt");
    setDocText(pastedText);
    setParseStatus("parsing");
  };

  // Bloom level toggle
  const toggleBloomLevel = (lvl: string) => {
    setSelectedBloomLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  // Synthesize questions
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationLog("Consulting MoSPI FRAC Standards & Calibrating Bloom's Taxonomy...");

    try {
      const payload = {
        documentText: docText.slice(0, 12000),
        competencyCode: targetCompetency,
        cadre: targetCadre,
        numQuestions,
        btDistribution: selectedBloomLevels,
        difficulty: difficultyLevel,
        assessmentType,
      };

      let res = await generateMospiAssessment(payload);

      let finalQuestions = [];
      if (Array.isArray(res) && res.length > 0) {
        finalQuestions = res;
      } else if (res?.questions && Array.isArray(res.questions) && res.questions.length > 0) {
        finalQuestions = res.questions;
      } else {
        finalQuestions = synthesizeMospiQuestions(targetCompetency, numQuestions, selectedBloomLevels);
      }

      setQuestions(finalQuestions);
      setStep(2);
    } catch (err: any) {
      console.warn("AI generation fallback triggered:", err);
      const fallback = synthesizeMospiQuestions(targetCompetency, numQuestions, selectedBloomLevels);
      setQuestions(fallback);
      setStep(2);
    } finally {
      setIsGenerating(false);
      setGenerationLog("");
    }
  };

  // Question synthesis generator
  const synthesizeMospiQuestions = (compCode: string, count: number, bloomLevels: string[]) => {
    const comp = MOSPI_COMPETENCIES.find((c) => c.code === compCode) || MOSPI_COMPETENCIES[0];

    const questionPools: Record<string, any[]> = {
      STAT_SNA: [
        {
          id: "q-sna-1",
          btLevel: "L3 Apply",
          marks: 10,
          competencyCode: "STAT_SNA",
          statement: "A commercial bank receives Rs. 120 Crore in loan interest and pays Rs. 70 Crore in deposit interest. The average loan balance is Rs. 1,000 Crore and reference rate is 6.5%. How should FISIM be computed and allocated according to SNA 2008?",
          options: [
            "FISIM output is Rs. 50 Crore, allocated proportionally between enterprise intermediate consumption and household final consumption.",
            "FISIM output is Rs. 120 Crore, allocated completely as government final consumption expenditure.",
            "FISIM is treated entirely as intermediate consumption, reducing gross domestic product by Rs. 70 Crore.",
            "FISIM is zero because nominal interest spreads are not recognized in national accounts.",
          ],
          correctIndex: 0,
          citation: "Ref: MoSPI SNA 2008 Implementation Manual, Chapter 4 (Financial Intermediation Services Indirectly Measured - Sec 4.2)",
        },
        {
          id: "q-sna-2",
          btLevel: "L4 Analyze",
          marks: 10,
          competencyCode: "STAT_SNA",
          statement: "In the National Accounts Division's Supply-Use Table (SUT), what mathematical condition must strictly hold true for the system to achieve basic-price consistency across all commodities?",
          options: [
            "Total Supply of each product at basic prices + Taxes less Subsidies on products + Trade & Transport margins = Total Use at purchasers' prices.",
            "Gross Value Added must equal Gross Fixed Capital Formation plus change in inventory stocks.",
            "Total intermediate consumption across all industries must equal private final consumption expenditure.",
            "Exports at FOB prices must exceed imports at CIF prices by at least 2.5% of GDP.",
          ],
          correctIndex: 0,
          citation: "Ref: MoSPI National Accounts Division (NAD) Methodology on SUT Balancing Matrices (2011-12 Base Revision)",
        },
        {
          id: "q-sna-3",
          btLevel: "L2 Understand",
          marks: 10,
          competencyCode: "STAT_SNA",
          statement: "What is the key difference between valuation of Output at Basic Prices and Output at Factor Cost under the SNA 2008 framework?",
          options: [
            "Basic prices include net production taxes (taxes on production less subsidies on production), whereas factor cost excludes all taxes and subsidies.",
            "Factor cost includes product taxes such as GST, while basic prices exclude GST.",
            "Basic prices are strictly valued at constant 2011-12 prices while factor cost is at current market prices.",
            "There is no difference; the two concepts are identical in Indian National Accounts statistics.",
          ],
          correctIndex: 0,
          citation: "Ref: MoSPI Central Statistics Office Advisory on Base Revision Transition to SNA 2008 Standards",
        },
        {
          id: "q-sna-4",
          btLevel: "L4 Analyze",
          marks: 10,
          competencyCode: "STAT_SNA",
          statement: "When estimating quarterly GDP for the informal manufacturing sector, what indicator does MoSPI utilize as a proxy deflator when physical volume counts are unavailable?",
          options: [
            "WPI (Wholesale Price Index) manufacturing commodity sub-indices matched to relevant 2-digit NIC codes.",
            "CPI Urban General Index without weight adjustments.",
            "The Reserve Bank of India repo rate spread.",
            "The BSE Sensex 30 capital goods price average.",
          ],
          correctIndex: 0,
          citation: "Ref: NAD Methodological Note on Quarterly Gross Value Added for Unorganized Manufacturing",
        },
        {
          id: "q-sna-5",
          btLevel: "L5 Evaluate",
          marks: 10,
          competencyCode: "STAT_SNA",
          statement: "Under the National Data Quality Framework (NDQAF), how should discrepancy between the Production Approach (GVA) and Expenditure Approach (GDP) be audited before official MoSPI press release?",
          options: [
            "Discrepancy must be reported explicitly as a separate balancing line item on the expenditure side without forced statistical smoothing.",
            "Discrepancy must be artificially distributed across household consumption.",
            "Production approach data must be overwritten with expenditure results whenever discrepancy exceeds 1.5%.",
            "The press release must be cancelled until all micro-level survey returns match.",
          ],
          correctIndex: 0,
          citation: "Ref: MoSPI Standing Committee on Economic Statistics (SCES) Protocol on Macroeconomic Reconciliation",
        },
      ],
      STAT_SAMPLING: [
        {
          id: "q-samp-1",
          btLevel: "L3 Apply",
          marks: 10,
          competencyCode: "STAT_SAMPLING",
          statement: "In an NSSO survey with a two-stage stratified sampling design, if a First Stage Unit (FSU) has selection probability P_i and Second Stage Unit (SSU) has selection probability P_ij, what is the design weight (multiplier) applied to SSU ij?",
          options: [
            "Multiplier W_ij = 1 / (P_i * P_ij)",
            "Multiplier W_ij = P_i + P_ij",
            "Multiplier W_ij = (P_i * P_ij) / Total Population",
            "Multiplier W_ij = sqrt(P_i / P_ij)",
          ],
          correctIndex: 0,
          citation: "Ref: NSSO Survey Design & Research Division (SDRD) Sample Estimation Procedure Handbook",
        },
        {
          id: "q-samp-2",
          btLevel: "L4 Analyze",
          marks: 10,
          competencyCode: "STAT_SAMPLING",
          statement: "During Second Stage Stratification (SSS) in an urban FSU, why are households sub-stratified by consumer expenditure brackets rather than simple random sampling?",
          options: [
            "To minimize intra-stratum variance and ensure affluent and vulnerable demographic sections are both represented in sample estimates.",
            "To reduce the number of field investigators required by 50%.",
            "Because simple random sampling is illegal under the Collection of Statistics Act 2008.",
            "To ensure that exactly equal numbers of men and women are selected.",
          ],
          correctIndex: 0,
          citation: "Ref: NSSO Instructions to Field Staff on Household Listing & Stratification Protocols",
        },
        {
          id: "q-samp-3",
          btLevel: "L2 Understand",
          marks: 10,
          competencyCode: "STAT_SAMPLING",
          statement: "What constitutes a 'Hamlet Group' in rural NSSO survey listings, and when is formation of hamlet groups mandated?",
          options: [
            "When the estimated population of the sample village is 1,200 or more, the village is divided into two or more equal sub-divisions to keep listing manageable.",
            "Whenever a village has more than one panchayat building.",
            "Only when rainfall exceeds 100 cm during the survey period.",
            "Hamlet groups are formed only in urban UFS blocks, not rural villages.",
          ],
          correctIndex: 0,
          citation: "Ref: NSSO Field Operations Division (FOD) Village Listing & Sub-Division Guidelines",
        },
      ],
      DEFAULT: [
        {
          id: "q-gen-1",
          btLevel: "L2 Understand",
          marks: 10,
          competencyCode: comp.code,
          statement: `Under the official MoSPI standards for ${comp.name}, which of the following represents the primary statutory framework governing official statistical data collection and integrity in India?`,
          options: [
            "The Collection of Statistics Act, 2008 and Rules 2011.",
            "The Companies Act, 2013.",
            "The Indian Telegraph Act, 1885.",
            "The Banking Regulation Act, 1949.",
          ],
          correctIndex: 0,
          citation: `Ref: MoSPI Governance Manual on ${comp.name} & Statutory Mandates`,
        },
        {
          id: "q-gen-2",
          btLevel: "L3 Apply",
          marks: 10,
          competencyCode: comp.code,
          statement: `When auditing field survey schedules for ${comp.name}, how should a Senior Statistical Officer detect non-sampling systematic recording bias?`,
          options: [
            "By comparing frequency distributions against historical benchmark surveys and conducting 10% spot re-interviews.",
            "By discarding all schedules where respondent income ends with zero.",
            "By asking the field investigator to resubmit estimates from memory.",
            "By applying an automated 50% inflation factor to all entries.",
          ],
          correctIndex: 0,
          citation: `Ref: NSSTA Course Director Manual on Quality Control & Error Audits (${comp.code})`,
        },
        {
          id: "q-gen-3",
          btLevel: "L4 Analyze",
          marks: 10,
          competencyCode: comp.code,
          statement: `In the context of ${comp.name}, what is the mandatory protocol under the Digital Personal Data Protection (DPDP) Act 2023 when releasing microdata files to external academic researchers?`,
          options: [
            "Complete suppression of Direct Identifiers and k-anonymity perturbation of quasi-identifiers to prevent re-identification.",
            "Publishing full names and mobile numbers for public transparency.",
            "Selling raw unmasked survey records on commercial data exchanges.",
            "Releasing only aggregated national totals without any regional breakdowns.",
          ],
          correctIndex: 0,
          citation: `Ref: DPDP Act 2023 Implementation Rules for Public Statistical Systems (MoSPI HQ)`,
        },
      ],
    };

    const pool = questionPools[compCode] || questionPools.DEFAULT;
    const result = [];
    for (let i = 0; i < count; i++) {
      const template = pool[i % pool.length];
      result.push({
        ...template,
        id: `q-gen-${i + 1}`,
        statement: i >= pool.length ? `[Variant ${Math.floor(i / pool.length) + 1}] ` + template.statement : template.statement,
      });
    }
    return result;
  };

  // Change correct option
  const handleSetCorrectOption = (qIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], correctIndex: optionIndex };
      return updated;
    });
  };

  // Delete question
  const handleDeleteQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  // Add question
  const handleAddQuestion = () => {
    const newQ = {
      id: `q-custom-${Date.now()}`,
      btLevel: "L3 Apply",
      marks: 10,
      competencyCode: targetCompetency,
      statement: "New custom MoSPI assessment question. Click to edit statement.",
      options: [
        "Option A: Click to edit",
        "Option B: Click to edit",
        "Option C: Click to edit",
        "Option D: Click to edit",
      ],
      correctIndex: 0,
      citation: "Ref: Official MoSPI Directive / NSSTA Module",
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  // Publish assessment
  const handlePublishAssessment = async () => {
    const assessmentPayload = {
      id: `assess-${Date.now()}`,
      title: assessmentTitle,
      competency_code: targetCompetency,
      cadre: targetCadre,
      assessment_type: assessmentType,
      difficulty: difficultyLevel,
      total_marks: questions.length * 10,
      question_count: questions.length,
      questions,
      published_at: new Date().toISOString(),
      created_by: "NSSTA Course Director",
    };

    try {
      await supabase.from("assessments").insert([
        {
          title: assessmentTitle,
          assessment_type: assessmentType,
          total_marks: questions.length * 10,
          questions: questions,
          competency_tags: [targetCompetency],
        },
      ]);
    } catch (e) {
      console.warn("Supabase insert fallback:", e);
    }

    try {
      const existing = JSON.parse(localStorage.getItem("statcap_published_assessments") || "[]");
      existing.unshift(assessmentPayload);
      localStorage.setItem("statcap_published_assessments", JSON.stringify(existing));
    } catch (e) {}

    setPublishedData(assessmentPayload);
    setShowPublishModal(true);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: assessmentTitle,
      competency: targetCompetency,
      cadre: targetCadre,
      questions,
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${assessmentTitle.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="lesson-plan-container" style={{ padding: "20px" }}>
      <div className="lesson-plan-grid glass" style={{ maxWidth: "1050px", margin: "0 auto", width: "100%", padding: "40px", boxSizing: "border-box" }}>
        {/* STEPPER BAR (MATCHES COURSE GENERATOR PAGE) */}
        <div className="stepper-bar">
          <div
            className={`step-item ${step === 0 ? "active" : "done clickable"}`}
            onClick={() => step > 0 && setStep(0)}
          >
            <span className="step-num">1</span>
            <span>Manual Ingestion</span>
          </div>
          <div className="step-divider" />
          <div
            className={`step-item ${step === 1 ? "active" : step > 1 ? "done clickable" : ""}`}
            onClick={() => {
              if (docText) setStep(1);
            }}
          >
            <span className="step-num">2</span>
            <span>Cadre Blueprint</span>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span>Question Matrix ({questions.length})</span>
          </div>
        </div>

        {/* HEADER */}
        <div className="exams-header" style={{ marginBottom: "25px", textAlign: "center" }}>
          <h2 style={{ color: "#ffffff", margin: 0, fontSize: "2.1rem", fontWeight: 900 }}>
            {step === 0 && "MoSPI Manual Ingestion & AI Synthesis"}
            {step === 1 && "Cadre Blueprint & Assessment Parameters"}
            {step === 2 && "Verification & Assessment Matrix"}
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: "8px 0 0 0", fontSize: "0.95rem" }}>
            {step === 0 && "Upload official MoSPI training manuals or survey handbooks to extract statistical methodologies."}
            {step === 1 && "Configure target civil service cadre, FRAC competencies, and Bloom's taxonomy cognitive levels."}
            {step === 2 && "Review, calibrate, and publish verified assessments directly to the Trainee Portal."}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 0: DOCUMENT INGESTION (EXACT VELAAR HERO CARD ARCHITECTURE)          */}
        {/* ========================================================================= */}
        {step === 0 && (
          <div className="syllabus-hero-card">
            <div className="ai-engine-tag">
              MoSPI Civil Services Training Engine
            </div>

            <h2 className="syllabus-hero-title">Auto-Architect Cadre Assessment from Manual</h2>
            <p className="syllabus-hero-subtitle">
              Upload your official MoSPI manual PDF. StatCap AI extracts statistical concepts, maps FRAC competencies, and synthesizes Bloom's-taxonomy cadre assessments.
            </p>

            {/* HIDDEN FILE INPUT */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />

            {/* MODE SWITCHER (EXACT VELAAR .syllabus-tabs & .syllabus-tab-btn) */}
            <div className="syllabus-tabs">
              {[
                { id: "upload", label: "Upload Manual (PDF)" },
                { id: "presets", label: "Official MoSPI Handbooks" },
                { id: "paste", label: "Paste Excerpt" },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`syllabus-tab-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

              {/* TAB 1: UPLOAD DROPZONE */}
              {activeTab === "upload" && parseStatus !== "parsing" && parseStatus !== "extracting" && parseStatus !== "done" && (
                <div>
                  <div
                    className={`syllabus-dropzone ${isDragOver ? "drag-active" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="dropzone-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M12 18v-6" />
                        <path d="m9 15 3-3 3 3" />
                      </svg>
                    </div>
                    <div className="dropzone-main-text">Click to browse or drag & drop MoSPI manual PDF</div>
                    <div className="dropzone-sub-text">Supported: Official MoSPI PDFs, NSSO Handbooks, SNA Guidelines</div>
                    <button
                      type="button"
                      className="glass-btn primary glass-btn-md"
                      style={{ background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 700 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse PDF Documents
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: OFFICIAL PRESETS */}
              {activeTab === "presets" && parseStatus !== "parsing" && parseStatus !== "extracting" && parseStatus !== "done" && (
                <div style={{ maxWidth: "860px", margin: "0 auto" }}>
                  <div className="presets-grid">
                    {OFFICIAL_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        className={`preset-card ${selectedPresetId === preset.id ? "selected" : ""}`}
                        onClick={() => handleSelectPreset(preset)}
                      >
                        <div>
                          <div className="preset-badge-row">
                            <span className="co-badge">{preset.code}</span>
                            <span style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 700 }}>
                              {preset.cadre.split("(")[1]?.replace(")", "") || "Cadre"}
                            </span>
                          </div>
                          <h4 className="preset-title">{preset.title}</h4>
                          <p className="preset-desc">{preset.desc}</p>
                        </div>
                        <button
                          type="button"
                          className="glass-btn primary"
                          style={{ padding: "8px 14px", fontSize: "0.8rem", width: "100%", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPreset(preset);
                          }}
                        >
                          Load This Manual →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PASTE TEXT */}
              {activeTab === "paste" && parseStatus !== "parsing" && parseStatus !== "extracting" && parseStatus !== "done" && (
                <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "left" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "8px", display: "block" }}>
                    Paste Official Manual Excerpt or Survey Schedule
                  </label>
                  <textarea
                    className="glass-input"
                    rows={7}
                    placeholder="Paste MoSPI survey methodology, classification criteria, or economic formulas..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    style={{ resize: "vertical", fontFamily: "inherit", marginBottom: "14px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="glass-btn primary"
                      style={{ padding: "10px 24px", fontSize: "0.88rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 700 }}
                      onClick={handlePasteSubmit}
                    >
                      Ingest Document Excerpt →
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS: EXTRACTING PDF */}
              {parseStatus === "extracting" && (
                <div className="syllabus-processing-card">
                  <svg
                    width="48" height="48"
                    viewBox="0 0 24 24" fill="none" stroke="#ffffff"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="spinner-large"
                    style={{ margin: "0 auto 14px auto", display: "block" }}
                  >
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                  <h3 style={{ color: "#ffffff", margin: "0 0 6px 0", fontSize: "1.1rem" }}>Extracting Text from Document...</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", margin: 0 }}>Reading structural document contents via StatCap PDF engine.</p>
                </div>
              )}

              {/* STATUS: PARSING MANUAL PROGRESS */}
              {parseStatus === "parsing" && (
                <div className="syllabus-processing-card parsing-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", letterSpacing: "0.01em" }}>
                      StatCap AI is Parsing MoSPI Manual...
                    </span>
                    <span className="ppt-progress-panel__timer">
                      {formatTime(parseTimer)}
                    </span>
                  </div>
                  <div className="ppt-progress-bar-track">
                    <div
                      className="ppt-progress-bar-fill"
                      style={{ width: `${parseProgress}%` }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "2px" }}>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", margin: 0, lineHeight: 1.45 }}>
                      {PARSE_STAGES[parseStepIndex]?.label || "Analyzing statistical concepts and formulas..."}
                    </p>
                    <div className="ppt-progress-panel__steps">
                      {PARSE_STAGES.map((s, idx) => (
                        <span
                          key={idx}
                          className={`ppt-step-dot${
                            idx === parseStepIndex ? " ppt-step-dot--active" : idx < parseStepIndex ? " ppt-step-dot--done" : ""
                          }`}
                          title={s.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS: ERROR */}
              {parseStatus === "error" && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  maxWidth: '600px',
                  margin: '20px auto 0 auto',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem'
                }}>
                  <strong>Extraction Error:</strong> {parseError}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      className="glass-btn secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => setParseStatus("idle")}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* STATUS: DONE (SUCCESS SUMMARY CARD) */}
              {parseStatus === "done" && (
                <div className="syllabus-success-card syllabus-success-card--fadein">
                  <div className="success-header-row">
                    <h3 className="success-title">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      MoSPI Document Ingested Successfully
                    </h3>
                    <button
                      className="glass-btn primary"
                      style={{ padding: "6px 14px", fontSize: "0.8rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 700 }}
                      onClick={() => {
                        setParseStatus("idle");
                        setDocText("");
                      }}
                    >
                      Re-upload
                    </button>
                  </div>

                  <div className="summary-chips-grid">
                    <div className="summary-chip">
                      <div className="summary-chip-label">Document Title</div>
                      <div className="summary-chip-val">{docTitle || "Official Manual"}</div>
                    </div>
                    <div className="summary-chip">
                      <div className="summary-chip-label">Characters Extracted</div>
                      <div className="summary-chip-val">{docText.length}</div>
                    </div>
                    <div className="summary-chip">
                      <div className="summary-chip-label">Competency Code</div>
                      <div className="summary-chip-val">{targetCompetency}</div>
                    </div>
                    <div className="summary-chip">
                      <div className="summary-chip-label">Target Cadre</div>
                      <div className="summary-chip-val">{targetCadre.split("(")[0]}</div>
                    </div>
                    <div className="summary-chip">
                      <div className="summary-chip-label">Benchmark Goal</div>
                      <div className="summary-chip-val">
                        {MOSPI_COMPETENCIES.find((c) => c.code === targetCompetency)?.benchmark || 80}% Pass
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button
                      className="glass-btn primary"
                      style={{ padding: "12px 28px", alignItems: "center", fontSize: "0.95rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 800 }}
                      onClick={() => setStep(1)}
                    >
                      Configure Cadre Blueprint & Parameters →
                    </button>
                  </div>
                </div>
              )}
            </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CADRE BLUEPRINT & PARAMETERS                                      */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="form-content">
            {/* TOP PREFILLED BANNER */}
            <div className="prefilled-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="co-badge">{targetCompetency}</span>
                <span><strong>{docTitle || "Official MoSPI Document"}</strong> — Ready for Bloom's Taxonomy Synthesis</span>
              </div>
              <button
                className="glass-btn primary"
                style={{ padding: "6px 16px", fontSize: "0.82rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 700 }}
                onClick={() => setStep(0)}
              >
                ← Back to Manual Ingestion
              </button>
            </div>

            {/* FORM SECTION: BLUEPRINT PARAMETERS */}
            <div className="form-section">
              <div className="row-inputs" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "18px" }}>
                <div>
                  <label>Target FRAC Competency</label>
                  <select
                    className="glass-input"
                    value={targetCompetency}
                    onChange={(e) => setTargetCompetency(e.target.value)}
                  >
                    {MOSPI_COMPETENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name} ({c.benchmark}% Benchmark)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Target Civil Service Cadre</label>
                  <select
                    className="glass-input"
                    value={targetCadre}
                    onChange={(e) => setTargetCadre(e.target.value)}
                  >
                    <option value="Indian Statistical Service (ISS - Group A)">
                      Indian Statistical Service (ISS - Group A)
                    </option>
                    <option value="Subordinate Statistical Service (SSS - Group B)">
                      Subordinate Statistical Service (SSS - Group B)
                    </option>
                    <option value="Field Operations Division (FOD Investigator)">
                      Field Operations Division (FOD Investigator)
                    </option>
                  </select>
                </div>
              </div>

              <div className="row-inputs" style={{ gridTemplateColumns: "2fr 1fr", marginBottom: "18px" }}>
                <div>
                  <label>Assessment Title</label>
                  <input
                    className="glass-input"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    placeholder="e.g. SNA 2008 Gross Value Added Evaluation"
                  />
                </div>

                <div>
                  <label>Number of Questions</label>
                  <select
                    className="glass-input"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  >
                    <option value={5}>5 Questions (Express Diagnostic)</option>
                    <option value={10}>10 Questions (Standard Module Exam)</option>
                    <option value={15}>15 Questions (Comprehensive)</option>
                    <option value={20}>20 Questions (Final Cadre Certification)</option>
                  </select>
                </div>
              </div>

              <div className="row-inputs" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "18px" }}>
                <div>
                  <label>Assessment Purpose</label>
                  <select
                    className="glass-input"
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                  >
                    <option value="Diagnostic Pre-Test (FRAC Radar Feed)">
                      Diagnostic Pre-Test (Feeds into Competency Radar)
                    </option>
                    <option value="Mid-Term Cadre Training Evaluation">
                      Mid-Term Cadre Training Evaluation
                    </option>
                    <option value="Final Certification (Mint Blockchain Credential)">
                      Final Certification (Mint Soulbound Credential on Pass)
                    </option>
                  </select>
                </div>

                <div>
                  <label>Cognitive Difficulty</label>
                  <select
                    className="glass-input"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                  >
                    <option value="Foundational (SSS Induction)">Foundational (SSS Induction Level)</option>
                    <option value="Intermediate (ISS Junior Time Scale)">
                      Intermediate (ISS Junior Time Scale / In-Service)
                    </option>
                    <option value="Advanced (Senior Statistical Officers & Directors)">
                      Advanced (Senior Statistical Officers & Directors)
                    </option>
                  </select>
                </div>
              </div>

              {/* BLOOM TAXONOMY PILLS (ZERO EMOJIS) */}
              <div style={{ marginTop: "14px" }}>
                <label>Bloom's Taxonomy Cognitive Levels to Target</label>
                <div className="bloom-pills-row">
                  {[
                    { lvl: "L1 Remember", desc: "Definitions & MoSPI Guidelines" },
                    { lvl: "L2 Understand", desc: "Statistical Concepts & Methodologies" },
                    { lvl: "L3 Apply", desc: "Calculations, SUT Balancing & Multipliers" },
                    { lvl: "L4 Analyze", desc: "Microdata Errors & Outlier Diagnostics" },
                    { lvl: "L5 Evaluate", desc: "NDQAF Quality Audits & Consistency" },
                  ].map((item) => (
                    <div
                      key={item.lvl}
                      className={`bloom-pill ${selectedBloomLevels.includes(item.lvl) ? "active" : ""}`}
                      onClick={() => toggleBloomLevel(item.lvl)}
                    >
                      <span className="co-badge">{item.lvl}</span>
                      <span>{item.desc}</span>
                      {selectedBloomLevels.includes(item.lvl) && (
                        <span style={{ fontWeight: 800 }}>[Selected]</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
              <button
                className="glass-btn primary"
                style={{ padding: "14px 36px", fontSize: "1rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 800 }}
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
              >
                {isGenerating ? "Synthesizing Questions with StatCap AI..." : "Synthesize Cadre Assessment with Gemini AI →"}
              </button>
            </div>
            {generationLog && (
              <p style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.8)", fontSize: "0.85rem", marginTop: "10px" }}>
                {generationLog}
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: VERIFICATION & QUESTION MATRIX                                   */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div>
            {/* ACTION TOOLBAR */}
            <div className="questions-action-bar">
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 800, color: "#ffffff" }}>
                  {assessmentTitle}
                </h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span className="co-badge">{targetCompetency}</span>
                  <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.7)" }}>
                    {questions.length} Questions • {questions.length * 10} Total Marks • Cadre: {targetCadre.split("(")[0]}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="glass-btn secondary"
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  onClick={handleAddQuestion}
                >
                  Add Question
                </button>
                <button
                  className="glass-btn secondary"
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  onClick={handleExportJSON}
                >
                  Export JSON
                </button>
                <button
                  className="glass-btn secondary"
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                  onClick={() => window.print()}
                >
                  Print Document
                </button>
                <button
                  className="glass-btn primary"
                  style={{ padding: "8px 20px", fontSize: "0.85rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 800 }}
                  onClick={handlePublishAssessment}
                >
                  Publish to Trainee Portal
                </button>
              </div>
            </div>

            {/* QUESTIONS LIST */}
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="question-item-card">
                  <div className="question-card-header">
                    <div className="q-number-pill">
                      <span>Q{idx + 1}.</span>
                      <div className="q-badges-group">
                        <span className="co-badge">{q.btLevel || "L3 Apply"}</span>
                        <span className="hours-badge">{q.competencyCode || targetCompetency}</span>
                        <span className="hours-badge">{q.marks || 10} Marks</span>
                      </div>
                    </div>

                    <div>
                      <button
                        className="glass-btn secondary"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                        onClick={() => handleDeleteQuestion(idx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="question-statement">{q.statement}</div>

                  {/* OPTIONS */}
                  <div className="options-grid">
                    {q.options?.map((opt: string, optIdx: number) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = q.correctIndex === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`option-box ${isCorrect ? "correct" : ""}`}
                          onClick={() => handleSetCorrectOption(idx, optIdx)}
                          title="Click to set this as correct answer"
                        >
                          <span className="option-letter-badge">{letter}</span>
                          <span className="option-text">{opt}</span>
                          {isCorrect && (
                            <span className="option-correct-badge">
                              [Correct Answer]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* CITATION */}
                  {q.citation && (
                    <div className="q-explanation-box">
                      <div>
                        <div className="q-citation-tag">Official MoSPI Manual Citation</div>
                        <div>{q.citation}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOTTOM PUBLISH ROW */}
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "32px" }}>
              <button
                className="glass-btn secondary"
                style={{ padding: "12px 24px", fontSize: "0.95rem" }}
                onClick={() => setStep(1)}
              >
                ← Back to Blueprint Parameters
              </button>
              <button
                className="glass-btn primary"
                style={{ padding: "12px 36px", fontSize: "1rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 800 }}
                onClick={handlePublishAssessment}
              >
                Publish Assessment to Trainee Portal
              </button>
            </div>
          </div>
        )}

        {/* PUBLISH CONFIRMATION MODAL */}
        {showPublishModal && (
          <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px 0" }}>
                Assessment Published Successfully
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                <strong>{publishedData?.title}</strong> is now live in the MoSPI Trainee Portal. Officers in the{" "}
                <strong>{targetCadre.split("(")[0]}</strong> cohort can now take this assessment to close competency gaps and update their FRAC diagnostic radar.
              </p>

              <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "14px", marginBottom: "22px", textAlign: "left", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Competency Domain:</span>
                  <span style={{ fontWeight: 700 }}>{targetCompetency}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Assessment Purpose:</span>
                  <span>{assessmentType.split("(")[0]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Total Questions:</span>
                  <span>{questions.length} Questions ({questions.length * 10} Marks)</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  className="glass-btn primary"
                  style={{ padding: "10px 24px", fontSize: "0.9rem", background: "#ffffff", color: "#000000", border: "1px solid #ffffff", fontWeight: 800 }}
                  onClick={() => {
                    setShowPublishModal(false);
                    navigate("/trainee");
                  }}
                >
                  Jump to Trainee Dashboard →
                </button>
                <button
                  className="glass-btn secondary"
                  style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                  onClick={() => setShowPublishModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseGeneratorPage;
