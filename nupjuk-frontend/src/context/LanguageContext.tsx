import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode
  } from "react";
  
  type Language = "ko" | "en";
  
  interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
  }
  
  const LanguageContext = createContext<LanguageContextValue | null>(null);
  
  interface LanguageProviderProps {
    children: ReactNode;
  }
  
  export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>("ko");
  
    const value = useMemo(
      () => ({
        language,
        setLanguage,
        toggleLanguage: () => {
          setLanguage((current) => (current === "ko" ? "en" : "ko"));
        }
      }),
      [language]
    );
  
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }
  
  export function useLanguage() {
    const context = useContext(LanguageContext);
  
    if (!context) {
      throw new Error("useLanguage must be used inside LanguageProvider");
    }
  
    return context;
  }