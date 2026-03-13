import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  appName: { en: 'RuralHealth Connect', hi: 'ग्रामीण स्वास्थ्य कनेक्ट', mr: 'ग्रामीण आरोग्य कनेक्ट' },
  login: { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  register: { en: 'Register', hi: 'पंजीकरण', mr: 'नोंदणी' },
  worker: { en: 'Health Worker', hi: 'स्वास्थ्य कार्यकर्ता', mr: 'आरोग्य कार्यकर्ता' },
  doctor: { en: 'Doctor', hi: 'डॉक्टर', mr: 'डॉक्टर' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  patients: { en: 'Patients', hi: 'मरीज', mr: 'रुग्ण' },
  addPatient: { en: 'Add Patient', hi: 'मरीज जोड़ें', mr: 'रुग्ण जोडा' },
  symptoms: { en: 'Symptoms', hi: 'लक्षण', mr: 'लक्षणे' },
  vitals: { en: 'Vitals', hi: 'वाइटल्स', mr: 'व्हायटल्स' },
  aiAssistant: { en: 'AI Assistant', hi: 'एआई सहायक', mr: 'एआय सहाय्यक' },
  skinCheck: { en: 'Skin Check', hi: 'त्वचा की जांच', mr: 'त्वचेची तपासणी' },
  referral: { en: 'Referral', hi: 'रेफरल', mr: 'रेफरल' },
  save: { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  submit: { en: 'Submit', hi: 'जमा करें', mr: 'सबमिट करा' },
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  reviewed: { en: 'Reviewed', hi: 'समीक्षा की गई', mr: 'पुनरावलोकन केले' },
  voiceInput: { en: 'Voice Input', hi: 'आवाज इनपुट', mr: 'व्हॉइस इनपुट' },
  language: { en: 'Language', hi: 'भाषा', mr: 'भाषा' },
  logout: { en: 'Logout', hi: 'लॉगआउट', mr: 'लॉगआउट' },
  appTagline: { en: 'Empowering Rural Healthcare', hi: 'ग्रामीण स्वास्थ्य सशक्तिकरण', mr: 'ग्रामीण आरोग्य सक्षमीकरण' },
  loggingIn: { en: 'Logging in...', hi: 'लॉगिन किया जा रहा है...', mr: 'लॉगिन करत आहे...' },
  loginAs: { en: 'Login as', hi: 'के रूप में लॉगिन करें', mr: 'म्हणून लॉगिन करा' },
  secureLogin: { en: 'Secure Google Login for Health Professionals', hi: 'स्वास्थ्य पेशेवरों के लिए सुरक्षित Google लॉगिन', mr: 'आरोग्य व्यावसायिकांसाठी सुरक्षित Google लॉगिन' },
  welcomeBack: { en: 'Welcome back', hi: 'वापसी पर स्वागत है', mr: 'पुन्हा स्वागत आहे' },
  noPatients: { en: 'No patients added yet.', hi: 'अभी तक कोई मरीज नहीं जोड़ा गया है।', mr: 'अद्याप कोणतेही रुग्ण जोडलेले नाहीत.' },
  recentCases: { en: 'Recent Cases', hi: 'हाल के मामले', mr: 'अलीकडील केसेस' },
  noCases: { en: 'No cases submitted yet.', hi: 'अभी तक कोई मामला जमा नहीं किया गया है।', mr: 'अद्याप कोणतीही केस सबमिट केलेली नाही.' },
  viewAll: { en: 'View All', hi: 'सभी देखें', mr: 'सर्व पहा' },
  managePatients: { en: 'Manage and view all registered patients.', hi: 'सभी पंजीकृत मरीजों का प्रबंधन और अवलोकन करें।', mr: 'सर्व नोंदणीकृत रुग्णांचे व्यवस्थापन आणि पहा.' },
  searchPlaceholder: { en: 'Search by name or village...', hi: 'नाम या गांव से खोजें...', mr: 'नाव किंवा गावावरून शोधा...' },
  years: { en: 'years', hi: 'साल', mr: 'वर्षे' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  age: { en: 'Age', hi: 'आयु', mr: 'वय' },
  gender: { en: 'Gender', hi: 'लिंग', mr: 'लिंग' },
  village: { en: 'Village / Area', hi: 'गांव / क्षेत्र', mr: 'गाव / परिसर' },
  contact: { en: 'Contact Number', hi: 'संपर्क नंबर', mr: 'संपर्क क्रमांक' },
  medicalHistory: { en: 'Medical History (Optional)', hi: 'चिकित्सा इतिहास (वैकल्पिक)', mr: 'वैद्यकीय इतिहास (पर्यायी)' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  registerPatient: { en: 'Register Patient', hi: 'मरीज पंजीकृत करें', mr: 'रुग्णाची नोंदणी करा' },
  male: { en: 'Male', hi: 'पुरुष', mr: 'पुरुष' },
  female: { en: 'Female', hi: 'महिला', mr: 'महिला' },
  other: { en: 'Other', hi: 'अन्य', mr: 'इतर' },
  patientId: { en: 'Patient ID', hi: 'मरीज आईडी', mr: 'रुग्ण आयडी' },
  noContact: { en: 'No contact', hi: 'कोई संपर्क नहीं', mr: 'संपर्क नाही' },
  noHistory: { en: 'No history recorded', hi: 'कोई इतिहास दर्ज नहीं', mr: 'इतिहास नोंदवलेला नाही' },
  currentVitals: { en: 'Current Vitals', hi: 'वर्तमान वाइटल्स', mr: 'सध्याचे व्हायटल्स' },
  updateVitals: { en: 'Update Vitals', hi: 'वाइटल्स अपडेट करें', mr: 'व्हायटल्स अपडेट करा' },
  temp: { en: 'Temperature', hi: 'तापमान', mr: 'तापमान' },
  bp: { en: 'Blood Pressure', hi: 'रक्तचाप', mr: 'रक्तदाब' },
  pulse: { en: 'Pulse Rate', hi: 'नब्ज की दर', mr: 'नाडीचा वेग' },
  weight: { en: 'Weight', hi: 'वजन', mr: 'वजन' },
  caseHistory: { en: 'Case History', hi: 'मामले का इतिहास', mr: 'केस हिस्ट्री' },
  newCase: { en: 'New Case', hi: 'नया मामला', mr: 'नवीन केस' },
  symptomAnalysis: { en: 'Symptom Analysis', hi: 'लक्षण विश्लेषण', mr: 'लक्षण विश्लेषण' },
  doctorGuidance: { en: 'Doctor\'s Guidance', hi: 'डॉक्टर का मार्गदर्शन', mr: 'डॉक्टरांचे मार्गदर्शन' },
  reviewedByDoctor: { en: 'Reviewed by Doctor', hi: 'डॉक्टर द्वारा समीक्षा की गई', mr: 'डॉक्टरांनी पुनरावलोकन केले' },
  noCasesForPatient: { en: 'No cases recorded for this patient.', hi: 'इस मरीज के लिए कोई मामला दर्ज नहीं है।', mr: 'या रुग्णासाठी कोणतीही केस नोंदवलेली नाही.' },
  aiAssistantWelcome: { en: 'Hello! I am your AI Medical Assistant. How can I help you today?', hi: 'नमस्ते! मैं आपका एआई मेडिकल सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं?', mr: 'नमस्कार! मी तुमचा एआय वैद्यकीय सहाय्यक आहे. मी तुम्हाला आज कशी मदत करू शकतो?' },
  patientSelection: { en: 'Patient Selection', hi: 'मरीज का चयन', mr: 'रुग्ण निवड' },
  choosePatient: { en: 'Choose a patient...', hi: 'मरीज चुनें...', mr: 'रुग्ण निवडा...' },
  aiInputPlaceholder: { en: 'Describe symptoms or use voice input...', hi: 'लक्षणों का वर्णन करें या आवाज इनपुट का उपयोग करें...', mr: 'लक्षणांचे वर्णन करा किंवा व्हॉइस इनपुट वापरा...' },
  analyzingSymptoms: { en: 'Analyzing symptoms...', hi: 'लक्षणों का विश्लेषण किया जा रहा है...', mr: 'लक्षणांचे विश्लेषण करत आहे...' },
  startAnalysis: { en: 'Start Analysis', hi: 'विश्लेषण शुरू करें', mr: 'विश्लेषण सुरू करा' },
  aiAnalysisResult: { en: 'AI Analysis Result', hi: 'एआई विश्लेषण परिणाम', mr: 'एआय विश्लेषण निकाल' },
  urgency: { en: 'Urgency', hi: 'अत्यावश्यकता', mr: 'तातडी' },
  recommendations: { en: 'Recommendations', hi: 'सिफारिशें', mr: 'शिफारसी' },
  saveToRecord: { en: 'Save to Patient Record', hi: 'मरीज के रिकॉर्ड में सहेजें', mr: 'रुग्णाच्या रेकॉर्डमध्ये जतन करा' },
  caseSaved: { en: 'Case Saved', hi: 'मामला सहेजा गया', mr: 'केस जतन केली' },
  selectPatientToSave: { en: 'Please select a patient to save this case.', hi: 'कृपया इस मामले को सहेजने के लिए एक मरीज चुनें।', mr: 'कृपया ही केस जतन करण्यासाठी रुग्ण निवडा.' },
  listening: { en: 'Listening...', hi: 'सुन रहा हूँ...', mr: 'ऐकत आहे...' },
  stop: { en: 'Stop', hi: 'रुकें', mr: 'थांबा' },
  skinCheckDescription: { en: 'Upload a clear photo of the skin condition for AI analysis.', hi: 'एआई विश्लेषण के लिए त्वचा की स्थिति का एक स्पष्ट फोटो अपलोड करें।', mr: 'एआय विश्लेषणासाठी त्वचेच्या स्थितीचा स्पष्ट फोटो अपलोड करा.' },
  takePhoto: { en: 'Take a Photo or Upload', hi: 'फोटो लें या अपलोड करें', mr: 'फोटो घ्या किंवा अपलोड करा' },
  photoGuidance: { en: 'Ensure good lighting and focus', hi: 'अच्छी रोशनी और फोकस सुनिश्चित करें', mr: 'चांगला प्रकाश आणि फोकस सुनिश्चित करा' },
  changePhoto: { en: 'Change Photo', hi: 'फोटो बदलें', mr: 'फोटो बदला' },
  startSkinAnalysis: { en: 'Start AI Analysis', hi: 'एआई विश्लेषण शुरू करें', mr: 'एआय विश्लेषण सुरू करा' },
  analyzing: { en: 'Analyzing...', hi: 'विश्लेषण किया जा रहा है...', mr: 'विश्लेषण करत आहे...' },
  recommendation: { en: 'Recommendation', hi: 'सिफारिश', mr: 'शिफारस' },
  specialistRecommended: { en: 'A visit to a dermatologist or specialist is recommended for further diagnosis.', hi: 'आगे के निदान के लिए त्वचा विशेषज्ञ या विशेषज्ञ के पास जाने की सिफारिश की जाती है।', mr: 'पुढील निदानासाठी त्वचाविज्ञानी किंवा तज्ञाकडे जाण्याची शिफारस केली जाते.' },
  manageableCare: { en: 'This condition may be manageable with basic care, but monitor closely.', hi: 'यह स्थिति बुनियादी देखभाल के साथ प्रबंधनीय हो सकती है, लेकिन बारीकी से निगरानी करें।', mr: 'ही स्थिती मूलभूत काळजीने व्यवस्थापित होऊ शकते, परंतु बारकाईने लक्ष ठेवा.' },
  nearbySpecialists: { en: 'Nearby Specialists', hi: 'पास के विशेषज्ञ', mr: 'जवळपासचे तज्ञ' },
  refer: { en: 'Refer', hi: 'रेफर करें', mr: 'रेफर करा' },
  pendingReviews: { en: 'Pending Reviews', hi: 'लंबित समीक्षाएं', mr: 'प्रलंबित पुनरावलोकने' },
  doctorDashboardDesc: { en: 'Review and provide guidance for cases submitted by health workers.', hi: 'स्वास्थ्य कार्यकर्ताओं द्वारा जमा किए गए मामलों की समीक्षा करें और मार्गदर्शन प्रदान करें।', mr: 'आरोग्य कार्यकर्त्यांनी सबमिट केलेल्या केसेसचे पुनरावलोकन करा आणि मार्गदर्शन करा.' },
  dailySummary: { en: 'Daily Summary', hi: 'दैनिक सारांश', mr: 'दैनिक सारांश' },
  casesToReview: { en: 'Cases to Review', hi: 'समीक्षा के लिए मामले', mr: 'पुनरावलोकनासाठी केसेस' },
  highUrgency: { en: 'High Urgency', hi: 'उच्च अत्यावश्यकता', mr: 'उच्च तातडी' },
  avgResponse: { en: 'Avg Response Time', hi: 'औसत प्रतिक्रिया समय', mr: 'सरासरी प्रतिसाद वेळ' },
  quickActions: { en: 'Quick Actions', hi: 'त्वरित कार्रवाई', mr: 'त्वरीत कृती' },
  reviewAll: { en: 'Review All Pending', hi: 'सभी लंबित समीक्षा करें', mr: 'सर्व प्रलंबित पुनरावलोकन करा' },
  exportReport: { en: 'Export Report', hi: 'रिपोर्ट निर्यात करें', mr: 'अहवाल निर्यात करा' },
  noPendingCases: { en: 'No pending cases to review.', hi: 'समीक्षा के लिए कोई लंबित मामला नहीं है।', mr: 'पुनरावलोकनासाठी कोणतीही प्रलंबित केस नाही.' },
  caseDetails: { en: 'Case Details', hi: 'मामले का विवरण', mr: 'केस तपशील' },
  workerLabel: { en: 'Worker', hi: 'कार्यकर्ता', mr: 'कार्यकर्ता' },
  aiAnalysisLabel: { en: 'AI Analysis', hi: 'एआई विश्लेषण', mr: 'एआय विश्लेषण' },
  provideGuidance: { en: 'Provide Guidance', hi: 'मार्गदर्शन प्रदान करें', mr: 'मार्गदर्शन करा' },
  guidancePlaceholder: { en: 'Enter your medical advice and next steps...', hi: 'अपनी चिकित्सा सलाह और अगले कदम दर्ज करें...', mr: 'तुमचा वैद्यकीय सल्ला आणि पुढील पावले प्रविष्ट करा...' },
  submitReview: { en: 'Submit Review', hi: 'समीक्षा जमा करें', mr: 'पुनरावलोकन सबमिट करा' },
  reviewSubmitted: { en: 'Review Submitted', hi: 'समीक्षा जमा की गई', mr: 'पुनरावलोकन सबमिट केले' },
  analysisError: { en: 'I encountered an error analyzing the symptoms. Please try again.', hi: 'लक्षणों का विश्लेषण करने में त्रुटि हुई। कृपया पुनः प्रयास करें।', mr: 'लक्षणांचे विश्लेषण करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' },
  selectPatientFirst: { en: 'Please select a patient first.', hi: 'कृपया पहले एक मरीज चुनें।', mr: 'कृपया आधी रुग्ण निवडा.' },
  speechNotSupported: { en: 'Speech recognition is not supported in this browser.', hi: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।', mr: 'या ब्राउझरमध्ये स्पीच रिकग्निशन समर्थित नाही.' },
  imageAnalysisError: { en: 'Error analyzing image. Please try again.', hi: 'छवि का विश्लेषण करने में त्रुटि। कृपया पुनः प्रयास करें।', mr: 'प्रतिमेचे विश्लेषण करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' },
  skinCheckPlaceholder: { en: 'Analysis results will appear here after you upload and process a photo.', hi: 'फोटो अपलोड और प्रोसेस करने के बाद विश्लेषण परिणाम यहां दिखाई देंगे।', mr: 'फोटो अपलोड आणि प्रोसेस केल्यानंतर विश्लेषण निकाल येथे दिसतील.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
