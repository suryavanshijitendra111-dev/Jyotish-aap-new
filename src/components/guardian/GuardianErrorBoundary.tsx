import React, { Component, ErrorInfo, ReactNode } from 'react';
import { guardianMonitor } from '../../services/guardian/guardianMonitor';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { t } from '../../i18n';

interface Props {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GuardianErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    guardianMonitor.recordIncident({
      category: 'REACT',
      message: error.message || 'React rendering component failure',
      stack: errorInfo.componentStack || error.stack,
      module: this.props.moduleName || 'ReactView',
      screen: typeof window !== 'undefined' ? window.location.pathname : '/',
      affectedFeature: `UI Component (${this.props.moduleName || 'View'})`,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 sm:p-8 bg-[#0a1510]/95 border border-[#d4af37]/40 rounded-3xl text-center backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] my-4">
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
            <ShieldAlert className="w-7 h-7 text-[#d4af37]" />
          </div>
          <h3 className="text-xl font-bold text-[#d4af37] mb-2">
            {t('guardian.protectedViewTitle') || 'जीवन दर्पण संरक्षक सुरक्षित दृश्य'}
          </h3>
          <p className="text-sm sm:text-base text-gray-200 max-w-sm mx-auto mb-5 leading-relaxed break-words">
            {t('guardian.protectedViewDesc') || 'जीवन दर्पण के एक तकनीकी भाग में समस्या आई है। खगोलीय और कुंडली गणनाएँ पूरी तरह सुरक्षित हैं।'}
          </p>
          <button
            onClick={this.handleReset}
            className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] text-[#030a08] text-sm sm:text-base font-bold hover:bg-[#d4af37]/80 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('guardian.retryComponent') || 'पुनः प्रयास करें'}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
